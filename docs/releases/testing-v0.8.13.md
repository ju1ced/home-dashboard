# Testchecklist v0.8.13

## Verhouding tot v0.8.12

Drie tickets sinds `v0.8.12`: HD-231, HD-232 en HD-233 — waaronder een echte regressiefix voor een bug die met `v0.8.12` (HD-229) is binnengeslopen. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-233 (fix, P0, regressie sinds v0.8.12):** sinds HD-229 toont elke chip met een live state `ha-state-icon` i.p.v. `ha-icon` als icoon-element. De bestaande CSS (`.control>ha-icon`/`.active>ha-icon`/`.status-attention>ha-icon`) is een tag-naam-selector die enkel een directe `ha-icon`-kind matcht — sindsdien stilletjes kapot voor elke chip met een live state: de ronde, gekleurde icoon-badge-styling (achtergrond, padding, actieve vulkleur) verdween. Elke chip krijgt nu een eigen `<span class="icon-badge">` die dit component zelf stylet, ongeacht wat erbinnen rendert. Lost meteen ook een tweede, onafhankelijk ontdekte bug op: een chip wiens entiteit-state pas ná de allereerste render beschikbaar kwam (de normale volgorde voor elke kamer zonder expliciete `control_entities`), bleef voorheen voorgoed op het generieke fallback-icoon hangen.
- **HD-231 (fix):** rolluik-/luifelchips volgen nu de live open/gesloten/bewegende staat, zoals het oude dashboard. Open/gesloten matchten Home Assistant se eigen `cover`-standaardicoon al exact; enkel het bewegend-icoon (het oude dashboard toont in beide richtingen hetzelfde "alert"-icoon, HA toont standaard pijl-iconen) en het luifel-icoon (Home Assistant heeft er geen ingebouwd) zijn nu expliciet behouden.
- **HD-232 (fix):** de aandachtchip toont voortaan het icoon van de sensor die daadwerkelijk aandacht vraagt (bv. een open raam toont een open-raam-icoon) i.p.v. altijd een generiek uitroepteken, met behoud van de rode kleur via de badge se eigen CSS.

## Releasegate

- `pnpm test` (153/153), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget ongewijzigd (222 kB), gemeten 217.569 bytes.
- Privacyscan schoon.
- Lokaal visueel bevestigd (sandboxscreenshot + computed-style-inspectie): ronde kleurcirkel-styling werkt opnieuw, aandachtchip toont de kritieke accentkleur met een open-raam-icoon voor een open raamsensor.

## Wat je zelf kan testen

- Bekijk de chips op Home: elke chip moet weer een ronde, gekleurde cirkel rond zijn icoon tonen (niet langer een plat, ongestyled icoon).
- Zet een kamer se rolluik open/dicht en laat het bewegen: bevestig dat het chip-icoon meebeweegt met de staat.
- Zorg dat een raamsensor een aandacht-waardige staat krijgt: bevestig dat de rode aandachtchip een open-raam-icoon toont, geen generiek uitroepteken.
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.13` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.
- HD-217's opzoekfunctie (v0.8.8) is nog niet live tegen een echte Home Assistant-instantie getest.
- Het werkelijke `ha-state-icon`-gedrag (groepsicoon, device_class-afgeleide iconen) en de icoon-badge-styling zijn enkel in de sandboxprototype met een vereenvoudigde stub getest — definitieve visuele bevestiging vereist de live Home Assistant-instantie.
- Twee rookmelder-sensoren zonder enige `device_class` tonen voorlopig nog een generiek icoon op de aandachtchip — vereist een losse, nog te plannen live `device_class`-override, niet in deze release.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.12`.
- Na deze release: verwijder de `v0.8.13`-release/tag en herpin HACS naar `v0.8.12`. Let op: `v0.8.12` bevat zelf de icoon-badge-regressie die deze release oplost — een rollback naar `v0.8.12` herintroduceert die regressie bewust.
