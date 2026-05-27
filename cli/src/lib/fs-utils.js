import { createHash } from 'node:crypto';
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  chmodSync,
  renameSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';

export function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

export function fileHash(path) {
  return sha256(readFileSync(path));
}

export function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

export function listFilesRecursive(root) {
  const out = [];
  if (!existsSync(root)) return out;
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) out.push(full);
    }
  }
  walk(root);
  return out;
}

export function copyTree(src, dst) {
  cpSync(src, dst, { recursive: true });
}

export function backupDir(src) {
  if (!existsSync(src)) return null;
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const bak = `${src}.bak.${ts}`;
  cpSync(src, bak, { recursive: true });
  return bak;
}

export function makeExecutable(path) {
  try {
    chmodSync(path, 0o755);
    return true;
  } catch {
    return false;
  }
}

export function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function writeJSON(path, data) {
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

export { copyFileSync, existsSync, readFileSync, statSync, writeFileSync, relative, join };
