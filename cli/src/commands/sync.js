import { existsSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { dim, green } from 'kolorist';
import { USER_SKILLS, USER_HOME, studioRoot, projectRoot } from '../lib/paths.js';
import { copyTree, ensureDir } from '../lib/fs-utils.js';
import { ok, warn, info, heading, blank } from '../lib/log.js';

export async function syncCommand(opts = {}) {
  if (!existsSync(USER_SKILLS)) {
    info(`No user skills directory at ${USER_SKILLS}`);
    info(`Create one and add SKILL.md files under ${USER_SKILLS}/<name>/SKILL.md`);
    info('Each user-scoped skill gets prefixed (default: user-) when synced into a project.');
    return;
  }

  const userSkills = readdirSync(USER_SKILLS, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .filter((e) => existsSync(join(USER_SKILLS, e.name, 'SKILL.md')));

  if (userSkills.length === 0) {
    info(`${USER_SKILLS} is empty (or has no subdirectory containing SKILL.md)`);
    return;
  }

  if (opts.list) {
    heading(`User-scoped skills at ${USER_SKILLS}`);
    for (const e of userSkills) console.log(`  ${e.name}`);
    blank();
    return;
  }

  const studio = studioRoot('.');
  if (!existsSync(studio)) {
    throw new Error('No .claude/ in this directory. Run `sfcs init` first.');
  }

  const studioSkillsDir = join(studio, 'skills');
  ensureDir(studioSkillsDir);

  heading(`sfcs sync  →  ${projectRoot('.')}`);

  const prefix = opts.prefix || 'user-';
  let synced = 0;
  for (const e of userSkills) {
    const srcDir = join(USER_SKILLS, e.name);
    const dstName = e.name.startsWith(prefix) ? e.name : prefix + e.name;
    const dstDir = join(studioSkillsDir, dstName);
    if (existsSync(dstDir)) {
      warn(`skip  ${dstName}  (already exists in project)`);
      continue;
    }
    copyTree(srcDir, dstDir);
    ok(`synced  ${dstName}`);
    synced++;
  }
  blank();
  console.log(`${green(`${synced} user skill${synced === 1 ? '' : 's'} synced`)} into ${dim('.claude/skills/')}`);
  console.log(`${dim('Re-run `sfcs sync` after adding skills under ' + USER_SKILLS)}`);
  blank();
}
