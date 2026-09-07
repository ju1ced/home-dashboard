# Uitklapbare kamerpanelen — lokale werkversie

Werkversie v0.8.0-alpha.2, nog niet gepubliceerd. Home gebruikt de beschikbare breedte. Klik op een kamerkop om de chips te tonen; alleen Volledige kamer navigeert. Airco / verwarming gebruikt de bestaande klimaatbron en opent het native HA-detailvenster op Home.

De vier bestaande directe actiedoelen behouden hun opt-in en veiligheidsregels. Zonder actiedoel zijn bestaande licht-, media- en covermappings bereikbaar als detailchips; meerdere bronnen tonen een keuzelijst. Hieruit worden nooit automatisch directe actiedoelen gemaakt. De luifel blijft afzonderlijk expliciet gemapt.

Bij meerdere apparaten gebruikt de chip alle bronstates voor de actieve kleur en de aantallen. Browserchecks dekken ook een uitgeschakeld eerste apparaat met een actief tweede apparaat, en de overgang naar unavailable.

| Render | Viewport |
|---|---|
| [Desktop](desktop.png) | 1440×1100 |
| [Tablet](tablet.png) | 1024×1100 |
| [Mobiel](mobile.png) | 390×844 |
| [Donker](dark.png) | 1440×1100 |
| [Warning](warning.png) | 1440×1100 |
| [Missing](missing.png) | 390×844 |
| [Unavailable](unavailable.png) | 390×844 |

Alle renders zijn full-page met fictieve states en lokale stubs. Start pnpm run serve, open /room-controls.html en voer scripts/render-room-controls.mjs uit met Playwright beschikbaar via HD_BROWSER_PACKAGES. De klok wordt vastgezet op 7 september 2026; de native iconen en camera zijn lokaal vervangen door getekende placeholders.

Validatie: 62 tests, zeven browser-renders, toetsenbordbediening (Enter/Escape), focusherstel, behoud van uitgeklapte toestand bij updates, klimaatdetail-event zonder servicecall of navigatie, legacy bronkeuze zonder directe acties, bestaande action-/foutchecks, GUI-opslag en een Home-breedte boven 1300 px op een 1440 px viewport. Honderd irrelevante updates vervangen de kamer-DOM niet. Geen live Home Assistant-writes.
