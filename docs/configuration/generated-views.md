# Gegenereerde views

De dashboard strategy maakt vijf stabiele hoofdviews en per geconfigureerde kamer een stabiele subview; een afzonderlijke view strategy bouwt iedere view als Sections-configuratie. `v0.5.0-alpha.1` levert Home/security en Kamers. Energie, Domeinen en Meer behouden bewust hun shell-alpha-inhoud tot hun eigen roadmaprelease.

| View | Inhoud in deze alpha |
|---|---|
| Home | compacte Vandaag- en Gezinblokken, operationele aandacht uit de allowlist, alarmstatus, een brede horizontale camerastrook en compacte navigatie |
| Kamers | hero, compacte kamerkaarten per verdieping en voor iedere kamer een afzonderlijk `room-<key>`-detailpad |
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

- De Home/security-release toont aandacht alleen voor de expliciete operationele allowlist. Actieve kamers, `Nu` en de twee algemene quick actions volgen pas na hun afzonderlijke actiegate; deze alpha blijft read-only.
- De cameracarrousel ondersteunt ieder geconfigureerd aantal camera's, bronvolgorde, muis/touchscroll en toetsenbord, maar toont één beeld per viewport. Privacy-actieve camera's worden niet als beeld getoond en blijven alleen in de compacte statusrail zichtbaar. `hidden` verbergt `unavailable`/`unknown`; `placeholder` en `last_image` gebruiken voorlopig de native camerafout-/snapshotweergave.
- Kamerbediening en quick actions blijven achter hun actiegate; volledige Energy-pariteit en specialistische Kia-, robot-, tuin- en zwembadcards volgen in hun eigen PR en prerelease.
- De native weather-card bepaalt in deze alpha zelf de zichtbare forecastlengte; de geconfigureerde forecastlimiet blijft alvast in schema v1 bewaard.
- `theme_mode` en `mobile_disclosure` blijven in schema v1 bewaard; deze shell-alpha erft het actieve HA-thema en gebruikt de native responsive Sections-layout.
- `language: en` bewaart de configuratiekeuze, maar de gegenereerde shelllabels zijn in deze eerste testrelease nog Nederlands.
- Relatieve interne navigatie wordt expliciet getest op Home Assistant 2026.8.2 voordat detailroutes worden uitgebreid.
