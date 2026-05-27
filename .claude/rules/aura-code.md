---
paths:
  - "force-app/**/aura/**"
  - "src/aura/**"
---

# Aura Component Rules

## Position

**Don't write new Aura.** Salesforce is deprecating Aura over the long term and the DX MCP `aura-experts` toolset (in particular `orchestrate_aura_migration`) handles the full PRD → blueprint → enhance → transition-to-LWC → verify pipeline.

For existing Aura that must be maintained:

## Mandatory

- **Apex bulkification rules apply equally** — `apex-classes.md` and `apex-triggers.md` rules are the same whether the caller is Aura, LWC, or VF. No SOQL/DML in loops, sharing declared, etc.
- **No new Aura components** without an explicit ADR justifying why LWC won't do.
- **Don't add features to legacy Aura** — port the component to LWC first, then add the feature in LWC.

## Strongly Recommended

- **Thin client-side controllers.** Move logic to server-side Apex via `@AuraEnabled` controllers. Aura's client-side controller layer is hard to test and hard to read.
- **Migration over patching.** When opening an Aura file for a non-trivial change, propose `/sf-aura-migrate` instead.
- **Action-method bulkification.** Just like Apex anywhere, `@AuraEnabled` methods should accept and return collections, not single records.
