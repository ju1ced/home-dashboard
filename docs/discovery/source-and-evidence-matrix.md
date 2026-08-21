# Bron- en evidencematrix

Peildatum: 2026-08-21. Bij conflicten geldt: live read-only Home Assistant voor actuele toestand; officiële Home Assistant-documentatie voor platformgedrag; actuele bronrepositories voor hun implementaties; de vault voor historische intentie.

| Vraag | Sterkste bron | Evidence | Classificatie | Ontwerpbesluit |
|---|---|---|---|---|
| Wat draait nu? | Read-only Home Assistant MCP | Core 2026.8.2, storage-mode dashboard, 27 default-views, 52 resources, 3 floors en 26 geregistreerde areas, waarvan zes waarschijnlijk geen kamers zijn | actueel feit + classificatievraag | ontwerp tegen 2026.8.x; definitieve navigeerbare area-lijst en versiegrens later vastleggen |
| Is Home rustig en attention-first? | Live default-config + `../juiced-dashboard/dashboard/views/home.yaml` | Home mengt veel kamers, domeinen en diagnostiek en is zeer groot | actueel feit | nieuwe Home vanaf nul als operationeel overzicht |
| Is MCP Test een veilige kopie? | Live dashboardvergelijking | default en MCP Test verschillen in grootte/hash | actueel feit | verse export/snapshot en menselijke gate vóór staging |
| Welke shell past bij HA? | Officiële Sections-, views-, cards- en actions-docs | Sections is standaard; subviews, Tile, Heading, Badge en Visibility zijn native beschikbaar | officiële aanbeveling | native Sections-shell met semantische paths en subviews |
| Is visibility beveiliging? | Officiële views-docs | verborgen tabs blijven via URL bereikbaar | officieel feit | zichtbaarheid alleen voor UX; adminbeheer apart beveiligen |
| Hoe reageren custom cards efficiënt? | Officiële developer-docs | relevante subscriptions, identity checks en cleanup beperken rerenders | officieel feit | detail-only custom cards; lifecycle/performancecontract testen |
| Wat is herbruikbaar uit `juiced-dashboard`? | Actuele repo | includes, logische placeholders, lokale mapping, privacyguards, renders en migratiepatroon | actueel repo-feit | toolingprincipes hergebruiken, legacy Home-layout niet |
| Hoe integreren Kia, robot en tuin? | Hun bronrepos | zelfstandige HACS-cards met eigen mapping, veiligheids- en fallbacklogica | actueel repo-feit | compacte centrale summaries; volledige card op detailsubview |
| Heeft robot werk nodig? | Robotrepo + live resources | card is geregistreerd maar rendert bij iedere brede HA-update en zit niet in default | actueel feit | eerst relevante-state gating/QA in bronrepo; daarna detailintegratie |
| Is een custom panel wenselijk? | Casa repo + officiële HA-mogelijkheden | Casa biedt app-shell en dynamische kamers maar voegt een tweede runtime, routering en config-API toe | vergelijking/inferentie | geen custom panel; selectief app-like gedrag boven native shell |
| Welke Casa-ideeën passen? | Casa repo + vaultstudie van 2026-08-19 | progressive disclosure, lijstgestuurde kamers, verbergen van lege secties en expliciete mapping | actuele intentie + repo-feit | statisch version-controlled room/capabilitymodel, geen runtime magie |
| Is de vault actueel voor entities? | Graphify manifest 2026-07-29 | geen `.storage` registries/default Lovelace; dashboarddekking vooral Kia | dekkingsgat | vault niet gebruiken voor actuele entity-waarheid |
| Welke privacygrens geldt? | Opdracht + repo-tooling + vaultstudie | publieke `/www` mapping lekt topologie; huidige placeholderlaag is privacyveilig | vastgesteld risico | tracked logische keys, gitignored lokale mappings, privacyguard |
| Hoe behandelen we unavailable? | Live states + officiële cardgedrag | veel unavailable/unknown is diagnostisch of semantisch normaal | actueel feit | operationele allowlist en expliciete unavailable-fallback; diagnose apart |
| Hoe beheren we acties? | Officiële actions-docs + kaartcontracten | confirmation is native; specialistische cards hebben risicoclassificatie | officieel/repo-feit | toestand vóór actie; confirm voor riskante/kostbare acties |
| Hoe borgen we toegankelijkheid? | Officiële docs + eigen WCAG-interpretatie | native docs bewijzen geen WCAG-conformiteit | evidencegap | WCAG 2.2 AA, toetsenbord, screenreader en touch-targettests in bouwplan |

## Bronregister

### Live Home Assistant, read-only

- Overzicht, system health, dashboardlist en volledige default-config.
- Dashboardresources, floors/areas, devices, entity search en registrynaslag.
- Helpers, automations, scripts, scenes en statekwaliteit.
- Geen service calls, writes, backups of testacties.

### Officiële Home Assistant-bronnen

Alle geraadpleegd op 2026-08-21.

- <https://www.home-assistant.io/dashboards/>
- <https://www.home-assistant.io/dashboards/dashboards/>
- <https://www.home-assistant.io/dashboards/sections/>
- <https://www.home-assistant.io/dashboards/views/>
- <https://www.home-assistant.io/dashboards/cards/>
- <https://www.home-assistant.io/dashboards/tile/>
- <https://www.home-assistant.io/dashboards/features/>
- <https://www.home-assistant.io/dashboards/heading/>
- <https://www.home-assistant.io/dashboards/badges/>
- <https://www.home-assistant.io/dashboards/conditional/>
- <https://www.home-assistant.io/dashboards/actions/>
- <https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/>
- <https://developers.home-assistant.io/docs/frontend/custom-ui/registering-resources/>
- <https://developers.home-assistant.io/docs/frontend/data/>
- <https://developers.home-assistant.io/docs/frontend/design/>
- <https://developers.home-assistant.io/docs/internationalization/>

### Repositories

- `../juiced-dashboard/README.md`
- `../juiced-dashboard/ARCHITECTURE.md`
- `../juiced-dashboard/docs/default-dashboard-analysis-and-plan.md`
- `../juiced-dashboard/docs/entity-mapping.md`
- `../juiced-dashboard/docs/performance-baseline.md`
- `../juiced-dashboard/docs/nav-badge-evaluation.md`
- `../juiced-dashboard/dashboard/`
- `../ha-kia-connect-dashboard/README.md`, `ARCHITECTURE.md`, `ha-kia-connect-dashboard.js`
- `../robot-vacuum-dashboard/README.md`, `robot-vacuum-dashboard.js`, `scripts/check-card.js`
- `ju1ced/garden-dashboard`: `README.md`, `ARCHITECTURE.md`, `garden-dashboard.js`, `test/`
- <https://github.com/fabiovit/casa-dashboard>

Alle vier referentieprojecten hebben een MIT-licentie. In deze fase is geen code, asset of merkidentiteit gekopieerd.

### Obsidian/Graphify-vault, read-only

- `Casa Dashboard - Architecture Study.md`, aangemaakt/gewijzigd 2026-08-19.
- `Graphify/HomeAssistant/.graphify_obsidian_manifest.json`, snapshot/mtime 2026-07-29.
- Taakrelevante Kia-, energie-, automation-, script-, kamer- en vacuumnotities uit dezelfde snapshot.
- `EXTRACTED` relaties zijn alleen historische bronmetadata; `INFERRED` en community-clusters zijn geen bewijs.

## Evidencegaten die de bouw niet blokkeren

- De eigenaar heeft Home Assistant 2026.8.2 als minimale versie gekozen; compatibiliteit met oudere versies is geen doel.
- De zesde dashboard-entry en volledige disabled-registry zijn niet verklaard.
- Werkelijke gezinsfrequentie van quick actions is nog niet met gebruikersonderzoek gemeten.
- Bestaande kaarten hebben ongelijke browser- en visuele testdekking.

## Eigenaarsbesluiten na conceptreview

- Home Assistant 2026.8.2 is de minimale ondersteunde versie.
- De gewone HA-sidebar blijft buiten het dashboard; de eerdere prototype-sidebar was geen te bouwen custom dashboardcomponent.
- Kamers is een volledige overzichtsview met alle bevestigde kamers en capability-afhankelijke quick actions.
- Energie is een zelfstandige volledige hoofdview.
- Kia-, robot- en tuindetails renderen de volledige bestaande cards.
- Zwembad krijgt een nieuwe volledige specialistische card in dezelfde stijl en met dezelfde dependencygrenzen.
- Home behoudt individuele person cards en een horizontaal scrollbare strook met drie camera's en afzonderlijke privacystanden; privacy uitschakelen vraagt expliciete bevestiging.
