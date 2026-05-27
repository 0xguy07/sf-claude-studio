---
paths:
  - "force-app/**/objects/**/*.object-meta.xml"
  - "force-app/**/objects/**/fields/*.field-meta.xml"
  - "src/objects/**/*.object-meta.xml"
---

# SObject & Field Rules

## Mandatory

- **Description on every custom object and field.** No exceptions. The description shows in metadata APIs, reports, and integrations.
- **Naming** — custom objects and fields use PascalCase singular for objects (`Volunteer__c`, not `Volunteers__c`); snake-friendly multi-word fields (`Last_Contacted_Date__c`).
- **Don't duplicate standard objects** — extend Account, Lead, Contact, Opportunity, Case rather than creating `Customer__c`, `Sales_Lead__c`, etc.
- **Picklist values governed.** Picklist value sets should be Global Value Sets when shared across objects.

## Strongly Recommended

- **Help text on every field.** Users see this in inline help icons.
- **Required fields require validation rules** — never rely solely on layout-level requiredness; the API can bypass it.
- **Master-detail vs. lookup** — pick deliberately. Master-detail is hard to undo: it cascades deletes and rolls up. Document the choice in the field description.
- **Formula vs. stored** — formulas don't take storage but are recomputed on every read; stored fields cost storage but are queryable indexed faster.
- **External Id flag** — set on any field used as an upsert key from integrations.

## Anti-patterns

- Fields named `Field1__c`, `Stuff__c`, `Misc__c`.
- Required text fields where a picklist (or lookup to a config object) would govern values.
- Custom Account field that overlaps with a standard Account field already on the platform.
