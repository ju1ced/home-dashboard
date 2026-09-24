# Energy-paritymanifest

Peildatum: 23 september 2026. Dit manifest sluit HD-120 als read-only inventaris af. Het bewijst geen live pariteit; die blijft onder HD-121 en vereist een expliciet goedgekeurd testdashboard.

## Beslisregel

- **Gedekt:** lokaal contract en regressietest aanwezig.
- **Gedeeltelijk:** bruikbare alpha-implementatie, maar runtime-inhoud of semantiek moet nog worden bevestigd.
- **Geblokkeerd:** ontbrekend productcontract of alleen live te valideren.
- **Niet van toepassing:** pas vast te stellen na privacyveilige inventaris van de testconfiguratie.

## Matrix

| Categorie | Status | Huidige dekking | Vervolgactie |
|---|---|---|---|
| Periodekeuze en vergelijking | Gedeeltelijk | Officiële `energy-date-selection`; `default_period` is configuratie maar geen bewezen runtime-default | Onder HD-121 dag/week/maand/jaar en vorige periode controleren; geen alpha-claim over het default |
| Usage, bronnen en teruglevering | Gedeeltelijk | Officiële usage-graph en sources-table | Kosten, vergoeding en meerdere bronnen live vergelijken |
| Solar en forecast | Gedeeltelijk | Officiële solar-graph en gauges wanneer zon is gemapt | Collectionconfig en ontbrekende forecast live controleren |
| Netbalans, zonverbruik, koolstof en zelfvoorziening | Gedekt als officiële kaartselectie | Vier officiële gauges worden conditioneel opgebouwd | In HD-121 inhoud en zichtbaarheid per echte Energy-config bevestigen |
| Historische Energy Sankey | Gedekt als officiële kaartselectie | `energy-distribution` | Live bronlabels en totalen vergelijken |
| Actuele Power Sankey | Geblokkeerd / uitgesteld | Alleen actuele KPI's en een read-only historiegraph; het prototype is conceptueel bewijs, geen productbewijs | Niet claimen in deze alpha; apart productcontract vóór implementatie |
| Batterijflow en SoC | Gedeeltelijk | Expliciete batterijbronnen, zonder semantische rollen | Mappingvolgorde documenteren; later SoC/laden/ontladen scheiden |
| Apparaten totaal/detail | Gedeeltelijk | Officiële devicegraph plus lokale read-only tiles | Totalen, detail en lege categorie live controleren |
| Upstream-apparaathiërarchie | Geblokkeerd / uitgesteld | Geen parent-/groupcontract | Niet optellen; officiële Energy-totalen blijven leidend |
| Dubbeltelling | Gedeeltelijk met expliciete grens | Identieke bronnen worden gededupliceerd, maar categorie-overlap wordt niet semantisch gevalideerd | Lokale tiles uitsluitend als context presenteren; geen lokaal totaal berekenen |
| Gas en water | Gedeeltelijk / conditioneel | Officiële graphs en lokale groepen wanneer gemapt | Per testconfig markeren als geconfigureerd of niet van toepassing |
| Capaciteitspiek | Gedeeltelijk | Eén expliciete piekbron | Testconfig moet aangeven of dit maand- of kwartierpiek is |
| EV | Gedeeltelijk | Actueel laadvermogen | Sessie-energie, planning en freshness buiten deze alpha |
| UPS | Gedeeltelijk | Eén expliciete operationele bron | Betekenis van status/vermogen/SoC in de testmapping vastleggen |
| Fasen en onbalans | Gedeeltelijk | Maximaal drie expliciete fasewaarden | Onbalans wordt niet berekend; aparte bron of deferral vereist |
| Apparaat actueel/dagverbruik | Gedeeltelijk | Centrale lokale tiles en afzonderlijke kamermappings | Tijdens HD-121 controleren dat beide dezelfde bronsemantiek gebruiken |
| Missing/unknown/unavailable | Gedekt | Geconfigureerde onleesbare bron toont `Niet beschikbaar` zonder de pagina te blokkeren | In live smoke per categorie bevestigen |
| Stale | Geblokkeerd / uitgesteld | Geen betrouwbaar Energy-freshnesscontract | Niet afleiden uit onveranderde numerieke waarden |
| Configuratie en fallback | Gedekt | GUI-mappings, officiële kaarten en `/energy`-fallback | Default Energy-config blijft eigenaar van historische bronnen |
| Actiescope | Gedekt | Alle lokale tiles zijn read-only; geen service-, target- of perform-actionconfig | Behouden als releasegate |

## Alpha-scope

De volgende alpha mag claimen dat de Energie-view actuele expliciet gemapte context combineert met officiële Home Assistant Energy-kaarten en een `/energy`-fallback. Zij mag niet claimen dat actuele Power Sankey, stale-detectie, upstreamhiërarchie of live kosten-/vergoedingpariteit zijn afgerond.

Het statische ontwerp-prototype bevat rijkere periode-, kosten- en powerflowvisualisaties dan de productimplementatie. Die renders zijn conceptueel en tellen niet als implementatie- of pariteitsbewijs.

## HD-121 runtimecheck

1. Vergelijk dezelfde datum/periode in Home Dashboard en het ingebouwde Energy-dashboard.
2. Controleer import, export, solar, batterij, gas, water en apparaten uitsluitend wanneer ze in de goedgekeurde testconfig bestaan.
3. Controleer kosten en vergoeding zonder lokale herberekening.
4. Bevestig dat lokale tiles niet worden opgeteld bij officiële totalen.
5. Test missing en unavailable per categorie; markeer stale als uitgesteld.
6. Controleer mobiel en desktop op dezelfde functionele dekking.
7. Verifieer dat geen servicecall of configuratiewrite plaatsvindt.
