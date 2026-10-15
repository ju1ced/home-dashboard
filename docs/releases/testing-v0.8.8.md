# Testchecklist v0.8.8

## Verhouding tot v0.8.7

Eén correctieticket sinds `v0.8.7`: HD-217, gevonden bij het hervatten van de openstaande kanban-tickets (niet nieuw live eigenaarsfeedback op de Verbruik-tab, zoals de vorige vijf releases). Geen schema- of migratiewijziging.

## Wat er feitelijk verandert

- **HD-217 (bugfix in reeds gemergede code, PR #83):** de editor se automatische dag-/maand-/jaarsensor-opzoekfunctie bij het promoveren van een smart plug ging uit van een Home Assistant-API die niet bestaat (`config_entries/get` geeft nooit de `options` van een `utility_meter`-helper terug). Tegen een echte installatie zou de functie dus altijd stil "geen match" hebben gemeld, ongeacht de werkelijke configuratie.
- **HD-217 (fix):** herschreven naar de enige echte weg — een options-flow starten en weer afbreken over REST, exact zoals Home Assistant's eigen "helper bewerken"-dialoog dat doet. Het volledige resultaat (welke `utility_meter`-helper bij welke energiesensor hoort) wordt nu éénmaal per editorsessie opgebouwd en herbruikt, niet opnieuw bij elke klik op "opzoeken".
- Geen gedragswijziging voor de eindgebruiker op het dashboard zelf — dit raakt uitsluitend de GUI-configuratie-editor.

## Releasegate

- `pnpm test` (152/152), `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Hoofdbundel ongewijzigd (editor-only wijziging, niet in `dist/home-dashboard.js`); editorbundel gemeten 100.352 bytes, binnen budget (160 kB, D-055).
- Privacyscan schoon.

## Wat je zelf kan testen

- Open de GUI-editor voor een kamer met een smart plug waarvan de energiesensor al `utility_meter`-helpers heeft (dag/maand/jaar) in je eigen Home Assistant. Klik op "opzoeken" bij die plug.
- **Dit is het eerste punt waarop deze functie ooit tegen een echte Home Assistant-instantie wordt getest** — vóór nu was ze alleen tegen gemockte tests gevalideerd, en die mock bleek de verkeerde API-vorm te simuleren. Bevestig concreet: (a) wordt er effectief een voorstel getoond met de juiste dag-/maand-/jaarsensor-entity-ID's, (b) wordt niets automatisch overgenomen zonder op "Overnemen" te klikken, en (c) blijft er geen onafgewerkte options-flow achter in Home Assistant na het opzoeken (zichtbaar als een "in progress"-flow onder Instellingen → Apparaten en diensten als er iets misloopt).
- Bevestig in HACS dat de installatie na deze release op `tags/v0.8.8` staat gepind en dat de releaselijst dit nieuwe tag bevat naast de eerdere versies.

## Niet-geverifieerde aannames

- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.
- De eigenaar meldde eerder ook dat de schaal "nog steeds niet makkelijk leesbaar" is, zonder concreet reproduceerbaar detail — dit blijft open tot een vervolgscreenshot of nadere omschrijving.
- HD-217 blijft "In uitvoering" (niet "Klaar") tot de hierboven beschreven live test daadwerkelijk een match vindt — dit is de eerste keer dat deze specifieke opzoekfunctie tegen een echte instantie draait.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.7`.
- Na deze release: verwijder de `v0.8.8`-release/tag en herpin HACS naar `v0.8.7`. HD-217's opzoekfunctie vervalt dan weer naar haar (altijd al niet-functionele) vorige versie; geen enkele bestaande configuratie of entiteitsmapping gaat daarbij verloren.
