---
name: sf-retrieve
description: "Pull metadata from an org into source format. Wraps `sf project retrieve start` (or the MCP `retrieve_metadata` tool) with sensible defaults and a confirmation step."
argument-hint: "<metadata-type-or-glob> [--target-org <alias>]"
user-invocable: true
allowed-tools: Read, Glob, Bash, AskUserQuestion
model: sonnet
agent: devops-lead
---

## Phase 1: Confirm scope and target

Ask the user (or accept from arguments):
- What metadata type or path glob? (e.g., `ApexClass`, `Flow:My_Flow`, `force-app/main/default/lwc/myComp`)
- Target org alias?

Show the inferred scope before retrieving — large-scope retrieves can pull thousands of files.

## Phase 2: Detect MCP availability

If `.mcp.json` is present and `Salesforce DX` MCP server is loaded with the `metadata` toolset, prefer the MCP `retrieve_metadata` tool. Otherwise fall back to:

```
sf project retrieve start --metadata "<types>" --target-org <alias>
```

or for a path:

```
sf project retrieve start --source-dir <path> --target-org <alias>
```

## Phase 3: Show what changed

After the retrieve, run `git status` and show the user the new/modified files. Don't `git add` — let the user review first.

## Phase 4: Suggest follow-ups

Depending on what was retrieved, recommend:
- Apex → `/sf-apex-review` on the new classes.
- Flows → `/sf-flow-review`.
- LWC → `/sf-lwc-review`.
- Permission sets → `/sf-security-review --scope diff`.
