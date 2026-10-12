# Testchecklist v0.8.2

## Verhouding tot v0.8.1

Eén ticket sinds `v0.8.1`: HD-219, een visuele/informatieve uitbreiding van de Verbruik-tab. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-219:** de "Verbruik per periode"-sectie toonde voorheen zes losse, ongelabelde per-apparaat SVG-sparklines (`statisticBarsSvg()`), zonder as, periodelabels of legende. Dit is vervangen door één gecombineerde, gestapelde staafdiagram: een verticale as-schaal (max/midden/0), een label onder elke staaf afgeleid uit de echte buckettijdstempel (nooit een hardgecodeerde dag-/maandlijst), en een kleurenlegende die elk apparaat consistent aan zijn kleur koppelt tussen de gestapelde segmenten en de legende. Elk staafsegment komt rechtstreeks van een echte `recorder/statistics_during_period`-waarde; een bron zonder data voor een bucket krijgt een zichtbaar gearceerd "geen data"-segment, nooit een stilzwijgende nul of een weggelaten segment.
- **Nieuw: "Grootste verbruikers"-ranglijst**, naast de grafiek binnen dezelfde sectie. Rangschikt de kamer's smart-plug-periodebronnen (dezelfde entity-ID-deduplicatie als HD-208's `plugPeriodTotal()`) aflopend op verbruik voor de actieve periode, met naam, percentage t.o.v. de gerangschikte bronnen zelf (nooit een fictief woningtotaal), absolute waarde en een proportionele balk.
- **Onderzocht, geen bug:** de eigenaar vermoedde via een screenshotvergelijking dat de bestaande Apparaatvergelijking-sectie's apparaatnaam-labels niet renderen. Onderzoek bevestigt: het label-element wordt wel degelijk aangemaakt en toegevoegd, geen CSS verbergt het. Beoordeeld als een leesbaarheidsartefact van een lage schermresolutie in de screenshot, geen echte renderbug — niet gewijzigd.

## Releasegate

- `pnpm test` (141/141), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget 216 kB → 222 kB (gemeten 220.061 bytes) voor de nieuwe grafiek en ranglijst. Editorbundel ongewijzigd.
- Privacyscan schoon.

## Wat je zelf kan testen

- Open een kamer met meerdere smart plugs (bv. Keuken) op de Verbruik-tab. De "Verbruik per periode"-sectie moet nu één gestapelde staafdiagram tonen met een as-schaal links, een label onder elke staaf, en een kleurenlegende onderaan — in plaats van losse kleine grafiekjes per apparaat.
- Daarnaast moet een "Grootste verbruikers"-kaart verschijnen die diezelfde apparaten aflopend rangschikt met percentage en een balk.
- Vergelijk visueel met de oorspronkelijke ontwerpstudie (artifact `FnV91MaTVuLRHfeuCkYL3d`) om te bevestigen dat dit dichter bij de gedroomde layout zit — dit is geen geautomatiseerd gecontroleerd criterium, puur een menselijke visuele beoordeling.
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.2` staat gepind en dat de releaselijst dit nieuwe tag bevat naast `v0.8.0`/`v0.8.1`.

## Niet-geverifieerde aannames

- Of HA's `sum`-veld in `recorder/statistics_during_period` een per-bucket-delta dan wel een cumulatief lopend totaal is, is niet binnen HD-219 geverifieerd — dit is ongewijzigd, al vóór deze ticket bestaand gedrag van `extractStatisticSeries()` (D-059), hier alleen hergebruikt, niet herontworpen.
- Visuele gelijkenis met de ontwerpstudie is niet machinaal getest; alleen de afwezigheid van gefabriceerde data en de aanwezigheid van as/labels/legende/ranglijst zijn in code en browsertests bevestigd.
- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.1`.
- Na deze release: verwijder de `v0.8.2`-release/tag en herpin HACS naar `v0.8.1`. HD-219's grafiek en ranglijst vervallen dan weer; geen enkele bestaande configuratie of entiteitsmapping gaat daarbij verloren (puur een weergave-uitbreiding, geen schema- of migratiewijziging).
