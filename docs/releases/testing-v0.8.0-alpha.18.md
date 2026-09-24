# Testchecklist v0.8.0-alpha.18

## Scope

Deze iteratie herordent de kamerdetailpagina op brede schermen naar drie scanbare kolommen: directe bediening en safety/camera's, comfort/historie, en energie/smart plugs/bureau. Op tablet krijgen de capabilities eerst de volle breedte en volgen twee gebalanceerde secundaire kolommen; mobiel stapelt dezelfde groepen in leesvolgorde.

Een kamer kan optioneel `light_switch_entities` bevatten. Die mapping is uitsluitend voor switches die bij de verlichting horen, zoals DreamView; elke configuratie blijft expliciet en schakelt rechtstreeks via de `switch`-service. Oude configuraties zonder deze optionele mapping blijven geldig.

Het bewaakte minified bundlebudget is voor deze iteratie beperkt verhoogd van 212 kB naar 215 kB. `origin/main` bouwt reproduceerbaar tot 211.963 bytes en de kandidaat tot circa 214 kB; `scripts/verify-dist.mjs` bewaakt de nieuwe harde bovengrens.

## Veiligheidschecks

- Smart plugs blijven ontgrendelen plus expliciet bevestigen.
- Covers behouden voor iedere beweging opnieuw inline bevestiging voor Open en Dicht; Stop blijft direct.
- Garage-, poort- en deurcovers en niet-ondersteunde coverservices blijven geblokkeerd.
- Switches reageren alleen op de expliciet gemapte entiteit en zijn uitgeschakeld voor missing, unknown en unavailable.
- Reconfiguratie of disconnect maakt ingeplande servicecalls en verouderde foutfeedback ongeldig.
- Er zijn geen automatische targetselecties, configuratiewrites, live tests of Home Assistant-deployments.

## Lokale releasegate

- `pnpm test` en `git diff --check`.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser node scripts/check-room-detail-browser.mjs`.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser node scripts/check-navigation-browser.mjs`.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser HD_BROWSER_CHANNEL=chromium HD_RENDER_DIRECTORY=generated/room-layout-iteration node scripts/render-room-controls.mjs`, gevolgd door visuele inspectie.

## Lokaal resultaat — 23 september 2026

- Volledige suite groen: 85/85 tests, typecheck, build, dist-, link- en privacychecks.
- Room-detailmatrix groen voor normal, dark, warning, missing en unavailable op 1440, 1024 en 390 px; navigatiegeometrie blijft invariant.
- Dertien verificatierenders gegenereerd en representatief visueel beoordeeld.
- Onafhankelijke security-, actionscope-, accessibility- en lifecycle-review: geen open P0/P1-bevindingen.
- De volledige binary patch is op een verse `origin/main`-archive toegepast en opnieuw gebouwd; de resulterende `dist/home-dashboard.js` is byte-voor-byte gelijk aan de kandidaat (213.998 bytes).

## Rollbackscope

- Voor commit of PR: verwerp uitsluitend deze lokale diff; er is geen externe toestand gewijzigd.
- Na een eventuele merge maar vóór deployment: revert de room-cardwijziging en bouw `dist/home-dashboard.js` opnieuw; configuraties zonder `light_switch_entities` blijven compatibel.
- Na een later afzonderlijk goedgekeurde testdeployment: herstel uitsluitend het testdashboard uit de verse snapshot en plaats de eerder goedgekeurde resourceversie terug. Wijzig of verwijder geen globale resource zonder multi-dashboardaudit.
- Het default dashboard `lovelace`, live mappings en Home Assistant-configuratie zijn in deze slice niet geschreven; productiecutover heeft een eigen gate en rollbackplan.

## Live acceptatie — afzonderlijke gate

Controleer alleen in een vooraf goedgekeurd testdashboard met verse snapshot en targetallowlist: desktopkolommen, mobiele stapelvolgorde, ontbrekende statusbronnen en de gewenste verlichtingsswitch. Deze release voert die live handelingen niet uit.
