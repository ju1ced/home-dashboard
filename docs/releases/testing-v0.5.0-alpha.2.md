# Testchecklist v0.5.0-alpha.2 — visuele Home- en Kamers-herbouw

Test uitsluitend in het tijdelijke dashboard. Het default dashboard blijft read-only. Deel geen exports, entity-ID's, interne URL's, persoonsgegevens of camerabeelden.

## Home

- [ ] Begroeting, aandacht, Vandaag, Gezin, Snel naar en Security vormen één rustige verticale hiërarchie.
- [ ] Weer, maximaal vier energie-KPI's en afvalinformatie zijn zichtbaar wanneer ze in de GUI zijn gemapt.
- [ ] Bij lege energiecontext gebruikt Home zinvolle geconfigureerde Energie-fallbacks zonder duplicaten.
- [ ] Eén camerabeeld is maximaal circa 520 px breed; de camera domineert desktop noch mobiel.
- [ ] Een private camera verschijnt niet als beeld en heeft alleen een compacte status in de privacyrail.

## Kamers

- [ ] Kamers blijven per verdieping gegroepeerd en tonen geen raw floor- of area-ID.
- [ ] De onderste chips verwijzen alleen naar werkelijk gemapte apparaten en tonen hun actuele status.
- [ ] Een chip opent het standaard Home Assistant-detailvenster van de bedoelde bron.
- [ ] De volledige kamerkaart opent het semantische kamerdetailpad.

## Kamerdetail

- [ ] Hero, ruimtestatus, bediening, klimaat, media, veiligheid en energie vormen één samenhangend dashboard.
- [ ] Een lichte en zware kamer blijven bruikbaar op desktop, tablet en circa 390 px mobiel.
- [ ] Alleen geconfigureerde groepen verschijnen en unavailable bronnen blokkeren de rest niet.
- [ ] Apparaatkaarten openen het standaard HA-detailvenster; de dashboardbundle voert geen directe servicecall uit.
- [ ] De 72-uurs historie blijft onder de compositie zichtbaar wanneer historiebronnen zijn gekozen.

Rapporteer viewport, kamerfunctie en verwacht/werkelijk. Eén geanonimiseerde uitsnede zonder camerabeeld mag bij visuele afwijkingen.
