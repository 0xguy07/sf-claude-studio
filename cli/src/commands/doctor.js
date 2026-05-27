import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { projectRoot, studioRoot, manifestPath } from '../lib/paths.js';
import { listFilesRecursive } from '../lib/fs-utils.js';
import { ok, warn, fail, info, heading, blank } from '../lib/log.js';

export async function doctorCommand(opts = {}) {
  const project = projectRoot('.');
  const studio = studioRoot('.');
  const results = [];

  const record = (level, label, detail = '') =>
    results.push({ level, label, detail });

  // Tooling
  record('section', 'Tooling');
  recordCmd(record, 'sf', 'sf CLI installed', '--version', 'npm install -g @salesforce/cli');
  recordCmd(record, 'node', 'node 18+', '--version', 'install Node 18+', (v) => {
    const major = parseInt(v.replace(/^v/, '').split('.')[0], 10);
    return major >= 18 ? null : `found ${v}, need 18+`;
  });
  recordCmd(record, 'git', 'git installed', '--version', 'install git');
  recordCmd(record, 'jq', 'jq (optional)', '--version', '', null, /* optional */ true);
  recordCmd(record, 'python3', 'python3 (optional, Flow Scanner)', '--version', '', null, true);

  // Org + auth
  record('section', 'Org + auth');
  let orgAlias = null;
  try {
    const out = execSync('sf config get target-org --json', { stdio: ['ignore', 'pipe', 'pipe'], timeout: 10_000 }).toString();
    const data = JSON.parse(out);
    const v = data?.result?.[0]?.value || data?.value;
    if (v) {
      orgAlias = v;
      record('ok', `target-org configured: ${v}`);
    } else {
      record('warn', 'no default target-org', 'sf config set target-org=<alias>');
    }
  } catch {
    record('warn', 'sf config not readable', 'sf CLI may not be installed');
  }

  if (orgAlias) {
    try {
      execSync(`sf org display --target-org ${orgAlias} --json`, { stdio: ['ignore', 'pipe', 'pipe'], timeout: 10_000 });
      record('ok', `default org reachable (${orgAlias})`);
    } catch {
      record('warn', `default org unreachable (${orgAlias})`, 'try `sf org login web --alias ' + orgAlias + '`');
    }
  }

  // Project structure
  record('section', 'Project structure');
  recordPath(record, project, 'sfdx-project.json', 'present', 'run `sf project generate --name <project> --output-dir .`', false, /* warnIfMissing */ true);
  recordPath(record, project, 'force-app', 'present', 'created by `sf project generate`', false, true);
  recordPath(record, project, '.claude', 'directory', 'run `sfcs init` to scaffold', true);
  recordPath(record, project, 'CLAUDE.md', 'present', 'run `sfcs init`', false);
  recordPath(record, project, 'AGENTS.md', 'present', 'run `sfcs init`', false);
  recordPath(record, project, 'STANDARDS.md', 'present', 'run `sfcs init`', false);
  recordPath(record, project, 'TOOLS.md', 'present', 'run `sfcs init`', false);

  if (existsSync(join(studio, 'settings.json'))) {
    try {
      JSON.parse(readFileSync(join(studio, 'settings.json'), 'utf8'));
      record('ok', '.claude/settings.json valid JSON');
    } catch (e) {
      record('fail', '.claude/settings.json INVALID JSON', e.message);
    }
  } else {
    record('fail', '.claude/settings.json missing', 'run `sfcs init` to scaffold');
  }

  // Hooks
  record('section', 'Hooks');
  const hooks = join(studio, 'hooks');
  if (existsSync(hooks)) {
    const sh = listFilesRecursive(hooks).filter((f) => f.endsWith('.sh'));
    let nonExec = 0;
    for (const f of sh) {
      const mode = statSync(f).mode & 0o777;
      if ((mode & 0o100) === 0) nonExec++;
    }
    if (sh.length === 0) {
      record('warn', '.claude/hooks/ empty', 'no shell hooks present');
    } else if (nonExec === 0) {
      record('ok', `${sh.length} hook script${sh.length === 1 ? '' : 's'} executable`);
    } else {
      record('fail', `${nonExec} of ${sh.length} hooks not executable`, 'run `chmod +x .claude/hooks/*.sh`');
    }
  } else {
    record('warn', '.claude/hooks/ missing');
  }

  // Quality tooling
  record('section', 'Quality tooling');
  try {
    const plugins = execSync('sf plugins --core', { stdio: ['ignore', 'pipe', 'pipe'], timeout: 10_000 }).toString()
      + '\n'
      + execSync('sf plugins', { stdio: ['ignore', 'pipe', 'pipe'], timeout: 10_000 }).toString();
    if (plugins.includes('code-analyzer')) record('ok', 'sf code-analyzer plugin installed');
    else if (plugins.includes('scanner')) record('ok', 'sf scanner plugin installed (legacy v4)');
    else record('warn', 'no sf scanner / code-analyzer', 'sf plugins install @salesforce/plugin-code-analyzer');
  } catch {
    record('warn', 'sf plugins not enumerable', 'is `sf` v2+ on your PATH?');
  }

  recordPath(record, project, 'code-analyzer.yml', 'present', '', false);

  // MCP
  record('section', 'MCP (optional)');
  recordPath(record, project, '.mcp.json.example', 'template hygiene', '', false);
  const mcpPath = join(project, '.mcp.json');
  if (existsSync(mcpPath)) {
    try {
      JSON.parse(readFileSync(mcpPath, 'utf8'));
      record('ok', '.mcp.json present and valid');
    } catch (e) {
      record('fail', '.mcp.json INVALID JSON', e.message);
    }
    // gitignore check
    try {
      execSync('git check-ignore .mcp.json', { stdio: 'ignore' });
      record('ok', '.mcp.json is gitignored');
    } catch {
      record('warn', '.mcp.json is NOT gitignored', 'add .mcp.json to .gitignore');
    }
  } else {
    info('.mcp.json absent (CLI-only mode is fine)');
  }

  // Counts
  record('section', 'Counts');
  countDir(record, join(studio, 'agents'),  'agents (.md)', /\.md$/);
  countDir(record, join(studio, 'skills'),  'skills (subdirs)', null, /* dirs */ true);
  countDir(record, join(studio, 'rules'),   'rules (.md)', /\.md$/);
  countDir(record, join(studio, 'hooks'),   'hooks (.sh)', /\.sh$/);
  countDir(record, join(studio, 'docs/templates'), 'templates', /\..+$/);

  // Manifest
  record('section', 'Manifest');
  if (existsSync(manifestPath('.'))) {
    try {
      const m = JSON.parse(readFileSync(manifestPath('.'), 'utf8'));
      record('ok', `.studio-manifest.json present (template ${m.templateVersion}, ${Object.keys(m.files || {}).length} files tracked)`);
    } catch {
      record('warn', '.studio-manifest.json unreadable', 're-run `sfcs init` or remove the file');
    }
  } else {
    info('.studio-manifest.json absent (legacy install — `sfcs upgrade` will create one)');
  }

  // Output
  if (opts.json) {
    console.log(JSON.stringify(results, null, 2));
    process.exit(results.some((r) => r.level === 'fail') ? 1 : 0);
  }

  let pass = 0, warns = 0, fails = 0;
  for (const r of results) {
    if (r.level === 'section') heading(r.label);
    else if (r.level === 'ok') { if (!opts.quiet) ok(r.label); pass++; }
    else if (r.level === 'warn') { warn(`${r.label}${r.detail ? ` — ${r.detail}` : ''}`); warns++; }
    else if (r.level === 'fail') { fail(`${r.label}${r.detail ? ` — ${r.detail}` : ''}`); fails++; }
    else if (r.level === 'info') info(r.label);
  }

  blank();
  console.log(`  ${pass} passed · ${warns} warnings · ${fails} failures`);
  blank();
  process.exit(fails > 0 ? 1 : 0);
}

function recordCmd(record, cmd, label, args, fix, validator = null, optional = false) {
  try {
    const out = execSync(`${cmd} ${args}`, { stdio: ['ignore', 'pipe', 'pipe'], timeout: 5_000 }).toString().trim().split('\n')[0];
    if (validator) {
      const issue = validator(out);
      if (issue) {
        record(optional ? 'warn' : 'fail', `${label}: ${issue}`);
        return;
      }
    }
    record('ok', `${label}  ${out ? `(${out})` : ''}`);
  } catch {
    record(optional ? 'warn' : 'fail', `${label} not found`, fix);
  }
}

function recordPath(record, root, rel, label, fix, isDir, warnIfMissing = false) {
  const p = join(root, rel);
  if (existsSync(p)) {
    if (isDir && !statSync(p).isDirectory()) {
      record('fail', `${rel} is not a directory`);
      return;
    }
    record('ok', `${rel}  ${label}`);
  } else {
    record(warnIfMissing ? 'warn' : 'fail', `${rel} missing`, fix);
  }
}

function countDir(record, dir, label, fileRe, dirsOnly = false) {
  if (!existsSync(dir)) {
    record('warn', `${label}: dir missing (${dir})`);
    return;
  }
  let n = 0;
  if (dirsOnly) {
    for (const f of statSync(dir).isDirectory() ? readdirSync(dir, { withFileTypes: true }) : []) {
      if (f.isDirectory()) n++;
    }
  } else {
    for (const f of listFilesRecursive(dir)) {
      if (!fileRe || fileRe.test(f)) n++;
    }
  }
  record('ok', `${label}: ${n}`);
}
