---
name: sf-scan
description: "Run Salesforce Code Analyzer v5 over the project or changed files. Aggregates PMD, ESLint, RetireJS, Flow Scanner, and Salesforce Graph Engine results."
argument-hint: "[path-or-glob, default = changed files]"
user-invocable: true
allowed-tools: Read, Glob, Bash, AskUserQuestion
model: sonnet
agent: devops-lead
---

## Phase 1: Resolve target

If a path is provided, use it. Otherwise scope to staged + recently-modified files:

```
git diff --name-only HEAD~1 HEAD
git diff --cached --name-only
```

## Phase 2: Pre-flight

Check that `sf code-analyzer` is installed (preferred) or fall back to `sf scanner`:

```
sf plugins list | grep -E '(code-analyzer|scanner)'
```

If neither is installed, suggest:

```
sf plugins install @salesforce/plugin-code-analyzer
```

## Phase 3: Run

```
sf code-analyzer run --workspace . --target <paths> --view detail --severity-threshold 3
```

If using v4 (`sf scanner`):

```
sf scanner run --target <paths> --format json --severity-threshold 3 --engine pmd,eslint,retire-js
```

## Phase 4: Group findings

Group by severity (Critical / High / Moderate / Low / Info) and engine. For each finding:

```
[SEVERITY] file.cls:LINE — RuleName (engine)
  Description: <what>
  Reference: <rule URL or rules/<file>.md>
  Fix: <suggestion if obvious>
```

## Phase 5: Offer fixes

For PMD rules with known auto-fixes (Quick Fix), offer to apply them. Ask first.

For Flow Scanner findings, point at `.claude/rules/flows.md`.
For RetireJS, surface the affected library + version + advisory link.
