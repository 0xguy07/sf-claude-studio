---
name: sf-describe-snapshot
description: "Describe org objects referenced in force-app and write docs/schema/<Object>.md — field API names, types, picklist values, record types. Idempotent. Use before writing any metadata so field references are verified, not invented."
argument-hint: "[--object <SObject>] [--target-org <alias>]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, AskUserQuestion
model: sonnet
agent: data-lead
---

Snapshot the live schema of the objects this project touches so that later metadata work references real field API names, types, picklist values, and record types — never invented ones. The output is `docs/schema/<Object>.md`, one file per object, committed to the repo.

## Phase 1: Resolve the object list

If `--object <SObject>` was passed, the list is just that one object — skip discovery.

Otherwise discover the set of referenced objects two ways and union them:

1. **`objects/` directories** — every object with a local source folder:

   ```
   ls -d force-app/**/objects/*/ src/objects/*/ 2>/dev/null
   ```

   The directory name is the object API name (e.g. `Account`, `Volunteer__c`).

2. **SOQL `FROM` clauses** — sObject names queried in Apex and flows:

   ```
   grep -rhoiE 'from[[:space:]]+([A-Za-z0-9_]+__c|[A-Za-z][A-Za-z0-9]+)' \
       force-app --include='*.cls' --include='*.trigger' --include='*flow-meta.xml' 2>/dev/null
   ```

   Take the token after `FROM`. Drop obvious non-objects (subquery noise, `SELECT` aliases). Keep standard objects (Account, Contact, Case, Opportunity, etc.) and any `*__c`.

Dedupe the union. Show the resolved list and the count before describing anything — a large list means a lot of describe calls against the org's API budget.

## Phase 2: Confirm target org

Read `sf config get target-org`. Confirm the alias with the user (or accept `--target-org`). Describe is read-only, but it still consumes API calls — confirm the target before fanning out.

## Phase 3: Describe each object

For each object:

```
sf sobject describe --sobject <Object> --target-org <alias> --json
```

If an object errors (not found in this org, no access), note it and continue — don't abort the whole run.

## Phase 4: Write docs/schema/<Object>.md

Create `docs/schema/` if absent. For each described object, write `docs/schema/<Object>.md`, overwriting only that file (idempotent — other objects' snapshots are left untouched). Layout:

```markdown
# <Label> (`<Object API name>`)

Snapshot of the `<alias>` org. Regenerate with `/sf-describe-snapshot --object <Object>`.

- Custom: <true/false> · Queryable · Createable · Updateable
- Record types: <list DeveloperName, or "none">

## Fields

| API name | Label | Type | Required | Details |
|-|-|-|-|-|
| `Name` | Name | string | yes | |
| `Stage__c` | Stage | picklist | no | values: New, Active, Closed |
| `AccountId` | Account | reference | no | → Account |

## Picklist values

### `Stage__c`
- New
- Active
- Closed (inactive)
```

Field-row rules:
- **Type** comes from the describe `type`.
- **Required** = `nillable == false && defaultedOnCreate == false`.
- **Details**: for `reference` show `→ <referenceTo>`; for `picklist`/`multipicklist` inline the active values (and flag inactive ones in the dedicated section); for formula/autonumber/external-id note it.
- List picklist value sets in full under **Picklist values** — these are what later metadata work must match exactly.

## Phase 5: Report

State which objects were snapshotted, which were skipped (and why), and the file paths written. Remind the user the snapshots are the source of truth referenced by the "check `docs/schema/` before writing metadata" rule in CLAUDE.md, and that they should be committed.
