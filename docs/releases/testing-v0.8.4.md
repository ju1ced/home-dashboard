# Testchecklist v0.8.4

## Verhouding tot v0.8.3

Eén ticket sinds `v0.8.3`: een vervolg op HD-220, een directe reactie op live eigenaarsfeedback over de `v0.8.3`-Verbruik-tab. Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-220-vervolg (bugfix):** de gecombineerde staafdiagram toonde geen zichtbare balken, ook al was de as-schaal correct berekend sinds `v0.8.3`. Live statistiek van de echte Keuken-apparaten (opgehaald read-only via de Home Assistant-verbinding) bevestigde dat de onderliggende cijfers wel degelijk correct waren — de bug zat uitsluitend in de weergave: een CSS-percentagehoogte zonder voorouder-element met een vaste hoogte, waardoor elke balk terugviel op een onzichtbare minimumhoogte. Elke balk krijgt nu een expliciete, in JavaScript berekende hoogte.
- **HD-220-vervolg (opschoning):** de generieke notitie "Status en bediening blijven gescheiden in één overzicht", die op elke kamerfunctie-tab verscheen zonder echte informatie, is verwijderd.

## Releasegate

- `pnpm test` (146/146), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundelbudget ongewijzigd (222 kB), gemeten 219.876 bytes — kleiner dan `v0.8.3`.
- Privacyscan schoon.

## Wat je zelf kan testen

- Open een kamer met meerdere smart plugs (bv. Keuken) op de Verbruik-tab. De gecombineerde staafdiagram moet nu echte, zichtbare gestapelde balken tonen die proportioneel verschillen per dag/maand/jaar, niet een lege of platte grafiek.
- Controleer dat er geen generieke uitlegtekst meer verschijnt onder de status-badge op elke tab.
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.4` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.3`.
- Na deze release: verwijder de `v0.8.4`-release/tag en herpin HACS naar `v0.8.3`. De staafdiagram toont dan weer geen zichtbare balken (het eerdere renderprobleem); geen enkele bestaande configuratie of entiteitsmapping gaat daarbij verloren (puur een bugfix/weergave-aanpassing, geen schema- of migratiewijziging).
