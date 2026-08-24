# Compatibility

| Component | Ondersteund in v0.5.0-alpha.8 | Opmerking |
|---|---:|---|
| Home Assistant Core/frontend | 2026.8.2 of nieuwer | 2026.8.2 is de minimale en huidige ontwikkelbaseline |
| HACS | actuele ondersteunde release | custom repository, categorie Dashboard |
| Browser | moderne ES2022-browser | Chrome/Edge/Firefox/Safari-versies die de ondersteunde HA-frontend kan gebruiken |
| Configuratieschema | v1 | toekomstige versies worden geweigerd |
| Kia-card | configuratiecontract | runtime-integratie volgt in v0.7 |
| Robot-card | configuratiecontract | runtime-integratie volgt in v0.8 |
| Tuincard | configuratiecontract | runtime-integratie volgt in v0.9 |
| Zwembadcard | configuratiecontract | zelfstandige card en runtime-integratie volgen in v0.10 |

De editor gebruikt de publieke custom strategy/editorcontracten en native selectors van Home Assistant. De dashboard strategy levert vijf views en een afzonderlijke view strategy bouwt Sections. De camerastrook is een kleine meegeleverde custom card die uitsluitend native camerakaarten samenstelt. De compacte weerpresentatie gebruikt Home Assistants officiële read-only dagelijkse forecastsubscription. Statuskaarten zijn in deze alpha read-only; kamer-, Energie- en specialistfunctionaliteit volgt per roadmaprelease.
