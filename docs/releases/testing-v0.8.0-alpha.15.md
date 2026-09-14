# Testchecklist v0.8.0-alpha.15

## Scope

Home composeert in geïntegreerde en kioskmodus één gekleurde, responsieve header. Bij minimaal 1200 px beschikbare kaartbreedte staan navigatie, datum/begroeting en statuschips op één rij. Op smallere kaarten stapelen dezelfde onderdelen. Native modus behoudt de zelfstandige header. Geen configuratievelden, dependencies, acties of autorisatiepaden wijzigen.

## Lokale releasegate

- `pnpm test` en `git diff --check`.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser node scripts/check-home-header-row.mjs`: brede rij en mobiele stapeling voor geïntegreerde en kioskmodus, zonder overflow of collision.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser node scripts/check-navigation-browser.mjs`: navigatiegeometrie, configuratie-ingang, admin-gate, kiosk en herstel.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser HD_BROWSER_CHANNEL=chromium HD_RENDER_DIRECTORY=generated/room-controls node scripts/render-room-controls.mjs`: normal/warning/missing/unavailable, light/dark, focus en interactie.
- CI en HACS op de mergecommit; release-assets verifiëren tegen de getagde bundle en checksum.

## Live acceptatie — nog open

Alleen na goedkeuring van het exacte testdashboard en een verse export/snapshot:

- Controleer de ene brede headerregel op de daadwerkelijke beschikbare kaartbreedte, met lange chiplabels en alle gebruikte paletten.
- Controleer responsief stapelen, overflow, toetsenbordfocus, kioskherstel en de native zelfstandige header.
- Acties, confirmations en backendautorisatie blijven ongewijzigd; deze release voert geen live acties uit.

## Rollback

Herinstalleer v0.8.0-alpha.14 en herlaad de frontendresource. Geen configuratiemigratie nodig. Het default dashboard blijft read-only.
