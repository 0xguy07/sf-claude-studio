#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initCommand } from './commands/init.js';
import { doctorCommand } from './commands/doctor.js';
import { upgradeCommand } from './commands/upgrade.js';
import { onboardCommand } from './commands/onboard.js';
import { syncCommand } from './commands/sync.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

const program = new Command();

program
  .name('sfcs')
  .description(pkg.description)
  .version(pkg.version, '-v, --version', 'show version');

program
  .command('init')
  .description('scaffold .claude/ + companion docs into a project')
  .argument('[target]', 'target directory (default: current)', '.')
  .option('-y, --yes', 'accept defaults, skip prompts')
  .option('--mcp <preset>', 'enable MCP with preset (apex-dev|lwc-dev|aura-migrate|mobile-dev|data-admin)')
  .option('--no-mcp', 'do not write .mcp.json (default)')
  .option('--force', 'overwrite existing .claude/ without prompting')
  .action(initCommand);

program
  .command('doctor')
  .description('preflight health check: sf CLI, default org, .claude/ structure, hooks, scanners, MCP config')
  .option('--json', 'output machine-readable JSON')
  .option('-q, --quiet', 'only print failures')
  .action(doctorCommand);

program
  .command('upgrade')
  .description('pull latest .claude/ from the public template into the current project')
  .option('--dry-run', 'show what would change without writing')
  .option('--no-backup', 'skip .claude.bak/ backup before applying')
  .option('--force-take-new', 'on conflict, always take the new template version')
  .option('--force-keep-mine', 'on conflict, always keep the local version')
  .action(upgradeCommand);

program
  .command('onboard')
  .description('full first-run wizard: init + initial config + doctor pass')
  .argument('[target]', 'target directory (default: current)', '.')
  .action(onboardCommand);

program
  .command('sync')
  .description('link user-scoped skills from ~/.sf-claude-studio/skills/ into the current project')
  .option('--prefix <prefix>', 'prefix for synced skill names (default: user-)', 'user-')
  .option('--list', 'list user-scoped skills without syncing')
  .action(syncCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error(`\n  ✗ ${err.message}\n`);
  if (process.env.DEBUG) console.error(err);
  process.exit(1);
});
