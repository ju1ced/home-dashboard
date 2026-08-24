# Testchecklist v0.5.0-alpha.7 — Renderstijl en compact weer

Test uitsluitend via het bestaande tijdelijke dashboard. Deel geen exports, entity-ID's, interne URL's of andere private waarden.

## Update en eerste indruk

- [ ] Werk via HACS bij naar `v0.5.0-alpha.7` en herlaad Home Assistant volledig.
- [ ] Home behoudt dezelfde driedelige desktopindeling, maar surfaces, randen, schaduw, groene accenten en typografie sluiten zichtbaar beter aan op de goedgekeurde render.
- [ ] De energie-KPI's vormen één rustige, aaneengesloten rail; afval, personen en directe routes gebruiken dezelfde visuele familie.

## Compact weer

- [ ] De weerkaart is ongeveer even hoog als de energie-rail en bevat geen groot leeg vlak meer.
- [ ] Actuele conditie, locatie en temperatuur zijn direct leesbaar.
- [ ] Maximaal drie dagelijkse voorspellingen tonen weekdag, weericoon en hoge/lage temperatuur.
- [ ] Tijdens laden of bij ontbrekende forecast blijft de actuele weerstatus zichtbaar en blokkeert Home niet.
- [ ] Een tik of klik opent het standaard Home Assistant-detailvenster van de gekozen weerbron.

## Responsive en thema

- [ ] Op 390 px staan weer, energie, afval, security, personen en routes in een compacte enkele kolom zonder horizontale pagina-overflow.
- [ ] **Thema = systeem**, **licht** en **donker** houden tekst, randen, surfaces, iconen en statuschips leesbaar.
- [ ] Security toont nog steeds exact één niet-private camera per positie; privacy-actieve camera's blijven alleen als kleine status zichtbaar.
- [ ] Snelle sensorupdates veroorzaken geen zichtbare volledige Home-refresh.

## Veiligheid

- [ ] Camera's blijven read-only en state-/weerkaarten openen uitsluitend `hass-more-info`.
- [ ] Browserconsole toont geen forecastsubscription- of custom-cardfouten.

De forecastsubscription is read-only. De dashboardbundle voert geen Home Assistant-servicecall, WebSocket-write of automatische configuratiewrite uit. Alleen de normale opslagactie van de Home Assistant-dashboardeditor bewaart de door de gebruiker bevestigde configuratie.
