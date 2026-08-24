# Testchecklist v0.5.0-alpha.1 — Kamers

Test uitsluitend in het tijdelijke dashboard. Het default dashboard blijft read-only. Deze release bevat ook de camera-/privacycorrectie uit `v0.4.0-alpha.2`.

## Overzicht

- [ ] Kamers toont een hero en één duidelijk herkenbare kaart per geconfigureerde kamer.
- [ ] Kamers zijn per verdieping gegroepeerd; er verschijnt nergens een raw floor- of area-ID.
- [ ] Een lichte én een zwaar geconfigureerde kamer blijven overzichtelijk op desktop en circa 390 px mobiel.
- [ ] Status, capabilitylabels en `Deels offline` komen overeen met de geselecteerde bronnen.

## Detailpagina

- [ ] Elke kamer opent een eigen semantische subview en de terugknop gaat naar Kamers.
- [ ] Licht/covers, klimaat/comfort, media, veiligheid/camera, power en historie staan in afzonderlijke herkenbare groepen.
- [ ] Alleen geconfigureerde groepen verschijnen; lege secties laten geen lege panelen achter.
- [ ] De informatie uit de huidige kamerdetailpagina is terug te vinden zonder technische entitydump.
- [ ] Een unavailable operationele bron blijft zichtbaar zonder de rest van de kamer te blokkeren.
- [ ] Alle tiles en camera's blijven read-only en voeren geen serviceactie uit.

## Camera-regressie

- [ ] Home toont één niet-private camera per viewport.
- [ ] Privacy-actieve camera's ontbreken in de beeldcarrousel en staan alleen in de compacte privacyrail.

Rapporteer viewport, kamerfunctie en verwacht/werkelijk. Deel geen export, entity-ID, interne URL of camerabeeld.
