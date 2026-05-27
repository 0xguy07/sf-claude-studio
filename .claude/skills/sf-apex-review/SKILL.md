---
name: sf-apex-review
description: "Full Apex best-practices audit of the current diff or specified files. Checks sharing, bulkification, SOQL/DML in loops, hardcoded IDs, governor-limit hygiene, test quality, exception handling. Cites .claude/rules/apex-*.md."
argument-hint: "[file-or-glob, default = staged Apex changes]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Task, AskUserQuestion
model: sonnet
agent: apex-lead
---

## Phase 1: Determine target files

If the user provided file paths or a glob as the argument, use that.
Otherwise, use staged Apex changes:

```
git diff --cached --name-only --diff-filter=AM | grep -E '\.(cls|trigger)$'
```

If nothing is staged, fall back to:

```
git diff --name-only HEAD~1 HEAD | grep -E '\.(cls|trigger)$'
```

Confirm the file list with the user before reviewing more than 10 files.

## Phase 2: Load rules + read targets

Read each target file in full.

Read these rule files — they are the source of truth, cite them in findings:
- `.claude/rules/apex-classes.md`
- `.claude/rules/apex-triggers.md`
- `.claude/rules/apex-tests.md`

## Phase 3: Run the checklist

For every file, evaluate every rule. Group output by **severity**:

### BLOCKING (must fix before merge)

- [ ] **Sharing declared** — `with sharing` / `without sharing` / `inherited sharing` present on every public/global class. *(rules/apex-classes.md → Mandatory)*
- [ ] **No SOQL inside `for` loops** *(rules/apex-classes.md, SF-WIKI #2)*
- [ ] **No DML inside `for` loops** *(rules/apex-classes.md, SF-WIKI #2)*
- [ ] **No hardcoded record IDs** *(rules/apex-classes.md, SF-WIKI #10)*
- [ ] **Bind variables in dynamic SOQL** *(rules/apex-classes.md)*
- [ ] **One trigger per SObject** *(rules/apex-triggers.md, SFB #5)*
- [ ] **No business logic in `.trigger` file** *(rules/apex-triggers.md)*
- [ ] **No `SeeAllData=true`** in tests *(rules/apex-tests.md)*

### WARNING (should fix)

- [ ] **Bulkified helpers** — methods that take a single record and would run in a loop *(SF-WIKI #3)*
- [ ] **`Limits.*` checks** on hot paths approaching governor limits *(SF-WIKI #7)*
- [ ] **`@future` discipline** — no `@future` calls inside loops; primitive-only parameters *(SF-WIKI #8)*
- [ ] **Recursion guards** in trigger handlers *(rules/apex-triggers.md)*
- [ ] **Test data factory** — no copy-pasted setup *(rules/apex-tests.md)*
- [ ] **Bulk asserts in tests** — 200-record case for triggers/services *(rules/apex-tests.md, SF-WIKI #9)*
- [ ] **Positive AND negative test cases** *(rules/apex-tests.md)*
- [ ] **System.runAs** for sharing/FLS-sensitive code *(rules/apex-tests.md)*
- [ ] **Custom exceptions** for distinct error categories *(SF-DPC 2.1.10)*
- [ ] **No `JSON.serialize`** of SObjects returned to LWC *(SFB #12)*

### INFO (style/maintainability)

- [ ] Methods under ~45 lines
- [ ] Constants in `static final` fields or Custom Metadata
- [ ] API version current
- [ ] Doc comments on public methods/classes

## Phase 4: Report

For each finding output:

```
[SEVERITY] file.cls:LINE
  Rule: rules/apex-classes.md → "No SOQL or DML inside for loops"
  What: <one-sentence summary of the violation>
  Fix:  <suggested fix in 1-3 lines, or a diff>
```

End with a summary count: `N BLOCKING / M WARNING / K INFO`.

## Phase 5: Offer next step

If any BLOCKING findings: ask the user "Apply suggested fixes?" — do **not** edit anything without explicit yes.
