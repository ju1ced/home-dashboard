# Testresultaat HD-111 — Live acceptatie van v0.8.0-alpha.29

## Status

**Gedeeltelijk geslaagd op 7 oktober 2026**, uitgevoerd op het door de eigenaar expliciet aangewezen testdashboard (`home-dashboard`, url_path `home-dashboard` — niet het default `lovelace`-dashboard). Doelallowlist voor deze ronde: alleen de lichten van kamer "Bureau" mochten daadwerkelijk geschakeld worden; alle andere controles bleven read-only verificatie.

Vóór elke write: een volledige HA-snapshot (`backup_id 229833a3`). Na afloop: default `lovelace`'s config-hash bevestigd ongewijzigd (`6fb98f13455f14a9`, 453.201 bytes — identiek vóór en na deze sessie).

## Checklistresultaten

| Checklistitem | Resultaat |
|---|---|
| **Installatie/update** | **Bevinding, gefixt tijdens deze ronde** — zie hieronder. Specialistische HACS-afhankelijkheden (Kia Connect Dashboard, Robot Vacuum Dashboard, Garden Dashboard Card, Pool Dashboard Card) zijn stuk voor stuk bevestigd correct gepind, geen drift. |
| **Dashboardeditor** | Niet visueel herbevestigd deze ronde — er is geen browser-/screenshotautomatisering beschikbaar in deze sessie. Functioneel/structureel gedrag blijft doorlopend bewezen door de bestaande CI-browserregressiematrix tegen exact dezelfde, nu live geïnstalleerde broncode (v0.8.0-alpha.29). |
| **Vijf routes en subviews** | Structureel bevestigd: `layout.view_order` bevat alle vijf verwachte routes, kamer-subviews blijven stabiel per kamersleutel. Dezelfde garantie als hierboven: bewezen door CI tegen de live versie, niet opnieuw visueel bevestigd (geen browserautomatisering). |
| **Room-cardgedrag** | **Live bevestigd met een echte apparaatbediening.** Kamer "Bureau": vóór de test alle zes lichtentiteiten uitgelezen, één licht (dat vooraf uit stond) aan- en weer uitgezet via de echte licht-service (aan/uit), staat bevestigd na elke stap, en alle zes lichten staan na afloop exact in hun oorspronkelijke toestand. Overige kamerconfiguratie (covers, luifel, media, hvac, smart plugs) structureel gevalideerd zonder fouten. |
| **Navigation/kioskherstel** | `layout.navigation_mode: "kiosk"` bevestigd geconfigureerd. Daadwerkelijk hersteloprijdrag na een herstart van de kiosk-app/-sessie vereist een echte browser- of companion-app-sessie — niet testbaar via deze API-only sessie. **Blijft open voor een menselijke test.** |
| **Home-header** | Structureel bevestigd: weerentiteit, twee personen, beveiliging met drie camera's, quick actions allemaal correct geconfigureerd. Visuele bevestiging: zelfde beperking als hierboven. |
| **Specialistische routes** | Alle vijf specialisten (Kia, 3D-printer, robotstofzuiger, tuin, zwembad) staan ingeschakeld met het juiste `card_type` en nul validatiefouten. Hun externe HACS-kaartafhankelijkheden zijn stuk voor stuk bevestigd geïnstalleerd en correct gepind. |
| **Live configuratievalidatie** (extra, niet expliciet in de oorspronkelijke scope maar wel uitgevoerd) | De volledige, echte 19-kamer-configuratie door `compileConfig()`/`validateConfig()`/`validateConfigSchema()` gehaald: **nul schemafouten, nul semantische fouten.** Tien al bekende, niet-blokkerende waarschuwingen (vijf kamers zonder power-apparaten — terecht, die kamers hebben er simpelweg geen; vijf specialisten zonder gepinde minimumversie — een al gedocumenteerde, bestaande hiaat, niets nieuws). |
| **Default `lovelace` aantoonbaar ongewijzigd** | **Bevestigd.** Config-hash en -grootte identiek vóór en na deze volledige sessie. |

## Bevinding — HACS volgde opnieuw `main` in plaats van de getagde release

Bij de start van deze ronde bleek HACS de `home-dashboard`-repository weer op `ref: "main"` te volgen (geïnstalleerd op commit `21d6a79`, zelfs ouder dan `v0.8.0-alpha.28`) in plaats van gepind te blijven op een releasetag — exact dezelfde regressie die D-069 (HD-180) op 6 oktober 2026 al eerder vaststelde en oploste. Tijdens deze sessie opnieuw expliciet vastgepind op `tags/v0.8.0-alpha.29`, bevestigd via een onafhankelijke herlezing. Dit is nu de **tweede keer** dat dezelfde drift optreedt — de onderliggende oorzaak (waarom de pin niet standhoudt) is nog niet gevonden. Vastgelegd als een nieuw, op zichzelf staand HD-112-subticket (zie `tickets.md`) in plaats van simpelweg herhaaldelijk te herpinnen zonder de kernvraag te beantwoorden.

## Niet geverifieerd deze ronde — vereist een aparte menselijke/browsersessie

- Visuele weergave van alle vijf routes en kamer-subviews in een echte browser (geen screenshot-/browserautomatisering beschikbaar in deze MCP-sessie).
- De dashboardeditor's interactieve gedrag in de echte, ingebedde Home Assistant-context (wel gedekt door de bestaande CI-browsermatrix, niet live herbevestigd).
- Kiosk-navigatieherstel na een echte app-/sessieherstart.
- HD-217's periodesensor-opzoekfunctie tegen een echte Home Assistant-instantie — ondertussen gecorrigeerd naar een REST-optionsflow-aanpak (D-081, `v0.8.8`) nadat bleek dat de oorspronkelijke `hass.callWS`-aanname niet klopte; nog steeds niet live bevestigd, expliciet al vastgelegd als open vraag in HD-217 zelf.

## Gate

Dit resultaat sluit HD-111 **niet volledig af** — de hierboven genoemde visuele/interactieve punten blijven open voor een menselijke browsersessie, en de HACS-driftoorzaak blijft een open onderzoeksvraag onder het nieuwe HD-112-subticket. Alle overige checklistitems zijn met concreet bewijs afgerond: geen regressie op het default dashboard, een echte geslaagde apparaatbediening, en een foutloze validatie van de volledige live configuratie.

## Vervolgronde — 15 oktober 2026, tegen `v0.8.8`

Uitgevoerd als onderdeel van het hervatten van de openstaande kanban-tickets, na een reeks releases (`v0.8.2` t/m `v0.8.8`) sinds de vorige ronde. Uitsluitend read-only MCP-verificatie (geen HA-write, geen snapshot nodig) — geen browser-/screenshotautomatisering beschikbaar in deze sessie, dus dezelfde drie visuele/interactieve punten blijven om dezelfde reden open.

| Checklistitem | Resultaat |
|---|---|
| **HACS-pin, geen drift (vervolg op HD-112-bevinding)** | **Bevestigd stabiel.** `home-dashboard` staat gepind op `v0.8.8` (`installed_version`/`available_version` identiek, `pending_update: false`) — geen terugval naar `main` deze ronde, bij geen van de zes tussentijdse releases deze sessie (`v0.8.2`–`v0.8.8`). De drie externe specialist-HACS-afhankelijkheden (Kia Connect Dashboard, Robot Vacuum Dashboard, Garden Dashboard Card) staan alle drie nog correct gepind, geen pending updates. (De 3D-printer- en zwembadspecialisten zijn eigen, interne `custom:home-dashboard-*-summary`-kaarten — geen externe HACS-afhankelijkheid, dus niet afzonderlijk te pinnen.) |
| **Live configuratievalidatie, herhaald tegen de huidige codebase** | De volledige, echte 19-kamer-configuratie (ongewijzigd t.o.v. de vorige ronde) opnieuw door `migrateConfig()`/`compileConfig()`/`validateConfig()`/`validateConfigSchema()` gehaald — nu tegen `v0.8.8`'s schema/validator, die sinds de vorige ronde substantieel is uitgebreid (HD-216 t/m HD-223). **Nul migratieproblemen, nul schemafouten, nul semantische fouten.** Dezelfde tien niet-blokkerende waarschuwingen als de vorige ronde (vijf kamers zonder power-apparaten, vijf specialisten zonder gepinde minimumversie) — geen nieuwe waarschuwingen, geen regressie in achterwaartse compatibiliteit ondanks de vele schemawijzigingen sinds 7 oktober. |
| **Default `lovelace` dashboard** | Config-hash en -grootte zijn **niet meer identiek** aan de 7 oktober-baseline (`6fb98f13455f14a9`/453.201 bytes → nu anders, nieuwe baseline vastgelegd hieronder). Dit is **geen regressie van dit project**: er is deze sessie geen enkele `ha_config_set_dashboard`-aanroep (of andere write) tegen het default dashboard uitgevoerd — alleen read-only HACS-herpinning en configuratielezingen. De drift komt van elders (de eigenaar se eigen, aan dit project ongerelateerde dashboardgebruik tussen 7 en 15 oktober). Vastgelegd als nieuwe baseline voor een volgende vergelijking, niet als bevinding om op te lossen. |
| **HD-217's opzoekfunctie (correctie, D-081)** | Nog niet live tegen een echte Home Assistant-instantie bevestigd — dit blijft het eerstvolgende concrete testpunt zodra er een menselijke sessie met een echte browser/editor beschikbaar is (zie testchecklist `v0.8.8`). |

**Nieuwe baseline voor default `lovelace`:** config-hash `d06672da79509e12`, 453.172 bytes, vastgesteld 15 oktober 2026 — te gebruiken als vergelijkingspunt bij de volgende live-acceptatieronde, in plaats van de verouderde 7 oktober-waarde.

**Nog steeds open, ongewijzigd:** de drie punten die een echte menselijke browser-/app-sessie vereisen (visuele weergave van de vijf routes/subviews, de dashboardeditor se interactieve gedrag in de echte HA-context, en kiosk-navigatieherstel na een echte herstart) — geen van deze is via een MCP-only sessie te bewijzen. HD-217's opzoekfunctie komt daar nu als vierde, nieuw punt bij (zie hierboven).
