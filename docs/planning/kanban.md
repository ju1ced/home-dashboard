# Home Dashboard — kanban bord

Ticket-overzicht voor `home-dashboard`. Elk ticket linkt door naar zijn detail in [tickets.md](tickets.md). Klaar bevat al het afgeronde werk, van de eerste HACS-fundering (HD-001) tot de recentste room-card-slice — lokaal werk staat expliciet gemarkeerd zolang het nog niet gepusht of released is. Backlog bevat openstaand werk richting v1; scope en gates volgen het [implementatieplan](../design/implementation-plan.md), de [deliveryroadmap](../design/delivery-roadmap.md) en het [beslislog](../design/decision-log.md). WIP-limiet: maximaal één ticket **In uitvoering** en maximaal twee in **Review/validatie**. Geen push, PR, prerelease, Home Assistant-write of productiecutover zonder de daar vastgelegde expliciete goedkeuring. Peildatum 25 september 2026.

De kolom **Volgorde** vertaalt afhankelijkheden naar de aanbevolen uitvoering: fase 0 rondt commit, PR en prerelease van de reeds gebouwde lokale alpha.20-kandidaat af; fase 1 voert de menselijke QA- en runtimecyclus uit; fase 2 zet de resterende v1-scope en specialistcontracten vast; fase 3 bouwt de gekozen specialisten; fase 4 valideert de geïntegreerde specialistset; fase 5 sluit performance, resources en productbrede veiligheid; fase 6 bewijst release en testmigratie; fase 7 is de afzonderlijke productiepoort. Letters geven de volgorde binnen een fase aan; gelijk genummerde bronrepotrajecten mogen met gescheiden ownership parallel lopen. `Voorwaardelijk` betekent dat het ticket alleen bij concrete bevindingen start.

## Backlog

| Ticket | Prioriteit | Categorie | Volgorde | Toelichting |
|---|---|---|---|---|
| [HD-112 Runtimebevindingen oplossen](tickets.md#hd-112--runtimebevindingen-oplossen) | P1 | Runtimeacceptatie | 1d · Voorwaardelijk | Live gevonden bevindingen oplossen in kleine, geïsoleerde regressieslices |
| [HD-181 Admin-dashboardgrens uitwerken](tickets.md#hd-181--admin-dashboardgrens-uitwerken) | P2 | Diagnostiek | 2b | `require_admin`-grens voor diagnostiek/beheer, los van het gezinsdashboard; architectuurbeslissing genomen (D-068), klaar om op te pakken |
| [HD-192 v1-documentatie en release readiness afronden](tickets.md#hd-192--v1-documentatie-en-release-readiness-afronden) | P1 | Release engineering | 6c | Documentatie laten overeenkomen met de werkelijk bewezen v1-scope |


## In uitvoering

Geen tickets.

## Review/validatie

| Ticket | Prioriteit | Categorie | Volgorde | Toelichting |
|---|---|---|---|---|
| [HD-170 Volledige responsive, accessibility en visual QA](tickets.md#hd-170--volledige-responsive-accessibility-en-visual-qa) | P1 | Quality engineering | 1a en 4b | Nu de menselijke alpha.20-QA uitvoeren; definitief sluiten na validatie van de gekozen specialistset |

## Klaar

| Ticket | Prioriteit | Categorie | Afgerond via |
|---|---|---|---|
| [HD-001 Repositoryfundering, HACS, tooling en privacyguards](tickets.md#hd-001--repositoryfundering-hacs-tooling-en-privacyguards) | P0 | Foundation & HACS | `v0.1.0-alpha.1` |
| [HD-002 Entitymapping, room-/capabilitymodel en GUI-configuratie](tickets.md#hd-002--entitymapping-room-capabilitymodel-en-volledige-gui-configuratie) | P0 | GUI-config | `v0.2.0-alpha.1` |
| [HD-003 Custom dashboard strategy, tokens, HA-shell en navigatie](tickets.md#hd-003--custom-dashboard-strategy-tokens-ha-shellgrens-en-navigatie) | P0 | Shell & navigatie | `v0.3.0-alpha.1` |
| [HD-004 Home, person cards en contextuele waarschuwingen](tickets.md#hd-004--home-person-cards-en-contextuele-waarschuwingen) | P0 | Home & security | `v0.4.0-alpha.1` → `v0.8.0-alpha.13` |
| [HD-005 Volledig Kamers-overzicht, kamermodel en kamerpagina's](tickets.md#hd-005--volledig-kamers-overzicht-kamermodel-en-kamerpaginas) | P0 | Kamers | `v0.5.0-alpha.1` → `v0.8.0-alpha.9` |
| [HD-006 Volledige Energie-hoofdview en domeinpagina's](tickets.md#hd-006--volledige-energie-hoofdview-en-woningbrede-domeinpaginas) | P1 | Energie en domeinen | `v0.6.0-alpha.1` |
| [HD-007 Kia-integratie](tickets.md#hd-007--kia-integratie) | P1 | Specialisten | `v0.7.0-alpha.1` |
| [HD-008 Zelfstandige 3D-printerspecialist](tickets.md#hd-008--zelfstandige-3d-printerspecialist) | P1 | Specialisten | PR #39 · `v0.8.0-alpha.11`/`.12` |
| [HD-009 Read-only zwembadsamenvatting](tickets.md#hd-009--read-only-zwembadsamenvatting) | P1 | Specialisten | PR #41 · `v0.8.0-alpha.11` |
| [HD-010 Consistente navigatie, lokale kiosk en Home-header](tickets.md#hd-010--consistente-navigatie-lokale-kiosk-en-gekleurde-home-header) | P1 | Shell & navigatie | PR #40 · `v0.8.0-alpha.9`/`.10`/`.13` |
| [HD-101 Room-card overhaul afronden](tickets.md#hd-101--room-card-overhaul-afronden) | P0 | Kamers | Lokaal · `v0.8.0-alpha.19` candidate |
| [HD-102 Room-card slice reviewen en releaseklaar maken](tickets.md#hd-102--room-card-slice-reviewen-en-releaseklaar-maken) | P0 | Kamers | Lokaal · 85/85 tests, byte-identieke rebuild |
| [HD-110 Browserregressiematrix consolideren](tickets.md#hd-110--browserregressiematrix-consolideren) | P1 | Quality engineering | Lokaal · 88/88 tests, `pnpm run test:browser` |
| [HD-120 Energy-paritymanifest actualiseren](tickets.md#hd-120--energy-paritymanifest-actualiseren) | P1 | Energie en domeinen | Lokaal · `docs/quality/energy-parity-manifest.md` |
| [HD-150 Zwembadstatusrandgevallen tegen de bron bevestigen](tickets.md#hd-150--zwembadstatusrandgevallen-tegen-de-bron-bevestigen) | P1 | Specialisten | Lokaal · `docs/quality/pool-status-contract.md` |
| [HD-202 Control Deck-kamerdashboard implementeren](tickets.md#hd-202--control-deck-kamerdashboard-implementeren) | P1 | Kamers | PR #48 · `v0.8.0-alpha.21` |
| [HD-204 Control Deck herstructureren naar de v3-rail](tickets.md#hd-204--control-deck-herstructureren-naar-de-v3-rail) | P1 | Kamers | PR #50 · `v0.8.0-alpha.22` |
| [HD-206 Control Deck-omkadering aanvullen naar de v3-mockup](tickets.md#hd-206--control-deck-omkadering-aanvullen-naar-de-v3-mockup) | P1 | Kamers | PR #52 · `v0.8.0-alpha.23` |
| [HD-210 Bundlebudget structureel oplossen: editor lazy laden](tickets.md#hd-210--bundlebudget-structureel-oplossen-editor-lazy-laden) | P0 | Performance | PR #59 · `v0.8.0-alpha.26` |
| [HD-200 3D-printerspecialist: contract en documentatiereconciliatie](tickets.md#hd-200--3d-printerspecialist-contract-productiegate-en-documentatiereconciliatie) | P1 | Specialisten | Documentatie, geen release nodig |
| [HD-203 LINAK-bureaucard: contract en documentatiereconciliatie](tickets.md#hd-203--linak-bureaucard-contract-en-documentatiereconciliatie) | P2 | Specialisten | Documentatie, geen release nodig |
| [HD-208 Control Deck afbakenen, zinloze tekst schrappen, Kamerverbruik combineren](tickets.md#hd-208--control-deck-visueel-afbakenen-zinloze-tekst-schrappen-en-kamerverbruik-echt-combineren) | P0 | Kamers | PR #55 · `v0.8.0-alpha.24` |
| [HD-209 Kamerafbeelding rechtstreeks kunnen uploaden](tickets.md#hd-209--kamerafbeelding-rechtstreeks-kunnen-uploaden) | P1 | Kamers | PR #57 · `v0.8.0-alpha.25` |
| [HD-207 Control Deck-omkadering: drie resterende hiaten](tickets.md#hd-207--control-deck-omkadering-drie-resterende-hiaten) | P2 | Kamers | PR #63 · `v0.8.0-alpha.27` |
| [HD-205 Verbruik en Historie op echte HA-statistics en logbook-data](tickets.md#hd-205--verbruik-en-historie-op-echte-ha-statistics-en-logbook-data) | P2 | Kamers / Energie en domeinen | PR #66 · `v0.8.0-alpha.27` |
| [HD-171 Performancebaseline en budgetten vastleggen](tickets.md#hd-171--performancebaseline-en-budgetten-vastleggen) | P1 | Performance | PR #67 · `v0.8.0-alpha.27` |
| [HD-172 Multi-dashboard resource-audit uitvoeren](tickets.md#hd-172--multi-dashboard-resource-audit-uitvoeren) | P1 | Performance | PR #68 · `docs/quality/resource-audit.md` |
| [HD-201 Volledige productaudit voor privacy en beveiliging](tickets.md#hd-201--volledige-productaudit-voor-privacy-en-beveiliging) | P0 | Quality engineering | PR #69 · `v0.8.0-alpha.27` |
| [HD-211 Printersummary: relevante-state gating toevoegen](tickets.md#hd-211--printersummary-relevante-state-gating-toevoegen) | P2 | Performance | PR #71 |
| [HD-212 mountCard()-resourcefallback met een echte test bewijzen](tickets.md#hd-212--mountcard-resourcefallback-met-een-echte-test-bewijzen) | P2 | Quality engineering | PR #72 |
| [HD-213 Diff-voor-schrijven toevoegen aan Home, Energie en pool-specialist renderpaden](tickets.md#hd-213--diff-voor-schrijven-toevoegen-aan-home-energie-en-pool-specialist-renderpaden) | P2 | Performance | PR #73 |
| [HD-214 Centrale actionallowlist is gedefinieerd maar nergens uitgevoerd](tickets.md#hd-214--centrale-actionallowlist-actionconfigprivacy_action_key-is-gedefinieerd-maar-nergens-uitgevoerd) | P2 | Quality engineering | PR #74 · `v0.8.0-alpha.28` |
| [HD-215 GUI-configuratie-editor opsplitsen per sectie](tickets.md#hd-215--gui-configuratie-editor-opsplitsen-per-sectie) | P2 | Quality engineering | PR #77 |
| [HD-180 HACS lifecycle en compatibiliteitsmatrix bijwerken](tickets.md#hd-180--hacs-lifecycle-en-compatibiliteitsmatrix-bijwerken) | P1 | Release engineering | Live HACS-test 6 okt 2026, geen PR nodig (documentatie + live verificatie) |

## Geblokkeerd

| Ticket | Prioriteit | Categorie | Volgorde | Blokkade |
|---|---|---|---|---|
| [HD-111 Live acceptatie van de actuele alpha](tickets.md#hd-111--live-acceptatie-van-de-actuele-alpha) | P0 | Runtimeacceptatie | 1b | Expliciet goedgekeurd testdashboard, verse snapshot en targetallowlist |
| [HD-121 Live Energie- en domeinpariteit valideren](tickets.md#hd-121--live-energie--en-domeinpariteit-valideren) | P1 | Energie en domeinen | 1c | HD-120 en menselijke runtimegate; praktisch in hetzelfde testvenster als HD-111 |
| [HD-130 Robot-bronrepo door de productiepoort brengen](tickets.md#hd-130--robot-bronrepo-door-de-productiepoort-brengen) | P1 | Specialisten | 3a | Afzonderlijke scope en eigenaarschap in de robot-bronrepo |
| [HD-131 Robot centraal integreren](tickets.md#hd-131--robot-centraal-integreren) | P1 | Specialisten | 3b | HD-130 |
| [HD-140 Tuincard-contract en bronrepo valideren](tickets.md#hd-140--tuincard-contract-en-bronrepo-valideren) | P1 | Specialisten | 3a | Afzonderlijke bronrepo-scope indien fixes nodig zijn |
| [HD-141 Tuin centraal integreren](tickets.md#hd-141--tuin-centraal-integreren) | P1 | Specialisten | 3c | HD-140 |
| [HD-151 Zelfstandige pool-dashboard-card bouwen](tickets.md#hd-151--zelfstandige-pool-dashboard-card-bouwen) | P1 | Specialisten | 3a | HD-150 en goedgekeurde nieuwe bronrepo-/releasegrens |
| [HD-152 Volledige zwembadkaart centraal integreren](tickets.md#hd-152--volledige-zwembadkaart-centraal-integreren) | P1 | Specialisten | 3d | HD-151 |
| [HD-160 Specialistische runtimeacceptatie uitvoeren](tickets.md#hd-160--specialistische-runtimeacceptatie-uitvoeren) | P1 | Specialisten | 4a | Menselijke runtimegate en beschikbare specialistresources |
| [HD-190 Testmigratie en rollback bewijzen](tickets.md#hd-190--testmigratie-en-rollback-bewijzen) | P0 | Migratie | 6b | Alle product-, QA- en auditgates groen plus menselijke toestemming |
| [HD-191 Gezinsacceptatie en productiecutover](tickets.md#hd-191--gezinsacceptatie-en-productiecutover) | P0 | Migratie | 7 | HD-190 en aparte productiegoedkeuring |
