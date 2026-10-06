# Compatibility

| Component | Ondersteund in v0.8.0-alpha.28 | Opmerking |
|---|---:|---|
| Home Assistant Core/frontend | 2026.8.2 of nieuwer | 2026.8.2 blijft de minimale ontwikkelbaseline; live geverifieerd tegen Core 2026.9.4 (HAOS 18.3) op 6 oktober 2026 (HD-180) |
| HACS | 2.0.5, volledige lifecycle live gevalideerd op 6 oktober 2026 (HD-180) | custom repository, categorie Dashboard; install/update/downgrade/verwijdering/herinstallatie allemaal bevestigd tegen `v0.8.0-alpha.27`/`v0.8.0-alpha.28`, tag-gepind (`ref: tags/v0.8.0-alpha.28`), geen wijziging aan het default `lovelace`-dashboard |
| Browser | Chromium via Playwright 1.63.0 | synthetisch getest; Firefox/WebKit/Safari blijven onderdeel van live compatibilityvalidatie |
| Configuratieschema | v1 | toekomstige versies worden geweigerd |
| Hoofdbundel | 213.000 → 215.000 bytes budget (D-066), gemeten 214.427 bytes | editorbundel apart budget 160.000 bytes (D-055), gemeten 94.077 bytes |
| Kia-card | `custom:kia-dashboard-card`, versie via configuratie | `specialist-kia` gebruikt de bestaande full-width HACS-card en een native summary; resource-/mappingfallback is beschikbaar |
| Robot-card | prototype-/configuratiecontract | bronrepo-productiepoort en volledige runtime-integratie zijn uitgesteld |
| Tuincard | prototype-/configuratiecontract | bronrepo-audit en volledige runtime-integratie zijn uitgesteld |
| 3D-printer | meegeleverde summary en detailroute | synthetische browserdekking voor normal, warning en unavailable |
| Zwembadcard | meegeleverde read-only summary | statuscontract bevestigd; zelfstandige volledige card en acties zijn uitgesteld |

De editor gebruikt de publieke custom strategy/editorcontracten en native selectors van Home Assistant. De dashboard strategy levert vijf views en een afzonderlijke view strategy bouwt Sections. De camerastrook is een kleine meegeleverde custom card die uitsluitend native camerakaarten samenstelt. De compacte weerpresentatie gebruikt Home Assistants officiële read-only dagelijkse forecastsubscription. Acties en uitgestelde runtimekoppelingen blijven achter expliciete allowlists en testgates.
