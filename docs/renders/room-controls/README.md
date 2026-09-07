# Kamerbediening — runtime-renders

Deze renders gebruiken de werkelijke v0.8-dashboardbundle met uitsluitend fictieve states, lokale service-stubs en getekende iconen/cameraplaceholder. Het zijn geen screenshots van een woninginstallatie. De oude conceptbaselines in de bovenliggende folder blijven historische referenties.

Start `pnpm run serve` en open `/room-controls.html`. `?theme=dark`, `?fixture=warning`, `?fixture=missing` en `?fixture=unavailable` wisselen de varianten.

Voer `node scripts/render-room-controls.mjs` uit met Playwright beschikbaar. `HD_BROWSER_PACKAGES` mag verwijzen naar de lokale node_modules-map met Playwright; `HD_BROWSER_CHANNEL` kiest een geïnstalleerd Chromium-kanaal (standaard msedge). De klok staat tijdens de test vast op 7 september 2026. Alle afbeeldingen zijn full-page; onderstaande maten zijn de viewports.

| Render | Viewport | Controle |
|---|---|---|
| [Desktop](desktop.png) | 1440×1100 | Afval, voorspelling, vier favorieten, uitgeklapte rolluikbediening |
| [Tablet](tablet.png) | 1024×1100 | Responsieve kaartindeling |
| [Mobiel](mobile.png) | 390×844 | Eén kolom kamers, twee kolommen bediening en afval |
| [Donker](dark.png) | 1440×1100 | Gedeelde statussemantiek met donkere surfaces |
| [Warning](warning.png) | 1440×1100 | Safety buiten favoriete kamers blijft zichtbaar |
| [Missing](missing.png) | 390×844 | Geen fictieve bronwaarde/afvaldatum |
| [Unavailable](unavailable.png) | 390×844 | Bronuitval zichtbaar, geen directe actie |

Browserasserties controleren overflow, afval, afwezigheid van generieke ouderdomsmeldingen, vaste favorieten, exacte calls naar de stub, geen optimistische statewijziging, foutfeedback, luifelbevestiging, stop tijdens een wachtend verzoek, focusbehoud na vermogensupdate en minimaal 44×44 px knoppen. Er traden geen JavaScript-paginafouten op.

De harnasiconen en cameravlakken vervangen alleen native HA-childcards die lokaal niet beschikbaar zijn. Live streams, backendautorisatie en echte apparaten vallen onder de releasechecklist.

Ook GUI-events zijn getest: favoriet, directe bediening en actiedoel blijven na een configuratie-event opgeslagen. Honderd irrelevante updates behouden dezelfde kamer-DOM en ongewijzigde inhoud; de lokale meting bedroeg 55,3 ms.
