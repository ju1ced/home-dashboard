# Changelog

Alle betekenisvolle wijzigingen worden hier bijgehouden. Het project gebruikt Semantic Versioning met prereleases tijdens de testfasen.

## Unreleased

Nog geen wijzigingen.

## 0.2.0-alpha.1 — 2026-08-22

### Added

- Versioned configuratieschema v1 met defaults, validatie, migratie en privacyveilig compilermanifest.
- Volledige grafische strategy-editor voor algemeen, Vandaag, personen, drie camera's/privacy, kamers, Energie, acties, specialisten, layout en diagnostiek.
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
