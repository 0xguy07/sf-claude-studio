---
paths:
  - "force-app/**/pages/**"
  - "force-app/**/components/**/*.component"
  - "src/pages/**"
---

# Visualforce Rules

## Position

VF is mature/legacy. Net-new VF is rare; this is mostly maintenance. For new UI, prefer LWC. The exceptions where VF is still legitimate:

- Public Sites that need server-rendered output without LWC overhead.
- Email templates that use `<messaging:emailTemplate>` (Visualforce Email Templates).
- Specific PDF-generation use cases (`renderAs="pdf"`).

## Mandatory

- **Standard or StandardSet controllers preferred** when the page maps cleanly to a single SObject or collection. Hand-rolled custom controllers are easier to write but harder to maintain — only use one when StandardController doesn't fit.
- **CRUD/FLS in custom controllers.** When you don't have StandardController doing the enforcement for you, you must check explicitly:
  - `Schema.sObjectType.<Object>.fields.<Field>.isAccessible()` for reads.
  - `Schema.sObjectType.<Object>.fields.<Field>.isUpdateable()` / `isCreateable()` before DML.
  - Or qualify SOQL with `WITH USER_MODE` (Spring '23+) and DML with `Database.<op>(records, AccessLevel.USER_MODE)`.
- **VFRemoting (`@RemoteAction`) bulkifies like everything else.** No SOQL/DML in loops on the server side; collections in, collections out.
- **No hardcoded IDs.** Same as Apex.
- **Sharing declared on every controller class** (see `apex-classes.md`).
- **`apex:inputText` etc. with `escape="false"` is dangerous.** Default is `escape="true"` — leave it. Setting `escape="false"` enables stored XSS unless every value path is sanitized.

## Strongly Recommended

- **Migration ADRs.** When touching a VF page for a non-trivial change, ask whether it should migrate to LWC first.
- **CSRF protection on GET** — set the org-level `Require CSRF protection on GET requests to Visualforce pages` if the page mutates state on GET (it shouldn't, but legacy code).
- **No CSS or JS inline.** Use static resources; lets you version and cache them.
- **Mobile readiness.** If the page is rendered on Mobile Publisher, verify `<apex:page standardStylesheets="false">` etc. behaves on the platform.
