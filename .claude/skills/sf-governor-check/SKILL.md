---
name: sf-governor-check
description: "Scan Apex for governor-limit risks: SOQL/DML in loops, missing Limits checks, @future misuse, batch inefficiency."
argument-hint: "[file-or-glob, default = force-app/**/classes & triggers]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, AskUserQuestion
model: sonnet
agent: apex-lead
---

## Phase 1: Targets

User-supplied path/glob, or all `*.cls` and `*.trigger` under `force-app/`.

## Phase 2: Static checks

- **SOQL inside `for`** — flag every occurrence with file:line.
- **DML inside `for`** — same.
- **Missing `Limits` checks** on classes that contain SOQL/DML in service methods reachable from triggers (heuristic: any `static` method called from a trigger handler).
- **`@future` calls inside loops** — count `@future`-annotated method invocations inside a `for`.
- **`@future` parameter types** — if the annotated method declares non-primitive / non-collection-of-primitive parameters, flag.
- **Batch with `Database.QueryLocator` returning > 50M records** — heuristic: scan for missing `WHERE` filters.
- **`Schedulable` invoked at impossible cadence** — comment-only flag if cron expression is sub-minute.

## Phase 3: Report

For each finding, output:
```
file.cls:LINE — <category> — <one-line description>
  Rule: rules/apex-classes.md → "<rule name>"
```

Group by category. End with a count.

## Phase 4: Suggest profiling

If the user wants confirmation under load, suggest enabling debug logs at `FINER` for `APEX_CODE` and `DB`, executing the path, and reading the `LIMIT_USAGE_FOR_NS` line.
