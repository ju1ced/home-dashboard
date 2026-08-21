# Integratiestrategie

## Architectuurgrens

`home-dashboard` beheert uitsluitend:

- native shell, views, subviews en navigatie;
- logische room-/capabilitymappings;
- compacte native summaries;
- theme- en statuscontract;
- compatibiliteitsmetadata, fallbacks en integratietests.

Kia-, robot- en tuinlogica blijft in de drie bronrepositories. Voor zwembad wordt een vierde zelfstandige bronrepo/card voorzien. De centrale repo kopieert geen serviceflows, berekeningen, mappingheuristiek, kaart/SVG, zonecommando's, trips, drempels of editorcode.

## Dependencygrenzen

| Resource | V1-gebruik | Eigenaar | Minimale contracten |
|---|---|---|---|
| `custom:kia-dashboard-card` | full-width op `specialist-kia` | Kia-repo | expliciete mapping, unavailable/stale, veilige acties, themevariabelen |
| `custom:robot-vacuum-dashboard-card` | full-width op `specialist-robot` | robotrepo | expliciete mapping, confirmations, foutfeedback, relevante-state gating |
| `custom:garden-dashboard-card` | full-width op `specialist-garden` | tuinrepo | zone/irrigatiemapping, unavailable, confirmations, relevante-state gating |
| `custom:pool-dashboard-card` | full-width op `specialist-pool` | nieuwe zwembadrepo | waterkwaliteit, filter/verwarming, veilige modi, unavailable en diagnostics |

De specialistische resources zijn onafhankelijk geversioneerd via HACS. `home-dashboard` legt een compatibiliteitsmatrix vast; het bundelt of forkt hun code niet. Globale registratie kan nog download-/parsekosten veroorzaken, ook als een card alleen op een subview wordt gemount. Dat wordt gemeten.

## Kia

### Summary

Native Heading/Tile/Badge toont hoogstens:

- acculading;
- bereik;
- laadstatus;
- dataversheid of operationele fout;
- beveiligingswaarschuwing wanneer relevant.

De summary navigeert naar `specialist-kia`. Locks, klimaatcommando's, laadinstellingen, trips en locatie blijven detail-only.

### Detail

De bestaande kaart behoudt Overview, Battery, Vehicle, Climate, Energy, Location en Settings. Mapping health, request-tokens, caching, confirmation en verificatie na lockacties blijven intact. Alleen het HACS-cardpad wordt gebruikt; de dependency-zware YAML-referentie niet.

### Fallback

- Resource ontbreekt: native foutblok met installatie-/versiehint en veilige terugnavigatie.
- Mapping incompleet: summary toont `Voertuigstatus onvolledig`; detailkaart toont eigen mapping health.
- Data stale/unavailable: geen oude waarde als actueel presenteren; toon dataversheid.

## Robotstofzuiger

### Summary

Native summary toont status/taak, batterij en alleen relevante fout of onderhoud. In v1 is de summary primair navigatie. Start, kaart, kamer-/zoneselectie en reverse-engineered commando's blijven detail-only. Een pauze-/naar-basisactie kan pas na actionreview worden toegevoegd.

### Detail

De bestaande kaart behoudt Overview, kaart, kamers/zones, onderhoud, alle data en instellingen. Companion-mapfunctionaliteit is opt-in en modelgebonden.

### Productiegate

Voor opname in productie moet de robotrepo:

1. alleen op relevante entitywijzigingen renderen;
2. servicefouten zichtbaar en herstelbaar maken;
3. interacties/confirmations op 390×844 en wandtablet testen;
4. ontbrekende camera/map en unsupported zones veilig afhandelen;
5. focus, toetsenbord en screenreaderlabels valideren.

Tot die gate blijft de native summary bruikbaar als status/navigatie; de detailroute kan een duidelijke `Nog niet beschikbaar`-fallback tonen.

## Tuin

### Summary

Native summary toont maximaal droge-zonecount, actieve irrigatie, storing en relevante lage batterij. Directe irrigatie blijft detail-only en vereist confirmation.

### Detail

De bestaande kaart behoudt zones, vochtstatus, irrigatiecontrols en diagnostiek. Het echte entitydomein, action validation, focusbehoud en missing/unavailable-gedrag blijven bronrepo-eigendom.

### Fallback

- Ontbrekend droogteaggregaat: toon geen berekende count in de frontend; gebruik individuele navigation/status of een later beheerde helper.
- Onbeschikbare zone: tekstuele offline-status zonder algemene tuinpaniek.
- Irrigatieactie faalt: bronkaart toont fout; shell blijft navigeerbaar.

## Zwembad

### Summary en route

Zwembad staat standaard onder Domeinen en kan bij een echte afwijking als Home-waarschuwing verschijnen. De native summary toont waterkwaliteit, filter-/verwarmingsstatus en alleen relevante fout of kostbare actieve modus. `Open details` navigeert naar `specialist-pool`.

### Nieuwe volledige card

De latere bouwfase maakt een zelfstandige `custom:pool-dashboard-card` in dezelfde architectuurfamilie als Kia, robot en tuin. De kaart omvat minimaal:

- overzicht van waterkwaliteit en dataversheid;
- filter, pomp en verwarming;
- energie en relevante historie;
- zwem-/comfortmodi en doelwaarden;
- riskante of kostbare acties met confirmation;
- mapping health, missing/unavailable en diagnostics;
- responsive light/dark layout en `getGridOptions()`.

De card krijgt een eigen configuratiecontract, tests en HACS-release. `home-dashboard` bevat alleen summary, route, mappingcontract en integratietests.

## Theming- en navigatiecontract

- Shell bezit viewtitel, `back_path`, achtergrond, buitenmarge en contentbreedte.
- Volledige kaarten zijn full-width binnen de Sections-grid.
- Alleen ondersteunde HA-themevariabelen en gedeelde semantische aliases worden gebruikt.
- Statuscontract: `normal`, `active`, `warning`, `critical`, `unavailable`, altijd met tekst/icoon.
- Een kaart mag intern functionele tabs houden. Dubbele paginatitels worden eerst getest; pas daarna kan een backwards-compatible `hide_header` upstream worden voorgesteld.
- Geen `card-mod` of selectors door Shadow DOM-grenzen.

## Versiecompatibiliteit

De centrale minimumversie is Home Assistant 2026.8.2. Voor iedere integratie wordt later vastgelegd:

- centrale dashboardversie;
- minimum en geteste cardversies;
- minimum en geteste HA-versies;
- vereist/optioneel mappingcontract;
- bekende featureflags;
- resultaat op desktop, mobiel, dark/light en unavailable-fixtures.

Een versie-mismatch toont een duidelijke fallback; hij mag Home of andere routes niet blokkeren.

## Wat waar thuishoort

| Wijziging | Bronrepo | `home-dashboard` |
|---|:---:|:---:|
| domeinberekening en serviceflow | ja | nee |
| mapping health binnen specialist | ja | alleen samenvattende fallback |
| relevante-state gating in kaart | ja | integratietest |
| `display_mode: summary` indien later bewezen | ja | consument/fallback |
| shell, routes en `back_path` | nee | ja |
| native summaryconfig | nee | ja |
| logische centrale mappingkeys | contractinput | ja |
| theme/statussemantiek | ondersteunen | definiëren/testen |
| HACS release en kaartlicentie | ja | compatibiliteitsregister |
| visuele integratierenders | kaartfixtures ondersteunen | ja |
| zwembadcard bouwen en releasen | nieuwe zwembadrepo | alleen consument/integratietest |

## Resource-audit

De huidige 52 resources zijn globaal en kunnen door andere dashboards worden gebruikt. Verwijdering gebeurt pas na:

1. inventaris van alle dashboards en gebruik per resource;
2. gemeten nieuwe baselines;
3. migratie of expliciete onafhankelijkheid van iedere consument;
4. snapshot en rollbackmanifest;
5. menselijke productie-gate.
