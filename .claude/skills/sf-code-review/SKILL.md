---
name: sf-code-review
description: "Top-level code review entry point. Routes Apex files to /sf-apex-review, LWC files to /sf-lwc-review, flows to /sf-flow-review, and runs a cross-cutting architecture/SOLID pass. Use this when reviewing a mixed change set."
argument-hint: "[file-or-glob, default = staged changes]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Task, AskUserQuestion
model: sonnet
agent: technical-architect
---

## Phase 1: Categorize

Get the target file list (argument or staged diff). Bucket files into:

- **Apex** → `*.cls`, `*.trigger`
- **LWC** → `force-app/**/lwc/**`
- **Flow** → `*.flow-meta.xml`
- **SObject metadata** → `*.object-meta.xml`, `*.field-meta.xml`
- **Permission set** → `*.permissionset-meta.xml`
- **Other** → everything else

## Phase 2: Spawn specialist reviews in parallel

For each non-empty bucket, spawn a specialist via Task in **parallel**:

- Apex bucket → invoke `/sf-apex-review` with the apex paths
- LWC bucket → invoke `/sf-lwc-review`
- Flow bucket → invoke `/sf-flow-review`
- SObject / permission set → spawn `data-lead` / `security-lead` with the relevant rule files

## Phase 3: Cross-cutting architecture pass

While specialists run, you check:

- [ ] **Layer separation** — UI doesn't own data access; service layer doesn't own UI concerns.
- [ ] **Single Responsibility** — each class has one reason to change.
- [ ] **Cyclomatic complexity** — under 10 per method (rough heuristic).
- [ ] **Dependency direction** — UI → service → selector → SObject; never reversed.
- [ ] **Naming consistency** — one convention across the change set.
- [ ] **No copy-paste** — three similar blocks → factor into a helper.

## Phase 4: Aggregate

Collect specialist findings + your cross-cutting findings into a single severity-grouped report.

## Phase 5: Offer fixes

Ask the user before applying any fix. Group by severity; offer "fix all blockers" or per-file approval.
