# Multi-agent implementatieplan

Dit plan beschrijft de latere bouwfase. Het autoriseert nog geen Home Assistant-write, deployment of productiecutover.

De operationele afspraken voor de custom dashboard strategy, volledige GUI-configuratie, agentrollen, PR/releasekoppeling en HACS-distributie staan in de [deliveryroadmap](delivery-roadmap.md). Bij een verschil geldt die roadmap voor leveringsvolgorde en dit document voor de technische definition of done.

## Strategie en critical path

```text
PR 1 foundation/privacy
  → PR 2 model + mapping/compiler
    → PR 3 tokens + native shell/navigation
      → PR 4 Home/person/status contracts
      → PR 5 room overview/model/pages ─┐
      → PR 6 Energy + domain pages ────┼→ PR 11 responsive/a11y/visual QA
      → PR 7 Kia integration ──────────┤
      → PR 8 robot gate/integration
      → PR 9 garden integration
      → PR 10 pool card/integration
                                      └→ PR 12 performance/resource audit
                                  → HUMAN GATE: testdeployment
                                    → PR 13 staged migration/rollback proof
                                      → HUMAN GATE: productioncutover
```

Critical path: foundation → capability/mappingcontract → native HA-shell/viewnavigation → Home/rooms/energy/domains → vier specialistische integratie- en QA-gates → verse snapshot/testdashboard → runtimevalidatie → productie-gate.

## Werkwijze met agents en Git

- De lead houdt composition root, schema's, beslislog, integratie en eindredactie in eigendom.
- Iedere schrijfagent krijgt één branch met prefix `codex/` en bij voorkeur een eigen git worktree.
- Twee agents wijzigen nooit tegelijk hetzelfde bestand of dezelfde gegenereerde output.
- Agents leveren kleine, reviewbare PR's met fixtures en tests; de lead integreert serieel in dependencyvolgorde.
- Lokale mappings, exports, snapshots en gegenereerde HA-config blijven gitignored en worden nooit via agentberichten gepubliceerd.
- Read-only onderzoek kan parallel; iedere HA-write vereist de expliciete fasegate en het exacte testdashboardtarget.

## Fasen en PR-volgorde

### PR 1 — Repositoryfundering, HACS, tooling en privacyguards

- **Doel:** veilige, reproduceerbare basis.
- **Eigenaar:** foundation/tooling-agent; exclusief eigendom op rootconfig, `scripts/`, tests en CI.
- **Inputs:** discovery, `../juiced-dashboard` toolingpatronen, dit plan.
- **Scope:** package/runtimekeuze, TypeScript/bundle, HACS Dashboard-pluginmanifest, releaseworkflow, lint/format, Markdown/linkcheck, fixtureconventie, `.gitignore`, privacyguard, AGENTS-commando's.
- **Outputs/bestanden:** `dist/home-dashboard.js`, `hacs.json`, package/buildconfig, `scripts/`, `test/`, `.github/workflows/`, `.gitignore`, licentie en bijgewerkt `AGENTS.md`.
- **Tests:** syntax, Markdown, interne links, voorbeeldfixtures, privacypositief en bewust negatieve privacyfixtures.
- **Acceptatie:** één lokaal commando voert alle statische checks uit; geen echte identifiers in tracked files.
- **Rollback:** PR revert; geen externe toestand geraakt.

### PR 2 — Entitymapping, room-/capabilitymodel en volledige GUI-configuratie

- **Doel:** kleine, declaratieve bron van waarheid zonder runtimeherkenning.
- **Eigenaar:** schema/mapping-agent; exclusief op `config/`, `schemas/`, mappingcompiler en golden fixtures.
- **Inputs:** bevestigde navigeerbare area-lijst, current-to-target matrix, action- en statuscontracten.
- **Scope:** logical keys, optionele capabilities, locale labels, operationele allowlists, severity/fallback, lokale mappingtemplate, versioned strategyconfig en grafische strategy-editor met native selectors.
- **Outputs/bestanden:** tracked voorbeeldconfig, JSON Schema, editorcomponenten, GUI-coveragecontract, migratieharnas, gitignored local-configpad, compiler/validator en generated-outputmanifest.
- **Tests:** schema, duplicate keys, onbekende capability, missing required, optional missing, unavailable/unknown semantics, mappingcompleetheid.
- **Acceptatie:** fictieve woning compileert; echte lokale mapping compileert zonder dat identifiers in logs of artifacts lekken.
- **Rollback:** gegenereerde output verwijderen; terug naar tracked fixtures.

### PR 3 — Custom dashboard strategy, design tokens, HA-shellgrens en navigatie

- **Doel:** native Sections-shell met vijf hoofdviews en semantische subviews, binnen de gewone HA-sidebar.
- **Eigenaar:** shell-agent; exclusief op composition root, navigation en theme.
- **Inputs:** PR 1–2, designsysteem, minimale HA-versie.
- **Scope:** registratie in `window.customStrategies`, Community dashboards-picker, dashboard- en lazy view strategies voor `home`, `rooms`, `energy`, `domains`, `more`; native viewnavigation; `back_path`; light/dark tokens; native fallbackkaarten. Geen tweede custom sidebar of bottom dock.
- **Outputs/bestanden:** dashboard composition root, viewskeletons, theme, navigationtests.
- **Tests:** unique/stable paths, geen indexnavigation, Sections-grid, themevars, missing subview, tabvisibility ≠ auth-documentatie.
- **Acceptatie:** alle routes renderen met fixtures op mobiel/desktop; toetsenbordvolgorde volgt bronvolgorde.
- **Rollback:** deze aparte dashboardbuild verwijderen; default blijft onaangeroerd.

### PR 4 — Home, person cards en contextuele waarschuwingen

- **Doel:** operationeel overzicht binnen harde contentbudgetten.
- **Eigenaar:** home-agent; exclusief op Home-view, alert/statuscontracten en Home-fixtures.
- **Inputs:** eigenaarselectie quick actions, PR 2–3.
- **Scope:** Aandacht; Vandaag met weer/afval/globale energiecontext; privacyveilige person cards; scrollbare strook met alle gekozen camera's, privacystand en alarmstatus; Nu; `Avondscene` en gemapt `Lichten beneden uit`; actieve ruimtes; vier vaste native summaries en domeinlinks; normal/warning/critical/unavailable fixtures.
- **Tests:** prioriteit, tijdige Vandaag-content, person states thuis/zone/onderweg/onbekend, relevante device-batterijwarning, geen precieze locatielekken, camerastreamfallback per kaart, privacystatus, alarmstatus, confirmation/autorisatie bij privacy uit, action missing-mapping, niet-kritieke maxima, unknown-filtering, unavailable allowlist en empty states.
- **Acceptatie:** eerste mobiele viewport toont aandacht/context; Vandaag, gezin en de geconfigureerde camera's zijn vlot bereikbaar; geen uitgebreide grafieken/diagnoselijsten; exact de twee goedgekeurde algemene actions verschijnen alleen met geldige mapping.
- **Rollback:** Home vervangen door minimale navigatieview in het testdashboard.

### PR 5 — Volledig Kamers-overzicht, kamermodel en kamerpagina's

- **Doel:** alle bevestigde kamers uit één herkenbaar patroon.
- **Eigenaar:** rooms-agent; exclusief op roomgenerator/templates en kamerfixtures.
- **Inputs:** goedgekeurde area-lijst en capabilitymodel.
- **Scope:** floor-gegroepeerd overzicht, mobiel disclosuregedrag, room summaries en maximaal twee passende quick actions; lichte/zware kamer met licht/scènes, covers/openingen, volledige ondersteunde HVAC, media, comfort/aanwezigheid, safety/camera, apparaten/power, historie en diagnostiek.
- **Tests:** iedere capability- en quick-actionvariant, HVAC mode/preset/fan/swing, actueel/dagverbruik en optionele spanning, actionscope/confirmation, lege secties verborgen, area-loze mapping, operationele unavailable zichtbaar, warning buiten gesloten sectie, source/focusorder en golden output.
- **Acceptatie:** alle bevestigde kamers zijn vanuit één overzicht bereikbaar; een lichte en zware kamer behouden volledige informatiedekking op 390×844, tablet en desktop; floors/detailsecties zijn mobiel progressief zonder permanent verborgen functies; geen hardcoded aantal kamers.
- **Rollback:** kamerincludes uit testcomposition verwijderen; generatoroutput reproduceerbaar herstellen.

### PR 6 — Volledige Energie-hoofdview en woningbrede domeinpagina's

- **Doel:** Energie als volledige hoofdview bouwen en klimaat, water, beveiliging, zwembad, weer/afval en techniek volledig achterliggend plaatsen.
- **Eigenaar:** domains-agent; exclusief op domeinviews en fixtures.
- **Inputs:** current-to-target matrix en actioncontracten.
- **Scope:** `energy` gebruikt alle relevante officiële cards voor date/compare, usage, solar/forecast, gas/water, sources/cost, grid/solar/carbon/self-sufficiency, devices total/detail, historische Energy Sankey, actuele Power Sankey, powerhistory en batterij/SoC. Voeg lokaal capaciteitspiek, EV, UPS, fase-onbalans en kamer-/apparaatpower toe. Overige domeinen volgen status → veilige actie → historie → details.
- **Tests:** paritymanifest per geconfigureerde bron/card, gedeelde collection/date-semantie, cost/compensation, upstream apparaten zonder dubbeltelling, current versus historische flow, conditional gas/water, ingebouwde Energy-fallback, lokale piek/EV/UPS/fases, data freshness, domain coverage, riskante controls en volledige securityroute.
- **Acceptatie:** Energie is op mobiel/tablet/desktop aantoonbaar niet informatiearmer dan het standaard HA Energy-dashboard voor dezelfde configuratie en voegt de lokale besliscontext toe; iedere relevante live functionele categorie heeft één eigenaarroute en fixture.
- **Rollback:** afzonderlijke domeinview uitschakelen zonder Home/rooms te breken.

### PR 7 — Kia-integratie

- **Doel:** native Kia-summary en volledige bestaande card.
- **Eigenaar:** Kia-integratieagent; centrale repo alleen Kia-config/tests, bronrepo-agent alleen indien upstreamfix nodig is.
- **Inputs:** vastgelegde compatibele cardversie, mappingcontract.
- **Scope:** `specialist-kia`, full-width grid, stale/mapping fallback, themecontract.
- **Tests:** missing resource, incomplete mapping, stale/unavailable, lock confirmation/verificatie in broncard, mobiel/dark/light.
- **Acceptatie:** geen specialistische logica gekopieerd; summary en detail spreken elkaar niet tegen.
- **Rollback:** native Mobiliteit-ingang blijft; specialistview toont fallback.

### PR 8 — Robotstofzuigerintegratie en productiepoort

- **Doel:** veilige, performante robotintegratie.
- **Eigenaar:** robot-bronagent voor cardfixes; aparte centrale integratieagent voor view/config/tests.
- **Inputs:** robotrepo, model-/mapondersteuning, actionapproval.
- **Scope bronrepo:** relevante-state gating, zichtbare servicefouten, accessibility/interactietests. **Scope centraal:** summary, specialistview, resourcefallback.
- **Tests:** irrelevant update veroorzaakt geen render, map ontbreekt/faalt, zones unsupported, confirmations, focus, 390×844, serviceerror.
- **Acceptatie:** alle vijf productiegates uit integration-strategy groen; anders blijft detail fallback.
- **Rollback:** centrale specialistview uitschakelen; bronrepo-release onafhankelijk terugrollen.

### PR 9 — Tuinintegratie

- **Doel:** tuinwaarschuwingen en volledige card integreren.
- **Eigenaar:** garden-integratieagent; bronrepo alleen voor aantoonbare contractgaten.
- **Inputs:** zone-/irrigatiecontract en bevestigde aggregatorbron.
- **Scope:** native summary, `specialist-garden`, full-width card, unavailable/missing fallbacks.
- **Tests:** normale/te droge/actieve irrigatie/fout/unavailable, confirm, unsupported action, focus tijdens rangeinput.
- **Acceptatie:** geen frontendberekende veiligheidsdrempels; irrigatie detail-only met confirmation.
- **Rollback:** Buiten/Tuin navigeert naar native statusfallback.

### PR 10 — Zwembaddashboard en integratie

- **Doel:** een volledige specialistische zwembadcard in dezelfde architectuurfamilie maken.
- **Eigenaar:** pool-bronagent voor de nieuwe zelfstandige card/repo; aparte centrale integratieagent voor summary, route en tests.
- **Inputs:** zwembadcapabilities, veilige actioncontracten, design tokens en PR 3/6.
- **Scope bronrepo:** `custom:pool-dashboard-card` met waterkwaliteit, filter/pomp, verwarming, energie/historie, modi, editor/mapping health en diagnostics. **Scope centraal:** `specialist-pool`, native summary/warning, full-width card en fallback.
- **Tests:** normal/warning/critical/missing/unavailable, stale data, riskante/kostbare confirmations, unsupported action, responsive/dark/light, focus/toetsenbord/screenreader en relevante-state gating.
- **Acceptatie:** geen zwembadveiligheidslogica gekopieerd naar de centrale shell; volledige card is bruikbaar op telefoon en wanddisplay en heeft een HACS-/versiecontract.
- **Rollback:** `domain-pool` blijft als native statuspagina; specialistview toont een veilige fallback.

### PR 11 — Responsive, accessibility en visual-regression QA

- **Doel:** aantoonbaar bruikbaar op telefoon, wandtablet en desktop.
- **Eigenaar:** QA-agent; testbestanden/snapshots exclusief, productfixes terug naar oorspronkelijke eigenaar.
- **Inputs:** PR 3–10.
- **Scope:** screenshots, keyboard, focus, screenreaderlabels, dialogs, 44×44 targets, contrast, zoom, reduced motion, dark/light.
- **Tests:** 390×844, representatieve tabletlandscape, 1440×900; normal/warning/critical/missing/unavailable; specialistviews.
- **Acceptatie:** geen overflow/clipping/horizontale scroll, WCAG 2.2 AA voor scope, goedgekeurde baselines.
- **Rollback:** regressiebaseline nooit aanpassen zonder productreview; falende PR blokkeren.

### PR 12 — Performancevalidatie en resource-audit

- **Doel:** winst meten en globale dependencies veilig beoordelen.
- **Eigenaar:** performance-agent; read-only audit, geen resourcewrites.
- **Inputs:** huidige historische baseline, nieuwe testbuild, alle dashboardresourceconsumenten.
- **Scope:** payload/parse, DOM, long tasks, rerenders, route-interactie; resource-use manifest voor alle dashboards.
- **Tests:** Home, Kamers-overzicht, lichte/zware kamer, Energie/security en vier specialistviews; irrelevante stateupdates.
- **Acceptatie:** budgets op basis van eerste fixture/live testbaseline; geen onverklaarde regressie; verwijdermanifest is reviewbaar maar niet uitgevoerd.
- **Rollback:** geen live wijziging; meettooling kan onafhankelijk worden teruggedraaid.

### PR 13 — Veilige testmigratie en cutoverrunbook

- **Doel:** aparte testomgeving, rollbackbewijs en productieplan.
- **Eigenaar:** lead + migratieagent; HA-writes uitsluitend na menselijke gate.
- **Inputs:** alle groene PR's, verse read-only default-export, nieuw testdashboard-ID, snapshots.
- **Scope:** stage build, configvergelijking, runtime smoke, gezinacceptatie, rollbackoefening, cutover- en resourceplan.
- **Tests:** targetallowlist, default-hash blijft gelijk, alle routes/actions, resourcefallback, herstel uit verse export.
- **Acceptatie:** testdashboard expliciet goedgekeurd; default aantoonbaar onveranderd; rollback geoefend; eigenaar tekent af.
- **Rollback:** testdashboard verwijderen/herstellen vanuit verse snapshot. Productiecutover heeft een apart tijdvenster en herstelpad.

## Parallelisatie en file ownership

| Werk | Mag parallel na | Schrijfgrens |
|---|---|---|
| Home en kamers | PR 3 + stabiel schema | afzonderlijke view-/fixturefolders |
| Domeinen | PR 3 + coveragecontract | domeinviews/fixtures |
| Kia, robot, tuin en zwembad | PR 3 + mappingcontract | ieder eigen integrationfolder; upstreamrepo apart |
| Accessibility en performance tooling | PR 1 | uitsluitend testharnas; baselines pas na featurefreeze |
| Documentatie/compatibiliteitsmatrix | vanaf PR 2 | eigen docs; lead eindredactie |

Niet parallel schrijven:

- composition root en hoofdnav;
- centraal schema en generated manifest;
- global theme tokens;
- dezelfde visual baselines;
- migratiescript/targetallowlist;
- resource-removalmanifest.

## Teststrategie

### Statisch en unit

- JS/YAML/JSON syntax en schema.
- Include- en pathvalidatie.
- Pure status-/severity-/fallbackfuncties.
- Mappingcompleetheid en duplicate logical keys.
- Actionscope, confirmation en foutpaden.
- Privacyguard met negatieve fixtures.

### Browser en visueel

- Reproduceerbare screenshots van alle paginatypes en statevarianten.
- Interactiontests voor navigation, focus, dialogs, sliders, interne tabs en missing resources.
- Visuele regressie met kleine, reviewbare tolerance; geen blind baseline-updaten.

### Home Assistant-runtime

- Alleen op het goedgekeurde testdashboard na snapshot.
- Smoke van routes, cards, theme, resources en stateupdates.
- Default-dashboardconfig vóór/na vergelijken; iedere afwijking blokkeert.
- Specialistische serviceflows alleen met expliciet goedgekeurde testacties en veilige testvoorwaarden.

### Performance

- JS download/parse, DOM-nodes, long tasks en navigatielatency.
- Rerendercount bij relevante en irrelevante stateupdates.
- Camera/map/history lazy gedrag.
- Warm en koud cachepad documenteren.

## Menselijke gates

1. **Conceptgate:** gesloten door `final-proposal.md`; bouwfundering is toegestaan, HA-writes niet.
2. **Vóór testdeployment:** exacte target, verse export/snapshot, privacycheck, alle statische/browserchecks groen.
3. **Vóór productiecutover:** gezinacceptatie, runtime/accessibility/performance, rollbackoefening en default-snapshot goedgekeurd.
4. **Vóór oude resources verwijderen:** multi-dashboard use-audit, staged removalmanifest, apart herstelvenster en expliciete eigenaargoedkeuring.

## Definition of done

- De current-to-target matrix dekt iedere relevante capability en actie.
- Home respecteert contentbudgetten en is attention-first in alle statefixtures.
- Alle bevestigde kamers en domeinen hebben een consistente, conditionele pagina.
- Kia, robot en tuin hebben summary, hun volledige bestaande card, fallback en compatibiliteitsbewijs; robotgate is groen.
- Zwembad heeft een zelfstandige volledige card, specialistview, veilige acties, fallback en HACS-/versiecontract.
- Home bevat Vandaag, privacyveilige person cards, alarmstatus en alle gekozen camerakaarten met afzonderlijke privacystand; Kamers bevat alle bevestigde kamers met passende quick actions; zware kamerdetails behouden HVAC, comfort/safety, apparaten/power en historie; Energie slaagt op het standaard-HA-plus-lokaal paritymanifest.
- Light/dark, mobiel/tablet/desktop, keyboard/screenreader, contrast en touch targets zijn gevalideerd.
- Performance is gemeten met vaste methode en binnen goedgekeurde budgets.
- Tracked bron, logs, fixtures en renders zijn privacyveilig.
- Default `lovelace` bleef tot expliciete cutover read-only; testmigratie en rollback zijn bewezen.
- Interne links, Markdown, schema's, tests en CI zijn groen.
- Documentatie, compatibilitymatrix, snapshot- en herstelpad zijn actueel.
