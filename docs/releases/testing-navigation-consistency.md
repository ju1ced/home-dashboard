# Navigatiecorrectie in v0.8.0-alpha.9

PR, merge na groene checks en publicatie als alpha zijn door de eigenaar goedgekeurd. De releasecandidate is v0.8.0-alpha.9; schema v1 blijft ongewijzigd. Deze toestemming omvat geen Home Assistant-write of deployment. Zie de [releasechecklist](testing-v0.8.0-alpha.9.md).

## Wijzigingen

- Eén eerste, volle-breedte navigatiecard op Home, Kamers, Energie, Domeinen, Meer, kamerdetails en Kia. De balk is 66 px hoog; knoppen wisselen niet van positie wanneer de actieve route verandert.
- Home-begroeting en status blijven beschikbaar onder de navigatie, zonder tweede gekleurde balk.
- Kiosk gebruikt een lokale, opruimbare shelladapter in plaats van alleen configuratie voor een externe resource.
- Het tandwiel **Dashboard instellen** opent voor beheerders de native Home Assistant-dashboardeditor. De eigen HA-editor blijft verantwoordelijk voor opslaan, autorisatie en bevestigingen.
- **Home Assistant-balk tonen**, **Kiosk hervatten** en `?disable_km` bieden herstel. Bij onbekende editormarkup verschijnt de HA-balk met uitleg en een dashboardbeheerlink.

## Lokaal reproduceerbaar

Start de statische server met `pnpm run serve`. Playwright en een Chromium-browser moeten beschikbaar zijn; stel `HD_BROWSER_PACKAGES` in op de map met de Playwright-installatie wanneer die buiten de repository staat.

```sh
pnpm test
node scripts/check-navigation-browser.mjs
HD_BROWSER_CHANNEL=chromium HD_RENDER_DIRECTORY=generated/room-controls node scripts/render-room-controls.mjs
git diff --check
```

De nieuwe browsercheck vergelijkt zowel de balk als iedere afzonderlijke knop voor zeven viewtypen bij 390, 1024 en 1440 px. Hij test headerverberging zonder externe kioskresource, het verdwijnen van de headerafstand, de native editorknop en overflow-menuvariant, beheerderszichtbaarheid, toetsenbordactivering, ongewijzigde DOM bij irrelevante updates, herstel bij edit mode en disconnect, de herstelknoppen, URL-herstel en fallback bij ontbrekende editormarkup. De shell is fictief; dit is geen live HA-test.

De bestaande kamerbrowsercheck produceert dertien fictieve renders en controleert normal, warning, missing en unavailable, Home-context, camera-uitlijning, bediening, confirmation, foutpaden, focus, touchdoelen en GUI. Nieuwe lokale screenshots staan onder de gitignored map `generated/`; gepubliceerde alpha.8-baselines zijn niet overschreven.

## Review van scope en grenzen

- **Acties:** navigatie en het openen van bestaande HA-configuratie-UI; geen nieuwe apparaatservice of automatische configuratiewrite.
- **Confirmation en autorisatie:** bestaande kameractiegates ongewijzigd. De configuratie-ingang is alleen zichtbaar voor beheerders; backendautorisatie blijft leidend. Kiosk is geen beveiligingsgrens.
- **Responsive en toegankelijkheid:** dezelfde bronvolgorde, zichtbare focus, benoemde controls en minimaal 44 px touchdoelen. Op mobiel krijgen alle routes een compact label in een vaste knopbreedte. Bij nog smallere vensters kan de balk horizontaal scrollen; er wordt geen route verwijderd.
- **Performance:** HA-stateupdates vervangen de navigatie-DOM niet zolang de beheerderszichtbaarheid gelijk blijft. De kioskobserver kijkt alleen naar de class van de omhullende shell, niet naar alle entity-updates. Cleanup verwijdert de lokale stijl en observer.
- **Fallback:** ontbrekende headerstructuur blijft onaangeroerd. Niet-herkende editorbediening toont de HA-balk met een beheerlink. Externe kioskresources/configuratie blijven ongemoeid en kunnen onafhankelijk verbergen.
- **Compatibiliteit:** de begrensde adapter leest HA-DOM, geen publieke kiosk-API. De huidige `hui-root`-header en native editor-menuconstructie zijn gecontroleerd tegen [de HA-frontendbron](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/hui-root.ts). Dit bewijst geen compatibiliteit met iedere HA-versie of Companion App; onderstaande runtimegate blijft open.

## Nog af te tekenen op Home Assistant

Alleen na expliciete toestemming voor een exact testdashboard, met verse snapshot en rollback. Default `lovelace` blijft read-only.

- [ ] Wissel alle hoofdviews en beschikbare details: balk en knopposities blijven gelijk op desktop, tablet en mobiel.
- [ ] Activeer Kiosk: de HA-bovenbalk en gereserveerde headerhoogte verdwijnen zonder extra kioskresource.
- [ ] Open als beheerder het tandwiel vanaf Home, een andere hoofdview en een subview: de juiste native strategy-editor verschijnt.
- [ ] Controleer niet-beheerder, config opslaan/annuleren, backendweigering en terugkeer naar het dashboard.
- [ ] Controleer HA-balk tonen/hervatten, `?disable_km`, native edit mode en vertrek naar een ander dashboard; andere dashboards houden hun oorspronkelijke shell.
- [ ] Toon de HA-balk tijdelijk en wissel naar een andere view: de nieuwe navigatiecard hervat kiosk. Bevestig dat dit herstel per card/view de gewenste UX is; het is niet cross-view persistent. `?disable_km` blijft wel behouden via de interne navigatielinks.
- [ ] Herhaal op de minimale ondersteunde HA-versie en de geïnstalleerde versie; test eventuele externe kioskconfiguratie afzonderlijk.

Rollback voor een toekomstige testinstallatie: herstel de vooraf bewaarde bundle/resourceversie en dashboardconfiguratie. Tijdelijke frontendtoegang: voeg `?disable_km` toe; selecteer daarna indien nodig **Alleen Home Assistant-balk**. Geen globale resource verwijderen.
