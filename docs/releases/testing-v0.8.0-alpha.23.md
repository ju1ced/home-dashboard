# Testchecklist v0.8.0-alpha.23

## Verhouding tot alpha.22

Deze release voegt alleen omkadering toe rond de Control Deck-rail uit `v0.8.0-alpha.22`. De onderliggende functionaliteit (dimsliders, positiebalken, plug-metrics, Comfort-consolidatie, awning-confirmation, plug-tweestapsbevestiging) is ongewijzigd — zie de [alpha.22-testchecklist](testing-v0.8.0-alpha.22.md) voor die scope. Dit document beschrijft alleen wat sindsdien is toegevoegd.

## Wat is toegevoegd sinds alpha.22

- **Deck-head:** een sectiekop boven de capabilityrail met de kamernaam en een telling van werkelijk geconfigureerde lampen/openingen/plugs (categorieën met nul items worden weggelaten, geen nepteling).
- **Stage-head:** bovenaan de inhoud van elke geselecteerde rail-functie een titel, korte omschrijving en een statusbadge met drie tonen:
  - **Beschikbaar** — alle controleerbare bronnen van die functie rapporteren normaal.
  - **Aandacht** — hergebruikt de bestaande waarschuwingslogica (bv. een veiligheidssensor in een niet-kritieke afwijkende toestand).
  - **Deels niet beschikbaar** — minstens één relevante bron is unavailable/unknown.
  - Geen badge wanneer een functie wel geconfigureerd is maar geen enkele controleerbare entiteit heeft (bv. een Comfort-stage die alleen uit de LINAK-bureaukaart bestaat) — er wordt nooit een verzonnen "Beschikbaar" getoond.
- **Rail-iconen en statusregel:** elke rail-knop toont een icoon en een korte, actuele samenvatting (bv. "4 van 6 aan", "2 bedieningen"), waarbij unavailable apparaten nooit als "uit" meetellen.
- **Hero:** meerdere statuspillen (bv. temperatuur, luchtvochtigheid) in plaats van één generieke pil, plus een neutrale placeholder-illustratie met bijschrift "Geen kamerfoto geconfigureerd" wanneer geen `image_entity` is ingesteld.

## Extra releasegate (aanvullend op alpha.22)

- Twee onafhankelijke reviewrondes uitgevoerd. Eerste ronde vond twee blokkerende bevindingen (een vals-positieve statusbadge wanneer de enige energiebron buiten de gecontroleerde entiteitenlijst viel; de ontbrekende "Aandacht"-toon) en twee P1's (stilzwijgend wisselend cijfer in de energie-rail-samenvatting bij een unavailable bron; rail-tellingen die unavailable apparaten als "uit" telden). Alle vier opgelost. Een finale verificatieronde bevestigde de fixes en vond geen nieuwe regressie in awning-confirmation, plug-tweestapsbevestiging of roving-tabindex/aria-semantiek (functie-voor-functie herverifieerd tegen alpha.22).
- `pnpm test` (110/110 losstaand van de bundlegate), volledige `pnpm run test:browser`-matrix en `git diff --check` zijn groen.
- Drie kleine, niet-blokkerende hiaten uit de finale verificatie zijn als **HD-207** vastgelegd voor een latere, aparte slice: de plugs-stagebadge controleert nog niet de energiesensoren van een plug (alleen schakel-/vermogensbron), de deck-head-telling kan een lege regel tonen voor een kamer met uitsluitend comfort/energie geconfigureerd, en één evidence-screenshot (`unavailable-1440.png`) documenteert door een nieuwe testfixture tijdelijk iets anders dan de rest van de matrix.

## Bekend aandachtspunt: bundlebudget

De harde grens is voor de derde keer in deze tickets-familie verhoogd (245 kB → 254 kB → **258 kB**, D-052/D-053). Gemeten kandidaat: 256.821 bytes (± 1,2 kB marge). HD-171 (performancebaseline en budgetten) moet dit structureel oplossen vóór de volgende specialistintegraties (HD-131/141/152) — die zullen anders vrijwel zeker meteen tegen deze grens aanlopen.

## Testdashboardgate — ongewijzigd, vóór iedere Home Assistant-write invullen

- Exact testdashboard: **nog goed te keuren**.
- Verse dashboardexport/snapshot: **vereist**.
- Default `lovelace`-hash vóór test: **vereist**.
- Targetallowlist voor veilige acties: **vereist**.
- Goedgekeurde resourceversie en rollbackversie: **vereist**.

Zonder alle vijf waarden wordt de live test niet gestart.

## Rollbackscope

- Vóór deze release: geen wijziging, `main` stond op `v0.8.0-alpha.22`.
- Na deze release maar vóór testdeployment: verwijder de `v0.8.0-alpha.23`-release/tag en herstel de HACS-resource naar `v0.8.0-alpha.22`.
- Na een goedgekeurde testdeployment: herstel uitsluitend het testdashboard uit de verse snapshot en zet de eerder goedgekeurde resourceversie terug.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.
