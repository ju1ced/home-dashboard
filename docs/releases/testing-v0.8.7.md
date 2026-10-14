# Testchecklist v0.8.7

## Verhouding tot v0.8.6

Eén ticket sinds `v0.8.6`: HD-223, een zesde directe reactie op live eigenaarsfeedback over dezelfde Verbruik-tab. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-223 (gedragswijziging, op expliciet verzoek):** `v0.8.6`'s kalenderweek-vorm (maandag t/m zondag) toonde lege kolommen voor nog niet beleefde dagen. De eigenaar vond dit verwarrend en vroeg expliciet om een rollend venster in plaats daarvan: de voorbije 7 dagen, met vandaag altijd als laatste kolom.
- **HD-223 (uitbreiding):** "Verbruik per maand" krijgt dezelfde garantie: altijd precies 12 kolommen, met deze maand altijd als laatste kolom — ook als een bron nog geen volledig jaar historiek heeft.
- Een dag/maand zonder historische data toont nog steeds een zichtbare "geen data"-marker, nooit een verdwenen of 0px-hoge kolom (ongewijzigd t.o.v. `v0.8.6`, enkel de positionering van die lege kolommen verandert: altijd vóór vandaag/deze maand, nooit erna).

## Releasegate

- `pnpm test` (152/152), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget ongewijzigd (222 kB), gemeten 218.314 bytes.
- Privacyscan schoon.

## Wat je zelf kan testen

- Open een kamer met smart plugs op de Verbruik-tab en klik op "Vandaag". De grafiek moet altijd 7 kolommen tonen, met vandaag als laatste (meest rechtse) kolom — ongeacht welke dag van de week het vandaag is.
- Klik op "Maand". De grafiek moet altijd 12 kolommen tonen, met deze maand als laatste kolom.
- Controleer dat dagen/maanden zonder historische data een duidelijk herkenbare "geen data"-markering tonen (een gestreept patroon), nooit gewoon leeg of afwezig.
- Bevestig dat de dagen/maanden die al wél data hebben nog steeds hun echte, correcte waarden tonen (geen regressie t.o.v. `v0.8.6`).
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.7` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.
- De eigenaar meldde eerder ook dat de schaal "nog steeds niet makkelijk leesbaar" is, zonder concreet reproduceerbaar detail — dit blijft open tot een vervolgscreenshot of nadere omschrijving.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.6`.
- Na deze release: verwijder de `v0.8.7`-release/tag en herpin HACS naar `v0.8.6`. HD-223's fix vervalt dan weer; geen enkele bestaande configuratie of entiteitsmapping gaat daarbij verloren (puur een gedragswijziging in de grafiekweergave, geen schema- of migratiewijziging).
