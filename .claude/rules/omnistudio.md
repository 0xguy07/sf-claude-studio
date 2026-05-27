---
paths:
  - "force-app/**/omniStudio/**"
  - "force-app/**/dataPacks/**"
  - "vlocity/**"
---

# OmniStudio Rules

## Runtime detection (do this first)

OmniStudio has two deployment paths and **mixing them in one org breaks deployments**.

- **Standard / Core Runtime** — components live as proper metadata under `force-app/**/omniStudio/`. Deploy with `sf project deploy start` like anything else. **This is the path forward.**
- **Package Runtime** — components are DataPacks (data, not metadata). Need the OmniStudio Build Tool (formerly Vlocity Build Tool, `vlocity packExport` / `packDeploy`). Separate tool, separate pipeline.

The `/sf-omnistudio-detect` skill identifies which runtime is active. Bake the answer into the project's CLAUDE.md so the agent doesn't waste time guessing.

## Mandatory

- **DataRaptors before Apex.** The platform's declarative data-access layer should be your default for read/write/transform. Reach for Apex only when DataRaptor can't express the operation.
- **Integration Procedures (IPs) for orchestration.** Chain DataRaptors, callouts, and conditional logic in an IP rather than wiring components together by hand or doing orchestration in Apex.
- **OmniScripts for guided user flows.** Wrap an IP for the data layer; keep the OmniScript focused on UX.
- **FlexCards for read-mostly UI.** They compile to LWC under the hood — same security/perf rules apply.
- **Cache settings reviewed at deploy time.** IPs and DataRaptors have caching layers that look fine in dev and serve stale data in prod. Document the cache strategy per IP.
- **No mixing runtimes in a single org.** If you inherit a Package Runtime org, plan a migration to Standard Runtime; don't add Standard Runtime components alongside.

## Strongly Recommended

- **Version-control DataPacks via export** if you're on Package Runtime. The OmniStudio Build Tool can produce git-friendly JSON. Don't track DataPacks as binary blobs.
- **Standard Runtime for any new build.** Salesforce is consolidating roadmap on Metadata API for OmniStudio.
- **Naming conventions** — use the same `Object_Trigger_Purpose` shape as flows, prefixed by component type (`DR_Get_Account`, `IP_Onboard_Customer`, `OS_NewClaim`).
- **OmniScript step count** — keep them under ~10 steps. Past that, split into multiple linked OmniScripts.

## References

- [OmniStudio Documentation](https://help.salesforce.com/s/articleView?id=sf.os_omnistudio_documentation.htm)
- [OmniStudio Deployments Roadmap (Salesforce Engineering blog)](https://developer.salesforce.com/blogs/2026/02/omnistudio-deployments-made-easier-whats-coming-on-the-salesforce-roadmap)
- [Copado: Mixing legacy DataPacks and Metadata-API components](https://docs.essentials.copado.com/en/articles/9820646-deploying-salesforce-industries-metadata)
