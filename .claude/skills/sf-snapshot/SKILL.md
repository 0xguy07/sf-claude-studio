---
name: sf-snapshot
description: "Retrieve full org metadata into snapshots/<org-alias>/<date>/ and commit it — a point-in-time record of what's in the org, for diffing against future change and for disaster reference."
argument-hint: "[--target-org <alias>] [--metadata <types>]"
user-invocable: true
allowed-tools: Read, Glob, Bash, AskUserQuestion
model: sonnet
agent: devops-lead
---

Capture a full point-in-time snapshot of an org's metadata into the repo. Unlike `/sf-retrieve` (which pulls specific types into `force-app/` as working source), this writes a dated, read-only archive under `snapshots/` so the org's state on a given day is recoverable and diffable.

## Phase 1: Confirm target org

Read `sf config get target-org`, or accept `--target-org`. Confirm the alias with the user — a full retrieve is large and counts against the API budget. If the alias is in `.claude/protected-orgs`, that's fine for a read, but call it out.

## Phase 2: Resolve scope

Default scope is the full unpackaged metadata set. The user can narrow with `--metadata "<types>"` (e.g. `ApexClass,Flow,CustomObject`). State the scope before retrieving — a full org retrieve can be thousands of files.

## Phase 3: Retrieve into a dated directory

Compute today's date as `YYYY-MM-DD` (run `date +%F`). Target directory: `snapshots/<alias>/<date>/`.

```
mkdir -p snapshots/<alias>/<date>
sf project retrieve start \
    --target-org <alias> \
    --metadata "<types or full set>" \
    --output-dir snapshots/<alias>/<date>
```

If a snapshot for this alias+date already exists, ask before overwriting.

## Phase 4: Commit

Show the file count, then commit the snapshot:

```
git add snapshots/<alias>/<date>
git commit -m "snapshot: <alias> <date>"
```

Snapshots are committed deliberately — they're the recovery/diff record. Don't `git add -A`; stage only the snapshot path.

## Phase 5: Report

State the alias, date, file count, and commit hash. If an older snapshot exists for the same alias, offer to `git diff` the two to show what changed in the org since.
