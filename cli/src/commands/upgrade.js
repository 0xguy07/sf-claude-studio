import { existsSync, readFileSync, writeFileSync, copyFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { confirm, select } from '@inquirer/prompts';
import { bold, cyan, dim, green, yellow, red } from 'kolorist';
import {
  TEMPLATES_DIR,
  TEMPLATE_FILES,
  projectRoot,
  studioRoot,
  manifestPath,
  templatesAvailable,
} from '../lib/paths.js';
import {
  backupDir,
  ensureDir,
  fileHash,
  listFilesRecursive,
  makeExecutable,
} from '../lib/fs-utils.js';
import { buildManifest, buildTemplateManifest, readManifest } from '../lib/manifest.js';
import { heading, ok, warn, fail, info, blank } from '../lib/log.js';

export async function upgradeCommand(opts = {}) {
  if (!templatesAvailable()) {
    throw new Error('Bundled templates not found. Run `npm run build:templates`.');
  }

  const projectDir = projectRoot('.');
  const studioDir = studioRoot('.');

  if (!existsSync(studioDir)) {
    throw new Error('No .claude/ found in this directory. Use `sfcs init` to create a fresh project instead.');
  }

  heading(`sfcs upgrade  →  ${projectDir}`);

  const oldManifest = readManifest('.');
  if (!oldManifest) {
    warn('no .studio-manifest.json — treating every file as user-modified');
  } else {
    info(`current template version: ${oldManifest.templateVersion}`);
  }

  // Build a manifest of the bundled (latest) template
  const newTemplateManifest = buildTemplateManifest(readCliVersion());
  info(`bundled template version: ${newTemplateManifest.templateVersion}`);

  // Plan changes
  const changes = []; // {rel, action, reason}
  const newFiles = newTemplateManifest.files;
  const oldFiles = (oldManifest && oldManifest.files) || {};

  // Files in new template
  for (const [rel, newHash] of Object.entries(newFiles)) {
    const localAbs = join(projectDir, rel);
    const localExists = existsSync(localAbs);
    const localHash = localExists ? fileHash(localAbs) : null;
    const oldHash = oldFiles[rel] || null;

    if (!localExists) {
      changes.push({ rel, action: 'add', reason: 'new in template' });
      continue;
    }
    if (localHash === newHash) continue; // up to date
    if (oldHash && localHash === oldHash) {
      // user has not modified — safe to update
      changes.push({ rel, action: 'update', reason: 'unmodified locally, template changed' });
    } else {
      // local has changed since install (or no manifest existed)
      changes.push({ rel, action: 'conflict', reason: 'local file modified' });
    }
  }

  // Files removed in new template (only if we have an old manifest)
  if (oldManifest) {
    for (const rel of Object.keys(oldFiles)) {
      if (!(rel in newFiles)) {
        changes.push({ rel, action: 'removed', reason: 'no longer in template' });
      }
    }
  }

  if (changes.length === 0) {
    blank();
    console.log(`${green('Already up to date.')} (template ${newTemplateManifest.templateVersion})`);
    blank();
    return;
  }

  // Show plan
  heading('Plan');
  for (const c of changes) {
    const verb = pickVerb(c.action);
    console.log(`  ${verb}  ${c.rel}  ${dim('— ' + c.reason)}`);
  }
  blank();

  if (opts.dryRun) {
    info('--dry-run: no files will be written');
    blank();
    return;
  }

  // Resolve conflicts
  const conflicts = changes.filter((c) => c.action === 'conflict');
  for (const c of conflicts) {
    if (opts.forceTakeNew) { c.resolution = 'take-new'; continue; }
    if (opts.forceKeepMine) { c.resolution = 'keep-mine'; continue; }
    c.resolution = await select({
      message: `Conflict on ${cyan(c.rel)}:`,
      choices: [
        { name: 'keep mine', value: 'keep-mine' },
        { name: 'take new (template version)', value: 'take-new' },
        { name: 'take new + save backup of mine', value: 'take-new-backup' },
        { name: 'show diff first', value: 'diff' },
      ],
    });
    if (c.resolution === 'diff') {
      showDiff(join(TEMPLATES_DIR, c.rel), join(projectDir, c.rel));
      c.resolution = await select({
        message: `Now what?`,
        choices: [
          { name: 'keep mine', value: 'keep-mine' },
          { name: 'take new', value: 'take-new' },
          { name: 'take new + save backup of mine', value: 'take-new-backup' },
        ],
      });
    }
  }

  // Resolve removals
  const removals = changes.filter((c) => c.action === 'removed');
  for (const c of removals) {
    if (opts.forceTakeNew) { c.resolution = 'remove'; continue; }
    if (opts.forceKeepMine) { c.resolution = 'keep'; continue; }
    c.resolution = await select({
      message: `${red('Remove')} ${c.rel}? (it has been removed in the latest template)`,
      choices: [
        { name: 'keep it', value: 'keep' },
        { name: 'remove it', value: 'remove' },
      ],
      default: 'keep',
    });
  }

  // Backup before applying (unless suppressed)
  if (!opts.noBackup) {
    const bak = backupDir(studioDir);
    if (bak) ok(`backup  ${relative(projectDir, bak)}`);
  }

  // Apply
  let applied = 0;
  for (const c of changes) {
    if (c.action === 'add' || c.action === 'update') {
      copyFileFromTemplate(c.rel, projectDir);
      ok(`${c.action === 'add' ? 'added ' : 'updated'}  ${c.rel}`);
      applied++;
    } else if (c.action === 'conflict') {
      if (c.resolution === 'keep-mine') {
        info(`kept     ${c.rel}`);
      } else if (c.resolution === 'take-new' || c.resolution === 'take-new-backup') {
        if (c.resolution === 'take-new-backup') {
          const localAbs = join(projectDir, c.rel);
          const ts = new Date().toISOString().replace(/[:.]/g, '-');
          copyFileSync(localAbs, `${localAbs}.bak.${ts}`);
        }
        copyFileFromTemplate(c.rel, projectDir);
        ok(`replaced ${c.rel}`);
        applied++;
      }
    } else if (c.action === 'removed') {
      if (c.resolution === 'remove') {
        // best-effort delete (we don't import rmSync here intentionally;
        // do it lazily)
        const { rmSync } = await import('node:fs');
        rmSync(join(projectDir, c.rel), { force: true });
        ok(`removed  ${c.rel}`);
        applied++;
      } else {
        info(`kept     ${c.rel}`);
      }
    }
  }

  // chmod hooks
  const hooksDir = join(studioDir, 'hooks');
  if (existsSync(hooksDir)) {
    for (const f of listFilesRecursive(hooksDir)) {
      if (f.endsWith('.sh')) makeExecutable(f);
    }
  }

  // Rebuild manifest
  const newManifest = buildManifest({ projectDir, templateVersion: newTemplateManifest.templateVersion });
  writeFileSync(manifestPath('.'), JSON.stringify(newManifest, null, 2) + '\n');
  ok(`updated  .studio-manifest.json  (${Object.keys(newManifest.files).length} files tracked)`);

  blank();
  console.log(`${green(`Upgraded to template ${newTemplateManifest.templateVersion}.`)} ${applied} change${applied === 1 ? '' : 's'} applied.`);
  blank();
}

function pickVerb(action) {
  if (action === 'add') return cyan('add     ');
  if (action === 'update') return green('update  ');
  if (action === 'conflict') return yellow('conflict');
  if (action === 'removed') return red('removed ');
  return action;
}

function copyFileFromTemplate(rel, projectDir) {
  const src = join(TEMPLATES_DIR, rel);
  const dst = join(projectDir, rel);
  ensureDir(dirname(dst));
  copyFileSync(src, dst);
}

function showDiff(srcPath, dstPath) {
  try {
    const srcLines = readFileSync(srcPath, 'utf8').split('\n');
    const dstLines = readFileSync(dstPath, 'utf8').split('\n');
    blank();
    console.log(dim('--- yours'));
    console.log(dim('+++ template'));
    const maxLines = Math.min(80, Math.max(srcLines.length, dstLines.length));
    for (let i = 0; i < maxLines; i++) {
      const a = dstLines[i];
      const b = srcLines[i];
      if (a === b) continue;
      if (a !== undefined) console.log(red('- ' + a));
      if (b !== undefined) console.log(green('+ ' + b));
    }
    blank();
  } catch (e) {
    warn(`could not diff: ${e.message}`);
  }
}

function readCliVersion() {
  try {
    const pkgPath = new URL('../../package.json', import.meta.url);
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}
