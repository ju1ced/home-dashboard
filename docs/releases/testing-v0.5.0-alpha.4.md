# Testchecklist v0.5.0-alpha.4 — entityselectie in de GUI

Test uitsluitend via de bestaande grafische dashboardconfiguratie. Deel geen exports, entity-ID's, interne URL's of andere private waarden.

## Update en cache

- [ ] Werk via HACS bij naar `v0.5.0-alpha.4`.
- [ ] Herlaad Home Assistant volledig nadat HACS de nieuwe resource heeft geplaatst.

## Vandaag

- [ ] Kies afzonderlijk een entity voor thuisbatterij-SoC, batterij laden/ontladen, zonnepanelenopbrengst, huisverbruik zonder batterijladen en maandelijkse vermogenspiek.
- [ ] De keuze blijft zichtbaar nadat je naar een andere editorsectie navigeert en terugkeert.
- [ ] Sla op, open de editor opnieuw en controleer dat de vijf keuzes bewaard zijn.
- [ ] Maak één keuze opnieuw leeg en controleer dat het optionele veld leeg kan worden opgeslagen.
- [ ] Controleer ook weer, afvalbronnen en optionele extra energiecontext.

## Andere enkelvoudige selectors

- [ ] Kies of wijzig de alarm-entiteit onder **Security** en controleer selectie, opslaan en opnieuw openen.
- [ ] Controleer steekproefsgewijs een enkelvoudige entityselector onder **Energie**.
- [ ] Meervoudige selectors, waaronder kamerbronnen en afval, blijven werken.

De dashboardbundle voert geen Home Assistant-servicecall, WebSocket-write of automatische configuratiewrite uit. Alleen de normale opslagactie van de Home Assistant-dashboardeditor bewaart de door de gebruiker bevestigde configuratie.
