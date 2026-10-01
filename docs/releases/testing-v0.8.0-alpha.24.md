# Testchecklist v0.8.0-alpha.24

## Verhouding tot alpha.23

Deze release reageert op directe, geannoteerde feedback van de eigenaar op een live screenshot van `v0.8.0-alpha.23`. De onderliggende Control Deck-functionaliteit (rail, dimsliders, positiebalken, plug-metrics, Comfort-consolidatie, awning-confirmation, plug-tweestapsbevestiging) is ongewijzigd — zie de [alpha.23-testchecklist](testing-v0.8.0-alpha.23.md). Dit document beschrijft alleen wat sindsdien is veranderd.

## Wat is veranderd sinds alpha.23

- **Minder tekst, meer betekenis:** de stage-header toont geen herhaalde kamernaam en geen statische omschrijving meer; alleen de functie-eyebrow en de echte statusbadge/-notitie. De hero-ondertitel is verwijderd.
- **Control Deck als afgebakende kaart:** rail en actieve functie-inhoud hebben nu een gezamenlijke rand, afronding, schaduw en achtergrond — leest als één kaart, net als in de goedgekeurde v3-ontwerpstudie.
- **Kamerverbruik combineert echt alles:** wanneer er geen kamerbrede meter (`room_energy.power_entity`) is geconfigureerd, telt het huidige vermogen nu smart plugs én de generieke apparatenlijst (bv. een airco) samen op, met deduplicatie per entiteit en een strikte W/kW-eenheidscheck (een niet-vermogensensor wordt nooit als watt gelezen). Is er wél een kamermeter geconfigureerd, dan blijft die gezaghebbend — er wordt niets bovenop opgeteld, om dubbeltelling te vermijden bij een meter die de plugs/airco mogelijk al omvat. Dit cijfer staat nu consistent op drie plekken: de rail-samenvatting, de Smart-plugs-stage en de Energie-tab.
- **Editor:** een hulptekst legt uit wanneer je de generieke apparatenlijst gebruikt versus Smart plugs (laatste heeft dag-/maand-/jaaroverzicht, eerste niet). De Smart-plugsvelden zijn gegroepeerd onder "Basis" en "Energieperiodes".

## Extra releasegate (aanvullend op alpha.23)

- Twee reviewrondes uitgevoerd. De eerste bevestigde de kernlogica (deduplicatie, eenheidscheck, niet-optellende meterprioriteit, één gedeelde berekening). Ze vond dat de Energie-tab het gecombineerde cijfer stilzwijgend kon weglaten bij een kamer met zowel smart plugs als een generiek apparaat en geen kamermeter — terwijl rail en Smart-plugs-tab het al correct toonden. Opgelost en met een gerichte fixture/browsertest afgedekt (`plugs_and_airco_energy`: 280 W + 420 W → 700 W op alle drie plekken).
- `pnpm test` (112/112), de volledige `pnpm run test:browser`-matrix en `git diff --check` zijn groen.
- Bundel: 257.796 van 258.000 bytes (D-053-grens, ongewijzigd) — 204 bytes marge, zeer krap. Geen nieuwe budgetverhoging nodig voor deze release, maar de volgende wijziging aan dit bestand zal er vrijwel zeker wél een vereisen.

## Testdashboardgate — ongewijzigd, vóór iedere Home Assistant-write invullen

- Exact testdashboard: **nog goed te keuren**.
- Verse dashboardexport/snapshot: **vereist**.
- Default `lovelace`-hash vóór test: **vereist**.
- Targetallowlist voor veilige acties: **vereist**.
- Goedgekeurde resourceversie en rollbackversie: **vereist**.

Zonder alle vijf waarden wordt de live test niet gestart.

## Rollbackscope

- Vóór deze release: geen wijziging, `main` stond op `v0.8.0-alpha.23`.
- Na deze release maar vóór testdeployment: verwijder de `v0.8.0-alpha.24`-release/tag en herstel de HACS-resource naar `v0.8.0-alpha.23`.
- Na een goedgekeurde testdeployment: herstel uitsluitend het testdashboard uit de verse snapshot en zet de eerder goedgekeurde resourceversie terug.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.
