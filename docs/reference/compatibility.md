# Compatibility

| Component | Ondersteund in v0.8.0-alpha.19 | Opmerking |
|---|---:|---|
| Home Assistant Core/frontend | 2026.8.2 of nieuwer | 2026.8.2 is de minimale en huidige ontwikkelbaseline |
| HACS | lifecycle nog niet opnieuw gevalideerd voor alpha.19 | custom repository, categorie Dashboard; HD-180 legt het volgende geteste bereik vast |
| Browser | Chromium via Playwright 1.63.0 | synthetisch getest; Firefox/WebKit/Safari blijven onderdeel van live compatibilityvalidatie |
| Configuratieschema | v1 | toekomstige versies worden geweigerd |
| Kia-card | `custom:kia-dashboard-card`, versie via configuratie | `specialist-kia` gebruikt de bestaande full-width HACS-card en een native summary; resource-/mappingfallback is beschikbaar |
| Robot-card | prototype-/configuratiecontract | bronrepo-productiepoort en volledige runtime-integratie zijn uitgesteld |
| Tuincard | prototype-/configuratiecontract | bronrepo-audit en volledige runtime-integratie zijn uitgesteld |
| 3D-printer | meegeleverde summary en detailroute | synthetische browserdekking voor normal, warning en unavailable |
| Zwembadcard | meegeleverde read-only summary | statuscontract bevestigd; zelfstandige volledige card en acties zijn uitgesteld |

De editor gebruikt de publieke custom strategy/editorcontracten en native selectors van Home Assistant. De dashboard strategy levert vijf views en een afzonderlijke view strategy bouwt Sections. De camerastrook is een kleine meegeleverde custom card die uitsluitend native camerakaarten samenstelt. De compacte weerpresentatie gebruikt Home Assistants officiële read-only dagelijkse forecastsubscription. De volledige bundle blijft onder de bewaakte grens van 215 kB; acties en uitgestelde specialistische routes behouden hun afzonderlijke roadmap- en veiligheidsstappen.
