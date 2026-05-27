---
paths:
  - "force-app/**/permissionsets/**"
  - "src/permissionsets/**"
---

# Permission Set Rules

## Mandatory

- **Least privilege.** Grant only what the user needs to do the job.
- **`Modify All Data` and `View All Data` require justification.** Documented in the permission set's `<description>` field.
- **Permission sets, not profiles, for entitlements.** Profiles get only the absolute minimum (license-bound + page layouts). Everything else flows via permission sets / permission set groups.
- **Description required.** Who is this for and what does it grant?

## Strongly Recommended

- **Permission set groups** for role bundles (`Service Agent`, `Sales Manager`).
- **Naming** — `{Persona}_{Capability}` (e.g., `ServiceAgent_CaseManagement`).
- **No assignment to individual users in source.** Assignments belong to the org config, not the metadata repo, with the rare exception of test users.

## Anti-patterns

- "Admin" perm set granted to non-admins.
- Permission sets that mix object access, system permissions, and Apex class access for unrelated features.
- Object permissions duplicated across many permission sets instead of inherited via groups.
