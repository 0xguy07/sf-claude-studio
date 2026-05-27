---
name: sf-security-review
description: "Security pass over the change set or full project: sharing model, FLS/CRUD, SOQL injection, secrets, LWC client-side hygiene, permission set least-privilege."
argument-hint: "[scope: 'diff' (default) | 'full']"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Task, AskUserQuestion
model: sonnet
agent: security-lead
---

## Phase 1: Scope

- `diff` (default) — review staged changes only.
- `full` — review every Apex class, LWC, and permission set in `force-app/`.

Confirm scope with the user before running `full` (it can be slow).

## Phase 2: Pass 1 — Sharing model

For every Apex class:
- [ ] Sharing declaration present (`with sharing` / `without sharing` / `inherited sharing`).
- [ ] `without sharing` is justified in a comment.
- [ ] Class accessed by Aura/LWC: prefer `with sharing`.

## Phase 3: Pass 2 — FLS / CRUD

For every Apex class that touches SObjects:
- [ ] FLS check via `Schema.sObjectType.X.isAccessible()` / `.isUpdateable()`, OR
- [ ] `WITH USER_MODE` / `WITH SYSTEM_MODE` qualified, OR
- [ ] `Security.stripInaccessible()` applied before DML.

If none of the above, flag **HIGH**.

## Phase 4: Pass 3 — SOQL injection

For every dynamic query (`Database.query(...)`):
- [ ] Bind variables, OR
- [ ] `String.escapeSingleQuotes` + allowlisted field/object names.
- [ ] No raw user input concatenated into the query string.

`Database.query` with concatenation = **CRITICAL**.

## Phase 5: Pass 4 — Secrets

Scan `force-app/**/staticresources/`, custom metadata, and Apex constants for:
- [ ] API keys, tokens, passwords, private keys, AWS keys (regex: `AKIA[0-9A-Z]{16}`, `sk_live_`, `xoxb-`, etc.).
- [ ] Hardcoded URLs that should be in Named Credentials.

Any hit = **CRITICAL**.

## Phase 6: Pass 5 — LWC client-side

For every LWC `*.js`:
- [ ] No `eval`, no `Function()` constructor.
- [ ] No `innerHTML` from untrusted source (URL params, user input).
- [ ] URL params validated (`window.location.search` → use `URLSearchParams` and allowlist).
- [ ] No PII in `console.log`.

## Phase 7: Pass 6 — Permission sets

For every `*.permissionset-meta.xml`:
- [ ] `<modifyAllData>true</modifyAllData>` justified in `<description>` or absent.
- [ ] `<viewAllData>true</viewAllData>` justified or absent.
- [ ] `<userPermissions>` block reviewed against persona.

## Phase 8: Report

Severity: **CRITICAL / HIGH / MEDIUM / LOW**. CRITICAL blocks the release.

For each finding:
```
[SEVERITY] file:line — what — fix
  Reference: rules/<rule>.md and/or OWASP / Salesforce Security guidance
```

## Phase 9: Run scanner if available

Offer to run `sf scanner run --target force-app --category Security` (or `sf code-analyzer run`) for a tooling-driven cross-check.
