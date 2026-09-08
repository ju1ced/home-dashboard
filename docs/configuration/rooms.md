# Kamers en kamerdetails

Werkversie v0.8.0-alpha.5: iedere favoriete kamer heeft een optionele, geordende lijst van nul tot zestien quick actions. Meerdere lichten, covers, mediaspelers en klimaatbronnen van hetzelfde type zijn toegestaan. Iedere chip gebruikt waar mogelijk het Home Assistant-entiteitsicoon, verkort dubbele kamernamen en toont een duidelijk typegebonden actief oppervlak. De kamerdetailpagina gebruikt de beschikbare breedte en de native terugpijl voert rechtstreeks naar Home.

Werkversie v0.8.0-alpha.2: de kamerkop klapt de bediening open/dicht. Verlichting, radio, rolluiken, luifel en airco/verwarming verschijnen als chips waar bronnen zijn ingesteld. De klimaat-chip gebruikt de bestaande Klimaatbron. Voor licht/media/covers zonder direct actiedoel blijven de bestaande bronmappings als detailkeuze bereikbaar, zonder automatische activering van services. Volledige kamer is een afzonderlijke link. Escape sluit het paneel en herstelt focus op de kamerkop.


Kamers heeft een overzicht en volledige details per ruimte.

## Kamers-overzicht en favorieten

Home en het volledige verdiepingenoverzicht delen dezelfde compacte kamerkaart. In v0.8.0-alpha.2 klapt de kamernaam/pijl het paneel open. Alleen Volledige kamer navigeert naar de kamerpagina. Chips tonen de beschikbare functies en hun toestand. Bij meerdere bronnen telt de chip de actieve en onbekende apparaten samen; de keuzelijst geeft de individuele toestanden weer.

Onder Dashboard bewerken → Kamers:

- **Favoriet op Home** kiest maximaal vier kamers; de bestaande pijlen bepalen de volgorde. Niet-favorieten blijven op Kamers bereikbaar.
- **Directe bediening toestaan** is standaard uit. Zonder opt-in openen de knoppen alleen HA-details.
- **Knoppen op Home** kiest nul tot zestien afzonderlijke entiteiten. Kies bij een item direct de gewenste positie; het item wordt in één wijziging verplaatst. Types mogen worden herhaald. Een lege lijst toont geen quick actions.
- Bestaande configuraties gebruiken de vier oude actiedoelen en bronmappings als beginweergave totdat de nieuwe lijst wordt opgeslagen. Daarna is de gekozen lijst leidend. Er is geen impliciete area-/devicegroepering.
- **Layout → Quick actions** regelt de zichtbaarheid van deze knoppen op beide overzichten.

Lichten gebruikt aan/uit volgens de actuele state. Rolluiken klapt Open/Stop/Dicht uit; luifels gebruiken Uit/Stop/In en vragen bevestiging voor beweging. Alleen ondersteunde coverfuncties zijn beschikbaar; deuren/poorten blijven uitgesloten. Radio pauzeert of hervat een gepauzeerde bron, en opent details voor bronkeuze bij idle/uit of een niet-ondersteunde actie. Actieve lichten, media, covers en klimaat krijgen elk een eigen donkere accentkleur, een gevulde icoontegel en expliciete statustekst; kleur is daardoor ondersteunend en nooit de enige statusdrager.

Een request verandert de zichtbare apparaatstate niet optimistisch. Fouten/timeout krijgen feedback zonder interne foutpayload. HA handhaaft autorisatie en integratievoorwaarden; Stop blijft beschikbaar tijdens een wachtend bewegingsverzoek. Missing/unknown/unavailable opent details en voert geen directe actie uit.

Kamerkaarten gebruiken minimaal 44×44 px knoppen, toetsenbordfocus, tekst naast statuskleur en responsive disclosure. Zie de [testrelease](../releases/testing-v0.8.0-alpha.1.md).

## Kamerdetail

Iedere kamer krijgt een Home Assistant-subview met terugpad naar Home. `v0.5.0-alpha.2` gebruikt één samenhangende responsive compositie, zodat secties niet meer als losse technische tilekolommen over het scherm worden verspreid. De beschikbare bronmappings bepalen welke onderdelen verschijnen:

1. **Ruimtestatus:** comfort- en relevante safetystatussen; warnings blijven ook op mobiel buiten ingeklapte inhoud zichtbaar.
2. **Verlichting:** alle geselecteerde lichtgroepen, lampen en scènes, met helderheid waar Home Assistant die aanbiedt.
3. **Covers & openingen:** geselecteerde covers met beweging en positie waar beschikbaar.
4. **Comfort & klimaat:** huidige en gewenste temperatuur, geconfigureerde modi en — indien beschikbaar — preset-, ventilator- en swingstatus, aangevuld met geselecteerde temperatuur-, vocht- en luchtkwaliteitsbronnen.
5. **Media:** geselecteerde mediaspelers met afspeelstatus en bron/titel waar beschikbaar.
6. **Veiligheid:** safety-entiteiten en een afzonderlijke camera-ingang.
7. **Apparaten & energie:** geselecteerde powerbronnen; deze zware lijst start op smalle schermen ingeklapt.
8. **Historie:** herkenbare broningangen plus gecombineerde kamer- en klimaathistorie over 72 uur; de bronnenlijst start op smalle schermen ingeklapt.

Lege onderdelen worden niet gerenderd. Een gemapte maar ontbrekende bron toont `Niet gevonden`; `unknown` en `unavailable` krijgen respectievelijk `Onbekend` en `Niet beschikbaar` zonder een nulwaarde te fabriceren. Apparaatkaarten op het detail openen het standaard Home Assistant-detailvenster. Expliciete actiedoelen worden ook in de passende detailgroepen opgenomen.

De maximaal twee geconfigureerde `quick_actions` blijven bewaard, maar worden in deze read-only alpha niet als uitvoerbare knoppen gerenderd. Dat gebeurt pas na de afzonderlijke actionscope-, confirmation- en verificatiegate. Tot die gate zijn de kamerkaart en entitychips uitsluitend navigatie naar een semantisch detailpad of Home Assistant `more-info`.
