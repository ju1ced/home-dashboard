# Testchecklist v0.8.0-alpha.18

## Scope

Deze iteratie herordent de kamerdetailpagina op brede schermen naar drie scanbare kolommen: directe bediening en safety/camera's, comfort/trend/historie, en energie/smart plugs/bureau. Mobiel stapelt dezelfde groepen in leesvolgorde.

Een kamer kan optioneel `light_switch_entities` bevatten. Die mapping is uitsluitend voor switches die bij de verlichting horen, zoals DreamView; elke configuratie blijft expliciet en schakelt rechtstreeks via de `switch`-service. Oude configuraties zonder deze optionele mapping blijven geldig.

## Veiligheidschecks

- Smart plugs blijven ontgrendelen plus expliciet bevestigen.
- Covers behouden inline bevestiging voor Open en Dicht; Stop blijft direct.
- Switches reageren alleen op de expliciet gemapte entiteit en zijn uitgeschakeld voor missing, unknown en unavailable.
- Er zijn geen automatische targetselecties, configuratiewrites, live tests of Home Assistant-deployments.

## Lokale releasegate

- `pnpm test` en `git diff --check`.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser node scripts/check-room-detail-browser.mjs`.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser node scripts/check-navigation-browser.mjs`.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser HD_BROWSER_CHANNEL=chromium HD_RENDER_DIRECTORY=generated/room-layout-iteration node scripts/render-room-controls.mjs`, gevolgd door visuele inspectie.

## Live acceptatie — afzonderlijke gate

Controleer alleen in een vooraf goedgekeurd testdashboard met verse snapshot en targetallowlist: desktopkolommen, mobiele stapelvolgorde, ontbrekende statusbronnen en de gewenste verlichtingsswitch. Deze release voert die live handelingen niet uit.
