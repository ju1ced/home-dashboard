# Testrelease v0.8.0-alpha.8 — duidelijke kiosk- en interne navigatie

Deze candidate maakt de interne navigatie standaard zichtbaar in de gekleurde balk. De vijf routes zijn Home, Kamers, Energie, Domeinen en Meer. De specialistische links onder de afvalophaling vullen de rij en tonen een icoontegel, contextregel en pijl.

## Te controleren

- Home toont de vijf interne routes in de begroetingsbalk; Home is duidelijk actief.
- Kamers, Energie, Domeinen, Meer en kamerdetails tonen dezelfde navigatie met de juiste actieve route.
- Op mobiel blijven alle routes bereikbaar en blijft de naam van de actieve route zichtbaar.
- **Dashboard bewerken → Layout → Navigatie** biedt In de gekleurde balk, Kiosk: HA-balk verbergen en Alleen Home Assistant-balk.
- Kiosk levert dezelfde interne routes en verbergt de HA-bovenbalk wanneer de optionele `kiosk-mode` frontendresource aanwezig is.
- Auto, Robot, Tuin en Zwembad tonen alleen als ze geconfigureerd zijn; de zichtbare kaarten verdelen samen de volledige rij.
- Iedere specialistische kaart toont een contrastrijke icoontegel, contextregel en pijl, en navigeert naar de bestaande detailroute.

## Lokaal bewijs en grenzen

Zeventig geautomatiseerde tests en dertien browserrenders gebruiken uitsluitend fictieve data. De minified bundle blijft onder de harde grens van 198 kB. Fixtures maken geen verbinding met Home Assistant en voeren geen live servicecall uit.

Rollback: selecteer via HACS `v0.8.0-alpha.7` en herlaad de frontend.
