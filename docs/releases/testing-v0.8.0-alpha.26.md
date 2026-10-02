# Testchecklist v0.8.0-alpha.26

## Verhouding tot alpha.25

Deze release is een bouwtooling-/performancewijziging, geen productfunctionaliteit. Alle bestaande Control Deck-functionaliteit (rail, dimsliders, positiebalken, plug-metrics, Comfort-consolidatie, awning-confirmation, plug-tweestapsbevestiging, gecombineerd Kamerverbruik, deck-head/stage-head, kamerfoto-upload) is ongewijzigd — zie de [alpha.25-testchecklist](testing-v0.8.0-alpha.25.md). Dit document beschrijft alleen wat sindsdien is toegevoegd.

## Wat is toegevoegd sinds alpha.25

- **Editor uitgesplitst naar een eigen bundle:** de configuratie-editor (`src/editor/home-dashboard-editor.ts` + `fields.ts`) is niet langer onderdeel van de altijd-geladen hoofdbundel. Hij wordt pas gedownload wanneer iemand de dashboardconfiguratie daadwerkelijk opent, via `HomeDashboardStrategy.getConfigElement()` die nu asynchroon is en een dynamische `import()` doet.
- **Twee nieuwe dist-bestanden:** `dist/home-dashboard.js` (hoofdbundel, ongewijzigd qua naam en HACS-resourceregistratie) en `dist/home-dashboard-editor.js` (nieuw, alleen voor de configuratie-UI). Beide hebben een eigen `.sha256`-checksum; `release-manifest.json` heeft een nieuw `editor`-subobject naast het bestaande hoofd-`artifact`-veld.
- **Geen functionele wijziging:** het openen van de dashboardconfiguratie werkt identiek aan voorheen, nu gewoon met één extra, niet-blokkerende netwerkaanvraag voor de editor-bundle.

## Extra releasegate (aanvullend op alpha.25)

- Twee ontwerpen gemeten vóór de keuze tussen esbuild `splitting: true` (kleinere hoofdbundel, maar met een gedeelde chunk die de hoofdbundel nog altijd eager importeert — vrijwel dezelfde downloadkost) en twee volledig zelfstandige bundles (gekozen, veiliger faalgedrag bij een verouderd/ontbrekend editorbestand na een upgrade).
- HACS' `gather_files_to_download()`-brongedrag rechtstreeks nagelezen (niet aangenomen): voor een plugin-repo die op een releasetag met assets is vastgezet, downloadt HACS alle release-assets, niet enkel het `hacs.json`-bestand. De releaseworkflow (`.github/workflows/release.yaml`) is aangepast om de editor-bundle en checksum mee te geven in de `gh release create`-assetlijst.
- HA-frontendbron rechtstreeks nagelezen (niet aangenomen): `hui-element-editor.ts` await't `getConfigElement()` al voor elke dashboard-strategy-editor, dus het asynchrone laadpatroon is bevestigd bestaand gedrag, geen nieuwe aanname.
- `git diff --stat` tegen alpha.25 op `src/cards/home-dashboard-room-cards.ts`, `src/config/migrate.ts` en `src/config/schema-validator.ts` toont geen wijzigingen — awning-confirmation, plug-tweestapsbevestiging, Kamerverbruik-aggregatie en de kamerfoto-levenscyclus zijn ongemoeid.
- `pnpm test` (118/118, onafhankelijk herverifieerd door de lead) en de volledige `pnpm run test:browser`-matrix (inclusief een scenario dat de editor via het echte lazy-load-pad en de devserver opent) zijn groen. `git diff --check` is schoon.
- Bundel: hoofdbundel 204.856 van 210.000 bytes (D-055, nieuwe, lagere grens — eerste structurele oplossing na vier opeenvolgende verhogingen); editorbundel 93.887 van 160.000 bytes.
- Decision log: [D-055](../design/decision-log.md#d-055--bundlebudget-structureel-opgelost-editor-lazy-geladen-hd-210).

## Niet-geverifieerde aanname — vereist live bevestiging

Geen nieuwe. De bestaande, nog niet live geverifieerde aanname over de `media_source/resolve_media`-responsvorm (alpha.25, D-054) blijft ongewijzigd staan en is niet aangeraakt door deze release.

## Testdashboardgate — ongewijzigd, vóór iedere Home Assistant-write invullen

- Exact testdashboard: **nog goed te keuren**.
- Verse dashboardexport/snapshot: **vereist**.
- Default `lovelace`-hash vóór test: **vereist**.
- Targetallowlist voor veilige acties: **vereist**.
- Goedgekeurde resourceversie en rollbackversie: **vereist**.
- **Extra voor deze release:** bevestig na installatie dat HACS zowel `home-dashboard.js` als `home-dashboard-editor.js` daadwerkelijk heeft gedownload, en dat de configuratie-editor in een echte Home Assistant-sessie opent zonder console-errors.

Zonder alle waarden wordt de live test niet gestart.

## Rollbackscope

- Vóór deze release: geen wijziging, `main` stond op `v0.8.0-alpha.25`.
- Na deze release maar vóór testdeployment: verwijder de `v0.8.0-alpha.26`-release/tag en herstel de HACS-resource naar `v0.8.0-alpha.25`.
- Na een goedgekeurde testdeployment: herstel uitsluitend het testdashboard uit de verse snapshot en zet de eerder goedgekeurde resourceversie terug.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.
