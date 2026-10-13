# Testchecklist v0.8.3

## Verhouding tot v0.8.2

Eén ticket sinds `v0.8.2`: HD-220, een directe reactie op live eigenaarsfeedback over de `v0.8.2`-Verbruik-tab. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-220 (bugfix):** de gecombineerde staafdiagram plotte voorheen Home Assistant's rauwe, cumulatieve langetermijntotaal (het `sum`-veld) rechtstreeks, wat tot een onrealistische schaal leidde (bv. 564,6 kWh voor ~1,26 kWh dagverbruik). De grafiek rekent nu een echt verschil per periode-bucket uit (`deltaSeries()`); de oudste opgehaalde bucket dient enkel als basislijn voor dat verschil en wordt zelf niet getoond.
- **HD-220 (bugfix):** een smart plug zonder ingetypte naam liet elk energielabel leeg (Kamerenergie-kaarttitel, staafdiagramlegende, Apparaatvergelijking/Grootste verbruikers). Valt nu terug op de naam van de schakelentiteit — stabiel, ongeacht welke dag-/maand-/jaartab actief is.
- **HD-220 (scope):** Apparaatvergelijking is verwijderd; Grootste verbruikers blijft als enige apparaatvergelijking (vollediger: gesorteerd, met percentage, gededupliceerd). Het oudere "Energie"-detailtabblad toont nu ook Grootste verbruikers in plaats van de verwijderde Apparaatvergelijking.
- **HD-220 (scope):** "Apparaten & energie" is volledig verwijderd van zowel de Verbruik-tab als het oudere Energie-tabblad.
- **HD-220 (nieuw):** een combinatie-overzicht toont nu/vandaag/deze maand/dit jaar gelijktijdig, ongeacht welke periodetab actief is. Expliciet "dit jaar" genoemd (kalenderjaar-tot-nu) — geen rollend 12-maandsvenster, want die statistiek bestaat niet in dit project.

## Releasegate

- `pnpm test` (146/146), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget ongewijzigd (222 kB), gemeten 219.938 bytes — kleiner dan `v0.8.2` zelf.
- Privacyscan schoon.

## Wat je zelf kan testen

- Open een kamer met meerdere smart plugs (bv. Keuken) op de Verbruik-tab. De gecombineerde staafdiagram moet nu een realistische schaal tonen die overeenkomt met het werkelijke dagverbruik, niet een cumulatief opgeblazen getal.
- Controleer dat elk apparaatlabel (kaarttitels, staafdiagramlegende, Grootste verbruikers) een echte naam toont — nooit leeg, ook niet voor plugs zonder ingetypte naam.
- Bevestig dat Apparaatvergelijking nergens meer verschijnt en dat "Apparaten & energie" weg is.
- Controleer het nieuwe nu/vandaag/deze maand/dit jaar-overzicht bovenaan de Verbruik-tab.
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.3` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- Of HA's `sum`-veld zich overal consistent gedraagt zoals hier aangenomen, inclusief rond een `utility_meter`-reset, is niet opnieuw live herbevestigd tegen een echte Home Assistant-instantie — enkel lokaal met gemockte teststatistiek geverifieerd.
- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.2`.
- Na deze release: verwijder de `v0.8.3`-release/tag en herpin HACS naar `v0.8.2`. HD-220's fixes vervallen dan weer (de grafiek toont dan opnieuw het cumulatieve-som-probleem); geen enkele bestaande configuratie of entiteitsmapping gaat daarbij verloren (puur een bugfix/weergave-aanpassing, geen schema- of migratiewijziging).
