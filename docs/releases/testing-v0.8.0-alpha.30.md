# Testchecklist v0.8.0-alpha.30

## Verhouding tot alpha.29

Documentatie-only release — geen enkele wijziging aan `src/`, de dashboardstrategy, of de editor. Alle functionaliteit uit alpha.29 (HD-216's kamereditor lazy-mount/zoekfilter/smart-plug-koppelhulp) is ongewijzigd — zie de [alpha.29-testchecklist](testing-v0.8.0-alpha.29.md).

## Wat is toegevoegd sinds alpha.29

- **HD-111's live acceptatieronde vastgelegd** (7 oktober 2026, geen codewijziging): een echte apparaatbediening (kamer "Bureau", één licht aan/uit, bevestigd en teruggezet), de volledige live 19-kamer-configuratie zonder schema- of semantische fouten gevalideerd, default `lovelace` bevestigd ongewijzigd vóór/na. Zie het [resultaatdocument](results-hd111-live-acceptance.md).
- **HD-218 geopend**: HACS volgde voor de tweede keer `main` in plaats van een gepinde releasetag (zelfde regressieklasse als [D-069](../design/decision-log.md#d-069--hacs-lifecycle-live-opnieuw-bewezen-voor-v080-alpha28-hd-180)/HD-180). Deze release brengt `main` en de getagde release weer in lijn, zodat de installatie na herpinnen niet langer een "update beschikbaar" toont die er eigenlijk geen is — de oorzaak van de drift zelf blijft open onderzoek onder HD-218.

## Releasegate

- `pnpm test`, `pnpm run test:browser`, `git diff --check`: te bevestigen vóór tag (zie commit).
- Geen bundelwijziging: hoofdbundel en editorbundel ongewijzigd t.o.v. alpha.29 — deze release bevat geen `src/`-wijziging.
- Privacyscan schoon.

## Wat je zelf kan testen

Niets nieuws om te testen in de dashboard-UI zelf — dit is een documentatie- en releasepin-ronde. Na deze release: bevestig in HACS dat de installatie op `tags/v0.8.0-alpha.30` staat gepind (niet op `main`), en dat het "update beschikbaar"-indicatie verdwenen is totdat er echt nieuwe commits op `main` landen.

## Niet-geverifieerde aannames

Geen nieuwe. De drie openstaande HD-111-punten (visuele routeweergave, editor-interactiviteit, kiosk-navigatieherstel in een echte browsersessie) blijven ongewijzigd open, zoals vastgelegd in het HD-111-resultaatdocument.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.0-alpha.29`.
- Na deze release: verwijder de `v0.8.0-alpha.30`-release/tag en herpin HACS naar `v0.8.0-alpha.29` — geen functionele regressie mogelijk, deze release wijzigt geen code.
