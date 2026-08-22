# Beslislog

## D-001 — Ontwerpfase is read-only voor Home Assistant

- **Status:** besloten
- **Besluit:** geen live config, dashboard, helper, resource of service wijzigen. Default `lovelace` blijft altijd read-only.
- **Reden:** de opdracht is onderzoek/concept/planning; MCP Test wijkt bovendien af van default.

## D-002 — App-like IA op Native-first techniek

- **Status:** aanbevolen
- **Besluit:** gebruik de App-like informatielagen en vijf hoofdviews — Home, Kamers, Energie, Domeinen en Meer — uitgevoerd met native Sections/Heading/Tile/Badge/Visibility.
- **Reden:** hoogste gecorrigeerde score (8,30) en beste gezinsmodel zonder tweede frontendplatform.

## D-003 — Geen lokale summary-component in v1

- **Status:** besloten voor voorstel
- **Besluit:** specialistische summaries zijn native; Hybrid's component blijft een voorwaardelijk experiment.
- **Reden:** extra resource, lifecycle en testmatrix zijn niet gerechtvaardigd zonder meetbare UX-winst.

## D-004 — Specialistische kaarten blijven zelfstandig

- **Status:** besloten
- **Besluit:** Kia, robot en tuin worden als geversioneerde HACS-resources op full-width subviews hergebruikt. Zwembad krijgt een vierde zelfstandige HACS-card in dezelfde familie.
- **Reden:** voorkomt duplicatie van gespecialiseerde logica, acties en foutafhandeling.

## D-005 — Stabiele, enkelvoudige viewpaths

- **Status:** besloten
- **Besluit:** `home`, `rooms`, `energy`, `domains`, `more`, `room-<key>`, `domain-<key>` en `specialist-<key>`.
- **Reden:** geen fragiele view-indexen en geen onbewezen geneste routing.

## D-006 — Statisch capabilitymodel, geen runtimeherkenning

- **Status:** besloten
- **Besluit:** locale-onafhankelijke logical keys met gitignored lokale mapping; lege capabilities worden verborgen.
- **Reden:** voorspelbaar, reviewbaar en privacyveilig; friendly-nameherkenning kan fout koppelen.

## D-007 — Home heeft harde inhoudsbudgetten

- **Status:** besloten
- **Besluit:** maximaal drie niet-kritieke alerts, vier actieve uitzonderingen, twee initiële algemene quick actions, vier actieve ruimtes, vier specialistische summaries en vijf domeinlinks. De door de eigenaar vereiste person cards en camerastrook hebben afzonderlijke vaste budgetten.
- **Reden:** voorkomt terugval naar een inventarisdashboard.

## D-008 — Diagnostiek bij voorkeur apart en admin-only

- **Status:** aanbevolen, eigenaarbeslissing open
- **Besluit:** systeem, netwerk, updates, batterijen, automations en area-loze techniek naar een apart `require_admin`-dashboard.
- **Reden:** visibility is geen security en gezinspad moet rustig blijven.

## D-009 — Geen resourceverwijdering op basis van dit concept

- **Status:** besloten
- **Besluit:** legacyresources blijven tot een volledige multi-dashboardaudit, meting, snapshot en menselijke gate.
- **Reden:** resources zijn globaal en andere dashboards kunnen ervan afhangen.

## D-010 — Robot heeft een productiepoort

- **Status:** besloten
- **Besluit:** relevante-state gating, zichtbare servicefouten en mobiele/accessibilitytests moeten groen zijn vóór productie.
- **Reden:** live resource is aanwezig, maar default gebruikt de kaart nog niet en de huidige renderstrategie is breed.

## D-011 — Area-aantal niet hardcoderen

- **Status:** besloten
- **Besluit:** bevestig de navigeerbare lijst uit 26 geregistreerde areas; zes lijken geen kamers.
- **Reden:** discoverybronnen waren hier aanvankelijk ambigu.

## D-012 — Open eigenaarbeslissingen

- **Status:** open
- Eerste twee quick actions en actioncategorieën die detail-only blijven.
- Apart admin-dashboard of een andere echte autorisatiegrens.

## D-013 — Home Assistant-sidebar blijft de applicatieshell

- **Status:** besloten
- **Besluit:** de linker sidebar is de gewone HA-sidebar. `home-dashboard` bouwt geen tweede sidebar of custom bottom dock; de vijf bestemmingen gebruiken native viewnavigatie.
- **Reden:** voorkomt een custom navigatiecomponent en sluit aan op de Native-first architectuur.

## D-014 — Minimale Home Assistant-versie

- **Status:** besloten
- **Besluit:** Home Assistant 2026.8.2 is de minimale ondersteunde versie.
- **Reden:** dit is de actuele live versie; oudere frontendfallbacks zijn geen doel.

## D-015 — Energie is een volledige hoofdview

- **Status:** besloten
- **Besluit:** `energy` staat als vaste hoofdview naast Home en Kamers.
- **Reden:** energie is dagelijks belangrijk genoeg voor volledige actuele balans, historie, piek, kosten en EV-context.

## D-016 — Kamers-overzicht met quick actions

- **Status:** besloten
- **Besluit:** `rooms` toont alle bevestigde kamers per verdieping met primaire toestand, maximaal twee passende quick actions en een detailingang.
- **Reden:** alleen actieve kamers op Home biedt onvoldoende volledig ruimtelijk overzicht.

## D-017 — Volledige zwembadcard

- **Status:** besloten voor bouwplan
- **Besluit:** bouw een zelfstandige `custom:pool-dashboard-card` en plaats die full-width op `specialist-pool`.
- **Reden:** zwembad heeft voldoende eigen status, historie, veiligheids- en kostbare acties voor een specialistische ervaring.

## D-018 — Person cards op Home

- **Status:** besloten
- **Besluit:** Home toont per persoon een privacyveilige statuskaart met thuis, benoemde zone, onderweg of onbekend en dataversheid.
- **Reden:** een geaggregeerde aanwezigheidchip vervangt de bestaande bruikbare person cards onvoldoende.

## D-019 — Beveiligings- en camerastrook op Home

- **Status:** besloten
- **Besluit:** Home behoudt een horizontaal scrollbare strook met alle eigenaar-gekozen camerabeelden/fallbacks en een afzonderlijk zichtbare privacystand per camera. Ingeschakelde Security vereist minstens één camera, zonder vaste bovengrens. Privacy uitschakelen vereist expliciete confirmation en backendautorisatie.
- **Reden:** snel cameratoezicht en privacybediening zijn cruciale dagelijkse functies; een algemene beveiligingslink is onvoldoende.

## D-020 — Informatiedekking huidige dashboard blijft behouden

- **Status:** besloten
- **Besluit:** de nieuwe layout mag informatie herordenen en progressief ontsluiten, maar verliest geen goedgekeurde capability uit Home, Kamers, kamerdetail, Security of Energie. Mobiel en desktop hebben gelijke functionele dekking.
- **Reden:** de huidige layout is geen doel, maar de eigenaar bevestigt dat de informatiedekking en mobiele bruikbaarheid waardevol zijn.

## D-021 — Energie volgt standaard HA plus lokale uitbreiding

- **Status:** besloten
- **Besluit:** `energy` dekt alle voor de installatie relevante officiële HA Energy-cards en gedeelde datum-/collectionsemantiek, plus capaciteitspiek, fase-onbalans, EV, UPS en kamer-/apparaatpower. De ingebouwde Energy-panelroute blijft fallback/configuratie-ingang.
- **Reden:** de nieuwe pagina mag qua informatie niet onder het standaard Home Assistant Energy-dashboard uitkomen.

## D-022 — Conceptgate gesloten

- **Status:** besloten voor bouwstart
- **Besluit:** de eerste Home-acties zijn `Avondscene` en een expliciet gemapt `Lichten beneden uit`; diagnostiek/beheer gaat naar een afzonderlijk `require_admin`-dashboard.
- **Reden:** hiermee zijn de twee resterende conceptbeslissingen opgelost. Testdeployment blijft afzonderlijk goedkeuringsplichtig.

## D-023 — HACS custom dashboard strategy met volledige GUI

- **Status:** besloten voor uitvoering
- **Besluit:** het centrale dashboard wordt als HACS Dashboard-plugin geleverd. Een `custom:home-dashboard` strategy genereert de volledige native Sections-configuratie en biedt via `getConfigElement()` een grafische editor voor alle ondersteunde instellingen. Iedere testbare implementatiestap krijgt na merge een echte GitHub prerelease.
- **Reden:** een dashboard strategy combineert HACS-installatie, Community dashboards-picker, dashboardbrede GUI-configuratie en native Home Assistant-views zonder een tweede sidebar, custom panel of automatische write naar het default dashboard.

## D-024 — Schema v1 en GUI zijn één contract

- **Status:** besloten en geïmplementeerd in delivery-PR 2
- **Besluit:** defaults, uitgevoerd JSON Schema, migratie, runtimevalidatie en editorcoverage gebruiken dezelfde tien configuratieonderdelen. Ongeldige tussenstanden blijven lokaal in de editor en sturen geen `config-changed`-event naar Home Assistant; toekomstige schema's blokkeren de editor zonder downgrade.
- **Reden:** dit voorkomt stille configuratiedrift, maakt upgrades testbaar en houdt riskante acties, de configureerbare camerastrook en maximaal twee kameracties expliciet valideerbaar.

## D-025 — Privacyacties hebben een expliciete configuratieroute

- **Status:** besloten en geïmplementeerd in `v0.2.0-alpha.3`
- **Besluit:** een camera met privacyinstelling verwijst naar een vooraf onder **Acties** aangemaakte actie. Security legt dat model uit en biedt een directe, toetsenbordvriendelijke route naar die sectie.
- **Reden:** de centrale actionallowlist bewaart bevestiging, targetscope en verificatie op één plaats, terwijl de editor de relatie voortaan zichtbaar maakt.
