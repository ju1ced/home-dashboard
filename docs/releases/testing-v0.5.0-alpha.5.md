# Testchecklist v0.5.0-alpha.5 — stabiele driedelige Home

Test uitsluitend via de bestaande grafische dashboardconfiguratie. Deel geen exports, entity-ID's, interne URL's of andere private waarden.

## Configuratie

- [ ] Werk via HACS bij naar `v0.5.0-alpha.5` en herlaad Home Assistant volledig.
- [ ] **Vandaag** toont afzonderlijke selectors voor **Batterij laden** en **Batterij ontladen**.
- [ ] Beide selectors kunnen onafhankelijk gekozen, leeggemaakt, opgeslagen en opnieuw geopend worden.
- [ ] Een oudere gecombineerde batterijvermogensbron blijft na migratie als extra energiecontext bewaard totdat die bewust wordt verwijderd.

## Home op desktop

- [ ] Weer staat links, energie-KPI's met afvalophaling staan in het midden en security staat als compacte derde kolom rechts.
- [ ] De zes vaste KPI-labels zijn: thuisbatterij-SoC, batterij laden, batterij ontladen, zonnepanelenopbrengst, huisverbruik zonder batterijladen en maandelijkse vermogenspiek.
- [ ] Afval staat onder **Afvalophaling** en iedere bron toont een afvalicoon, herkenbare naam en ophaalstatus.
- [ ] Security toont één camera per positie, compacte privacy-informatie en alarmstatus zonder horizontale overflow.

## Realtime en responsive gedrag

- [ ] Snel veranderende W-waarden actualiseren zonder dat weerkaart, camera of de volledige Home zichtbaar herladen.
- [ ] Een operationeel veiligheidsaandachtspunt verschijnt en verdwijnt wel correct.
- [ ] Tablet en mobiel stapelen weer, KPI/afval en security leesbaar zonder horizontale pagina-overflow.
- [ ] Person cards, kamerroutes en specialistische routes blijven aanwezig.

De dashboardbundle voert geen Home Assistant-servicecall, WebSocket-write of automatische configuratiewrite uit. Alleen de normale opslagactie van de Home Assistant-dashboardeditor bewaart de door de gebruiker bevestigde configuratie.
