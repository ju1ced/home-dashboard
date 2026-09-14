# Testrelease v0.8.0-alpha.13 — naadloze Home-header

## Testscope

- Fix, gemeld na live-test van v0.8.0-alpha.12 (zie screenshot `tests/screenshots/alpha12.png`): tussen de groene navigatiebalk en de groene "Goedemiddag"-header eronder bleef een zichtbare lijn/kier staan, ondanks de eerdere "join"-poging (PR #40).
- Grondoorzaak, geverifieerd tegen de daadwerkelijke Home Assistant-frontendbroncode: `hui-sections-view` gebruikt de CSS-variabele `--ha-view-sections-row-gap` (standaard **24px**) als afstand tussen top-level sections — niet de 16px die onze eigen "join"-CSS aannam. Dat verschil van 8px was precies de zichtbare lijn.
- De header refereert nu rechtstreeks naar die HA-variabele (`margin-top:calc(-1 * var(--ha-view-sections-row-gap,24px))`) in plaats van een vast getal. Dit werkt ook correct wanneer een thema die variabele zelf aanpast, omdat CSS custom properties door shadow-DOM-grenzen heen overerven.
- Geen andere visuele of functionele wijzigingen.

## Geautomatiseerd bewijs en open acceptatie

Een nieuwe test bevestigt dat de gebouwde bundel naar `--ha-view-sections-row-gap` verwijst en niet meer naar het oude vaste `-16px`. Dit is geen vervanging voor visuele verificatie op een echte Home Assistant-frontend — de vorige "join"-poging haalde de geautomatiseerde suite ook, en faalde toch zichtbaar in de praktijk. Bevestig deze fix daarom expliciet visueel voordat hij als opgelost geldt.

## Upgrade en rollback

- Selecteer na publicatie in HACS v0.8.0-alpha.13 en herlaad uitsluitend de frontend van het goedgekeurde testdashboard.
- Controleer op Home (met `navigation_mode` op **integrated** of **kiosk**, waar de header en navigatiebalk samen getoond worden) dat er geen lijn/kier meer zichtbaar is tussen de navigatiebalk en de eronder liggende gekleurde header. Controleer dit zowel op desktop- als mobiele breedte, en in light- en dark-modus.
- Rollback: selecteer v0.8.0-alpha.12 in HACS en herlaad de frontend. Geen configuratiemigratie nodig.
