# Testchecklist v0.8.10

## Verhouding tot v0.8.9

Eén ticket sinds `v0.8.9`: HD-225, twee directe correcties van de eigenaar op dezelfde kamerchips. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-225 (fix):** chips worden niet langer gecombineerd. Meerdere entiteiten van hetzelfde type (bv. drie losse lichten zonder gekozen hoofdlicht) toonden voorheen één samengevoegde chip met een "N apparaten"-teller en een apparatenlijst-popup. Elke entiteit krijgt nu gewoon zijn eigen chip — een kamer met veel losse lichten toont dus evenveel losse chips; de oplossing voor "te veel chips" is `control_entities`/`light_groups` configureren in de kamereditor, niet ze stilzwijgend laten samenvoegen.
- **HD-225 (fix):** media-chips openen voortaan altijd meer-informatie (net als climate al deed), in plaats van een gegokte play/pause-toggle. Licht- en cover/luifel-chips blijven ongewijzigd rechtstreeks bedienbaar.
- **HD-225 (layout):** de chiprij staat nu naast de kamernaam in plaats van eronder met een scheidingslijn; de kaart is merkbaar compacter.
- **HD-225 (bijvangst):** een latent renderprobleem gefixt waarbij een cover/luifel-strip soms de verkeerde (meervoudige, generieke) naam toonde in plaats van het apparaat se eigen naam.

## Releasegate

- `pnpm test` (152/152), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget ongewijzigd (222 kB), gemeten 214.848 bytes — kleiner dan `v0.8.9`.
- Privacyscan schoon.

## Wat je zelf kan testen

- Open Home en bekijk een kamer met meerdere losse lichten (geen gekozen hoofdlicht): bevestig dat je nu één chip per licht ziet, nooit één samengevoegde chip met een apparatenlijst.
- Tik een mediachip: moet altijd de meer-informatie-popup openen, nooit rechtstreeks pauzeren/hervatten.
- Bevestig dat de chiprij van elke kamer naast de kamernaam staat (niet eronder), en dat de kaart compacter oogt dan in `v0.8.9`.
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.10` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.
- HD-217's opzoekfunctie (v0.8.8) is nog niet live tegen een echte Home Assistant-instantie getest.
- De eigenaar meldde eerder ook dat de schaal "nog steeds niet makkelijk leesbaar" is, zonder concreet reproduceerbaar detail — dit blijft open tot een vervolgscreenshot of nadere omschrijving.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.9`.
- Na deze release: verwijder de `v0.8.10`-release/tag en herpin HACS naar `v0.8.9`. Geen functioneel verlies, puur een gedrags-/layoutcorrectie op dezelfde chips.
