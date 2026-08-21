# Grafische configuratie

## Reikwijdte van v0.2.0-alpha.1

De editor registreert zich als `home-dashboard-strategy-editor` en beheert schema v1 zonder handgeschreven YAML of JSON. De Community dashboard-kiezer kan de strategy al aanmaken en toont daarna één read-only configuratiepreview. De vijf productviews volgen in `v0.3.0-alpha.1`.

De editor heeft tien onderdelen:

1. **Algemeen:** titel, taal, tijdnotatie, startview, thema en informatiedichtheid.
2. **Vandaag:** weer, forecast, afval en compacte energiecontext.
3. **Personen:** personselectie, label, privacyveilige toegestane zones, thuis/zone/andere locatie, freshness en batterijen.
4. **Security:** alarm en exact drie camera's met privacyinstelling, actie, fallback en bevestiging.
5. **Kamers:** logische sleutel, naam, icon, floor, area, extra devices, capabilities, maximaal twee quick actions en expliciete bronnen voor licht, covers/openingen, media, safety, camera, power, historie en volledige klimaatdetails.
6. **Energie:** volledige bronselectie voor elektriciteit, zon, batterij, gas, water, apparaten, capaciteitspiek, EV, UPS en fases.
7. **Acties:** native HA action selector, expliciete targetscope, risicoklasse, bevestiging, hold en verplichte resultaatcontrole.
8. **Specialisten:** Kia, robot, tuin en zwembad met vaste cardtypes, minimumversie en logische mappingkeys.
9. **Layout:** mobiele disclosure en zichtbaarheid van weer, personen, security en quick actions.
10. **Diagnostiek:** beheerroute, freshness en operationele allowlist voor unavailable.

## Opslaan en validatie

Geldige wijzigingen versturen het publieke Home Assistant-event `config-changed`. Een ongeldige tussenstand blijft zichtbaar in de editor en wordt niet opgeslagen. Belangrijke regels zijn:

- security is alleen geldig met exact drie camera's;
- iedere collectie gebruikt unieke logische keys;
- een kamer heeft maximaal twee quick actions;
- privacy-, kostelijke en destructieve acties hebben bevestigingstekst;
- kostelijke en destructieve acties tonen een waarschuwing als hold ontbreekt;
- iedere serviceactie heeft een expliciete target en een verificatie-entity;
- de vijf semantische viewpaths blijven stabiel;
- unavailable verschijnt standaard alleen voor expliciet operationele entities.

## Selectors

Entity-, area-, floor-, icon- en actionvelden gebruiken Home Assistant-selectors. De installatie bewaart echte IDs in de dashboardconfiguratie; de repository, fixtures en documentatie bevatten alleen logische of fictieve waarden.

## Import en export

`Exporteer privé-back-up` maakt alleen na een privacywaarschuwing een lokale JSON-download. Die export kan echte installatiegegevens bevatten: bewaar hem privé, voeg hem nooit aan een issue toe en commit hem niet naar Git. Import valideert en migreert eerst; een toekomstige, onbekende schema-versie wordt geweigerd.

Een toekomstige schema-versie blokkeert de editor volledig. Er wordt dan geen default-v1-config teruggeschreven; alleen de import van een compatibele privé-back-up kan de blokkering opheffen.

## Toegankelijkheid en mobiel

De editor gebruikt native formcontrols, labels, toetsenbordbediening, Home Assistant-kleurtokens en een éénkoloms layout onder 600 px. Het fictieve harnas is gecontroleerd op desktop en 390×844. De volledige HA-dialogtest blijft onderdeel van de releasechecklist.
