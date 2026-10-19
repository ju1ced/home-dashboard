# Testchecklist v0.8.12

## Verhouding tot v0.8.11

Drie tickets sinds `v0.8.11`: HD-228, HD-229 en HD-230 — Home-paginapolish naar aanleiding van live feedback nadat alle kamers se quick actions werden afgestemd op het oude Overview-dashboard. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-228 (layout):** `.favorite-grid` op Home toont 3 kolommen op voldoende brede schermen (was 2), met een nieuw tussenliggend 2-koloms-breakpoint onder 1180px vóór het bestaande 1-koloms-breakpoint onder 700px.
- **HD-229 (iconen):** quick-action-chips (licht/cover/luifel/media/climate) tonen voortaan het icoon dat Home Assistant zelf voor die entiteit zou tonen — via het globaal geregistreerde `ha-state-icon`-element, dat groepsicoon/device_class/registry-override zelf berekent — in plaats van één vast icoon per type. Het icoon blijft live meebewegen met statuswijzigingen (bv. lamp aan/uit). De generieke per-kind iconen blijven enkel de fallback wanneer een entiteit geen live state heeft.
- **HD-230 (aandachtbanner):** de brede gele banner op Home verschijnt niet langer onvoorwaardelijk zodra er aandachtspunten zijn. De bestaande aandacht-pil in de kopbalk is nu een echte knop die de banner toont/verbergt; de banner sluit zichzelf automatisch zodra er geen aandachtspunten meer zijn. De per-kamer aandachtchip (HD-226) is ongewijzigd.

## Releasegate

- `pnpm test` (153/153), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget ongewijzigd (222 kB), gemeten 216.574 bytes.
- Privacyscan schoon.
- Lokaal visueel bevestigd (sandboxscreenshots): 3-koloms raster, banner verborgen bij laden, verschijnt na klik op de aandacht-pil, verdwijnt weer na een tweede klik of zodra er niets meer is.

## Wat je zelf kan testen

- Open Home op een voldoende breed scherm: bevestig dat "Kamers & bediening" 3 kolommen toont (niet langer 2), en dat dit terugvalt naar 2 op een middelgroot venster en 1 op mobiel.
- Bekijk de chips van een kamer met meerdere lichten: bevestig dat ze niet langer allemaal exact hetzelfde icoon tonen, maar het icoon dat Home Assistant zelf voor die entiteit gebruikt (bv. een apart icoon voor een lichtgroep).
- Zorg dat er een aandachtspunt is (bv. een veiligheidssensor in een aandacht-waardige staat): bevestig dat de gele banner NIET automatisch verschijnt, maar pas na een klik op de aandacht-pil in de kopbalk ("N aandachtspunten"). Klik nogmaals: de banner verdwijnt weer.
- Los het aandachtspunt op: bevestig dat de banner (indien open) zichzelf sluit en de pil weer neutraal wordt.
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.12` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.
- HD-217's opzoekfunctie (v0.8.8) is nog niet live tegen een echte Home Assistant-instantie getest.
- Het werkelijke `ha-state-icon`-gedrag (groepsicoon, device_class-afgeleide iconen) is enkel in de sandboxprototype met een vereenvoudigde stub getest — de echte Home Assistant-iconberekening kan pas visueel bevestigd worden tegen de live instantie.
- HD-227's cap-verwijdering liet de daadwerkelijke live `home_favorite`-markering van de overige kamers als apart, nog te plannen vervolg staan (zie D-085) — dat is intussen wel al live doorgevoerd buiten het releaseproces om, maar valt strikt genomen buiten deze code-release.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.11`.
- Na deze release: verwijder de `v0.8.12`-release/tag en herpin HACS naar `v0.8.11`. Geen functioneel verlies, puur drie UI-polishcorrecties op de bestaande kamerkaarten en Home-kopbalk.
