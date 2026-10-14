# Testchecklist v0.8.6

## Verhouding tot v0.8.5

Eén ticket sinds `v0.8.5`: HD-222, een vijfde directe reactie op live eigenaarsfeedback over dezelfde Verbruik-tab. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-222 (bugfix):** "Verbruik per dag" toonde alleen de dagen die al verstreken waren sinds de week-maandag (op een dinsdag dus enkel "ma"/"di"), in plaats van een stabiele maandag-zondag vorm. De week begon al terecht op maandag (`v0.8.5`), maar groeide verder letterlijk mee met de week zelf.
- **HD-222 (fix):** de grafiek vult nu altijd aan tot precies 7 kolommen. Een dag zonder echte historische data (typisch een nog niet beleefde dag) toont een zichtbare "geen data"-marker, nooit een verdwenen of gefabriceerde kolom.
- **HD-222 (knock-on fix):** een volledig lege, aangevulde kolom reserveert nu een minimale zichtbare hoogte, zodat die "geen data"-markers niet onzichtbaar worden (hetzelfde onzichtbare-balkprobleem dat `v0.8.4` al eens oploste, nu voor een nieuwe reden).

## Releasegate

- `pnpm test` (151/151), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget ongewijzigd (222 kB), gemeten 218.219 bytes.
- Privacyscan schoon.

## Wat je zelf kan testen

- Open een kamer met smart plugs op de Verbruik-tab en klik op "Vandaag". De grafiek moet altijd 7 kolommen tonen (maandag t/m zondag), ongeacht welke dag van de week het vandaag is.
- Controleer dat de dagen die nog niet geweest zijn een duidelijk herkenbare "geen data"-markering tonen (een gestreept patroon), niet gewoon leeg of afwezig zijn.
- Bevestig dat de dagen die al wél verstreken zijn nog steeds hun echte, correcte waarden tonen (geen regressie t.o.v. `v0.8.5`).
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.6` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.
- De eigenaar meldde eerder ook dat de schaal "nog steeds niet makkelijk leesbaar" is, zonder concreet reproduceerbaar detail — dit blijft open tot een vervolgscreenshot of nadere omschrijving.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.5`.
- Na deze release: verwijder de `v0.8.6`-release/tag en herpin HACS naar `v0.8.5`. HD-222's fix vervalt dan weer; geen enkele bestaande configuratie of entiteitsmapping gaat daarbij verloren (puur een bugfix/weergave-aanpassing, geen schema- of migratiewijziging).
