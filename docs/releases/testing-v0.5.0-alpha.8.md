# Testchecklist v0.5.0-alpha.8 — Brede weerzone

Test uitsluitend via het bestaande tijdelijke dashboard. Deel geen exports, entity-ID's, interne URL's of andere private waarden.

## Desktop

- [ ] Werk via HACS bij naar `v0.5.0-alpha.8` en herlaad Home Assistant volledig.
- [ ] De weerkaart overspant de twee linker kolommen van Vandaag.
- [ ] De energie-rail staat onder de weerkaart en gebruikt dezelfde twee kolommen.
- [ ] Afvalophaling volgt onder de energie-rail.
- [ ] Security blijft rechts staan en begint bovenaan naast het weer.

## Responsive

- [ ] Onder ongeveer 1050 px staan weer, energie/afval en security in die volgorde onder elkaar.
- [ ] Op 390 px is er geen horizontale pagina-overflow en blijven alle waarden en camerabediening bereikbaar.
- [ ] Licht, donker en systeemthema behouden dezelfde rasterindeling en leesbare contrasten.

## Veiligheid

- [ ] Camera's blijven read-only en privacy-actieve camera's verschijnen uitsluitend in de compacte statusrail.
- [ ] De weerkaart en statuskaarten openen alleen het standaard Home Assistant-detailvenster.

Deze release voert geen Home Assistant-servicecall, configuratiewrite of automatische dashboardmutatie uit.
