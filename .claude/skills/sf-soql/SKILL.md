---
name: sf-soql
description: "Run an ad-hoc SOQL query against the target org and pretty-print the result. Read-only by design."
argument-hint: "<soql-query>"
user-invocable: true
allowed-tools: Read, Bash, AskUserQuestion
model: haiku
---

## Phase 1: Validate the query

Reject the query and ask the user to revise if it:
- Has no `WHERE` clause on an SObject expected to have > 100k rows (warn, don't block).
- Uses `LIKE '%foo%'` as the leading filter (warn, may scan).
- Mentions a column that looks PII-sensitive (`Email`, `Phone`, `SSN__c`) — confirm intent before running.

## Phase 2: Confirm target org

Read `sf config get target-org` and confirm with the user. Refuse to run against any alias the project has flagged as `production` without explicit re-confirmation.

## Phase 3: Run

Prefer MCP `run_soql_query` if available. Otherwise:

```
sf data query --query "<query>" --target-org <alias> --result-format json
```

## Phase 4: Output

Pretty-print the result. If it's > 50 rows, show the first 20 and offer to write the full result to `tmp/soql-<timestamp>.json`.

If the query consumed > 1000 rows, surface this as a warning — that's noise on the org's API budget.
