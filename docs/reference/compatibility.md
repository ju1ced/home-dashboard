# Compatibility

| Component | Ondersteund in v0.3.0-alpha.2 | Opmerking |
|---|---:|---|
| Home Assistant Core/frontend | 2026.8.2 of nieuwer | 2026.8.2 is de minimale en huidige ontwikkelbaseline |
| HACS | actuele ondersteunde release | custom repository, categorie Dashboard |
| Browser | moderne ES2022-browser | Chrome/Edge/Firefox/Safari-versies die de ondersteunde HA-frontend kan gebruiken |
| Configuratieschema | v1 | toekomstige versies worden geweigerd |
| Kia-card | configuratiecontract | runtime-integratie volgt in v0.7 |
| Robot-card | configuratiecontract | runtime-integratie volgt in v0.8 |
| Tuincard | configuratiecontract | runtime-integratie volgt in v0.9 |
| Zwembadcard | configuratiecontract | zelfstandige card en runtime-integratie volgen in v0.10 |

De editor gebruikt de publieke custom strategy/editorcontracten en native selectors van Home Assistant. De dashboard strategy levert vijf views en een afzonderlijke view strategy bouwt native Sections. Statuskaarten zijn in deze alpha read-only; volledige Home-, kamer-, Energie- en specialistfunctionaliteit volgt per roadmaprelease.
