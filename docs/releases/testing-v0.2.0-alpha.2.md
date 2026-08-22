# Testchecklist v0.2.0-alpha.2 — compacte editor

Deze patchrelease verandert alleen de navigatie en presentatie van de configuratie-editor. Gebruik hetzelfde expliciete tijdelijke dashboard als bij `v0.2.0-alpha.1`; het default dashboard blijft buiten scope.

## Update

- [ ] HACS biedt `v0.2.0-alpha.2` als update aan.
- [ ] De bestaande configuratie opent zonder migratiemelding of dataverlies.
- [ ] Preview en export/import blijven werken.

## Desktop

- [ ] Links staan tien configuratieonderdelen; rechts is exact één onderdeel zichtbaar.
- [ ] Een klik op een onderdeel vervangt het rechterpaneel zonder door een lange formulierlijst te scrollen.
- [ ] Vorige en Volgende lopen door alle tien onderdelen.
- [ ] Pijltjestoetsen en Home/End navigeren tussen de sectietabs.
- [ ] Fout- en waarschuwingsbadges verwijzen naar het juiste onderdeel.

## Collecties

- [ ] Personen, camera's, kamers en acties starten als compacte inklapbare regels.
- [ ] Een geopend item blijft open nadat een veld is aangepast.
- [ ] Een nieuw item opent onmiddellijk.
- [ ] Kamer- en viewvolgorde blijven wijzigbaar.

## Mobiel

- [ ] De sectienavigatie wordt een horizontale, aanraakbare tabbalk.
- [ ] Er is geen horizontale pagina-overflow; alleen de tabbalk zelf mag horizontaal scrollen.
- [ ] Eén onderdeel, validatiemeldingen en vorige/volgende blijven volledig bedienbaar.
- [ ] De Home Assistant-knoppen Annuleren en Opslaan blijven bereikbaar.

## Veiligheid

- [ ] Ongeldige tussenstanden worden niet opgeslagen.
- [ ] Een toekomstige schema-versie blijft geblokkeerd.
- [ ] De test voert geen dashboardactie of Home Assistant-servicecall uit.

Een layout- of datablocker krijgt `v0.2.0-alpha.3`. Zonder blocker start delivery-PR 3 voor de vijf echte productviews.
