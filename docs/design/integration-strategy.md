# Integratiestrategie

## Architectuurgrens

`home-dashboard` beheert uitsluitend:

- native shell, views, subviews en navigatie;
- logische room-/capabilitymappings;
- compacte native summaries;
- theme- en statuscontract;
- compatibiliteitsmetadata, fallbacks en integratietests.

Kia-, robot- en tuinlogica blijft in de drie bronrepositories. Voor zwembad wordt een vierde zelfstandige bronrepo/card voorzien. De 3D-printerintegratie (HD-008/HD-200) is de uitzondering: er is geen externe bronrepo om renderlogica naar uit te besteden, dus de volledige summary en detailweergave zijn native in `home-dashboard` gebouwd, met bestaande sectie-, tile- en picture-entity-kaarttypes. De centrale repo kopieert geen serviceflows, berekeningen, mappingheuristiek, kaart/SVG, zonecommando's, trips, drempels of editorcode van de overige vier.

## Dependencygrenzen

| Resource | V1-gebruik | Eigenaar | Minimale contracten |
|---|---|---|---|
| `custom:kia-dashboard-card` | full-width op `specialist-kia` | Kia-repo | expliciete mapping, unavailable/stale, veilige acties, themevariabelen |
| `custom:robot-vacuum-dashboard-card` | full-width op `specialist-robot` | robotrepo | expliciete mapping, confirmations, foutfeedback, relevante-state gating |
| `custom:garden-dashboard-card` | full-width op `specialist-garden` | tuinrepo | zone/irrigatiemapping, unavailable, confirmations, relevante-state gating |
| `custom:pool-dashboard-card` | full-width op `specialist-pool` | nieuwe zwembadrepo | waterkwaliteit, filter/verwarming, veilige modi, unavailable en diagnostics |
| Geen (native) — `home-dashboard-printer-summary` + sectie-/tile-/picture-entity-kaarten | full-width op `specialist-printer` | `home-dashboard` zelf | mapping incompleet/unavailable-fallback; geen servicecalls, dus geen confirmationcontract nodig |
| `custom:linak-desk-card` | opt-in, embedded in de Comfort-stage van de kamerdetail (geen eigen `specialist-*`-route) | LINAK-bureaucardrepo | transparante passthrough, generieke resource-fallback via `mountCard()` |

De specialistische resources zijn onafhankelijk geversioneerd via HACS. `home-dashboard` legt een compatibiliteitsmatrix vast; het bundelt of forkt hun code niet. Globale registratie kan nog download-/parsekosten veroorzaken, ook als een card alleen op een subview wordt gemount. Dat wordt gemeten. De printerintegratie heeft geen externe HACS-resource en valt dus buiten deze compatibiliteitsmatrix; haar bundelkost wordt in plaats daarvan bewaakt via het bundlebudget (`scripts/verify-dist.mjs`, D-055).

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

## 3D-printer

### Summary en route

Native summary (`home-dashboard-printer-summary`) toont titel, status, voortgang, nozzle-/bedtemperatuur en resterende tijd. `Open details` navigeert naar `specialist-printer`. Anders dan Kia, robot, tuin en zwembad is er geen onafhankelijk geteste HACS-kaart om naar uit te besteden: de volledige detailweergave (printtaak, lagen, doeltemperaturen, laatste fout, filamentslots, camera/jobpreview) wordt native opgebouwd met bestaande sectie-, tile- en picture-entity-kaarttypes.

### Productiegate (aangepast aan de native architectuur)

De vijf gates uit de Robotstofzuiger-sectie zijn geschreven voor een aparte bronrepo met een centrale adapter. Omdat de printer geen bronrepo heeft, is elke gate rechtstreeks tegen de native implementatie beoordeeld (`src/cards/home-dashboard-printer-integration.ts`):

1. **Relevante-state gating:** **niet geïmplementeerd.** De `hass`-setter roept bij elke toewijzing onvoorwaardelijk `updateValues()` aan, zonder te controleren of een van de vijf gemapte entiteiten daadwerkelijk veranderde. Vastgelegd als [HD-211](../planning/tickets.md#hd-211--printersummary-relevante-state-gating-toevoegen); de bestaande 100-irrelevante-updates-perfgate (`scripts/render-room-controls.mjs`) dekt alleen de kamerdetail-DOM, niet deze summary.
2. **Zichtbare servicefouten:** **niet van toepassing.** De integratie doet geen enkele Home Assistant-servicecall, configuratiewrite of externe netwerkcall — puur read-only weergave (bevestigd in `docs/releases/testing-printer-specialist.md`).
3. **Confirmations voor riskante acties:** **niet van toepassing**, zelfde reden als gate 2; de enige interactieve elementen (camera/jobpreview-afbeeldingen) hebben expliciet `noAction()` op tap/hold/double-tap.
4. **Missing/unavailable-fallback:** **bevestigd.** `mappingIncomplete`, `valuesUnavailable`, `resourceAvailable()` en `hasPrinterSummaryMapping()` geven elk een eigen, native fallbacktekst (nooit een verzonnen waarde); afgedekt met normal/warning/missing/unavailable-fixtures in de browsermatrix.
5. **Mobiel/toetsenbord/screenreadergedrag:** **bevestigd via de gedeelde routematrix**, niet via een printerspecifieke test — zelfde bewijsstandaard als bij Kia/robot/tuin: `scripts/check-prototype-browser.mjs` rendert `specialist-printer` op 390×844/1024×900/1440×900, light/dark en normal/warning/unavailable, en controleert actieve-routestatus (`aria-current`) en zichtbare toetsenbordfocus dashboardbreed.

Tot HD-211 opgelost is, blijft de printersummary functioneel correct maar zonder de rerender-efficiëntie die de kamerdetailkaarten al hebben.

## LINAK-bureaucard

### Embedding

Anders dan de andere vier specialisten heeft de LINAK-bureaucard (`custom:linak-desk-card`) geen eigen `specialist-*`-route en geen summary op Home: een kamer met `room.desk` geconfigureerd toont de kaart rechtstreeks, embedded in de Comfort-stage van diezelfde kamerdetail (`buildCapabilityStage("comfort", ...)` in `home-dashboard-room-cards.ts`), naast comfort/media/safety/camera-informatie. Dit is een lichtere categorie dan Kia/robot/tuin/zwembad: een pure, transparante passthrough zonder eigen productiepoort, mappinglaag of centrale statuslogica — `card_config` wordt ongewijzigd doorgegeven aan de generieke `mountCard()`-helper.

### Resourcefallback

`mountCard()` is dezelfde gedeelde helper die ook `history-graph` mount: hij laadt de kaart via Home Assistants officiële `window.loadCardHelpers()`/`createCardElement()`-pad en vangt elke fout (ontbrekende resource, onbekend `card_type`, exception tijdens constructie) op met een generieke `"Kaart niet beschikbaar."`-tekst in plaats van een crash of stille lege ruimte. Dit dekt het "missing resource"-risicoprofiel dat Kia/printer/pool ook hebben.

**Gevonden gat:** dit vangnet wordt momenteel door geen enkele test uitgeoefend — noch voor de bureaucard, noch voor `history-graph`. Alleen de doorgave van `card_config` zelf is getest (`tests/room-cards-source.test.mjs`, regex op de aanroep), niet het daadwerkelijke fallbackgedrag bij een ontbrekende resource. Vastgelegd als een apart, geïsoleerd vervolgticket: [HD-212](../planning/tickets.md#hd-212--mountcard-resourcefallback-met-een-echte-test-bewijzen).

**Niet van toepassing:** versiemismatchdetectie (anders dan bij Kia/robot/tuin/zwembad) is bewust geen centrale verantwoordelijkheid — er is geen mappingcontract of health-check, dus er is ook geen versie om te vergelijken. Dat blijft, net als bij de andere bronrepo's, eigendom van de LINAK-kaart zelf.

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
| printersummary en -detailkaarten | n.v.t. (geen bronrepo) | ja, volledig native |
| LINAK-bureaucardlogica en mapping health | ja | alleen transparante passthrough + generieke resourcefallback |

## Resource-audit

De huidige 52 resources zijn globaal en kunnen door andere dashboards worden gebruikt. Verwijdering gebeurt pas na:

1. inventaris van alle dashboards en gebruik per resource;
2. gemeten nieuwe baselines;
3. migratie of expliciete onafhankelijkheid van iedere consument;
4. snapshot en rollbackmanifest;
5. menselijke productie-gate.
