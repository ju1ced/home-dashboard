# Testchecklist v0.5.0-alpha.3 — configureerbare Vandaag-energie-KPI's

Test uitsluitend via de bestaande grafische dashboardconfiguratie. Deel geen exports, entity-ID's, interne URL's of andere private waarden.

## Configuratie

- [ ] **Vandaag** toont afzonderlijke entityselectors voor thuisbatterij-SoC, batterij laden/ontladen, zonnepanelenopbrengst, huisverbruik zonder batterijladen en maandelijkse vermogenspiek.
- [ ] Ieder veld kan afzonderlijk leeg blijven en blokkeert opslaan niet.
- [ ] De optionele **Extra energiecontext** blijft bruikbaar voor aanvullende sensoren.
- [ ] Een bestaande configuratie opent zonder verlies van weer-, afval- of eerdere energiecontext.

## Home

- [ ] Iedere gekozen bron verschijnt met het vaste functionele label en de actuele waarde met eenheid.
- [ ] De volgorde is: batterij-SoC, batterijvermogen, zonnepanelen, huisverbruik en maandpiek.
- [ ] Een KPI opent het standaard Home Assistant-detailvenster van de geselecteerde sensor.
- [ ] Ontbrekende en unavailable sensoren blijven informatief en blokkeren de andere KPI's niet.
- [ ] Desktop en mobiel blijven zonder horizontale overflow bruikbaar.

De dashboardbundle voert geen service- of configuratiecall uit.
