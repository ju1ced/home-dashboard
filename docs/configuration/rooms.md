# Kamers en kamerdetails

`v0.5.0-alpha.1` vervangt de technische entiteitenlijst door twee niveaus.

## Kamers-overzicht

- Een hero toont het totale aantal geconfigureerde echte ruimtes.
- Kamers worden volgens hun gekozen `floor_id` gegroepeerd. Als de frontend geen vriendelijke verdiepingnaam aanbiedt, gebruikt de card tijdelijk `Verdieping 1`, `Verdieping 2`, enzovoort; interne IDs worden niet getoond.
- Iedere kamerkaart toont icon, naam, maximaal enkele primaire contextwaarden, een status zoals temperatuur/lichten/openingen en maximaal vier capabilitylabels.
- De volledige kamerkaart opent het semantische detailpad `room-<logische-sleutel>`.

## Kamerdetail

Iedere kamer krijgt een Home Assistant-subview met terugpad naar Kamers. De beschikbare bronmappings bepalen welke onderdelen verschijnen:

1. **Ruimtestatus:** comfort- en relevante safetystatussen.
2. **Licht, covers & openingen:** alle geselecteerde primaire entities.
3. **Comfort & klimaat:** huidige en gewenste temperatuur, geconfigureerde modi en — indien beschikbaar — preset-, ventilator- en swingstatus, aangevuld met geselecteerde temperatuur-, vocht- en luchtkwaliteitsbronnen.
4. **Media:** geselecteerde mediaspelers.
5. **Veiligheid:** safety-entiteiten en lokale camerabeelden.
6. **Apparaten & energie:** geselecteerde powerbronnen.
7. **Historie:** gecombineerde kamer- en klimaathistorie over 72 uur.

Lege onderdelen worden niet gerenderd. Alle tiles en camerakaarten zijn in deze alpha read-only. De maximaal twee geconfigureerde quick actions blijven bewaard, maar worden pas zichtbaar na de afzonderlijke actionscope-, confirmation- en verificatiegate.
