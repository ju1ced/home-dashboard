# Deliveryroadmap — agents, PR's, GUI, HACS en releases

## Status en doel

Deze roadmap vertaalt het goedgekeurde ontwerp naar een uitvoerbaar leveringsmodel. De initiële ontwerpbaseline staat op `main`. Iedere volgende productwijziging loopt via een kleine pull request met een vaste eigenaar, tests, documentatie en—wanneer er iets door een gebruiker getest moet worden—een afzonderlijke GitHub prerelease.

De roadmap autoriseert ontwikkeling en publicatie van testbare artifacts. Zij autoriseert geen write naar Home Assistant, testdeployment of productiecutover. Die handelingen behouden de menselijke gates uit het implementatieplan.

## Productvorm

`home-dashboard` wordt een **HACS Dashboard-plugin met een custom dashboard strategy**:

- HACS installeert `dist/home-dashboard.js` als frontendresource;
- de bundle registreert `custom:home-dashboard` in `window.customStrategies` als `dashboard` strategy;
- Home Assistant toont het project in de Community dashboards-kiezer;
- de strategy genereert de vijf native Sections-views Home, Kamers, Energie, Domeinen en Meer;
- afzonderlijke view strategies houden de eerste laadbeurt klein en bouwen een view pas wanneer die nodig is;
- `getConfigElement()` levert de grafische dashboardconfiguratie;
- `configRequired = true` voorkomt dat een onvolledig dashboard zonder editorconfig wordt aangemaakt;
- de bestaande Home Assistant-sidebar blijft de applicatieshell;
- het default dashboard wordt nooit automatisch gewijzigd.

Dit gebruikt de publieke strategy- en editorcontracten van Home Assistant 2026.8.2. Een custom panel of backend-integratie is voor v1 niet nodig.

Primaire technische referenties:

- [Custom dashboard strategies](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/)
- [Custom-card en editorcontract](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
- [Frontendresources registreren](https://developers.home-assistant.io/docs/frontend/custom-ui/registering-resources/)
- [HACS Dashboard-pluginvereisten](https://www.hacs.xyz/docs/publish/plugin/)
- [HACS manifest en versiegedrag](https://www.hacs.xyz/docs/publish/start/)
- [HACS-validatieactie](https://www.hacs.xyz/docs/publish/action/)

## Volledige GUI-configuratie

De normale gebruiker hoeft geen YAML of JSON te schrijven. De grafische strategy-editor beheert het volledige dashboardprofiel en gebruikt waar mogelijk native Home Assistant-selectors.

### Editoronderdelen

| Onderdeel | GUI-inhoud |
|---|---|
| Algemeen | titel, taal, tijdnotatie, startview, light/dark/auto, compacte of comfortabele density |
| Vandaag | weatherbron, forecastlengte, afvalbronnen, globale energiestatus en zichtbaarheid |
| Personen | personselectie, zichtbare status, benoemde zones, freshness en relevante batterijbronnen |
| Security | drie cameraselectors, privacy-entiteiten/actions, alarm, streamfallback en confirmationbeleid |
| Kamers | floors/areas kiezen, ordenen, naam/icon override, capabilities en maximaal twee quick actions |
| Klimaat | klimaatbron, modes, presets, fan, swing, comfort- en historybronnen per kamer |
| Energie | standaard Energy-bronnen, datumcollectie, solar, batterij, water/gas, apparatenhiërarchie en lokale KPI's |
| Acties | expliciete actionallowlist, script/service, target, confirmation, hold en resultaatverificatie |
| Specialisten | Kia, robot, tuin en zwembad activeren, cardversie/availability en mappings controleren |
| Layout | viewvolgorde binnen toegestane grenzen, mobiel disclosuregedrag en optionele secties |
| Diagnose | configuratiegezondheid, ontbrekende resources/mappings, stale data en export/import |

### GUI-contract

- Iedere ondersteunde configuratiesleutel is zichtbaar in de editor of staat expliciet als `advanced` in het schema en de documentatie.
- Entity-, device-, area-, floor-, action- en iconvelden gebruiken selectors; vrije entity-ID-tekst is geen standaardpad.
- De editor toont een privacywaarschuwing bij export. Een export kan installatiegegevens bevatten en wordt nooit automatisch aan Git of een issue toegevoegd.
- De editor valideert vereiste specialistresources en toont een HACS-installatieroute, maar bundelt Kia-, robot-, tuin- of zwembadlogica niet opnieuw.
- Acties worden pas opslaanbaar wanneer actionscope, confirmation en resultaatstatus geldig zijn.
- Een live preview gebruikt fictieve of lokaal geselecteerde states en voert nooit een servicecall uit.
- Het configuratiemodel heeft `schema_version`; iedere release test migratie van alle eerder gepubliceerde versies.
- Een leesbare YAML/JSON-referentie blijft beschikbaar voor diagnose, backup en power users, maar is geen installatievereiste.
- Een coverage-test vergelijkt JSON Schema, defaults, strategy en editor zodat geen configuratieoptie stil uit de GUI verdwijnt.

## Agentteam en ownership

Er werkt maximaal één lead plus drie schrijfagents tegelijk. Rollen worden per PR toegewezen; het zijn geen langlevende onbeperkte branches.

| Agentrol | Verantwoordelijkheid | Exclusieve schrijfgrens |
|---|---|---|
| Lead / integrator | architectuur, composition root, schema-evolutie, mergevolgorde, beslislog en releasego/no-go | strategy composition root, centrale schema-index, changelog en releasemanifest |
| Foundation & HACS-agent | build, bundling, HACS-manifest, CI, releaseworkflow, supply-chainchecks | root tooling, `dist` buildconfig, `.github/workflows`, `hacs.json` |
| GUI-configagent | strategy-editor, selectors, validatie, migraties en editorcoverage | editorcomponenten, configschema en GUI-tests |
| Shell-agent | dashboard/view strategies, navigatie, tokens, native Sections-output | strategy- en viewcomposition, navigatie, global theme tokens |
| Home & security-agent | Vandaag, persons, attention, camera's, privacy, alarm en quick actions | Home-view, Home/security-fixtures en contracttests |
| Rooms-agent | floor-/roommodel, overzicht, lichte en zware kamerdetails | room strategies/templates, roomfixtures en roomtests |
| Energy & domains-agent | standaard-HA-pariteit, lokale Energie-uitbreidingen en overige domeinen | Energy/domain views, paritymanifest en fixtures |
| Specialist-agent | centrale adapters voor Kia, robot, tuin en zwembad; upstreamwerk blijft in de bronrepo | één specialistfolder per PR; nooit bronlogica kopiëren |
| Accessibility & visual-QA-agent | keyboard, screenreader, contrast, touch, responsive en baselines | testharnas en QA-baselines; productfix terug naar feature-eigenaar |
| Performance, privacy & release-QA-agent | bundle/DOM/rerenders, privacyguard, dependency/resourceaudit en releasebewijs | meettooling, auditrapporten en releasechecklists |
| Documentatie-reviewer | gebruikershandleiding, GUI-reference, troubleshooting, compatibility en upgrade/migratie | docs per feature; lead doet eindredactie |

Iedere feature-eigenaar schrijft zelf de eerste documentatie en testfixtures. De documentatie-reviewer is een gate, geen afvoerput voor ontbrekende uitleg.

## Branch-, PR- en reviewbeleid

- Branches gebruiken `codex/<korte-taak>` en starten altijd vanaf actuele `main`.
- Eén PR heeft één primair doel, één eigenaar en een expliciete file-ownershipset.
- Draft PR's zijn de standaard tot tests, screenshots, changelog en docs compleet zijn.
- Squash merge naar `main`; de PR-titel wordt de changelogregel.
- Geen featurebranch hangt af van een onbeoordeelde siblingbranch. Afhankelijk werk wacht of gebruikt een tijdelijke interfacefixture.
- Composition root, centrale schemas, theme tokens, baselines en releaseworkflow worden nooit parallel door twee agents gewijzigd.
- Iedere PR beschrijft normal, warning, missing en unavailable; riskante acties voegen confirmation-, autorisatie- en foutpadtests toe.
- Iedere PR bevat `Docs changed` en `Release required` in de checklist.
- Een release wordt uitsluitend van een groene commit op `main` gemaakt, nooit rechtstreeks van een featurebranch.

## PR- en releasevolgorde

PR 0 is deze roadmap en heeft geen runtimeartifact. Vanaf PR 1 krijgt iedere stap die gebruikers moeten testen een volwaardige GitHub release; alleen een tag is onvoldoende voor HACS.

| PR | Eigenaar | Scope en hoofdoutput | Release na merge | Verplichte testfocus |
|---:|---|---|---|---|
| 1 | Foundation & HACS | TypeScript/buildbasis, `dist/home-dashboard.js`, `hacs.json`, licentie, CI, HACS Action, releaseworkflow, checksum | `v0.1.0-alpha.1` | HACS custom-repo install/update/remove, resource load, min. HA 2026.8.2 |
| 2 | GUI-config | versioned schema, defaults, strategy-editor, selectors, import/export, migratieharnas en minimale Community-registratie/configpreview | `v0.2.0-alpha.1` | dashboard kiezen, GUI openen/opslaan/heropenen, invalid/missing, schema v1 round-trip |
| 3 | Shell | minimale preview vervangen door dashboard + lazy view strategies, vijf native Sections-views, routes en tokens | `v0.3.0-alpha.1` | Community dashboard aanmaken, alle routes, mobiel/tablet/desktop, light/dark |
| 4 | Home & security | Attention, Vandaag, persons, camera-carousel/privacy, alarm, Nu en twee starteractions; GUI-secties mee | `v0.4.0-alpha.1` | normal/warning/missing/unavailable, privacyconfirmation, mobiel gezin/security |
| 5 | Rooms | flooroverzicht, quick actions, capabilitymodel, lichte/zware kamer en volledige room-GUI | `v0.5.0-alpha.1` | alle kamers, HVAC/media/covers/power/history, disclosure en 390×844 |
| 6 | Energy & domains | volledige HA Energy-pariteit, lokaal piek/EV/UPS/fase, klimaat/water/security/meer; volledige Energie-GUI | `v0.6.0-alpha.1` | paritymanifest, date/compare, kosten, flows, batterij, water, devices, mobiel |
| 7 | Specialist | Kia-summary, resourcecheck en volledige bestaande Kia-card | `v0.7.0-alpha.1` | installatie-afhankelijkheid, stale/missing, full dashboard, veilige voertuigacties |
| 8 | Specialist | robot-summary, productiepoort en volledige robotcard | `v0.8.0-alpha.1` | kaart/zonefout, servicefout, rerendergate, mobiel en confirmation |
| 9 | Specialist | tuin-summary en volledige tuincard | `v0.9.0-alpha.1` | droog/irrigatie/fout/unavailable, weerscontext en veilige acties |
| 10 | Specialist + pool-bronagent | zelfstandige zwembadcard, centrale adapter en volledige zwembad-GUI | `v0.10.0-alpha.1` | waterkwaliteit, filter, verwarming, energie, stale/critical en confirmations |
| 11 | Accessibility & visual QA | volledige responsive/a11y/visual-regressionronde en goedgekeurde baselines | `v0.11.0-beta.1` | keyboard, screenreader, 200% zoom, reduced motion, 44px, drie viewports |
| 12 | Performance/privacy QA | bundlebudget, lazy views/cards, rerenders, privacy- en multi-dashboardresourceaudit | `v0.12.0-rc.1` | koud/warm, DOM/long tasks, irrelevante states, install/upgrade/rollback |
| 13 | Lead + migratieagent | verse snapshot, exact testdashboard, stagingrunbook en rollbackbewijs | `v0.12.0-rc.2` | echte testinstallatie na gate, gezinsacceptatie, default-hash onveranderd |
| 14 | Lead + docs/release | compatibilitymatrix, supportbeleid, upgradepad en productiereadiness | `v1.0.0` na aparte goedkeuring | schone HACS-installatie, upgrade vanaf laatste RC, rollback en documentatie |

Bugfixes tijdens een teststap gebruiken dezelfde minorlijn met een volgende prerelease, bijvoorbeeld `v0.6.0-alpha.2`. Er wordt niet naar de volgende stap gegaan zolang de vorige release een open blocker heeft.

## Releasecontract

Iedere testrelease is een echte GitHub release en bevat:

- SemVer-tag en duidelijke prereleasestatus;
- gegenereerde `home-dashboard.js` uit exact dezelfde commit;
- SHA-256-checksum en buildmanifest met commit, Node-versie en minimum-HA-versie;
- changelog met toegevoegde GUI-opties, bekende beperkingen, migraties en rollback;
- exacte testscope en invulbare smokechecklist;
- compatibilitymatrix voor Home Assistant, HACS en specialistische cards;
- link naar installatie-, configuratie-, upgrade- en troubleshootingdocs.

De HACS-validatieactie draait op iedere PR, push naar `main` en release. `hacs.json` bevat minimaal:

```json
{
  "name": "Home Dashboard",
  "filename": "home-dashboard.js",
  "homeassistant": "2026.8.2",
  "hide_default_branch": true
}
```

De bundle staat in `dist/` en heet exact `home-dashboard.js`, passend bij de repositorynaam. De repository blijft publiek, heeft description/topics/issues, toont screenshots in README en krijgt pas na een stabiele release eventueel een afzonderlijke aanvraag voor opname als standaard HACS-repository. Tot dan ondersteunt de documentatie installatie als custom repository.

## Testgates per release

1. **Buildgate:** lint, typecheck, unit, schema/editorcoverage, linkcheck, privacyguard, bundlebudget en reproducible build.
2. **Browsergate:** Chromium plus waar haalbaar Firefox/WebKit; normal/warning/missing/unavailable; light/dark; 390×844, tablet en 1440×900.
3. **HACS-gate:** validation zonder ignores; custom-repo install, upgrade, downgrade en remove in een schone testconfig.
4. **HA-runtimegate:** minimale HA 2026.8.2 en actuele ondersteunde HA; resource load, Community dashboard create/edit/delete, strategy regeneration en editor round-trip.
5. **Actiegate:** uitsluitend goedgekeurde testacties; confirmation, backendautorisatie, servicefout en resultaatverificatie.
6. **Privacygate:** geen identifiers/secrets in bron, logs, screenshots, artifacts of supporttemplates.
7. **Menselijke gate:** tester vult releasechecklist in; blockers krijgen issue + volgende prerelease, geen stil doorrollen.

## Documentatiestructuur en definition of documented

Voor v1 worden minimaal deze pagina's onderhouden:

```text
docs/
  installation/hacs.md
  configuration/gui-overview.md
  configuration/home.md
  configuration/rooms.md
  configuration/energy.md
  configuration/security.md
  configuration/specialists.md
  guides/actions-and-confirmations.md
  guides/backup-upgrade-rollback.md
  reference/config-schema.md
  reference/compatibility.md
  troubleshooting.md
  releases/testing-<version>.md
```

Een feature is niet klaar wanneer alleen de code werkt. De PR moet ook bevatten:

- GUI-label, beschrijving, default, validatie en foutmelding;
- gebruikershandleiding met fictieve voorbeelden en screenshots;
- schema-/advanced-reference;
- normal/warning/missing/unavailable gedrag;
- accessibility- en privacy-impact;
- upgrade-/migratie-impact en rollback;
- testbewijs en changelog.

## Eerstvolgende uitvoering

1. PR 0 reviewen en mergen; geen release.
2. PR 1 openen voor de HACS/build/CI-fundering.
3. Tegelijk uitsluitend read-only voorbereiden: GUI-wireflow, Energy-parityfixtures en specialistcompatibilitymatrix.
4. Na `v0.1.0-alpha.1` de HACS-installatiesmoke aftekenen.
5. Pas daarna PR 2 voor schema/editor laten schrijven; shell- en featureagents wachten op dat contract.
