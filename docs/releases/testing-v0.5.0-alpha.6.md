# Testchecklist v0.5.0-alpha.6 — Home-render en thema

Test uitsluitend via het bestaande tijdelijke dashboard. Deel geen exports, entity-ID's, interne URL's of andere private waarden.

## Update en thema

- [ ] Werk via HACS bij naar `v0.5.0-alpha.6` en herlaad Home Assistant volledig.
- [ ] **Thema = systeem** volgt de actieve Home Assistant-modus.
- [ ] **Thema = licht** en **Thema = donker** geven leesbare kaarten, tekst, randen en statuskleuren zonder gemengde lichte/donkere childcards.

## Vandaag op desktop

- [ ] Weer is compacter dan in `v0.5.0-alpha.5` en blijft volledig leesbaar.
- [ ] De zes energiebronnen verschijnen als iconische statusblokken met de waarde naast het icoon; de lange vaste labels nemen geen kaartbreedte meer in.
- [ ] De losse kop **Beveiliging / Camera, privacy en alarm in één compacte kolom** is verdwenen.
- [ ] Security blijft de derde kolom, toont één niet-private camera per positie en behoudt compacte navigatie en privacystatus.

## Afvalophaling

- [ ] Herkende bronnen tonen het passende GFT-, papier-, PMD-, groenafval-, glas- of restafvalicoon en de korte fractienaam.
- [ ] Iedere ophaling toont een datum en daarnaast **Vandaag**, **Morgen** of **Over n dagen**.
- [ ] Een onbekende afvalbron blijft als neutrale afvalkaart zichtbaar en blokkeert Home niet.

## Responsive en veiligheid

- [ ] Op 390 px stapelen weer, energiestatussen, afval en security zonder horizontale pagina-overflow.
- [ ] Snelle vermogensupdates veranderen de waarden zonder zichtbare volledige Home-refresh.
- [ ] Person cards en directe kamer-/specialistroutes blijven zichtbaar.

De dashboardbundle voert geen Home Assistant-servicecall, WebSocket-write of automatische configuratiewrite uit. Alleen de normale opslagactie van de Home Assistant-dashboardeditor bewaart de door de gebruiker bevestigde configuratie.
