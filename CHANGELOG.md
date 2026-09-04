# Changelog

Alle betekenisvolle wijzigingen worden hier bijgehouden. Het project gebruikt Semantic Versioning met prereleases tijdens de testfasen.

## 0.7.0-alpha.1 — 2026-09-04

### Added

- Voegt een read-only Kia-summary en stabiele `specialist-kia`-subview toe, met acculading, bereik, laadstatus, dataversheid en een veilige route naar de bestaande HACS Kia-card.
- Geeft de private Kia-cardconfiguratie transparant door, zonder voertuiglogica, acties, confirmations of mappingdiagnostiek in deze repository te kopiëren.

### Changed

- Corrigeert het vaste Kia-cardcontract naar `custom:kia-dashboard-card` en bewaakt voor de nieuwe integratielaag een harde minified bundlelimiet van 168 kB.

### Safety and validation

- Toont een native fallback bij ontbrekende resource, onvolledige mapping of stale/unavailable voertuigdata; er zijn geen Home Assistant-writes of servicecalls toegevoegd.

## 0.6.0-alpha.1 — 2026-08-24

### Added

- Voegt op Home geprioriteerde aandacht, actuele activiteit en afwijkende kamers toe binnen vaste contentbudgetten.
- Toont op het kameroverzicht concrete apparaatchips met semantische status en groepeert kamerdetails per verlichting, covers, klimaat, media, safety, camera, power en historie.
- Bouwt een afzonderlijke read-only Energie-view met actuele KPI's, historie, bronsecties en de officiële Home Assistant Energy-kaarten.
- Vervangt de platte domeininventaris door gecureerde woningfuncties voor klimaat, verlichting, veiligheid, water, media, energie, mobiliteit/buiten en systeem.

### Changed

- Verhoogt het bewaakte minified bundlebudget naar 160 kB voor de nieuwe semantische views; de releasebundel blijft onder die harde grens.
- Verrijkt personen uitsluitend met privacyveilige zone-, versheids- en lage-batterijcontext.

### Safety and validation

- Alle nieuwe interacties openen uitsluitend Home Assistants standaard detaildialoog of navigeren naar een view; er zijn geen servicecalls of configuratiewrites toegevoegd.
- Dekt normal, warning, missing en unavailable states af met 48 geautomatiseerde tests, plus repository-, privacy-, TypeScript- en distributiechecks.

## 0.5.0-alpha.9 — 2026-08-24

### Changed

- Vormt weer, energiecontext en afvalophaling om tot één samengestelde Vandaag-kaart met één buitenrand en subtiele interne scheidingslijnen.
- Plaatst maximaal vier afvalfracties op desktop in één rij en houdt ze op smalle schermen in een compacte tweekolomsindeling.
- Behoudt security als afzonderlijke rechterkolom en de bestaande lineaire responsive volgorde.

### Validation

- Vergrendelt de samengestelde Vandaag-container, enkelvoudige desktop-afvalrij en tweekoloms mobiele afvalweergave in de distributietests.

## 0.5.0-alpha.8 — 2026-08-24

### Changed

- Laat de compacte weerkaart op desktop over de twee linker Vandaag-kolommen lopen.
- Verplaatst de energie-rail en afvalophaling naar de rij onder het weer, terwijl security rechts beide rijen blijft begeleiden.
- Behoudt op tablet en mobiel de bestaande lineaire stapelvolgorde zonder horizontale overflow.

### Validation

- Vergrendelt de nieuwe gridposities en responsive reset in de distributietests.

## 0.5.0-alpha.7 — 2026-08-24

### Changed

- Vervangt de te hoge native weather-card op Home door een begrensde eigen weerpresentatie met actuele conditie, temperatuur en maximaal drie dagelijkse voorspellingen.
- Laat die voorspelling via Home Assistants read-only `weather/subscribe_forecast`-contract binnenkomen en bewaart een veilige huidige-statusfallback wanneer forecastdata nog laadt.
- Brengt Home visueel dichter bij **Juiced Horizon Calm** met warmere surfaces, subtiele schaduwen, groene accenten, een aaneengesloten energie-rail en verfijnde afval-, person-, navigatie- en securitykaarten.
- Verhoogt het gecontroleerde minified bundlebudget van 120 kB naar 128 kB voor de compacte forecastpresentatie; de bundel blijft zonder service- of configuratiewrites.

### Validation

- Vergelijkt de Home-compositie lokaal met de goedgekeurde render op desktop, 390 px en donkere tokens.
- Bewaakt in de bundel de forecastsubscription, compacte weerstructuur, themetokens en afwezigheid van `callService` en `callWS`.

## 0.5.0-alpha.6 — 2026-08-24

### Changed

- Brengt de driedelige Vandaag-layout in lijn met de goedgekeurde render: compacter weer, iconische energiestatussen en security zonder dubbele sectietitel.
- Laat `system`, `light` en `dark` uit de grafische configuratie doorwerken op de Home-compositie en haar childcards via ondersteunde Home Assistant-themetokens.
- Herkent GFT, papier/karton, PMD, groenafval, glas en restafval semantisch en toont per ophaling een fractie-icoon, korte naam, datum en relatieve termijn.

### Validation

- Test afvalherkenning met ISO- en lokale datumnotatie en bewaakt de afwezigheid van de verwijderde securitykop.
- Controleert de runtimecompositie lokaal op 1440 px, 390 px en met donkere HA-themetokens; er zijn geen Home Assistant-writes of servicecalls uitgevoerd.

## 0.5.0-alpha.5 — 2026-08-24

### Changed

- Splitst het gecombineerde batterijvermogen onder **Vandaag** in afzonderlijke sensoren en vaste labels voor **Batterij laden** en **Batterij ontladen**.
- Plaatst security op brede schermen als compacte derde kolom naast het weer en de Vandaag-sensoren; tablet en mobiel blijven responsief stapelen.
- Geeft afval een eigen herkenbare groep **Afvalophaling**, een afvalicoon en duidelijke friendly-name plus ophaalstatus per bron.

### Fixed

- Werkt realtime statewaarden in-place bij, zodat snel veranderende vermogenssensoren niet langer de volledige Home-compositie, weerkaart en camerastrook voortdurend opnieuw opbouwen.
- Bewaart een oude gecombineerde batterijvermogensmapping verliesvrij als extra energiecontext en vraagt daarna om de twee nieuwe bronnen afzonderlijk te kiezen.

### Validation

- Voegt een regressietest toe die bewijst dat vermogensupdates geen structurele rerender veroorzaken, terwijl een echt veiligheidsincident de Home-structuur wel bijwerkt.
- Controleert de driedelige desktopcompositie in een lokale runtime met fictieve waarden en zonder Home Assistant-verbinding.

## 0.5.0-alpha.4 — 2026-08-24

### Fixed

- Voorkomt dat enkelvoudige Home Assistant-entityselectors hun net gekozen waarde onmiddellijk opnieuw leegmaken doordat zowel `value-changed` als het daaropvolgende native `change`-event werden verwerkt.
- Herstelt daarmee de vijf entityselectors onder **Vandaag** en dezelfde selectorroute voor onder meer het securityalarm en Energie.
- Markeert deze optionele entityvelden expliciet als niet-verplicht voor de Home Assistant-selectorcomponent.

### Validation

- Simuleert in de regressietests de echte Home Assistant-eventvolgorde voor zowel een Vandaag-KPI als het alarm en controleert dat selectie, opslag en rerender dezelfde waarde behouden.

## 0.5.0-alpha.3 — 2026-08-24

### Added

- Voegt onder **Vandaag** vijf afzonderlijke entityselectors toe voor thuisbatterij-SoC, batterij laad-/ontlaadvermogen, zonnepanelenopbrengst, huisverbruik zonder batterijladen en de maandelijkse vermogenspiek.
- Toont deze bronnen op Home met vaste betekenisvolle labels, onafhankelijk van de technische entitynaam of friendly name.
- Behoudt de bestaande algemene energiecontext als optionele aanvullende KPI-bronnen.

### Compatibility and validation

- Migreert bestaande schema-v1-configuraties verliesvrij door de nieuwe velden leeg aan te vullen.
- Voegt schema-, editor-, migratie- en strategyregressies toe voor alle vijf benoemde KPI's.

## 0.5.0-alpha.2 — 2026-08-24

### Changed

- Herbouwt Home als één begrensde, responsive compositie met begroeting, aandacht, weer, energiecontext, afval, gezin, directe routes en security.
- Verkleint de cameraviewport tot maximaal circa 520 px en de privacyrail tot compacte statussen naast het beeld.
- Vervangt generieke capabilitylabels op kamerkaarten door state-aware chips voor werkelijk gemapte lichten, covers, klimaat, media, veiligheid en energie.
- Herbouwt kamerdetails als één samenhangend dashboard met hero, primaire statussen, apparaatgroepen, klimaatcontext, media, veiligheid, energie en afzonderlijke historie.
- Apparaatkaarten en chips openen uitsluitend het standaard Home Assistant-detailvenster; de bundle voert nog steeds geen servicecall uit.

### Performance and validation

- Verhoogt het expliciete bundlebudget van 100 kB naar 120 kB voor de twee begrensde visuele compositiecards; de gemeten minified bundle blijft onder dit plafond.
- Voegt regressietests toe voor informatieoverdracht, compacte camera-afmetingen, room-detailcompositie en de afwezigheid van `callService`/`callWS`.

## 0.5.0-alpha.1 — 2026-08-24

### Added

- Vervangt de vlakke Kamers-entiteitenlijst door een herkenbaar overzicht met hero, verdiepingsgroepen en compacte kamerkaarten.
- Genereert voor iedere geconfigureerde kamer een stabiele semantische subview `room-<key>` met terugpad naar Kamers.
- Groepeert kamerdetails in ruimtestatus, licht/covers/openingen, comfort/klimaat, media, veiligheid/camera's, apparaten/energie en 72-uurs historie.
- Verbergt lege kamersecties en behoudt normale, gedeeltelijk onbeschikbare en lege kamers als geldige layouts.

### Safety and validation

- Kamerstatus en detailkaarten blijven read-only; servicecalls, actionsequences en quick actions worden nog niet gegenereerd.
- Test stabiele paths, subviews, informatiedekking, kamerstatussemantiek, responsive componentregistratie en veilige entityacties.

## 0.4.0-alpha.2 — 2026-08-24

### Fixed

- Toont in de cameracarrousel exact één camerakaart per viewport in plaats van een rij miniaturen.
- Laat camera's met actieve privacymodus volledig uit de beeldcarrousel weg.
- Verplaatst alle privacystatussen naar een compacte zijrail die op mobiel horizontaal onder het beeld staat.
- Beperkt de camerabreedte op grote schermen en houdt pijltjes-, touch- en toetsenbordnavigatie beschikbaar.

### Safety

- De compacte privacystatus is informatief en voert geen actie uit; camera-, alarm- en privacybediening blijven read-only.

## 0.4.0-alpha.1 — 2026-08-24

### Added

- Bouwt Home opnieuw op met compacte Vandaag-, Gezin- en navigatiegroepen en een beveiligingssectie over de volledige beschikbare breedte.
- Voegt een horizontaal en met toetsenbord bedienbare camerastrook toe voor ieder geconfigureerd aantal camera's.
- Toont bij actieve privacy een expliciete privacyplaceholder in plaats van een betekenisloos zwart cameravlak.
- Toont operationele `unknown`/`unavailable`-status uitsluitend voor de expliciete diagnostiek-allowlist.

### Safety and validation

- Camera-, privacy-, alarm- en personweergave blijven read-only; de release genereert geen servicecall of Home Assistant-write.
- Cameravolgorde, privacyfallback, verborgen fallback, volledige sectiebreedte, compacte personenweergave en custom-cardregistratie zijn regressiegetest.
- De in Home Assistant waargenomen layoutproblemen zijn alleen geanonimiseerd vastgelegd; screenshots en installatie-identifiers zijn niet aan de repository toegevoegd.

## 0.3.0-alpha.3 — 2026-08-22

### Fixed

- Accepteert een gekoppelde privacyactie met iedere geldige risicoklasse, inclusief `safe`.
- Laat de actie zelf bepalen of bevestiging vereist is; de cameracheckbox blijft een onafhankelijke, optionele extra bevestiging.
- Verwijdert de onterechte Security-blokkade voor een bestaande, volledig gescopete en verifieerbare actie.
- Herstelt daardoor ook het opslaan van een gekozen alarmentiteit wanneer deze fout de enige resterende blokkade was.
- Verduidelijkt het onderscheid tussen status-only, actierisico en de extra camerabevestiging in de editor.

## 0.3.0-alpha.2 — 2026-08-22

### Fixed

- Maakt een gekozen privacyinstelling met **Privacyactie = Geen** geldig voor status-only gebruik.
- Houdt de extra bevestigingskeuze per camera optioneel en gebruikt ze niet langer als opslagblokkade.
- Controleert targetscope en resultaatcontrole alleen wanneer een privacyactie daadwerkelijk is gekoppeld; `v0.3.0-alpha.3` maakt de risicoklasse daarbij vrij.
- Vervangt generieke configuratievariantmeldingen door de precieze fout bij de betrokken camera of actie.
- Toont de risicoklasse in de privacyactiekeuze en verduidelijkt in Security dat bediening optioneel is.

## 0.3.0-alpha.1 — 2026-08-22

### Added

- Vervangt de configuratiepreview door vijf echte native Sections-views: Home, Kamers, Energie, Domeinen en Meer.
- Registreert een afzonderlijke view strategy en genereert de gekozen startview als eerste stabiele view.
- Toont lokaal geselecteerde Vandaag-, person-, camera-, privacy-, kamer-, energie- en domeinbronnen.
- Ondersteunt alle geconfigureerde camera's in bronvolgorde en houdt verborgen personlocaties ook visueel verborgen.
- Biedt veilige navigatie naar Kamers, Meer en het standaard Home Assistant Energie-dashboard.

### Safety and validation

- Alle entitykaarten zijn in deze alpha read-only; tap, hold en double-tap voeren geen actie uit.
- Alleen expliciete `navigate`-acties zijn toegestaan; er wordt geen service, target of actionsequence gegenereerd.
- Test vijf stabiele views, Sections-output, zes camera's, startviewvolgorde, privacy, fixtures, registratie, serialisatie en determinisme.

## 0.2.0-alpha.3 — 2026-08-22

### Changed

- Laat Security met ieder geconfigureerd aantal camera's werken; bij ingeschakelde Security is alleen minstens één camera vereist.
- Verwijdert de eerdere vaste limiet van drie camera's uit schema, runtimevalidatie en grafische editor.
- Legt bij privacybediening expliciet uit dat de gekoppelde privacyactie eerst onder **Acties** wordt aangemaakt.
- Voegt in Security een directe knop toe die naar de sectie **Acties** navigeert en die sectie focust.

### Validation

- Legt vast dat de compacte configuratiemethode en kamerconfiguratie in `v0.2.0-alpha.2` praktisch goedgekeurd zijn.
- Test configuraties met één, twee, drie en zes camera's en de navigatie van Security naar Acties.

## 0.2.0-alpha.2 — 2026-08-22

### Changed

- Vervangt de lange editorlijst door vaste sectienavigatie met één zichtbaar onderdeel, voortgang en vorige/volgende-bediening.
- Gebruikt op desktop een compacte linkernavigatie en op mobiel een horizontaal scrollbare sectiebalk.
- Toont validatiebadges per onderdeel en alleen de relevante foutdetails in het actieve onderdeel.
- Maakt personen, camera's, kamers en acties afzonderlijk inklapbaar; open items blijven open na een wijziging.
- Voegt volledige toetsenbordnavigatie voor de sectietabs toe.

### Validation

- Legt de geslaagde preview-, import/export- en mobiele editortest van `v0.2.0-alpha.1` geanonimiseerd vast.

## 0.2.0-alpha.1 — 2026-08-22

### Added

- Versioned configuratieschema v1 met defaults, validatie, migratie en privacyveilig compilermanifest.
- Volledige grafische strategy-editor voor algemeen, Vandaag, personen, camera's/privacy, kamers, Energie, acties, specialisten, layout en diagnostiek.
- Minimale Community dashboard-registratie met verplichte editor en read-only configuratiepreview.
- Native Home Assistant-selectors voor entities, areas, floors, icons en actions.
- Lokale JSON-import/export met privacywaarschuwing en geblokkeerde ongeldige tussenstanden.
- Normal-, warning-, missing- en unavailable-fixtures plus schema/editorcoverage en round-triptests.
- GUI-, schema-, compatibility-, troubleshooting-, backup/rollback- en prereleasetestdocumentatie.

### Known limitations

- De vijf productviews volgen in `v0.3.0-alpha.1`; deze release genereert alleen een read-only configuratiepreview.
- Resource- en specialistversies worden opgeslagen en gevalideerd, maar pas door de shell zichtbaar gecontroleerd.

## 0.1.0-alpha.1 — 2026-08-21

### Added

- HACS Dashboard-pluginmanifest met Home Assistant 2026.8.2 als minimum.
- Reproduceerbare TypeScript/esbuild-bundle in `dist/home-dashboard.js`.
- CI-, HACS-validatie- en taggestuurde releaseworkflows.
- Releasechecksums, buildmanifest en installatietestchecklist.
- Eerste HACS-installatie-, update-, remove- en resource-loadtest.
