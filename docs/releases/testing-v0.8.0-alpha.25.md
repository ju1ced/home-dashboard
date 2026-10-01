# Testchecklist v0.8.0-alpha.25

## Verhouding tot alpha.24

Deze release voegt alleen de kamerfoto-upload toe. Alle eerdere Control Deck-functionaliteit (rail, dimsliders, positiebalken, plug-metrics, Comfort-consolidatie, awning-confirmation, plug-tweestapsbevestiging, gecombineerd Kamerverbruik, deck-head/stage-head) is ongewijzigd — zie de [alpha.24-testchecklist](testing-v0.8.0-alpha.24.md). Dit document beschrijft alleen wat sindsdien is toegevoegd.

## Wat is toegevoegd sinds alpha.24

- **Kamerfoto rechtstreeks uploaden:** naast de bestaande `image_entity`-entity-picker (vereist een vooraf via HA Instellingen aangemaakt Image-hulpmiddel) biedt de kamereditor nu ook Home Assistants native `media`-selector met upload-knop. Geen eigen backend-code; HA's eigen upload-UI verzorgt dit (beschikbaar sinds HA 2025.11).
- **Prioriteit en terugval:** is een upload geconfigureerd, dan krijgt die voorrang op `image_entity`. Faalt de resolutie (ontbrekende/ongeldige respons), dan valt het dashboard terug op `image_entity`, en daarna op de bestaande placeholder-illustratie. Nooit een kapotte afbeelding.
- **Migratie:** bestaande configuraties zonder upload blijven volledig ongewijzigd; het nieuwe veld is een écht afwezige sleutel, geen geforceerde default.

## Extra releasegate (aanvullend op alpha.24)

- Adversariale review vond drie echte bugs vóór release, geen enkele gevangen door de eerste testronde:
  1. De foto laadde nooit echt in een live sessie door een verwarring tussen "nog geen verbinding" en "definitief niet beschikbaar" — opgelost en bewezen met een nieuwe, echte browsertest (monteren zonder `hass`, dan toewijzen, dan reconnect).
  2. Een opgeloste foto bleef `aria-hidden="true"` staan — onzichtbaar voor schermlezers ondanks een geldig label. Opgelost.
  3. De eerste validatorfix verzwakte verplichte-veldvalidatie voor élk schemaveld, niet alleen het nieuwe. Opgelost bij de bron (het nieuwe veld is een écht afwezige sleutel), zodat de validator ongewijzigd kon blijven.
- `node --test` (117/117), de volledige `pnpm run test:browser`-matrix (inclusief de nieuwe setConfig-vóór-hass-levenscyclustest) en `git diff --check` zijn groen.
- Bundel: 259.642 van 260.000 bytes (D-054, nieuwe grens) — ruim 350 bytes marge, zeer krap. Vierde budgetverhoging op rij; HD-171 wordt steeds dringender.

## Niet-geverifieerde aanname — vereist live bevestiging

De exacte vorm van de `media_source/resolve_media`-WebSocket-respons (`{url, mime_type}`) is gebaseerd op Home Assistants gedocumenteerde gedrag, maar kon niet tegen een echte, draaiende Home Assistant-instantie getest worden vanuit deze ontwikkelomgeving. De resolutielogica zit geïsoleerd in één methode. **Dit moet als eerste gecontroleerd worden zodra de testdashboardgate wordt geopend**: upload een foto voor een kamer, bevestig dat ze correct verschijnt, en controleer vooral het gedrag na een HA-herstart/reconnect.

## Testdashboardgate — ongewijzigd, vóór iedere Home Assistant-write invullen

- Exact testdashboard: **nog goed te keuren**.
- Verse dashboardexport/snapshot: **vereist**.
- Default `lovelace`-hash vóór test: **vereist**.
- Targetallowlist voor veilige acties: **vereist**.
- Goedgekeurde resourceversie en rollbackversie: **vereist**.
- **Extra voor deze release:** bevestig de `media_source/resolve_media`-responsvorm (zie hierboven) vóór verdere afhankelijke functionaliteit hierop gebouwd wordt.

Zonder alle waarden wordt de live test niet gestart.

## Rollbackscope

- Vóór deze release: geen wijziging, `main` stond op `v0.8.0-alpha.24`.
- Na deze release maar vóór testdeployment: verwijder de `v0.8.0-alpha.25`-release/tag en herstel de HACS-resource naar `v0.8.0-alpha.24`.
- Na een goedgekeurde testdeployment: herstel uitsluitend het testdashboard uit de verse snapshot en zet de eerder goedgekeurde resourceversie terug.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.
