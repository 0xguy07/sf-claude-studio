import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));

// cli/src/lib/paths.js  →  cli/templates/
export const TEMPLATES_DIR = resolve(__dirname, '..', '..', 'templates');

// User-scoped skills directory
export const USER_HOME = join(homedir(), '.sf-claude-studio');
export const USER_SKILLS = join(USER_HOME, 'skills');

export const MANIFEST_NAME = '.studio-manifest.json';

// Files we copy from the template into a target project (relative to TEMPLATES_DIR)
export const TEMPLATE_FILES = [
  '.claude',
  '.gitignore',
  'CLAUDE.md',
  'AGENTS.md',
  'STANDARDS.md',
  'TOOLS.md',
  'code-analyzer.yml',
  '.mcp.json.example',
];

export function projectRoot(target = '.') {
  return resolve(process.cwd(), target);
}

export function studioRoot(target = '.') {
  return join(projectRoot(target), '.claude');
}

export function manifestPath(target = '.') {
  return join(projectRoot(target), MANIFEST_NAME);
}

export function templatesAvailable() {
  return existsSync(TEMPLATES_DIR) && existsSync(join(TEMPLATES_DIR, '.claude'));
}
