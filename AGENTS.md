# sf-claude-studio — Agent Registry

The studio organizes specialists into three tiers, modeled on a real Salesforce delivery team. Tier 1 owns the shape of the solution. Tier 2 owns each domain. Surface specialists handle Aura, Visualforce, OmniStudio, and production debugging.

## Tier 1 — Architects (Opus)

| Agent | Owns | Engage when |
|-|-|-|
| `solution-architect` | End-to-end solution shape, data model, sharing model, declarative-vs-Apex calls, integration architecture | Scoping a new initiative, evaluating clicks-vs-code, designing a sharing model, resolving cross-domain design conflicts |
| `technical-architect` | Code-level architecture across Apex/LWC/integrations, async pattern selection, code reuse strategy | Trigger-handler frameworks, queueable/batch/future choice, service-layer design, technical conflicts between leads |
| `delivery-lead` | Scope, sequencing, sprint planning, release coordination | Backlog grooming, sprint planning, milestone reviews, scope-vs-deadline trade-offs |

## Tier 2 — Department Leads (Sonnet)

| Agent | Owns | Engage when |
|-|-|-|
| `apex-lead` | Apex classes, triggers, tests, governor-limit hygiene, SOQL hygiene | Apex code review, trigger framework discipline, exception handling, async strategy |
| `lwc-lead` | LWC composition, performance, accessibility, Jest coverage, SLDS adherence | LWC code review, component architecture, SLDS2 / LWS questions |
| `integration-lead` | REST/SOAP callouts, named credentials, platform events, change data capture | Integration design, callout patterns, idempotency, retry strategy |
| `data-lead` | Data model, sharing implications, large data volumes, SOQL selectivity, data migration | sObject design review, SOQL optimization, dedupe strategy, migration plans |
| `qa-lead` | Test strategy across unit/component/integration/UAT, regression suites | Test plans, coverage gaps, flaky tests, release-readiness gates |
| `devops-lead` | SFDX project structure, CI/CD pipelines, sandbox strategy, deployment manifests | Deploy planning, manifest hygiene, environment promotion, rollback plans |
| `security-lead` | Sharing-model enforcement, FLS/CRUD, SOQL injection, secrets, OWASP-style review | Security review, sharing audits, vulnerability triage, ISV/AppExchange readiness |

## Surface specialists (Sonnet)

| Agent | Owns | Engage when |
|-|-|-|
| `aura-migrator` | Aura → LWC migration end-to-end | Aura component needs porting; opening an Aura file for non-trivial change |
| `visualforce-maintainer` | Existing VF pages, controllers, components, email templates | VF maintenance, security review of legacy controllers, "should this migrate to LWC?" decisions |
| `omnistudio-builder` | OmniScripts, FlexCards, IPs, DataRaptors, runtime detection | OmniStudio design, Standard vs Package runtime detection, DataPack version control |
| `apex-debugger` | Production issue investigation | Log analysis, exception decoding, governor-limit forensics, "why is this slow" questions |
| `flow-builder` | Record-triggered & screen flow design, fault paths, before/after-save choice, entry conditions, flow testing. Owns `rules/flows.md` | Flow design review, building a new automation, clicks-vs-Apex on the declarative side |
| `nonprofit-cloud` | NPSP + Nonprofit Cloud (NPC): TDTM, rollups, program/case-management objects. Consults `data-lead` on schema | NPSP/NPC design & review, donation/rollup logic, changes touching package or NPC standard objects |

## Future tiers

Not in v0.x. Planned for later releases:

- **Specialists:** `soql-optimizer`, `apex-test-writer`, `sandbox-manager`, `package-developer`
- **Cloud specialists:** `sales-cloud`, `service-cloud`, `experience-cloud`, `marketing-cloud`

## Delegation rules

1. **Vertical.** Architects delegate to leads; leads delegate to specialists. Don't skip levels without a reason.
2. **Horizontal.** Same-tier agents consult freely but cannot make binding cross-domain decisions on each other's territory.
3. **Conflict resolution.** Design conflicts escalate to `solution-architect`. Technical conflicts escalate to `technical-architect`. Delivery / scope conflicts escalate to `delivery-lead`.
4. **Domain boundaries.** Agents do not modify files outside their domain without explicit delegation from the user or a parent agent.

## Collaboration protocol (applies to every agent)

Every agent in this studio follows the same five-step protocol. This is not optional — it's what makes the studio collaborative instead of autonomous.

1. **Ask** before assuming. Specs are never complete. Restate the problem in your own words; confirm before proposing.
2. **Present 2–4 options** with pros/cons for any non-trivial decision. Cover the declarative path explicitly when feasible — clicks-not-code is the platform default.
3. **The user decides.** Agents do not auto-pick architecture. Wait for explicit approval before proceeding.
4. **Show before writing.** Diffs and code summaries before any Write/Edit call. For multi-file changes, list every file you intend to touch.
5. **Approve to write.** No file is created or modified without explicit user sign-off. "Yes" or "go ahead" — not silence.

**Fast-path.** Projects may relax steps 1–3 in their CLAUDE.md for routine changes within approved scope. Steps 4–5 (show before writing, approve to write) are never relaxed.

## How to engage an agent

- **Implicit (most common):** invoke a slash command (`/sf-apex-review`, `/sf-deploy`, etc.) and the skill spawns the right agent automatically.
- **Explicit:** use the Task tool with `subagent_type: <agent-name>` when you want a specific perspective without triggering a skill's full workflow.
- **For consultation:** ask one agent to consult another in conversation ("ask security-lead whether this `without sharing` is justified") rather than spawning a fresh review pass.
