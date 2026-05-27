#!/usr/bin/env node
// Copy parent-repo template files into cli/templates/ at build time so the
// published npm package is self-contained.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliRoot = resolve(__dirname, '..');
const repoRoot = resolve(cliRoot, '..');
const templates = join(cliRoot, 'templates');

const FILES = [
  '.claude',
  'CLAUDE.md',
  'AGENTS.md',
  'STANDARDS.md',
  'TOOLS.md',
  'code-analyzer.yml',
  '.mcp.json.example',
  '.gitignore',
];

console.log(`Building templates at ${templates}`);
if (existsSync(templates)) rmSync(templates, { recursive: true, force: true });
mkdirSync(templates, { recursive: true });

let copied = 0;
let skipped = 0;
for (const rel of FILES) {
  const src = join(repoRoot, rel);
  const dst = join(templates, rel);
  if (!existsSync(src)) {
    console.warn(`  skip (missing): ${rel}`);
    skipped++;
    continue;
  }
  cpSync(src, dst, { recursive: true });
  console.log(`  copied: ${rel}`);
  copied++;
}

// Strip per-developer state directories that the parent .gitignore covers
// but we still need to scrub from a published bundle:
const STRIP = ['.claude/agent-memory', '.claude/sessions', '.claude/active.md'];
for (const rel of STRIP) {
  const p = join(templates, rel);
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true });
    console.log(`  stripped: ${rel}`);
  }
}

console.log(`\n${copied} copied, ${skipped} skipped\n`);
