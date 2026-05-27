---
name: sf-omnistudio-detect
description: "Detect which OmniStudio runtime the project / org is using (Standard / Core or Package). Output the answer plus next-step guidance."
user-invocable: true
allowed-tools: Read, Glob, Bash
model: haiku
agent: omnistudio-builder
---

## Phase 1: Inspect project

Look for these signals in the local project:

- `force-app/**/omniStudio/` populated → **Standard / Core Runtime** likely.
- `force-app/**/dataPacks/` or top-level `vlocity/` populated → **Package Runtime**.
- Both populated → **MIXED** — flag this loudly; mixing breaks deployments.

## Phase 2: Inspect org

If a target org is configured, query for runtime metadata:

```
sf data query --query "SELECT Id, Name FROM CustomObject WHERE Name LIKE 'vlocity%'" --target-org <alias>
```

(or other Vlocity-namespaced object presence checks). The presence of `vlocity_*` namespaced objects suggests Package Runtime.

If no Vlocity-namespaced objects exist but `omniStudio` metadata types are returnable from a `sf project retrieve start --metadata OmniScript`, Standard Runtime is in play.

## Phase 3: Report

Output clearly:

```
OmniStudio runtime: STANDARD | PACKAGE | MIXED | UNKNOWN

Next steps:
  - STANDARD → use `sf project deploy start` for OmniStudio components like any other metadata.
  - PACKAGE  → install OmniStudio Build Tool (`vlocity packExport` / `packDeploy`); maintain a separate pipeline.
  - MIXED    → STOP. Open an ADR to plan consolidation onto Standard Runtime before further deploys.
  - UNKNOWN  → ask the user, or check the org's installed packages list.
```

## Phase 4: Persist

Write the answer to `CLAUDE.md` (or a project-local `docs/omnistudio.md`) so future sessions don't re-detect.
