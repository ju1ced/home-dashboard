# Testchecklist v0.8.0-alpha.16

## Scope

Kamerdetailpagina’s hebben een capability-gedreven operationeel overzicht voor geconfigureerde comfort-, verlichting-, opening-, media-, sensor- en veiligheidsbronnen. De rest van de pagina groepeert informatie per domein. Brede layouts gebruiken een hoofd-/zijkolom; mobiele layouts stapelen zonder overlap of clipping. Warning, missing en unavailable blijven zichtbaar als status in plaats van als bedienbaar doel. Bediening opent uitsluitend de standaard Home Assistant-detailvensters.

## Lokale releasegate

- `pnpm test` en `git diff --check`.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser node scripts/check-room-detail-browser.mjs`: normal, warning, missing en unavailable op desktop en mobiel, zonder overflow, collision of onbedoelde bediening.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser node scripts/check-navigation-browser.mjs`: navigatiegeometrie, configuratie-ingang, admin-gate, kiosk en herstel.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser HD_BROWSER_CHANNEL=chromium HD_RENDER_DIRECTORY=generated/room-detail-candidate node scripts/render-room-controls.mjs`: room rendering, focus, touchdoelen en interactie.
- CI en HACS op de mergecommit; release-assets verifiëren tegen de getagde bundle en checksum.

## Live acceptatie — nog open

Alleen na goedkeuring van het exacte testdashboard en een verse export/snapshot:

- Controleer per relevante kamer de samenvatting en de domeingroepering met de werkelijke capabilityconfiguratie.
- Controleer normal, warning, missing en unavailable, plus desktop, tablet en mobiel gedrag met lange labels.
- Controleer toetsenbordfocus, standaard detailvensters en dat er geen extra servicecall of configuratiewrite ontstaat.

## Rollback

Herinstalleer v0.8.0-alpha.15 en herlaad de frontendresource. Geen configuratiemigratie nodig. Het default dashboard blijft read-only.
