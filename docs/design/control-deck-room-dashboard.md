# Control Deck-kamerdashboard

## Status en doel

Dit contract beschrijft de in `v0.8.0-alpha.20` geïmplementeerde HD-202-richting. Het kamerdetail is primair een **Operate**-oppervlak: directe, expliciet gemapte bediening staat voorop; diagnostiek, energie en historie zijn secundair. Het lokale ontwerp-prototype was validatiemateriaal en is geen productiebron.

## Compositie

- De kamerheader toont naam, kernstatus en een optionele privacyveilige afbeelding. Zonder bruikbare afbeelding is de fallback decoratief.
- Een vaste capabilityrail toont alleen werkelijk geconfigureerde functies.
- Vier tabs scheiden Bediening, Apparaten, Energie en Historie. Bediening is standaard actief; de tabvolgorde en toetsenbordnavigatie zijn stabiel.
- Operationele warnings blijven zichtbaar binnen hun relevante inhoud en worden niet door een energie- of historiegrafiek vervangen.

## Configuratiemodel

### Lichtgroepen

Een lichtgroep heeft een logical key, naam, één expliciet `control_entity` en een vaste lijst `member_entities`. De leden bepalen uitsluitend de groepspresentatie: uit, aan, gedeeltelijk aan, unknown of unavailable. Groepsacties richten zich alleen op het geconfigureerde groepsdoel. Individuele leden blijven afzonderlijk bedienbaar wanneer ze expliciet in de groep zijn opgenomen.

### Openingen

Een opening heeft een logical key, naam, exact coverdoel, type `shutter`, `screen` of `awning`, en confirmationbeleid `none` of `movement`. Rolluiken gebruiken Open/Stop/Dicht; screens en luifels gebruiken Uit/Stop/In. Home Assistant `supported_features` blijft beslissend. Deur-, poort- en garagedeviceclasses blijven fail-closed.

### Smart plugs

Een smart plug bevat expliciete switch-, vermogen-, energie- en spanningsbronnen. Een beveiligde plug toont de opgegeven reden en levert geen schakelactie. Een gewone plug vereist ontgrendelen en bevestigen; de frontend verandert de apparaatstate niet optimistisch.

### Kamerenergie

Kamer en apparaten kunnen afzonderlijke bronnen voor vandaag, maand en jaar hebben. Een periode zonder bron blijft niet geconfigureerd en wordt nooit als nul geïnterpreteerd. Actueel vermogen en energie worden niet op één schaal samengevoegd. Het officiële Home Assistant Energy-dashboard blijft leidend voor woningtotalen.

### Historie

De Historie-tab is de enige eigenaar van de native `history-graph`-dialoog. De strategy voegt geen tweede grafiek toe. Sluiten herstelt focus naar dezelfde broningang.

## Veiligheidsgrenzen

- Geen area- of device-expansie tijdens een actie.
- Iedere servicecall bevat exact één expliciet gemapt `entity_id`.
- Missing, unknown en unavailable blokkeren directe acties.
- Bestaande configuraties activeren geen bediening door migratie.
- Live camera's zijn geen kamerafbeeldingsbron.
- Default `lovelace`, resources en productieconfiguratie blijven read-only buiten de afzonderlijke menselijke gates.

## Responsive en toegankelijkheid

Dezelfde capabilities blijven beschikbaar op 390×844, 1024×900 en 1440×900. Zichtbare actieve knoppen zijn minimaal 44×44 px. Status gebruikt tekst naast kleur. Tabs, confirmations en historiedialogen zijn met toetsenbord bedienbaar en behouden focus waar de DOM opnieuw wordt opgebouwd.

## Validatiegrens

Fictieve fixtures dekken normal, warning, missing, unknown en unavailable. De browsermatrix bewijst lokale componentcompositie, actionscope, touchdoelen en responsive gedrag. Zij bewijst geen live Home Assistant-autorisatie, echte themacontrasten, screenreaderuitvoer of deploymentveiligheid; die blijven onderdeel van de testdashboardgate.
