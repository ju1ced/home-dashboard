# Gegenereerde views

`v0.3.0-alpha.1` is de eerste release die de lokale GUI-configuratie omzet in een echt Home Assistant-dashboard. De dashboard strategy maakt vijf stabiele hoofdviews; een afzonderlijke view strategy bouwt iedere view als native Sections-configuratie.

| View | Inhoud in deze alpha |
|---|---|
| Home | Vandaag, personen, Security met alle camera's, maximaal vier kameringangen en geactiveerde specialistnamen |
| Kamers | iedere geconfigureerde kamer met de geselecteerde licht-, cover-, klimaat-, comfort-, media-, safety-, camera- en powerstates |
| Energie | geselecteerde elektriciteit-, zon-, batterij-, gas-, water-, apparaat-, EV-, UPS-, piek- en fasebronnen plus route naar het standaard Energy-panel |
| Domeinen | via kamers geselecteerde states opnieuw gegroepeerd per functie |
| Meer | configuratieaantallen en geactiveerde specialistcategorieën |

De ingestelde `start_view` wordt als eerste gegenereerd; de overige vier volgen de GUI-volgorde zonder numerieke paden. Lege optionele groepen verdwijnen of krijgen een korte configuratiehint.

## Read-only contract

Deze alpha is bedoeld om echte informatie, routes en responsive gedrag veilig te beoordelen:

- tile- en camerakaarten hebben `tap_action`, `hold_action` en `double_tap_action` op `none`;
- alleen knoppen met `navigate` zijn actief;
- geconfigureerde actionsequences worden niet naar Lovelace-kaarten gekopieerd;
- de strategy roept geen Home Assistant-service, WebSocket-write of dashboardwrite aan;
- een ongeldige of toekomstige configuratie levert de bestaande veilige foutpreview.

## Bewuste vervolgstappen

- Home-aandacht, actieve uitzonderingen, quick actions en volledige privacybediening volgen in de Home/security-release.
- De eerste cameraweergave gebruikt native responsive cards. `hidden` verbergt de camera dynamisch bij `unavailable`/`unknown`; `placeholder` en `last_image` gebruiken voorlopig de native camerafout-/snapshotweergave. De definitieve horizontaal scrollbare 1..n-strook en volledige streamfallbacks krijgen een afzonderlijke UX- en accessibilitygate.
- Kamerdetails, volledige Energy-pariteit en specialistische Kia-, robot-, tuin- en zwembadcards volgen in hun eigen PR en prerelease.
- De native weather-card bepaalt in deze alpha zelf de zichtbare forecastlengte; de geconfigureerde forecastlimiet blijft alvast in schema v1 bewaard.
- `theme_mode` en `mobile_disclosure` blijven in schema v1 bewaard; deze shell-alpha erft het actieve HA-thema en gebruikt de native responsive Sections-layout.
- `language: en` bewaart de configuratiekeuze, maar de gegenereerde shelllabels zijn in deze eerste testrelease nog Nederlands.
- Relatieve interne navigatie wordt expliciet getest op Home Assistant 2026.8.2 voordat detailroutes worden uitgebreid.
