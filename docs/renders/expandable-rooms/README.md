# Brede Home-layout en uitklapbare kamerpanelen — v0.8.0-alpha.8

V0.8.0-alpha.8 gebruikt vier Sections-kolommen op brede schermen, plaatst Snel naar onder de afvalophaling en verwijdert Nu actief. De interne hoofdnavigatie staat standaard in de welkomstbalk en gebruikt op alle vervolgpagina's dezelfde vijf routes. De Snel naar-kaarten hebben een duidelijke icoontegel, contextregel en pijl. Native, geïntegreerde en kioskmodus blijven afzonderlijk kiesbaar.

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
| [Bronkeuze](source-tray.png) | 1440×1100 |
| [Geordende acties](ordered-actions.png) | 1440×1100 |
| [Volgorde-editor](editor-ordering.png) | 1440×3074 |
| [Paletkeuze](palette-selector.png) | 1440×1100 |
| [Kamerdetail](room-detail.png) | 1440×1100 |
| [Kiosknavigatie](kiosk-navigation.png) | 1440×1100 |

Alle renders zijn full-page met fictieve states en lokale stubs. Start pnpm run serve, open /room-controls.html en voer scripts/render-room-controls.mjs uit met Playwright beschikbaar via HD_BROWSER_PACKAGES. De klok wordt vastgezet op 7 september 2026; de native iconen en camera zijn lokaal vervangen door getekende placeholders.

Validatie: 70 tests, dertien browserrenders, gelijke boven- en onderlijn voor Vandaag/camera, kamerdetailbreedte boven 1300 px, native `back_path: home`, lokale ordening met één opslagactie, vijf interne kioskroutes, focusherstel en veilige servicecalls. Honderd irrelevante updates vervangen de kamer-DOM niet. Geen live Home Assistant-writes.
