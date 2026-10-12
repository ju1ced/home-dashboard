# Testchecklist v0.8.1

## Verhouding tot v0.8.0

Twee tickets sinds `v0.8.0`: een bugfix (HD-208) en een nieuwe editorfunctie (HD-217). Geen releaseprocesverandering ditmaal — gewoon de eerste reguliere, niet-prerelease vervolgrelease.

## Wat er feitelijk verandert

- **HD-208 (bugfix):** de kamertotaalkaart op het Verbruik-tabblad toonde "Niet geconfigureerd" voor dag-/maand-/jaartotalen zodra er geen losse `room_energy`-periodesensor geconfigureerd was — ook als elke smart plug in de kamer zijn eigen, correct resolvende periodesensor al had. Nu telt de kaart de smart-plug-periodesensoren samen (gededupliceerd per entity-ID) wanneer er geen losse kamerbrede sensor is. `power_entities` blijft bewust buiten elke dag-/maand-/jaarberekening. Zie [D-074](../design/decision-log.md).
- **HD-217 (nieuwe editorfunctie):** de kamereditor stelt voortaan automatisch de dag-/maand-/jaar-periodesensoren voor bij een smart plug, via de bijpassende `utility_meter`-helper (gekoppeld op diens `source`-veld), wanneer de browser `hass.callWS` aanbiedt. Altijd als een te bevestigen voorstel — nooit stil overgenomen. Zonder `callWS` werkt de editor exact zoals voorheen.

## Releasegate

- `pnpm test`, `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget 215 kB → 216 kB (gemeten 215.187 bytes) voor HD-208's terugvalsom. Editorbundel ongewijzigd t.o.v. haar eigen budget (160 kB).
- Privacyscan schoon.

## Wat je zelf kan testen

- **HD-208 live:** open een kamer met meerdere smart plugs en zonder losse kamerbrede energiesensor (bv. Keuken) in de Verbruik-tab. "Vandaag"/"Maand"/"Jaar" moeten nu een echt opgeteld cijfer tonen in plaats van "Niet geconfigureerd", met als bron "samengevoegd uit smart plugs".
- **HD-217 live:** open de kamereditor voor een kamer met een nog niet volledig geconfigureerde smart plug (geen dag-/maand-/jaar-periodesensor ingevuld) en controleer of er een voorstel verschijnt zodra er een bijpassende `utility_meter`-helper bestaat. Bevestig dat niets automatisch wordt overgenomen zonder expliciete klik.
- Na deze release: bevestig in HACS dat de installatie op `tags/v0.8.1` staat gepind en dat de releaselijst dit nieuwe tag bevat naast `v0.8.0` — een vervolgbevestiging van D-073/D-074's niet-prerelease-aanpak.

## Niet-geverifieerde aannames

- HD-217's exacte `callWS`-commandovorm (`config_entries/get`) is nog niet live tegen een echte Home Assistant-sessie bevestigd — dit blijft, zoals elke nieuwe HA-frontend-aanname in dit project, een afzonderlijke menselijke testsessie vóór de editor-functionaliteit als volledig geverifieerd geldt.
- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.0`.
- Na deze release: verwijder de `v0.8.1`-release/tag en herpin HACS naar `v0.8.0`. HD-208's fix en HD-217's nieuwe editorvoorstel vervallen dan weer; geen enkele bestaande configuratie of entiteitsmapping gaat daarbij verloren (beide tickets zijn puur additief/reparerend, geen schema- of migratiewijziging).
