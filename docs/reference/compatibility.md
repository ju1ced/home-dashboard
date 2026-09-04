# Compatibility

| Component | Ondersteund in v0.7.0-alpha.2 | Opmerking |
|---|---:|---|
| Home Assistant Core/frontend | 2026.8.2 of nieuwer | 2026.8.2 is de minimale en huidige ontwikkelbaseline |
| HACS | actuele ondersteunde release | custom repository, categorie Dashboard |
| Browser | moderne ES2022-browser | Chrome/Edge/Firefox/Safari-versies die de ondersteunde HA-frontend kan gebruiken |
| Configuratieschema | v1 | toekomstige versies worden geweigerd |
| Kia-card | `custom:kia-dashboard-card`, versie via configuratie | `specialist-kia` gebruikt de bestaande full-width HACS-card en een native summary; resource-/mappingfallback is beschikbaar |
| Robot-card | configuratiecontract | runtime-integratie volgt in v0.8 |
| Tuincard | configuratiecontract | runtime-integratie volgt in v0.9 |
| Zwembadcard | configuratiecontract | zelfstandige card en runtime-integratie volgen in v0.10 |

De editor gebruikt de publieke custom strategy/editorcontracten en native selectors van Home Assistant. De dashboard strategy levert vijf views en een afzonderlijke view strategy bouwt Sections. De camerastrook is een kleine meegeleverde custom card die uitsluitend native camerakaarten samenstelt. De compacte weerpresentatie gebruikt Home Assistants officiële read-only dagelijkse forecastsubscription. De Kia-integratielaag houdt een harde minified bundlelimiet van 168 kB aan; Kia-acties en de overige specialistische routes behouden hun afzonderlijke roadmap- en veiligheidsstappen.
