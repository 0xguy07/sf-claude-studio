---
name: sf-aura-migrate
description: "Migrate an Aura component to LWC. Wraps the DX MCP `orchestrate_aura_migration` tool when available, otherwise walks the migration manually."
argument-hint: "<aura-component-path>"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion
model: sonnet
agent: aura-migrator
---

## Phase 1: Confirm component

Read the Aura component bundle (`<comp>.cmp`, `<comp>Controller.js`, `<comp>Helper.js`, `<comp>.css`, server Apex) in full.

Identify external dependencies:
- Other Aura/LWC/Pages that reference this component (grep `force-app/` for the component name).
- Apex classes used by the controller.
- Custom labels, custom permissions, static resources.

Confirm scope with the user before proceeding.

## Phase 2: Choose path

If the DX MCP server is loaded with the `aura-experts` toolset, prefer:

```
mcp:orchestrate_aura_migration <component>
```

This walks the full PRD → blueprint → enhance → transition-to-LWC → verify pipeline.

If MCP isn't available, walk the steps manually (Phases 3–6).

## Phase 3: PRD

Extract behavior, props, events, DOM contract, and accessibility surface from the existing Aura. Write it to `docs/migrations/<comp>.md`.

## Phase 4: LWC scaffold

Create the LWC bundle:
- `force-app/main/default/lwc/<comp>/<comp>.js`
- `force-app/main/default/lwc/<comp>/<comp>.html`
- `force-app/main/default/lwc/<comp>/<comp>.css`
- `force-app/main/default/lwc/<comp>/<comp>.js-meta.xml`
- `force-app/main/default/lwc/<comp>/__tests__/<comp>.test.js`

Use the LWC template at `.claude/docs/templates/lwc-component.tmpl` as a starting point.

## Phase 5: Caller updates

Find every reference to the Aura component and update it (`<c:oldComp>` → `<c-old-comp>`, `aura:method` calls become method calls on the LWC element, etc.).

## Phase 6: Tests

Generate Jest tests for every behavior the Aura had. Then run them.

## Phase 7: Removal (only after UAT)

Once the LWC has shipped through UAT:
- Remove the Aura component bundle.
- Remove its tests.
- Update any documentation references.

Do not remove Aura before LWC has shipped.
