# Testchecklist v0.8.14

## Verhouding tot v0.8.13

Eén ticket sinds `v0.8.13`: HD-234, een opfrisbeurt van de instellingen-editor se algemene structuur, naar aanleiding van live feedback van de eigenaar. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-234:** de editor rendert in het echt binnen Home Assistant se eigen `dialog-dashboard-strategy-editor` (titelbalk, "⋮"-menu, eigen Opslaan/Annuleren/Verwijderen-voettekst) — bevestigd via de HA-frontend-broncode en een live screenshot van de eigenaar. De editor se eigen dubbele titel ("Home Dashboard configuratie"), de permanente Export/Import/Herstel-werkbalk en de eigen "← Vorige / X van Y / Volgende →"-paginavoettekst zijn verwijderd:
  - Export/Import/Herstel staan nu in een nieuw "Back-up & herstel"-blok onderaan de Diagnostiek-sectie.
  - De kop toont voortaan enkel de live telling (kamers/personen/camera's/acties) en één compacte statuspil (groen/oranje/rood) i.p.v. twee losse statuszinnen.
  - Elk navigatie-item in de linkerkolom toont nu een icoontegel naast de titel.
- **Bewust niet in scope:** bulk-acties op kamers en duidelijkere per-veld-validatie — Kamers-specifieke vervolgwerk voor een later ticket.

## Releasegate

- `pnpm test` (153/153), `pnpm run test:browser` (inclusief het echte-browser-scenario tegen `editor.html`), `git diff --check`: bevestigd groen (zie commit).
- Editorbundelbudget ongewijzigd (160 kB), gemeten 101.274 bytes.
- Privacyscan schoon.
- Lokaal visueel bevestigd (sandboxscreenshots tegen de gemeten dialoogbreedte van ~1024px): geen dubbele titel, geen permanente werkbalk, geen paginavoettekst meer, Back-up & herstel correct verplaatst naar Diagnostiek.

## Wat je zelf kan testen

- Open "Wijzig dashboard" voor dit dashboard: bevestig dat er geen dubbele titel meer boven de sectietabs staat, en dat de kop enkel de telling + één statuspil toont.
- Loop de navigatietabs langs: elk item toont nu een icoon naast de titel.
- Open Diagnostiek: bevestig dat Export/Import/Herstel daar nu staan, onder de bestaande diagnostiekvelden.
- Bevestig dat er geen "← Vorige / Volgende →"-balk meer onderaan elke sectie staat, en dat navigatie tussen secties enkel via de linkerkolom gebeurt.
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.14` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.
- HD-217's opzoekfunctie (v0.8.8) is nog niet live tegen een echte Home Assistant-instantie getest.
- De exacte visuele passing binnen de echte dialoogchrome (titelbalk, "⋮"-menu, Opslaan-voettekst) is enkel tegen een gemeten dialoogbreedte in de sandboxprototype bevestigd, niet live tegen de echte dialoog zelf.
- Bulk-acties op kamers en duidelijkere per-veld-validatie blijven open voor een vervolgticket.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.13`.
- Na deze release: verwijder de `v0.8.14`-release/tag en herpin HACS naar `v0.8.13`. Geen functioneel verlies, puur een structurele opfrisbeurt van de editor-chrome.
