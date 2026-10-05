# Performancebaseline (HD-171)

Peildatum: 2 oktober 2026. Dit document legt de eerste gemeten performancebaseline en bijbehorende budgetten vast voor parse/evaluatie, DOM-grootte, long tasks, in-repo navigatietiming en rerendercost (koude/warme cache, relevante/irrelevante stateupdates). Bundlebyte-budgettering is al opgelost (`scripts/verify-dist.mjs`, D-055/D-059) en blijft hier ongewijzigd.

## Methode

- **Runner:** `scripts/check-performance-baseline.mjs`, Playwright 1.63.0, Chromium (bundled, versie `153.0.8010.12`), headless, standaardviewport, geen netwerk-throttling.
- **Hardware:** lokale Linux-VM (`12th Gen Intel(R) Core(TM) i9-12900HK`, 2 vCPU's beschikbaar aan de sandbox) — **geen CI-runner**. Dit is geen cross-machine baseline; de hieronder afgeleide budgetten zijn alleen geldig op vergelijkbare hardware onder dezelfde methode.
- **Fixtures:** uitsluitend fictieve identifiers via `window.roomFixture.ref(...)`/`put(...)` (dezelfde conventie als `scripts/render-room-controls.mjs` en `scripts/check-room-detail-browser.mjs`), of letterlijk via `["domain","key"].join(".")` zodat `scripts/privacy-patterns.mjs` ze niet als mogelijke echte entity-ID's markeert.
- **Klok:** gepind op `2026-09-07T08:00:00+02:00`, dezelfde conventie als `scripts/render-room-controls.mjs`, zodat datum-/afvallabels en dus DOM-tellingen deterministisch blijven.
- **Herhalingen:** 5 herhalingen per meting; gerapporteerd als mediaan en max (nooit alleen een gemiddelde, zodat een slechte uitschieter niet wordt weggemiddeld).
- **Wat NIET gemeten is, en waarom:** `prototype/index.html`/`app.js` (het statische ontwerpprototype) laadt `dist/home-dashboard.js` nooit en implementeert geen enkele client-side router (geverifieerd door de broncode te lezen: geen `pushState`/`popstate`/navigatielogica, alleen querystring-gedreven server-side-achtige rendering bij page-load). Elke meting hieronder gebruikt daarom uitsluitend `prototype/room-controls.html`, dat `dist/home-dashboard.js` echt laadt en de echte custom elements mount (dezelfde aanpak als `scripts/check-room-detail-browser.mjs` en `scripts/render-room-controls.mjs`).

## Scopebeslissingen (expliciet, voor de lead)

1. **Geen losse "Domeinen"/"Security"-component bestaat.** `buildDomainSections()` (`src/cards/home-dashboard-energy-domain-cards.ts`) en het grootste deel van `buildEnergySections()` genereren uitsluitend *native* Home Assistant Lovelace-kaarttypes (`grid`, `tile`, `button`, `markdown`, `history-graph`, `energy-*`) — geen eigen shadow DOM. Die kunnen niet gerenderd worden zonder een live HA-frontend. Gemeten is daarom alleen wat dit project zelf als custom element op die routes levert:
   - **Energie** → de `home-dashboard-energy-overview` "Nu"-kaart (de rest van de Energie-view is native HA).
   - **Security** → de `.security-panel`-subtree die al binnen de **Home**-mount zit (`home-dashboard-home-overview`); er is geen losse Security/Domeinen-pagina om te mounten. De Home-rerendermeting dekt deze subtree dus al mee.
   - **Domeinen** (het landingsscherm met specialistlinks) is zelf 100% native HA-kaarten; alleen de specialistsamenvattingskaarten die er vandaan linken (Kia/printer/pool) zijn eigen shadow DOM. Hiervan is **pool** gemeten als representatieve specialist.
2. **Geen client-side router bestaat.** "Navigatie" is daarom gemeten als de twee echte client-side wissels die dit project wél zelf implementeert (kamerdetail-tabwissel en capability-railwissel), plus één synthetische harnas-componentswap (unmount/mount/`setConfig`/`hass`) als proxy voor een routewissel. Een echte top-level routewissel wordt door Home Assistants eigen frontend-shell afgehandeld en kan niet gemeten worden zonder een live HA-omgeving — dit blijft een aparte, niet in deze baseline gedekte gate.
3. **Kamerdetail licht vs. zwaar:** "licht" = fixtureroom `hall` (alleen `safety_entities`, 69 DOM-nodes); "zwaar" = fixtureroom `room_0`/Woonkamer (alle capabilities: lichtgroepen, getypeerde covers, klimaat, media, smart plugs met drie periodes, `room_energy`, foto, 181 DOM-nodes).

## Gemeten getallen

### DOM-grootte (nodecount, inclusief shadow roots, enkelvoudige meting na settle)

| View | Component | Nodes |
|---|---|---|
| Home | `home-dashboard-home-overview` (volledige fixture, incl. security-panel) | 513 |
| Kamers | `home-dashboard-room-overview` | 363 |
| Kamerdetail licht | `home-dashboard-room-detail` (room `hall`) | 69 |
| Kamerdetail zwaar | `home-dashboard-room-detail` (room `room_0`) | 181 |
| Energie | `home-dashboard-energy-overview` | 37 |
| Specialist (pool) | `home-dashboard-pool-summary` | 30 |
| Security (subtree van Home) | `.security-panel` binnen `home-dashboard-home-overview` | 35 |

### Long tasks (PerformanceObserver, `buffered:true`, drempel 50ms) tijdens initiële mount

Alle zes gemeten views: **0 long tasks** tijdens de initiële mount, op deze hardware. Geen bevinding hier.

**Niet gedekt:** long-task-capture tijdens de batch-stateupdates zelf. De 100-update-lus is bewust één synchrone `for`-lus (zie hieronder) — dat is per constructie één lange taak, dus long-task-telling daarover zou niets zinvols toevoegen. Een realistischere meting (één update per macrotaak, zoals een WebSocket-cadans) is niet gebouwd binnen deze iteratie; als de lead dit specifiek wil, is dat een gerichte vervolgstap.

### Rerendercost — 100% irrelevante stateupdates (5 herhalingen × 100 updates; mediaan/max in ms voor de volledige lus van 100 updates)

| View | Mediaan (ms/100 updates) | Max | DOM-subtree vervangen? | Mutaties over 500 updates | Nodes |
|---|---|---|---|---|---|
| Home | 61,7 | 79,6 | Nee | **32.000** (64/update) | 513 |
| Kamers | 1,5 | 2,8 | Nee | **0** | 363 |
| Kamerdetail zwaar | 3,0 | 3,8 | Nee | **6** (0,012/update) | 181 |
| Energie | 1,7 | 1,9 | Nee | **6.000** (12/update) | 37 |
| Specialist (pool) | 1,4 | 2,2 | Nee | **4.500** (9/update) | 30 |

Geen enkele view vervangt zijn hoofd-DOM-subtree bij een volledig irrelevante update (het bestaande "DOM retained"-contract uit `check-room-detail-browser.mjs`/`render-room-controls.mjs` blijft overeind). Maar de mutatietelling laat iets zien dat die eerdere tests niet maten — zie "Afwijkingen" hieronder.

### Rerendercost — één relevante update (kamerdetail zwaar, lichtstatus wisselen)

Eén relevante statewijziging (de lamp van `room_0` aan/uit) → **8 DOM-mutaties**. Dit is een klein, begrensd aantal (niet de volledige 181-nodeboom), dus geen "brede" rerender — wel groter dan de 6 mutaties die 500 *irrelevante* updates optelden, wat het verwachte, correcte verschil is tussen relevant en irrelevant.

### Parse/evaluatie: koud vs. warm (dedicated serverinstantie met `HD_PROTOTYPE_CACHE=1`)

`scripts/serve-prototype.mjs` stuurt standaard `Cache-Control: no-store` voor alles (bewust — elke andere browsercheck moet altijd de werkelijk-op-schijf-staande `dist/`-bytes lezen). Voor deze ene meting draait de baseline-runner een eigen, kortlevende serverinstantie met het **opt-in** `HD_PROTOTYPE_CACHE=1`, die alleen `/dist/*` een jaar-cacheable maakt. Koud = gloednieuwe browsercontext (nog niets in cache); warm = tweede volledige paginanavigatie in diezelfde context, zelfde URL (geen cache-busting). Elke navigatie is een nieuw document, dus bundle-evaluatie (customElements-registratie, `migrateConfig`, eerste render) loopt bij warm gewoon opnieuw — alleen de netwerkkost verschilt.

| Meting | Koud | Warm |
|---|---|---|
| `domInteractive` | 29,8 ms | 13,5 ms |
| `domContentLoadedEventEnd` | 43,9 ms | 15,9 ms |
| `loadEventEnd` | 44,0 ms | 16,2 ms |
| Bundle-resourceduur (`dist/home-dashboard.js`) | 10,7 ms | 0 ms |
| Bundle `transferSize` | 211.938 bytes | **0 bytes** (bevestigd uit cache) |
| Bundle `encodedBodySize` | 211.638 bytes | 211.638 bytes (ongewijzigd — zelfde bytes) |

De test asserteert hard dat de koude load `transferSize > 0` heeft en de warme load `transferSize === 0` mét een positieve `encodedBodySize` — d.w.z. een bewezen cache-hit, niet een aanname. `domContentLoadedEventEnd` omvat hier zowel het laden als volledig evalueren van `dist/home-dashboard.js` als de synchrone initiële render van de Home-fixture (de harnas-module doet een top-level `await import(...)` vóór de rest van zijn eigen synchrone opbouw/registratie/render, dus DOMContentLoaded wacht daarop) — dit is dus een reële, geen gefabriceerde parse+eval+eerste-render-tijd.

### In-repo "navigatie" (geen top-level router bestaat — zie scopebeslissing 2)

| Wissel | Mediaan | Max |
|---|---|---|
| Kamerdetail tabwissel (Apparaten ↔ Energie) | 32,3 ms | 32,5 ms |
| Kamerdetail capability-railwissel (Comfort ↔ Verlichting) | 32,3 ms | 32,5 ms |
| Synthetische harnas-componentswap Home→Kamers (proxy, geen routewissel) | 21,1 ms | 22,8 ms |

De twee kamerdetail-wissels liggen opvallend dicht bij elkaar (~32,3 ms) — dat is twee `requestAnimationFrame`-wachtslagen (~2×16,6 ms bij 60Hz) plus een kleine klik-/renderkost, geen toeval. Dit is dus grotendeels de vaste overhead van de meetmethode (dubbele rAF-settle), niet zuiver renderwerk; zie budget-opmerking hieronder.

## Voorgestelde budgetten

Volgens de `verify-dist.mjs`-conventie: eerst meten, dan een budget met een kleine, expliciet benoemde marge vastleggen — nooit een budget dat de huidige meting al niet haalt.

| Metric | Gemeten (max over 5 runs) | Voorgesteld budget | Marge |
|---|---|---|---|
| DOM-nodes Home | 513 | 600 | ~17% |
| DOM-nodes Kamers | 363 | 420 | ~16% |
| DOM-nodes kamerdetail zwaar | 181 | 220 | ~22% |
| DOM-nodes Energie | 37 | 50 | ~35% (klein getal; vaste marge van 13 nodes) |
| DOM-nodes specialist (pool) | 30 | 40 | ~33% (idem, vaste marge van 10 nodes) |
| Long tasks per initiële mount | 0 | 0 (hard — elke long task tijdens mount is een nieuwe bevinding, geen budgetverhoging) | n.v.t. |
| Irrelevante-update-lus Home (100 updates) | 79,6 ms | 110 ms | ~38% |
| Irrelevante-update-lus overige views (100 updates) | 3,8 ms (kamerdetail zwaar) | 8 ms (alle niet-Home-views) | ruim, want deze views liggen allemaal < 3 ms |
| DOM-mutaties bij 500 irrelevante updates | zie "Afwijkingen" — **geen budget voorgesteld**, want de huidige getallen (32.000 / 6.000 / 4.500) zijn zelf de bevinding | — | — |
| Kamerdetail tab-/railwissel | 32,5 ms | 45 ms | ~38% |
| Bundle-evaluatie+eerste render (`domContentLoadedEventEnd`, koud) | 43,9 ms | 65 ms | ~48% |

**Niet voorgesteld:** een budget voor de DOM-mutatietelling bij irrelevante updates. Die getallen zijn zelf de bevinding die hieronder staat; een budget zou de bevinding verbergen in plaats van vastleggen. De lead beslist hier eerst over de bevinding (accepteren of een vervolgticket), en pas daarna is een budget voor "max toegestane mutaties per irrelevante update" zinvol.

## Afwijkingen / bevindingen (niet zelf gefixt — voor de lead)

### Bevinding 1 — Home, Energie en de pool-specialist herschrijven DOM op élke `hass`-toewijzing, ook bij een volledig irrelevante entity

Gemeten (500 volledig irrelevante updates, dezelfde niet-gemapte fictieve sensor-entity, 5× 100):

- **Home: 32.000 mutaties** (64 per update) over een 513-node boom. Root-oorzaak zichtbaar gemaakt met een losse probe: `HomeDashboardHomeOverview.set hass` (`src/cards/home-dashboard-home-overview.ts:434-444`) roept bij een ongewijzigde structuursignatuur `updateLiveState()` aan, die blijkbaar niet per-entity dift voordat het DOM herschrijft — de probe laat `childList`/`attributes`-mutaties zien op `STRONG`/`SPAN`/`BUTTON`-elementen (`aria-label`, `title`, `class`, tekstinhoud) van de kamercontrols, niet op het root-element.
- **Energie: 6.000 mutaties** (12 per update) over een 37-node boom — ruim een derde van de boom herschreven per irrelevante update. `HomeDashboardEnergyOverview.updateValues()` (`src/cards/home-dashboard-energy-domain-cards.ts`) zet `labelElement.textContent`/`valueElement.textContent` onvoorwaardelijk voor elke gemapte metric, ook als de waarde niet veranderd is.
- **Specialist (pool): 4.500 mutaties** (9 per update) over een 30-node boom.

Geen van deze drie vervangt de hoofd-DOM-subtree (de `domLengthUnchanged`-assertie in de testscript slaagt voor alle vijf gemeten views) — dit is dus geen "brede rerender" in de zin van een volledige remount, maar wel onverklaarde, herhaalde DOM-schrijfwerk op elke `hass`-tick, onafhankelijk van relevantie. Dit is precies het soort bevinding dat HD-171's acceptatiecriterium ("irrelevante stateupdates veroorzaken geen onverklaarde brede rerender") vraagt te rapporteren in plaats van te verbergen in een budget.

**Niet zelf gefixt**: een diff-voor-schrijven-fix in `updateLiveState()`/`updateValues()`/pool-summary's renderpad is geen triviale, overduidelijk-veilige wijziging (precies de categorie die deze opdracht uitsluit van zelf repareren). Voorstel voor de lead: een gericht vervolgticket dat deze drie renderpaden laat vergelijken vóór schrijven (bijv. `if (valueElement.textContent !== value) valueElement.textContent = value;`), met dezelfde regressietests als nu (`render-room-controls.mjs`'s performance-sectie, `check-room-detail-browser.mjs`) als vangnet.

### Bevinding 2 — Kamerdetail (`home-dashboard-room-detail`) en Kamers (`home-dashboard-room-overview`) lijken al correct te diffen

Ter contrast, en omdat dit niet vanzelfsprekend was gezien HD-171's eigen aandachtspunt over `render()`'s `previous.replaceWith(root)`-pad (`src/cards/home-dashboard-room-cards.ts` rond regel 1585): bij 500 irrelevante updates produceerde **Kamers 0 mutaties** en **kamerdetail zwaar slechts 6 mutaties** (0,012 per update) over een 181-node boom. Eén relevante update (de lamp van `room_0`) gaf **8 mutaties** — een klein, begrensd aantal, geen volledige subtree-vervanging. Dit weerspreekt de aanname dat elke relevante update via `replaceWith()` de hele `main`-subtree herbouwt; in de praktijk, voor dit specifieke fixtuurscenario, bleef het bij een gerichte DOM-schrijfactie. Dit is goed nieuws, geen actie vereist, maar wordt hier expliciet vastgelegd zodat een toekomstige regressie (bijv. een brede mutatiestijging bij kamerdetail) meetbaar zichtbaar wordt tegen deze baseline.

### Bevinding 3 — geen enkele long task boven 50ms tijdens initiële mount, op deze hardware

Geen directe bevinding, maar wel een scopebeperking: alleen gemeten op een 2-vCPU-sandbox-VM, niet op CI of op representatieve eindgebruikershardware (bijv. een goedkope tablet die een kiosk-dashboard bedient). Long-task-budgetten op basis van deze meting zijn dus optimistisch; de lead kan overwegen dit op een representatiever apparaat te herhalen vóór een harde CI-gate.

## Bevestiging bundle-onveranderlijkheid

- `dist/home-dashboard.js` sha256 vóór en na deze wijziging: `f2446ea41b3555f1f3054e8f49c655a60b367041400815871d63dcecc14d8d55` (211.638 bytes) — **byte-identiek**.
- `dist/home-dashboard-editor.js` sha256 vóór en na: `bb4a23aa76a62f284a6ce33aa28455f372b6a3e92d5f098c8f78fbfb573ebd85` (93.887 bytes) — **byte-identiek**.
- Deze ticket wijzigt alleen `scripts/` (nieuw `check-performance-baseline.mjs`, een opt-in cache-header in `serve-prototype.mjs`, registratie in `check-browser-matrix.mjs`) en deze rapportage — niets in `scripts/` wordt gebundeld in het HACS-artefact.

## Uitvoeren

    pnpm install --frozen-lockfile
    pnpm run browser:install
    pnpm run test:browser

`check-performance-baseline.mjs` draait als onderdeel van de bestaande matrix (`scripts/check-browser-matrix.mjs`) en schrijft zijn volledige meetresultaat naar `generated/browser-matrix/performance-baseline/results.json` (gitignored evidence, net als de rest van de matrix). Los uitvoeren kan met `HD_PROTOTYPE_URL=<lopende prototype-server> HD_RENDER_DIRECTORY=<pad> node scripts/check-performance-baseline.mjs`.

## Volgende stappen (niet in deze ticket)

- HD-172 (multi-dashboard resource-audit) blijft een losse ticket.
- Een gericht vervolgticket voor Bevinding 1 (diff-voor-schrijven in Home/Energie/pool-specialist), ter beoordeling door de lead.
- Long-task-capture tijdens een realistischere, per-macrotaak gespreide batch van updates (in plaats van de huidige synchrone lus), als de lead dat specifiek wil.
- Herhaling op representatievere eindgebruikershardware vóór een harde CI-long-task-gate.
