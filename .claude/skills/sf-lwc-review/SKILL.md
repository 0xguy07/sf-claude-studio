---
name: sf-lwc-review
description: "Review of LWC components for composition, accessibility, performance, security, and test coverage. Cites .claude/rules/lwc-code.md."
argument-hint: "[component-folder-or-glob, default = staged LWC changes]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Task, AskUserQuestion
model: sonnet
agent: lwc-lead
---

## Phase 1: Targets

If the user provided a path/glob, use it. Otherwise:

```
git diff --cached --name-only --diff-filter=AM | grep 'force-app.*lwc/'
```

For each affected component, identify:
- `*.js` (logic)
- `*.html` (template)
- `*.css` (styles)
- `*.js-meta.xml` (config)
- `__tests__/*.test.js` (Jest)

## Phase 2: Read rules + sources

Load `.claude/rules/lwc-code.md`. Read each component in full.

## Phase 3: Checklist

### BLOCKING

- [ ] **Jest test exists** for the component (`__tests__/*.test.js`).
- [ ] **No manual `JSON.parse(...)` from Apex returns** — return SObjects/DTOs.
- [ ] **No `document.querySelector`** — use `this.template.querySelector`.
- [ ] **No `eval`, no `Function()` constructor.**
- [ ] **No PII in `console.log`**.
- [ ] **URL parameters sanitized** before being rendered into HTML or used in queries.

### WARNING

- [ ] Wire service / LDS preferred over imperative Apex.
- [ ] `@AuraEnabled(cacheable=true)` on all read-only Apex calls used by `@wire`.
- [ ] `@api` properties documented with JSDoc.
- [ ] `connectedCallback` does not block on heavy synchronous work.
- [ ] `renderedCallback` does only focus/scroll positioning (no DOM mutation, no fetches).
- [ ] SLDS design tokens used (no raw hex, no `!important`).

### INFO

- [ ] Single-purpose component.
- [ ] ARIA roles, labels, keyboard navigation, focus management present.
- [ ] Loading/empty/error states rendered.

## Phase 4: Report

Same format as `/sf-apex-review`: severity, file:line, rule citation, fix suggestion.

## Phase 5: Run Jest if present

If `package.json` defines a `test` script and `node_modules/` exists, offer to run `npm test -- --testPathPattern=<component>` — ask first.
