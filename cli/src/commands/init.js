import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { confirm, input, select } from '@inquirer/prompts';
import { bold, cyan, dim, green, yellow } from 'kolorist';
import {
  TEMPLATES_DIR,
  TEMPLATE_FILES,
  projectRoot,
  studioRoot,
  manifestPath,
  templatesAvailable,
} from '../lib/paths.js';
import {
  copyTree,
  ensureDir,
  listFilesRecursive,
  makeExecutable,
} from '../lib/fs-utils.js';
import { buildManifest } from '../lib/manifest.js';
import { heading, ok, warn, fail, info, blank } from '../lib/log.js';

const MCP_PRESETS = {
  'apex-dev':     'orgs,data,metadata,testing,other',
  'lwc-dev':      'orgs,data,metadata,testing,lwc-experts,other',
  'aura-migrate': 'orgs,metadata,aura-experts,lwc-experts,other',
  'mobile-dev':   'orgs,data,metadata,testing,lwc-experts,mobile,other',
  'data-admin':   'orgs,data,users,metadata',
};

export async function initCommand(target, opts) {
  if (!templatesAvailable()) {
    throw new Error(
      'Bundled templates not found at ' + TEMPLATES_DIR + '. ' +
      'If you are running from a source checkout, run `npm run build:templates` first.'
    );
  }

  const projectDir = projectRoot(target);
  const projectName = basename(projectDir);
  const studioDir = studioRoot(target);

  heading(`sfcs init  →  ${projectDir}`);

  // Detect existing scaffolding
  const studioExists = existsSync(studioDir);
  if (studioExists && !opts.force) {
    if (opts.yes) {
      throw new Error(`.claude/ already exists at ${studioDir}. Use --force to overwrite, or run \`sfcs upgrade\`.`);
    }
    const proceed = await confirm({
      message: `${yellow('.claude/ already exists.')} Overwrite? (Use ${bold('sfcs upgrade')} to merge instead.)`,
      default: false,
    });
    if (!proceed) {
      info('Aborted. Run `sfcs upgrade` to merge the latest template into your existing project.');
      return;
    }
  }

  // Resolve options
  const orgAlias = opts.yes
    ? ''
    : await input({
        message: `Default ${cyan('sf')} target-org alias for this project? ${dim('(blank to skip)')}`,
        default: '',
      });

  let mcpPreset = opts.mcp ?? null;
  if (!opts.yes && mcpPreset === undefined) {
    const enableMcp = await confirm({
      message: 'Enable optional Salesforce DX MCP integration?',
      default: false,
    });
    if (enableMcp) {
      mcpPreset = await select({
        message: 'Pick a toolset preset',
        choices: Object.keys(MCP_PRESETS).map((p) => ({ name: p, value: p })),
        default: 'apex-dev',
      });
    }
  }

  if (mcpPreset && !MCP_PRESETS[mcpPreset]) {
    throw new Error(`Unknown MCP preset: ${mcpPreset}. Valid: ${Object.keys(MCP_PRESETS).join(', ')}`);
  }

  // Copy template files. Each top-level file/dir is checked individually:
  //   - .claude/ is gated by the --force flag we already handled above
  //   - everything else: skip + warn if the user already has it (e.g. .gitignore)
  ensureDir(projectDir);
  const skipped = [];
  for (const rel of TEMPLATE_FILES) {
    const src = join(TEMPLATES_DIR, rel);
    const dst = join(projectDir, rel);
    if (!existsSync(src)) continue;

    if (rel === '.claude') {
      // Already handled by the --force / studioExists logic above; if we're
      // here, either it didn't exist or the user said "overwrite".
      copyTree(src, dst);
      ok(`copied   ${rel}`);
      continue;
    }

    if (existsSync(dst)) {
      skipped.push(rel);
      warn(`skipped  ${rel}  (file already exists; preserving yours)`);
      continue;
    }

    copyTree(src, dst);
    ok(`copied   ${rel}`);
  }

  // If we skipped .gitignore, append our entries onto theirs so the
  // studio's gitignore lines (.studio-manifest.json, .claude/sessions/, etc.)
  // are still in effect.
  if (skipped.includes('.gitignore')) {
    mergeGitignore(projectDir);
  }

  // Make hooks executable
  const hooksDir = join(studioDir, 'hooks');
  if (existsSync(hooksDir)) {
    let n = 0;
    for (const f of listFilesRecursive(hooksDir)) {
      if (f.endsWith('.sh')) { makeExecutable(f); n++; }
    }
    ok(`chmod +x  ${n} hook script${n === 1 ? '' : 's'}`);
  }

  // Write .mcp.json from preset, if requested
  if (mcpPreset) {
    const mcp = {
      mcpServers: {
        'Salesforce DX': {
          command: 'npx',
          args: [
            '-y', '@salesforce/mcp',
            '--orgs', orgAlias ? orgAlias : 'DEFAULT_TARGET_ORG',
            '--toolsets', MCP_PRESETS[mcpPreset],
            '--allow-non-ga-tools',
          ],
        },
      },
    };
    writeFileSync(join(projectDir, '.mcp.json'), JSON.stringify(mcp, null, 2) + '\n');
    ok(`wrote  .mcp.json  (preset: ${mcpPreset})`);
  }

  // Scaffold project docs the studio expects but doesn't ship as templates:
  // an org-context primer and an empty schema-snapshot directory.
  scaffoldDocs(projectDir, projectName);

  // Build manifest for future upgrades
  const tplVer = readTemplateVersion();
  const manifest = buildManifest({ projectDir, templateVersion: tplVer });
  writeFileSync(manifestPath(projectDir), JSON.stringify(manifest, null, 2) + '\n');
  ok(`wrote  .studio-manifest.json  (template ${tplVer}, ${Object.keys(manifest.files).length} files tracked)`);

  blank();
  console.log(`${green('Done.')} Next steps:`);
  console.log(`  ${dim('1.')} ${cyan('cd')} ${projectDir === process.cwd() ? '.' : target}`);
  console.log(`  ${dim('2.')} ${cyan('sfcs doctor')}        ${dim('# verify the setup')}`);
  console.log(`  ${dim('3.')} ${cyan('claude')}             ${dim('# open Claude Code')}`);
  console.log(`  ${dim('4.')} type  ${cyan('/sf-start')}    ${dim('# pick the right entry point')}`);
  blank();
}

function readTemplateVersion() {
  // Embed the CLI's package.json version as the template version stamp.
  try {
    const pkgPath = new URL('../../package.json', import.meta.url);
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

// Scaffold docs/org-context.md (a primer the studio reads for project intent)
// and an empty docs/schema/ directory (where /sf-describe-snapshot writes
// per-object schema). Both are created only if absent — never clobbered.
function scaffoldDocs(projectDir, projectName) {
  const docsDir = join(projectDir, 'docs');
  const schemaDir = join(docsDir, 'schema');
  ensureDir(schemaDir);

  const keep = join(schemaDir, '.gitkeep');
  if (!existsSync(keep)) {
    writeFileSync(keep, '');
    ok('wrote  docs/schema/.gitkeep');
  }

  const ctx = join(docsDir, 'org-context.md');
  if (existsSync(ctx)) {
    warn('skipped  docs/org-context.md  (file already exists; preserving yours)');
    return;
  }

  const body = `# ${projectName} — Org Context

What an agent should know about this org before touching it. Keep this current.

## Purpose

What this org/project is for, who uses it, and what business it runs.

## Key custom objects

The objects that matter and how they relate. Run \`/sf-describe-snapshot\` to
write field-level detail into \`docs/schema/<Object>.md\`.

| Object | Purpose | Notes |
|-|-|-|
| | | |

## Gotchas

Non-obvious constraints, legacy quirks, "don't touch X" landmines, integrations
that break in surprising ways.

## Decision log

Newest first. One line per decision: what was decided, when, why.

- <YYYY-MM-DD> —
`;
  writeFileSync(ctx, body);
  ok('wrote  docs/org-context.md');
}

// When the user already had a .gitignore, append the studio's required entries
// (idempotently) so per-developer state and per-project artifacts are still
// excluded from version control.
function mergeGitignore(projectDir) {
  const userGitignore = join(projectDir, '.gitignore');
  const ours = join(TEMPLATES_DIR, '.gitignore');
  if (!existsSync(userGitignore) || !existsSync(ours)) return;

  const existing = readFileSync(userGitignore, 'utf8');
  const incoming = readFileSync(ours, 'utf8');

  // Pull out every non-blank, non-comment line from our template gitignore;
  // those are the patterns we care about preserving in the user's file.
  const ourPatterns = incoming
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  // Which patterns are missing from theirs?
  const existingLines = new Set(existing.split('\n').map((l) => l.trim()));
  const missing = ourPatterns.filter((p) => !existingLines.has(p));
  if (missing.length === 0) return;

  const block = [
    '',
    '# Added by sfcs init (sf-claude-studio)',
    ...missing,
    '',
  ].join('\n');

  writeFileSync(userGitignore, existing.replace(/\n*$/, '\n') + block);
  ok(`merged   .gitignore  (added ${missing.length} pattern${missing.length === 1 ? '' : 's'})`);
}
