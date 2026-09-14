# Testrelease v0.8.0-alpha.10 — gekleurde Home-header

## Testscope

- De vaste volle-breedte navigatiebalk behoudt op alle vijf hoofdviews, kamerdetails en Kia dezelfde maat en knopposities.
- Home toont daaronder een gekleurde header: datum en begroeting gecentreerd op brede schermen, met de drie statuschips rechts; op mobiel blijven alle onderdelen zichtbaar in één gestapelde header.
- Kiosk verbergt de native HA-header zonder extra frontendresource; interne navigatie, de native editoringang en de herstelopties blijven beschikbaar.
- Schema v1, bestaande actiebeveiliging en de read-only-grens van het default dashboard veranderen niet.

## Geautomatiseerd bewijs en open acceptatie

De fictieve suite controleert headerkleur, tekstcontrast, radius, padding, centrering, chipuitlijning en containment op desktop en mobiel. Zij dekt normal, warning, missing, unavailable, light, dark, kiosk en native navigatie af. De [volledige testscope](testing-navigation-consistency.md) beschrijft kiosk, editor, herstel, toegankelijkheid en runtimegrenzen.

Dit is geen live Home Assistant-acceptatie. Voor een runtime-test is afzonderlijk vereist: een exact goedgekeurd testdashboard, een verse snapshot met rollbackpad en een menselijke gate. Default `lovelace` blijft read-only.

## Upgrade en rollback

- Selecteer na publicatie in HACS v0.8.0-alpha.10 en herlaad uitsluitend de frontend van het goedgekeurde testdashboard.
- Controleer de vaste navigatie en de gekleurde Home-header op desktop, tablet en mobiel. Test kiosk, **Dashboard instellen**, **Home Assistant-balk tonen**, **Kiosk hervatten** en `?disable_km`.
- Rollback: selecteer v0.8.0-alpha.9 in HACS en herlaad de frontend. Herstel zo nodig de vooraf gemaakte privéconfiguratiebackup.
- Verwijder geen globale resource; deze release wijzigt geen externe kioskconfiguratie.