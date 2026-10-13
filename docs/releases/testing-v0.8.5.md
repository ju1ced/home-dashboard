# Testchecklist v0.8.5

## Verhouding tot v0.8.4

Eén ticket sinds `v0.8.4`: HD-221, een vierde directe reactie op live eigenaarsfeedback over dezelfde Verbruik-tab. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-221 (bugfix):** "Jaar" toonde geen grafiek in een project jonger dan een jaar. Live statistiekopvraging bevestigde: er bestond maar één historische periodebucket ooit, en de bestaande "sla de eerste bucket over als basislijn"-logica gooide die enige bucket weg. Een reeks met precies één bucket wordt nu ongewijzigd gebruikt (er is immers geen eerdere waarde om van af te trekken — die ene waarde IS al het volledige verbruik sinds het begin van de meting).
- **HD-221 (bugfix):** "Verbruik per dag" gebruikte een rollend venster dat elke dag opschoof (bv. dinsdag-tot-dinsdag). Dit lijnt nu uit op de kalenderweek, telkens vanaf de meest recente maandag.
- **HD-221 (scope):** de "Keuken totaal"-kaart en de losse per-apparaat-tegels onder Kamerenergie zijn volledig verwijderd, op expliciet verzoek — het nu/vandaag/deze maand/dit jaar-overzicht en Grootste verbruikers dekken deze informatie al.
- **HD-221 (regressiefix):** tijdens het bouwen van deze release werd een echte regressie gevonden in het nu/dag/maand/jaar-overzicht zelf: het som altijd de smart plugs op en negeerde een geconfigureerde kamerbrede energiesensor. Hersteld zodat die sensor weer voorrang krijgt, consistent met hoe de rest van de pagina al werkte.

## Releasegate

- `pnpm test` (149/149), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget ongewijzigd (222 kB), gemeten 217.709 bytes — kleiner dan `v0.8.4`.
- Privacyscan schoon.

## Wat je zelf kan testen

- Open een kamer met smart plugs op de Verbruik-tab en klik op "Jaar". Als er weinig historische data is (project jonger dan een jaar), moet er nu toch een grafiek verschijnen in plaats van niets.
- Klik op "Vandaag" en controleer dat de dagen van de grafiek een kalenderweek volgen (maandag als eerste dag), niet een willekeurig rollend venster.
- Bevestig dat de "Keuken totaal"-kaart en per-apparaat-tegels nergens meer verschijnen.
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.5` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.
- De eigenaar meldde ook dat de schaal "nog steeds niet makkelijk leesbaar" is, zonder concreet reproduceerbaar detail — dit blijft open tot een vervolgscreenshot of nadere omschrijving.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.4`.
- Na deze release: verwijder de `v0.8.5`-release/tag en herpin HACS naar `v0.8.4`. HD-221's fixes vervallen dan weer; geen enkele bestaande configuratie of entiteitsmapping gaat daarbij verloren (puur een bugfix/weergave-aanpassing, geen schema- of migratiewijziging).
