# Changelog

Alle betekenisvolle wijzigingen worden hier bijgehouden. Het project gebruikt Semantic Versioning met prereleases tijdens de testfasen.

## Unreleased

Nog geen wijzigingen.

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
