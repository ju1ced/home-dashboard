# Projectkanban

Peildatum: 23 september 2026. Dit bord vertaalt het nog resterende werk uit de deliveryroadmap naar opvolgbare tickets. De technische scope en gates blijven bepaald door het [implementatieplan](../design/implementation-plan.md), de [deliveryroadmap](../design/delivery-roadmap.md) en het [beslislog](../design/decision-log.md).

## Werkwijze

- Ticketdetails, afhankelijkheden en acceptatiecriteria staan in het [ticketregister](tickets.md).
- Statussen: **Backlog → Gereed → In uitvoering → Review/validatie → Klaar**.
- **Geblokkeerd** is een zijstatus voor werk dat een menselijke gate, externe bronrepo of eerdere ticket vereist.
- WIP-limiet: maximaal één productticket **In uitvoering** en maximaal twee tickets in **Review/validatie**.
- `P0` blokkeert de gate waarop het ticket betrekking heeft. Runtime-, migratie- en productiegates blokkeren geen synthetische prerelease die expliciet als nog niet live-geaccepteerd is gemarkeerd; `P1` is nodig voor v1 en `P2` is belangrijk maar niet op het directe kritieke pad.
- Verplaats een ticket pas naar **Klaar** wanneer de genoemde tests en bewijzen bestaan. Een lokale implementatie zonder runtimegate blijft niet automatisch klaar.
- Geen push, PR, prerelease, Home Assistant-write, deployment of productiecutover zonder de bestaande expliciete goedkeuring.

## Huidige samenvatting

- Actieve werkbranch: `codex/room-card-overhaul`.
- Lokale stand: releasecandidate `v0.8.0-alpha.19` staat lokaal; 88 tests, de browsermatrix en `git diff --check` zijn groen. Een verse `origin/main`-reconstructie bouwt byte-identiek en de gerichte rereview vond geen open P0/P1.
- HD-101 is lokaal afgerond: room-detail-, navigatie- en rendermatrix zijn groen op desktop, tablet en mobiel; de visuele review vond na de tabletbalansfix geen blocker.
- HD-102 is lokaal afgerond: de onafhankelijke review vond geen open P0/P1, de schone patchbuild is byte-identiek en release- plus rollbackscope zijn vastgelegd. Commit, PR en prerelease blijven afzonderlijke besluiten.
- HD-110 is lokaal afgerond: één runner dekt hoofdviews, details, editor, navigatie en specialisten met expliciete fixture-, viewport- en failurecontext.
- HD-120 en HD-150 zijn lokaal afgerond met privacyveilige parity- en broncontracten; niet-bewezen live semantiek is expliciet uitgesteld.
- HD-170 staat in review: de geautomatiseerde responsive, touch en reduced-motiongates zijn groen; zoom, screenreader, echt themacontrast en visuele acceptatie horen bij de nieuwe alpha-test.
- Grootste resterende blokken: volledige QA, live runtimeacceptatie, robot/tuin/zwembad, performance/resource-audit en staged migratie.
- GitHub Issues bevatte op de peildatum geen bestaande tickets; dit repositorybord is daarom het initiële opvolgsysteem.

## In uitvoering — WIP 0/1

Geen tickets.

## Review/validatie — WIP 1/2

| Ticket | Prioriteit | Onderwerp | Open validatie |
|---|---:|---|---|
| [HD-170](tickets.md#hd-170--volledige-responsive-accessibility-en-visual-qa) | P1 | Responsive/accessibility/visual QA | 200% zoom, screenreader, live themecontrast en visuele alpha-review |

## Gereed

| Ticket | Prioriteit | Onderwerp | Startvoorwaarde |
|---|---:|---|---|
Geen tickets.

## Geblokkeerd

| Ticket | Prioriteit | Onderwerp | Blokkade |
|---|---:|---|---|
| [HD-111](tickets.md#hd-111--live-acceptatie-van-de-actuele-alpha) | P0 | Live acceptatie actuele alpha | Expliciet goedgekeurd testdashboard, verse snapshot en targetallowlist |
| [HD-121](tickets.md#hd-121--live-energy-en-domeinpariteit-valideren) | P1 | Live Energie-/domeinpariteit | HD-120 en menselijke runtimegate |
| [HD-130](tickets.md#hd-130--robot-bronrepo-door-de-productiepoort-brengen) | P1 | Robot-bronrepo productiepoort | Afzonderlijke bronrepo-scope en eigenaarschap |
| [HD-131](tickets.md#hd-131--robot-centraal-integreren) | P1 | Robot centraal integreren | HD-130 |
| [HD-140](tickets.md#hd-140--tuincard-contract-en-bronrepo-valideren) | P1 | Tuincardcontract valideren | Afzonderlijke bronrepo-scope indien fixes nodig zijn |
| [HD-141](tickets.md#hd-141--tuin-centraal-integreren) | P1 | Tuin centraal integreren | HD-140 |
| [HD-151](tickets.md#hd-151--zelfstandige-pool-dashboard-card-bouwen) | P1 | Zelfstandige zwembadcard bouwen | HD-150 en goedgekeurde nieuwe bronrepo-/releasegrens |
| [HD-152](tickets.md#hd-152--volledige-zwembadkaart-centraal-integreren) | P1 | Volledige zwembadcard centraal integreren | HD-151 |
| [HD-160](tickets.md#hd-160--specialistische-runtimeacceptatie-uitvoeren) | P1 | Specialistische runtimeacceptatie | Menselijke runtimegate en beschikbare specialistresources |
| [HD-190](tickets.md#hd-190--testmigratie-en-rollback-bewijzen) | P0 | Testmigratie en rollback bewijzen | Alle product-, QA- en auditgates groen plus menselijke toestemming |
| [HD-191](tickets.md#hd-191--gezinsacceptatie-en-productiecutover) | P0 | Gezinsacceptatie en productiecutover | HD-190 en aparte productiegoedkeuring |

## Backlog

| Ticket | Prioriteit | Onderwerp | Afhankelijk van |
|---|---:|---|---|
| [HD-112](tickets.md#hd-112--runtimebevindingen-oplossen) | P1 | Runtimebevindingen oplossen | HD-111 |
| [HD-171](tickets.md#hd-171--performancebaseline-en-budgetten-vastleggen) | P1 | Performancebaseline en budgetten | Featurefreeze; HD-131, HD-141 en HD-152 of expliciete deferral |
| [HD-172](tickets.md#hd-172--multi-dashboard-resourceaudit-uitvoeren) | P1 | Multi-dashboard resource-audit | HD-171 |
| [HD-180](tickets.md#hd-180--hacs-lifecycle-en-compatibiliteitsmatrix-bijwerken) | P1 | HACS lifecycle en compatibility | Definitieve specialistset en actuele releasecandidate |
| [HD-181](tickets.md#hd-181--admin-dashboardgrens-uitwerken) | P2 | Admin-dashboardgrens uitwerken | Eigenaarsbesluit over afzonderlijke repo/dashboard |
| [HD-192](tickets.md#hd-192--v1-documentatie-en-release-readiness-afronden) | P1 | v1-documentatie en release readiness | HD-170 t/m HD-191 volgens toepasselijke gates |

## Klaar — samengevatte deliverybasis

### Recent afgerond

- [HD-150](tickets.md#hd-150--zwembadstatusrandgevallen-tegen-de-bron-bevestigen) — bronprecedence bevestigd, privacyveilig contract vastgelegd en centrale samenvatting gecorrigeerd.
- [HD-120](tickets.md#hd-120--energy-paritymanifest-actualiseren) — categoriegewijs paritymanifest met expliciete alpha-scope, live gates en deferrals.
- [HD-110](tickets.md#hd-110--browserregressiematrix-consolideren) — één reproduceerbare browserrunner, gedocumenteerde dekkingsmatrix, expliciete failurecontext en groene synthetische uitvoering.
- [HD-102](tickets.md#hd-102--room-card-slice-reviewen-en-releaseklaar-maken) — onafhankelijke review zonder open P0/P1, destijds 85/85 tests, schone byte-identieke rebuild en expliciete release-/rollbackscope.
- [HD-101](tickets.md#hd-101--room-card-overhaul-afronden) — room-card overhaul lokaal gevalideerd met room-detail- en navigatiebrowserchecks, 13 renders, visuele review en `git diff --check`.

De volgende deliveryslices zijn reeds in `main` of in gepubliceerde prereleases verwerkt en worden niet opnieuw als open ticket gepland:

- HACS/build/privacyfundering en schema-v1/GUI-editor.
- Vijf hoofdviews, vaste navigatie, lokale kioskadapter en native editoringang.
- Home, camerastrook, kamers, Energie/Domeinen en veilige directe kamerbediening.
- Kia-integratie, zelfstandige 3D-printerspecialist en read-only zwembadsamenvatting.
- Release- en regressiechecks tot en met de lokale kandidaat `v0.8.0-alpha.19`; publicatie en live test zijn nog niet uitgevoerd.

Deze lijst betekent niet dat live Home Assistant-acceptatie, volledige accessibility, performance of productiecutover al bewezen zijn.

## Aanbevolen uitvoeringsvolgorde

1. Maak de volgende alpha-releasecandidate voor de afgeronde room-card-, browser-, parity- en broncontractslice.
2. Voer HD-170 en HD-121 uit op het expliciet goedgekeurde testdashboard; maak bevindingen klein onder HD-112 of een featureticket.
3. Commit, PR, prerelease en live acceptatie blijven afzonderlijke menselijke gates.
4. Robot, tuin en zwembad volgen per bronrepo-gate en daarna centrale integratie: HD-130/131, HD-140/141 en HD-150/151/152.
5. HD-160 en HD-170 sluiten functionele en visuele QA.
6. HD-171 → HD-172 → HD-180.
7. Na menselijke toestemming: HD-111/121, bevindingen via HD-112, daarna HD-190.
8. HD-181 kan apart worden besloten; HD-192 sluit documentatie en release readiness.
9. HD-191 blijft de laatste, afzonderlijk goed te keuren productiegate.
