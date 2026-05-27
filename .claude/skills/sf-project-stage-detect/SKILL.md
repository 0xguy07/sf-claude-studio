---
name: sf-project-stage-detect
description: "Detects the current state of the project: SFDX scaffolding, default org, presence of metadata, in-progress branch/story. Used by /sf-start and other workflow skills."
user-invocable: true
allowed-tools: Read, Glob, Bash
model: haiku
---

Detect and report:

1. **SFDX scaffolding**
   - `sfdx-project.json` present?
   - `force-app/` directory present and populated?

2. **Default org**
   - Run `sf config get target-org --json` (allowed by default permissions).
   - Report the alias or `(none)`.

3. **Metadata footprint**
   - Count `.cls` files in `force-app/**/classes/`.
   - Count LWC components in `force-app/**/lwc/`.
   - Count flows in `force-app/**/flows/`.
   - Count custom objects in `force-app/**/objects/`.

4. **In-progress work**
   - Current branch (`git rev-parse --abbrev-ref HEAD`).
   - Last 5 commits.
   - Any uncommitted changes.

5. **Tooling**
   - `sf` CLI version (`sf --version`).
   - `node --version`, `npm --version` (for LWC tooling).
   - `pmd` or `sf scanner run` available?

Format as a compact dashboard. Don't comment on what to do — that's `/sf-start`'s job.
