# Testchecklist v0.8.0

## Verhouding tot alpha.30

Zelfde inhoud als `0.8.0-alpha.30` — geen functionele wijziging. Dit is uitsluitend een releaseproces-/versioneringswijziging: releasetags dragen vanaf nu geen `-alpha.N`-achtervoegsel meer, zodat GitHub ze niet langer als "Pre-release" markeert. Alle functionaliteit uit alpha.30 (HD-111's live acceptatieresultaten, HD-218's bevinding) blijft ongewijzigd — zie de [alpha.30-testchecklist](testing-v0.8.0-alpha.30.md).

## Waarom deze releaseprocesverandering

HD-218 vond de kernoorzaak van de herhaalde HACS-drift: elke eerdere release werd door GitHub als prerelease gemarkeerd, en HACS' zichtbaarheidsinstelling voor prereleases stond voor deze repository uit — dus bleef HACS' releaselijst voor dit component permanent leeg, wat telkens tot een terugval naar `main`-tracking leidde. Zie [D-073](../design/decision-log.md) voor de volledige analyse en het besluit.

**Bewust niet gewijzigd:** de project-status zelf. Dit blijft "concept/prototype" (zie `AGENTS.md`); meerdere v1-gates staan nog geblokkeerd in het kanban. Het is uitsluitend het releaseprocesmechanisme (tagformaat) dat verandert, niet de inhoudelijke rijpheid van het product.

## Releasegate

- `pnpm test`, `pnpm run test:browser`, `git diff --check`: bevestigd groen (zie commit).
- Geen bundelwijziging t.o.v. alpha.30 — alleen de versiebanner verschilt.
- Privacyscan schoon.

## Wat je zelf kan testen

Na deze release: bevestig in HACS dat (a) de installatie op `tags/v0.8.0` staat gepind, (b) HACS' releaselijst voor dit component niet langer leeg is, en (c) een herhaalde "Update information"-actie de pin niet langer terugzet naar `main` — dit was de exacte reproductiestap uit HD-218's bevinding.

## Niet-geverifieerde aannames

- Dat een niet-prerelease tag daadwerkelijk HACS' releaselijst vult en de drift stopt, is een **sterk onderbouwde hypothese** (bevestigd via het verschil met een gezonde afhankelijkheid die wél een gevulde releaselijst had), maar vereist nog een live herbevestiging ná deze release om als definitief opgelost te gelden. Zie HD-218's eigen acceptatiecriteria.
- De drie HD-111-punten die een menselijke browsersessie vereisen (routeweergave, editor-interactiviteit, kiosk-navigatieherstel) blijven ongewijzigd open.

## Rollbackscope

- Vóór deze release: `main` stond op `v0.8.0-alpha.30`.
- Na deze release: verwijder de `v0.8.0`-release/tag en herpin HACS naar `v0.8.0-alpha.30` — geen functionele regressie mogelijk, deze release wijzigt geen code.
