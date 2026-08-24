# Changelog

Alle betekenisvolle wijzigingen worden hier bijgehouden. Het project gebruikt Semantic Versioning met prereleases tijdens de testfasen.

## Unreleased

Nog geen wijzigingen.

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
