# Testchecklist v0.8.0-alpha.17

## Scope

Deze iteratie vervangt de verplichte Home Assistant-detaildialoog als bedieningspad voor expliciet gemapte kamerfuncties. De room detail card doet beperkte, directe `callService`-acties uitsluitend voor de gemapte entity. Er zijn geen configuratiewrites, automatische targetselectie of Home Assistant-deployment.

Read-only status blijft zichtbaar voor comfortsensoren, veiligheid, camera's, bestaande energiebronnen en historie. Optionele temperatuurhistoriek gebruikt de native `statistics-graph`. Een bureau gebruikt alleen een reeds geïnstalleerde `custom:linak-desk-card`; deze repository levert of registreert die resource niet.

## Veiligheidschecks

- Smart plugs: de eerste actie ontgrendelt alleen; pas de tweede, expliciete bevestiging schakelt het gemapte stopcontact.
- Covers: Open en Dicht vragen een inline tweede bevestiging; Stop voert geen beweging uit en blijft direct beschikbaar.
- Directe acties zijn uitgeschakeld voor missing, unknown en unavailable entities.
- Knoppen hebben een toegankelijke naam met de actie en de naam van het bediende apparaat.
- `desk.card_config.type` kan het vaste `custom:linak-desk-card`-type niet overschrijven.

## Lokale releasegate

- `pnpm test` en `git diff --check`.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser node scripts/check-room-detail-browser.mjs` voor desktop/mobiel en normal/warning/missing/unavailable, inclusief cover- en plugbevestiging.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser node scripts/check-navigation-browser.mjs`.
- `HD_BROWSER_PACKAGES=/tmp/hd-browser HD_BROWSER_CHANNEL=chromium HD_RENDER_DIRECTORY=generated/room-direct-controls node scripts/render-room-controls.mjs`, gevolgd door visuele inspectie.

## Live acceptatie — afzonderlijke gate

Alleen met een exact goedgekeurd testdashboard, een verse export/snapshot en een targetallowlist: controleer de zichtbaarheid van alle geconfigureerde statusbronnen, de inline bevestigingen, temperatuurhistoriek en de aanwezige LINAK-resource. Deze iteratie voert geen live test, deployment of configuratiewrite uit.
