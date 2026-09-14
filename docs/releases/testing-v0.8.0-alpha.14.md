# Testchecklist v0.8.0-alpha.14

## Scope

Compactere Home-header bovenop alpha.13 en herstel van de mobiele CSS-parserfout. Geen nieuwe configuratievelden, dependencies, acties of autorisatiepaden. Publicatie is door de eigenaar goedgekeurd; deployment en live HA-acceptatie niet.

## Lokale releasegate

- `pnpm test` en `git diff --check`.
- `node scripts/check-home-header-spacing.mjs`: desktop/tablet/mobiel, integrated/kiosk/native, standaard en aangepaste HA-sectieafstand.
- `node scripts/check-navigation-browser.mjs`: vaste navigatiegeometrie, configuratie-ingang, admin-gate, kiosk en herstel.
- `HD_BROWSER_CHANNEL=chromium HD_RENDER_DIRECTORY=generated/room-controls node scripts/render-room-controls.mjs`: normal/warning/missing/unavailable, light/dark en toetsenbord/focus.
- CI en HACS op PR en mergecommit; release-assets controleren tegen de getagde bundle en checksum.

Zie [detailbewijs en reproduceerbare stappen](testing-header-spacing.md).

## Live acceptatie — nog open

Alleen na goedkeuring van het exacte testdashboard en verse export/snapshot:

- Controleer de naad tussen navigatie en Home en de compacte begroetingsinset.
- Controleer lange statuslabels, mobiele chipstapeling, alle gebruikte paletten en overflow.
- Controleer ongewijzigde navigatieposities, toetsenbordfocus, kioskherstel en native zelfstandige header.
- Acties, confirmations en backendautorisatie blijven ongewijzigd; deze release voert geen live acties uit.

## Rollback

Herinstalleer v0.8.0-alpha.13 en herlaad de frontendresource. Geen configuratiemigratie nodig. Het default dashboard blijft read-only.
