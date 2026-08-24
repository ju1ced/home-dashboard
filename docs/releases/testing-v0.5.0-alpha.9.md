# Testchecklist v0.5.0-alpha.9 — Samengestelde Vandaag-kaart

Test uitsluitend via het bestaande tijdelijke dashboard. Deel geen exports, entity-ID's, interne URL's of andere private waarden.

## Desktop

- [ ] Werk via HACS bij naar `v0.5.0-alpha.9` en herlaad Home Assistant volledig.
- [ ] Weer, energiecontext en afvalophaling voelen als één kaart met één buitenrand en schaduw.
- [ ] Tussen weer, energie en afval staan alleen subtiele interne scheidingslijnen.
- [ ] Vier geconfigureerde afvalfracties staan naast elkaar op één rij.
- [ ] Security blijft rechts naast de samengestelde Vandaag-kaart staan.

## Responsive

- [ ] Onder ongeveer 1050 px staan de samengestelde Vandaag-kaart en security onder elkaar.
- [ ] Op 390 px staan afvalfracties twee per rij en is er geen horizontale pagina-overflow.
- [ ] Licht, donker en systeemthema behouden leesbare oppervlakken, lijnen en contrasten.

## Veiligheid

- [ ] De weer-, energie- en afvalkaarten openen alleen het standaard Home Assistant-detailvenster.
- [ ] Camera's blijven read-only en privacy-actieve camera's verschijnen uitsluitend in de compacte statusrail.

Deze release voert geen Home Assistant-servicecall, configuratiewrite of automatische dashboardmutatie uit.
