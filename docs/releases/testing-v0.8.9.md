# Testchecklist v0.8.9

## Verhouding tot v0.8.8

Eén ticket sinds `v0.8.8`: HD-224, live eigenaarsfeedback over toegankelijkheid van de "Kamers & bediening"-kaarten op Home. Schemawijziging: elke kamer krijgt een nieuw, verplicht (standaard leeg) veld `motion_entities`; migratie vult dit automatisch aan voor bestaande configuraties, geen handmatige actie nodig.

## Wat er feitelijk verandert

- **HD-224 (herontwerp):** de quick actions van een kamer (licht, cover, luifel, climate, media) zijn niet langer verstopt achter een expand-klik op de kamernaam. Ze staan nu als compacte, gekleurde pil-chips altijd zichtbaar direct onder de kamernaam, en blijven exact even bedienbaar als voorheen (dezelfde klik-/bevestigings-/foutafhandelingslogica).
- **HD-224 (nieuw):** camera's krijgen een eigen statuschip (altijd aanwezig als er camera's geconfigureerd zijn). Bewegingssensoren krijgen ook een chip, maar **alleen** wanneer je ze expliciet toevoegt via het nieuwe "Bewegingssensoren"-veld in de kamereditor — nooit automatisch afgeleid van de bestaande, voor iets anders bedoelde Safety-lijst. Een tik op zo'n chip opent altijd enkel meer-informatie, nooit een bediening.
- Geen wijziging aan bestaande veiligheidswaarborgen: luifelbevestiging, "Stop" blijft werken tijdens een lopende beweging, geen gefabriceerde status, uitgeschakelde bediening toont enkel details.

## Releasegate

- `pnpm test` (152/152), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget ongewijzigd (222 kB), gemeten 218.597 bytes.
- Privacyscan schoon.

## Wat je zelf kan testen

- Open Home en bekijk een favoriete kamer: de quick-actionchips moeten meteen zichtbaar zijn naast/onder de kamernaam, zonder iets te hoeven uitklappen.
- Tik een lichtchip: moet direct schakelen (geen extra stap). Tik een coverchip: moet de open/stop/dicht-strip tonen.
- Ga naar de kamereditor en voeg een bewegingssensor toe aan het nieuwe "Bewegingssensoren"-veld van een kamer. Bevestig dat er nu een extra chip verschijnt op Home voor die kamer, en dat kamers zonder dit veld ingevuld geen bewegingschip tonen (ook niet als ze wel andere Safety-sensoren hebben).
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.9` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.
- HD-217's opzoekfunctie (v0.8.8) is nog niet live tegen een echte Home Assistant-instantie getest.
- De eigenaar meldde eerder ook dat de schaal "nog steeds niet makkelijk leesbaar" is, zonder concreet reproduceerbaar detail — dit blijft open tot een vervolgscreenshot of nadere omschrijving.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.8`.
- Na deze release: verwijder de `v0.8.9`-release/tag en herpin HACS naar `v0.8.8`. Het nieuwe `motion_entities`-veld blijft dan ongebruikt in bestaande configuraties staan (geen functioneel verlies, puur een UI-herontwerp plus één nieuw optioneel veld).
