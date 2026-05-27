# sf-claude-studio (CLI)

`sfcs` — the command-line installer and upgrader for [sf-claude-studio](https://github.com/0xguy07/sf-claude-studio).

```bash
npm install -g sf-claude-studio
sfcs --version
```

## Commands

```
sfcs init [target]            scaffold .claude/ + companions into a project
sfcs onboard [target]         interactive first-run wizard (init + doctor)
sfcs doctor                   preflight health check
sfcs upgrade                  pull latest .claude/ from the bundled template
sfcs sync                     link skills from ~/.sf-claude-studio/skills/
sfcs --version                show version
sfcs --help                   show all commands
```

### `sfcs init`

Drop the studio into a project. By default, prompts for default org alias and whether to enable optional MCP integration. `--yes` skips prompts and accepts defaults.

```bash
sfcs init                              # current directory, interactive
sfcs init my-project                   # new directory
sfcs init --yes                        # non-interactive
sfcs init --mcp apex-dev               # also write .mcp.json with that preset
sfcs init --force                      # overwrite existing .claude/
```

Writes:

- `.claude/` — agents, skills, hooks, rules, templates, settings.json
- `CLAUDE.md`, `AGENTS.md`, `STANDARDS.md`, `TOOLS.md` — companion docs
- `code-analyzer.yml` — Salesforce Code Analyzer v5 config
- `.mcp.json.example` — copy-template for MCP integration
- `.studio-manifest.json` — file hashes used by `sfcs upgrade`

### `sfcs doctor`

One-shot health check. Reports pass / warn / fail per item across:

- Tooling (sf CLI v2+, node 18+, git, jq, python3)
- Org + auth (default target-org, reachability)
- Project structure (`.claude/`, companion docs, settings.json validity)
- Hooks (executable bit on every `.sh`)
- Quality tooling (`sf code-analyzer` or `sf scanner` plugin)
- MCP (config validity, gitignore hygiene)
- Counts (agents, skills, rules, hooks, templates)
- Manifest

```bash
sfcs doctor              # human output
sfcs doctor --json       # machine-readable
sfcs doctor --quiet      # only print warnings + failures
```

Exits non-zero if any failures are detected.

### `sfcs upgrade`

Pull the latest bundled template into the current project. Three-way merge driven by `.studio-manifest.json`:

- **Unmodified locally + changed in template** → auto-update
- **Modified locally + changed in template** → conflict; prompt (keep mine / take new / show diff)
- **Added in template** → add
- **Removed in template** → prompt (keep / remove)

```bash
sfcs upgrade                        # interactive
sfcs upgrade --dry-run              # show plan, write nothing
sfcs upgrade --force-take-new       # auto-resolve conflicts as "take new"
sfcs upgrade --force-keep-mine      # auto-resolve conflicts as "keep mine"
sfcs upgrade --no-backup            # skip the .claude.bak.<ts>/ snapshot
```

Always backs `.claude/` up to `.claude.bak.<timestamp>/` before applying, unless `--no-backup`.

### `sfcs sync`

Link user-scoped skills from `~/.sf-claude-studio/skills/` into the current project's `.claude/skills/`. Each user skill is copied with a `user-` prefix to avoid colliding with project skills.

```bash
sfcs sync                  # copy every user skill into .claude/skills/user-*
sfcs sync --list           # list user skills without syncing
sfcs sync --prefix me-     # use a different prefix
```

User-scoped skills are useful for personal workflow shortcuts (favorite SOQL snippets, custom review checklists, project-init helpers) that travel across every project you work on.

### `sfcs onboard`

Wizard mode: runs `init` interactively, then `doctor` to verify. Best for first-time setup.

```bash
sfcs onboard
sfcs onboard my-project
```

## Bundled template

The CLI ships with a snapshot of `.claude/` and the four companion docs. Versioned in lockstep with the package.json `version` field. To see what's bundled:

```bash
ls $(npm root -g)/sf-claude-studio/templates/
```

To rebuild from a checkout (for development):

```bash
npm run build:templates
```

## License

MIT — same as the parent repo.
