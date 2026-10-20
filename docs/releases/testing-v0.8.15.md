# Testchecklist v0.8.15

## Verhouding tot v0.8.14

Eerste deel van HD-235 sinds `v0.8.14`, naar aanleiding van live feedback van de eigenaar dat de Kamers-sectie van de instellingen-editor "absoluut niet handig en duidelijk" was. Geen schema- of migratiewijziging; enkel hoe de editor kamervelden groepeert en navigeert.

## Wat er feitelijk verandert

- **Master-detail-layout:** de Kamers-sectie toont nu een doorzoekbare kamerlijst links, gegroepeerd per verdieping, met rechts een echte pagina voor de geselecteerde kamer — in plaats van elke kamer als een uitklappende lijst.
- **Vijf sub-tabs per kamer:** Basis, Snelkoppelingen, Bronmappings, Energie, Klimaat. Elk veld staat op exact dezelfde plek functioneel als voorheen, enkel anders gegroepeerd; geen velden toegevoegd, verwijderd of van betekenis veranderd.
- **Zoekveld-fix:** zoeken matcht nu consistent op naam, sleutel, verdieping én area, ook tijdens live typen (voorheen matchte de live filter enkel de naam).
- **Repo-fix, geen functionele impact:** `docs/planning/kanban.md`/`tickets.md` waren per ongeluk gecommit als devbox-lokale symlinks en braken daardoor CI; teruggezet naar gewone bestanden. Geen effect op de dashboard- of editorwerking zelf.
- **Bewust niet in scope:** het hergebruiken van één apparaat als zowel favoriet als verbruiksbron zonder het twee keer te koppelen (HD-235's tweede deel), en HD-217's live UI-klik-door-acceptatie van de periodesensor-opzoekfunctie.

## Releasegate

- `pnpm test` (157/157, incl. `check-repo.mjs`/privacyscan), `pnpm run test:browser` (incl. het echte-browser-scenario tegen `editor.html` en de 44px-aanraakdoelscan), `git diff --check`: bevestigd groen.
- Editorbundelbudget ongewijzigd (160 kB), gemeten 106.754 bytes. Hoofdbundel ongewijzigd (217.569 bytes) — geen `src/cards/`-bestand aangeraakt.
- Privacyscan schoon (tijdens dit werk zijn ook twee eerder per ongeluk gecommitte, echte entity-/config-entry-ID's uit `tickets.md` verwijderd).
- Lokaal visueel bevestigd (Playwright, niet gecommit) op ≈972px (benadert de echte HA-dialoogbreedte van `min(1024px, 95vw)`) en 390px (telefoon): master-detail-split, tab-styling en telefoon-stapeling renderen correct.

## Wat je zelf kan testen

- Open "Wijzig dashboard" → Kamers. Bevestig dat je links een doorzoekbare, per-verdieping-gegroepeerde kamerlijst ziet, en rechts (of eronder op smal scherm) de velden van de geselecteerde kamer.
- Klik een kamer open: bevestig dat je vijf tabs ziet (Basis/Snelkoppelingen/Bronmappings/Energie/Klimaat) en dat elk tabblad enkel zijn eigen velden toont.
- Zoek op een kamernaam, een logische sleutel, een verdiepingsnaam en een area-naam: bevestig dat alle vier het verwachte resultaat filteren, ook terwijl je typt.
- Controleer voor minstens één kamer dat alle bestaande waarden (naam, icoon, entiteiten, smart plugs, klimaat) nog exact kloppen na de herindeling — niets mag verloren of verplaatst zijn in betekenis.
- Verklein het editorvenster (of test op een telefoon): bevestig dat de lijst boven de detailpagina stapelt in plaats van naast elkaar te blijven staan.
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.15` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De exacte visuele passing binnen de echte dialoogchrome (titelbalk, "⋮"-menu, Opslaan-voettekst, `min(1024px, 95vw)`-breedte) is enkel tegen een benaderde breedte in de sandboxprototype bevestigd, niet live tegen de echte dialoog zelf.
- HD-217's opzoekfunctie is nog niet live via een klik-door in deze nieuwe kamerpagina getest (apart vervolg, HD-235 blijft "In uitvoering").
- Het hergebruiken van één apparaat voor meerdere doeleinden (favoriet + verbruik) zonder het twee keer te koppelen is nog niet gebouwd.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.14`.
- Na deze release: verwijder de `v0.8.15`-release/tag en herpin HACS naar `v0.8.14`. Geen functioneel verlies — puur een herindeling van de editor-UI, geen schema- of dataverandering.
