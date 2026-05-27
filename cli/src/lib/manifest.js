import { existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileHash, listFilesRecursive, readJSON, writeJSON } from './fs-utils.js';
import { manifestPath, TEMPLATE_FILES, TEMPLATES_DIR } from './paths.js';

// Build a manifest of every file we tracked, with content hash + originating template version.
export function buildManifest({ projectDir, templateVersion }) {
  const entries = {};
  for (const rel of TEMPLATE_FILES) {
    const abs = join(projectDir, rel);
    if (!existsSync(abs)) continue;
    if (statSync(abs).isDirectory()) {
      for (const f of listFilesRecursive(abs)) {
        const r = relative(projectDir, f);
        entries[r] = fileHash(f);
      }
    } else {
      entries[rel] = fileHash(abs);
    }
  }
  return {
    schema: 1,
    templateVersion,
    generated: new Date().toISOString(),
    files: entries,
  };
}

export function writeManifest(projectDir, manifest) {
  writeJSON(manifestPath(projectDir), manifest);
}

export function readManifest(projectDir) {
  const p = manifestPath(projectDir);
  if (!existsSync(p)) return null;
  return readJSON(p);
}

// Build a manifest of the bundled template (what the user is upgrading TO).
export function buildTemplateManifest(templateVersion) {
  return buildManifest({ projectDir: TEMPLATES_DIR, templateVersion });
}
