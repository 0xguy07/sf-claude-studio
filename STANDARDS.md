# sf-claude-studio — Coding Standards

This file is the canonical statement of what the studio enforces. Every rule lives in `.claude/rules/<file>.md` with citations to the canonical Salesforce reference; this file is the index.

## How rules fire

Rules are **path-scoped**. Edit a file at a matching path and the corresponding rule loads automatically. You don't have to read the rules manually — the studio injects them when relevant.

| When you edit… | Rule that fires |
|-|-|
| `force-app/**/classes/**/*.cls` | `apex-classes.md` |
| `force-app/**/classes/**/*Test.cls` | `apex-tests.md` |
| `force-app/**/triggers/**/*.trigger` | `apex-triggers.md` |
| `force-app/**/lwc/**` | `lwc-code.md` |
| `force-app/**/aura/**` | `aura-code.md` |
| `force-app/**/pages/**`, `**/components/*.component` | `visualforce.md` |
| `force-app/**/flows/**/*.flow-meta.xml` | `flows.md` |
| `force-app/**/omniStudio/**`, `**/dataPacks/**` | `omnistudio.md` |
| `force-app/**/objects/**/*.object-meta.xml`, `**/fields/*.field-meta.xml` | `sobjects.md` |
| `force-app/**/permissionsets/**` | `permissionsets.md` |

## What's enforced (summary)

The full text + citations live in each rule file. The headlines:

### Apex (classes, triggers, tests)

- **Sharing declared** explicitly on every class. `without sharing` requires a comment.
- **No SOQL or DML inside `for` loops.**
- **No hardcoded record IDs.** Use Custom Metadata or runtime lookups by DeveloperName.
- **Bulkified helpers.** Methods accept collections, not single records.
- **Modern security syntax** (Spring '23+): `WITH USER_MODE`, `Database.<op>(records, AccessLevel.USER_MODE)`, `Security.stripInaccessible()`.
- **One trigger per SObject.** Logic lives in a handler class, not the trigger file.
- **Recursion guard** in trigger handlers.
- **Tests:** separate `@isTest` class · no `SeeAllData=true` · `Test.startTest()/stopTest()` · 200-record bulk case · positive AND negative · `System.runAs` for sharing-sensitive code · meaningful assertions (`Test.isRunningTest()` in production code is a smell).
- **Governor-limit reference table** (sync vs async budgets) baked into `apex-classes.md`.

### LWC

- **Jest test required** for every component.
- **Lightning Web Security (LWS)** is the default — the `template.querySelector` boundary is enforced; some third-party libraries that walk the global object won't work.
- **SLDS2** for new components.
- **Wire service / Lightning Data Service** preferred over imperative Apex.
- **Cacheable `@AuraEnabled`** for read-only Apex used by `@wire`.
- **Don't return manually-serialized JSON** from Apex to LWC — let the framework do it.
- **No `document.querySelector`**, no `eval`, no PII in `console.log`, sanitize URL params before render.

### Aura

- **Don't write new Aura.** Use the `aura-migrator` agent + `/sf-aura-migrate` to port to LWC.
- For existing Aura: same Apex bulkification rules, thin client controllers.

### Visualforce

- Net-new VF only for legitimate cases (Sites, email templates, PDF generation).
- StandardController over hand-rolled controllers when possible.
- CRUD/FLS via `WITH USER_MODE` / `AccessLevel.USER_MODE` in custom controllers.
- `escape="false"` is dangerous — leave the default.

### Flow

- **Fault paths** on every record / action element.
- **Before-save flows** for same-record updates (~10x faster than after-save).
- **Decision-first** design — branch early, do work in branches.
- **Avoid Flow → Apex → Flow recursion** (top cause of "too many SOQL queries").
- **No hardcoded IDs.** Run the **Flow Scanner** (Code Analyzer v5) on every flow change.

### OmniStudio

- **Runtime detection first.** Standard vs Package — never mix in one org.
- **DataRaptors before Apex.** Declarative data access is the default.
- **IPs for orchestration.** OmniScripts wrap them for guided UX.
- **Cache strategy documented per IP.**

### sObjects + permission sets

- Description on every custom object and field.
- Don't duplicate standard objects.
- Permission sets, not profiles, for entitlements.
- `Modify All Data` / `View All Data` require justification in the description.

## Trigger framework awareness

`apex-lead` asks at session start which trigger handler framework is in use (FFLib, Kevin O'Hara's `trigger-framework`, project-local). Every new handler matches the existing convention. If none is in use, the lead proposes one (default: O'Hara's, simplest) and logs the choice in an ADR.

## Reference material baked in

Citations are inline in every rule file. The three canonical sources:

- **[SF-DPC]** Salesforce Engineering — *Developer Practices Checklist* (2015)
- **[SF-WIKI]** Salesforce Developer Wiki — *Apex Code Best Practices* (10 rules)
- **[SFB]** SalesforceBen — *12 Salesforce Apex Best Practices*

Headless 360 / MCP / OmniStudio runtime guidance pulls from official Salesforce engineering blogs and `@salesforce/mcp` documentation. Modern security syntax (`WITH USER_MODE` etc.) is from the [Salesforce Secure Coding Guidelines](https://developer.salesforce.com/docs/atlas.en-us.secure_coding_guide.meta/secure_coding_guide/intro.htm).

## Hooks (automated enforcement)

`.claude/hooks/validate-commit.sh` scans staged Apex on every `git commit` for:

- Hardcoded SF Id literals (15- or 18-char alphanumerics in single quotes)
- SOQL inside `for` loops
- DML inside `for` loops
- Missing sharing declaration on `public`/`global` classes
- `SeeAllData=true` in test classes

Warnings only — non-blocking by design. To make any of these blocking, change the hook's `exit 0` to `exit 1`.

`.claude/hooks/validate-deploy.sh` warns on `sf project deploy start` against production targets without prior validate; flags `--test-level NoTestRun`.

`.claude/hooks/validate-push.sh` warns on push to protected branches (`main`, `master`, `release/*`, `production`).
