# Kamers en kamerdetails

`v0.5.0-alpha.1` vervangt de technische entiteitenlijst door twee niveaus.

## Kamers-overzicht

- Een hero toont het totale aantal geconfigureerde echte ruimtes.
- Kamers worden volgens hun gekozen `floor_id` gegroepeerd. Als de frontend geen vriendelijke verdiepingnaam aanbiedt, gebruikt de card tijdelijk `Verdieping 1`, `Verdieping 2`, enzovoort; interne IDs worden niet getoond.
- Iedere kamerkaart toont icon, naam, primaire context en een status zoals temperatuur/lichten/openingen. Afwijkende safety-statussen en niet-beschikbare bronnen krijgen voorrang in de contextregel.
- De onderste rij bevat maximaal vier state-aware chips voor werkelijk gemapte apparaten. Een chip gebruikt de Home Assistant-naam en toont zowel de actuele betekenis als toestand, bijvoorbeeld `Leeslamp · Aan · 42%`, `Rolluik tuin · Open · 60%` of `Sonos · Speelt · Radio 1`; het is dus geen generiek capabilitylabel.
- Iedere chip heeft een afzonderlijk touchvlak van minimaal 44 px, zichtbare toetsenbordfocus en opent uitsluitend het standaard Home Assistant-detailvenster van die bron. De chip voert zelf geen servicecall uit.
- De volledige kamerkaart opent het semantische detailpad `room-<logische-sleutel>`.

## Kamerdetail

Iedere kamer krijgt een Home Assistant-subview met terugpad naar Kamers. `v0.5.0-alpha.2` gebruikt één samenhangende responsive compositie, zodat secties niet meer als losse technische tilekolommen over het scherm worden verspreid. De beschikbare bronmappings bepalen welke onderdelen verschijnen:

1. **Ruimtestatus:** comfort- en relevante safetystatussen; warnings blijven ook op mobiel buiten ingeklapte inhoud zichtbaar.
2. **Verlichting:** alle geselecteerde lichtgroepen, lampen en scènes, met helderheid waar Home Assistant die aanbiedt.
3. **Covers & openingen:** geselecteerde covers met beweging en positie waar beschikbaar.
4. **Comfort & klimaat:** huidige en gewenste temperatuur, geconfigureerde modi en — indien beschikbaar — preset-, ventilator- en swingstatus, aangevuld met geselecteerde temperatuur-, vocht- en luchtkwaliteitsbronnen.
5. **Media:** geselecteerde mediaspelers met afspeelstatus en bron/titel waar beschikbaar.
6. **Veiligheid:** safety-entiteiten en een afzonderlijke camera-ingang.
7. **Apparaten & energie:** geselecteerde powerbronnen; deze zware lijst start op smalle schermen ingeklapt.
8. **Historie:** herkenbare broningangen plus gecombineerde kamer- en klimaathistorie over 72 uur; de bronnenlijst start op smalle schermen ingeklapt.

Lege onderdelen worden niet gerenderd. Een gemapte maar ontbrekende bron toont `Niet gevonden`; `unknown` en `unavailable` krijgen respectievelijk `Onbekend` en `Niet beschikbaar` zonder een nulwaarde te fabriceren. Apparaatkaarten openen het standaard Home Assistant-detailvenster; de dashboardbundle voert zelf geen servicecall uit.

De maximaal twee geconfigureerde `quick_actions` blijven bewaard, maar worden in deze read-only alpha niet als uitvoerbare knoppen gerenderd. Dat gebeurt pas na de afzonderlijke actionscope-, confirmation- en verificatiegate. Tot die gate zijn de kamerkaart en entitychips uitsluitend navigatie naar een semantisch detailpad of Home Assistant `more-info`.
