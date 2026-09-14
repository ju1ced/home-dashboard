# Home-header — compacte aansluiting na alpha.13

## Scope

Testcandidate v0.8.0-alpha.14 op basis van v0.8.0-alpha.13; publicatie is goedgekeurd. Alleen Home-layout en browserbewijs; geen configuratie-, actie- of autorisatiewijziging. Bestaande confirmations en backendautorisatie blijven intact.

De gekleurde vlakken sloten in het harnas al aan, maar de begroeting had nog 24 px bovenpadding. Geïntegreerde/kiosknavigatie gebruikt nu 8 px bovenpadding en 16 px onderpadding. De begroeting blijft bovenaan uitgelijnd wanneer statuschips rechts over meerdere regels lopen. Mobiel blijft de chipgroep onder de begroeting met 12 px tussenruimte. Een ontbrekend sluithaakje in de mobiele gridregel is hersteld: volgende mediaregels werden door de browser genegeerd.

## Reproduceerbaar bewijs

Start `pnpm run serve`. Met Playwright beschikbaar via `HD_BROWSER_PACKAGES`:

- `node scripts/check-home-header-spacing.mjs`: 390, 1024 en 1440 px; integrated/kiosk/native; 24 en 32 px gesimuleerde HA-sectieafstand. Voor de fix faalde de assertion op 24 px bovenruimte; daarna 8 px, een naad van 0 px en ongewijzigde navigatiehoogte van 66 px. Native padding blijft 24 px op desktop en 18 px op mobiel.
- `node scripts/check-navigation-browser.mjs`: navigatiegeometrie, editor, admin-gate, kiosk en herstel.
- `HD_BROWSER_CHANNEL=chromium HD_RENDER_DIRECTORY=generated/room-controls node scripts/render-room-controls.mjs`: bestaande normal/warning/missing/unavailable, light/dark, focus- en interactiematrix.
- `pnpm test` en `git diff --check`.

Renders staan gitignored in `generated/header-spacing/` en `generated/room-controls/`. Dit is fictief browserbewijs, geen echte HA Sections-render. Geen nieuwe dependencies in het product of verhoogd bundlebudget.

## Open acceptatie en herstel

Na afzonderlijke testdashboardgoedkeuring: controleer op de echte HA-frontend de aansluiting, vaste navigatiepositie, mobiele chipstapeling en lange statuslabels in alle gebruikte paletten. Verifieer dat native modus een zelfstandige header houdt. Geen HA-write is tijdens deze ontwikkeling uitgevoerd. Rollback: terug naar v0.8.0-alpha.13; geen configuratiemigratie nodig.
