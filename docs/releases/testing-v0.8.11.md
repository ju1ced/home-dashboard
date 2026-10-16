# Testchecklist v0.8.11

## Verhouding tot v0.8.10

Twee tickets sinds `v0.8.10`: HD-226 en HD-227, beide directe vervolgcorrecties van de eigenaar op de kamerkaarten. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-226 (fix):** "Aandacht nodig" wordt een oproepbare chip, geen permanente waarschuwingstekst. De kamerkop toonde voorheen onvoorwaardelijk "Aandacht nodig · Open kamerdetails" zodra een veiligheidssensor aandacht vroeg. De metatekst toont nu uitsluitend comfort-context (bv. temperatuur) of een neutrale standaardtekst — nooit meer de waarschuwing zelf. Een nieuwe chip (rood, `mdi:alert`) volgt hetzelfde "enkel oproepbaar"-patroon als de bestaande motion-/camerachips: altijd in de DOM zodra een kamer veiligheidssensoren heeft, maar verborgen tot minstens één sensor daadwerkelijk aandacht vraagt. Een klik opent meer-info voor precies die sensor, nooit een service-aanroep.
- **HD-227 (fix):** geen harde limiet meer op het aantal favoriete kamers op Home. `favoriteRooms()` kapte voorheen hard af op vier kamers; die cap is volledig verwijderd (niet opgetrokken naar een hoger vast getal), zodat alle door de eigenaar gekozen favoriete kamers verschijnen, in dezelfde expliciete volgorde als voorheen. Editor-copy en de forward-facing configuratiedocs zijn bijgewerkt om de oude limiet niet meer te vermelden.

## Releasegate

- `pnpm test` (153/153), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget ongewijzigd (222 kB), gemeten 215.694 bytes.
- Privacyscan schoon.

## Wat je zelf kan testen

- Zorg dat een veiligheidssensor in een kamer een aandacht-waardige staat heeft (bv. open/problem): bevestig dat de rode aandachtchip verschijnt naast de andere chips, en dat de metatekst onder de kamernaam nooit de waarschuwing zelf toont.
- Tik die aandachtchip: moet meer-informatie openen voor precies die sensor, nooit een service-aanroep.
- Zet de sensor terug naar een normale staat: bevestig dat de chip weer verdwijnt.
- Markeer (via Dashboard bewerken → Kamers) meer dan vier kamers als favoriet: bevestig dat ze allemaal op Home verschijnen, in de volgorde die je instelt, zonder foutmelding over een maximum.
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.11` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.
- HD-217's opzoekfunctie (v0.8.8) is nog niet live tegen een echte Home Assistant-instantie getest.
- HD-227 verwijdert enkel de code-cap; het daadwerkelijk markeren van extra kamers als `home_favorite: true` in de live Home Assistant-configuratie is een apart, nog te plannen vervolg dat een eigen menselijke goedkeuring vereist.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.10`.
- Na deze release: verwijder de `v0.8.11`-release/tag en herpin HACS naar `v0.8.10`. Geen functioneel verlies, puur twee gedragscorrecties op bestaande kamerkaarten.
