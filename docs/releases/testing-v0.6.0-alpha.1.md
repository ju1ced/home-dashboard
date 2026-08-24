# Testchecklist v0.6.0-alpha.1 — Home, Kamers, Energie en Domeinen

Test uitsluitend via het bestaande tijdelijke dashboard. Deel geen exports, entity-ID's, interne URL's of andere private waarden.

## Update en algemeen

- [ ] Werk via HACS bij naar `v0.6.0-alpha.1` en herlaad Home Assistant volledig.
- [ ] Home, Kamers, Energie, Domeinen en Meer openen via hun stabiele tab.
- [ ] Licht, donker en systeemthema blijven leesbaar op desktop en mobiel.
- [ ] Geen view veroorzaakt een zichtbare refreshlus of horizontale pagina-overflow.

## Home

- [ ] Aandacht toont alleen operationeel relevante afwijkingen en blijft compact wanneer alles normaal is.
- [ ] Vandaag, gezin, security, actuele activiteit en afwijkende kamers vormen één scanbare prioriteitsvolgorde.
- [ ] Person cards tonen geen adres, coördinaten of andere precieze locatie.
- [ ] Privacy-actieve camera's blijven uit de beeldcarrousel en verschijnen alleen in de compacte privacyrail.

## Kamers

- [ ] Het overzicht toont echte apparaatnamen en betekenisvolle staten voor licht, covers, klimaat en media.
- [ ] Een lichte en een zware kamer openen hun eigen detailpagina.
- [ ] Details zijn herkenbaar gegroepeerd in verlichting, covers, klimaat, media, safety, camera, power en historie.
- [ ] Op mobiel zijn zware groepen progressief inklapbaar en blijven waarschuwingen vindbaar.

## Energie

- [ ] De actuele KPI's volgen de geconfigureerde sensoren en tonen ontbrekende of onbeschikbare data expliciet.
- [ ] Datum-/vergelijkingskeuze, energiegebruik, solar, batterij, water/gas en apparaatdetails verschijnen wanneer de standaard HA Energy-configuratie ze ondersteunt.
- [ ] De knop naar het standaard Energy-dashboard blijft beschikbaar als veilige fallback.

## Domeinen

- [ ] Domeinen zijn gegroepeerd per woningfunctie en vormen geen platte lijst van alle entities.
- [ ] Klimaat, verlichting, veiligheid, water, media, energie, mobiliteit/buiten en systeem verbergen lege onderdelen netjes.
- [ ] Een kaart opent uitsluitend het standaard Home Assistant-detailvenster of een interne detailroute.

## Veiligheid

- [ ] Geen nieuwe knop voert rechtstreeks een servicecall uit.
- [ ] Missing en unavailable entities veroorzaken geen lege of vastgelopen view.
- [ ] Controleer in browserontwikkelaarstools dat navigeren en detailvensters geen onverwachte write-servicecall uitvoeren.

Deze release voert geen Home Assistant-servicecall, configuratiewrite of automatische dashboardmutatie uit.
