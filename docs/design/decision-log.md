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

- **Status:** besloten in `v0.2.0-alpha.3`; validatie verfijnd in `v0.3.0-alpha.2` en `v0.3.0-alpha.3`
- **Besluit:** een camera met privacyinstelling mag status-only blijven met **Privacyactie = Geen**. Optionele bediening verwijst naar een vooraf onder **Acties** aangemaakte actie. De actie behoudt haar gekozen risicoklasse en het bijbehorende confirmationcontract. De extra camerabevestigingsvlag is onafhankelijk en optioneel. Security legt dat model uit en biedt een directe, toetsenbordvriendelijke route naar Acties.
- **Reden:** de centrale actionallowlist bewaart bevestiging, targetscope en verificatie op één plaats, terwijl de editor de relatie voortaan zichtbaar maakt.

## D-026 — Eerste echte shell is read-only

- **Status:** besloten voor `v0.3.0-alpha.1`
- **Besluit:** de eerste vijf renderende Sections-views tonen alleen geselecteerde states, camerabeelden en navigatie. Entitytap, hold en double-tap zijn uitgeschakeld; actionsequences en servicecalls worden nog niet gegenereerd.
- **Reden:** hiermee kan de eigenaar routes, informatiekeuze, responsive gedrag en echte entityweergave testen voordat bediening en specialistische kaarten hun afzonderlijke veiligheidsgates doorlopen.

## D-027 — Camerastrook is een begrensde custom layoutcomponent

- **Status:** besloten voor `v0.4.0-alpha.1`
- **Besluit:** Security beslaat op Home de volledige Sections-breedte. Eén kleine, meegebundelde custom card verzorgt horizontale scroll en focusbediening voor 1..n camera's, met exact één niet-private camera per viewport en compacte privacystatussen ernaast. Privacy-actieve camera's worden niet als beeld gerenderd. De camerainhoud blijft een Home Assistant `picture-entity` met alle acties op `none`.
- **Reden:** een native horizontal stack perst 1..n camera's naast elkaar en een native grid levert geen horizontale camerastrook. De begrensde component lost alleen de ontbrekende layoutinteractie op en kopieert geen camera- of servicelogica.

## D-028 — Iedere kamer krijgt overview-summary en een echte subview

- **Status:** besloten voor `v0.5.0-alpha.1`
- **Besluit:** Kamers toont compacte herkenbare kamerkaarten per verdieping. Iedere kamer krijgt een stabiele `room-<key>`-subview met hero en afzonderlijke groepen voor status, primaire toestanden, klimaat, media, veiligheid, apparaten/energie en historie. Lege groepen verdwijnen. De eerste release is read-only.
- **Reden:** een vlakke entiteitenlijst behoudt wel data maar niet de informatiehiërarchie of mobiele bruikbaarheid van de bestaande kamerdetailpagina's en de goedgekeurde renders.

## D-029 — Home en kamerdetail worden begrensde compositiecards

- **Status:** besloten voor `v0.5.0-alpha.2`
- **Besluit:** Home en iedere kamerdetail-subview gebruiken één responsive compositiecard binnen de native Sections-shell. Kamerchips en detailcards openen uitsluitend het standaard `hass-more-info`-venster; zij roepen geen service aan. De cameraviewport wordt begrensd tot circa 520 px. Het minified bundlebudget groeit gecontroleerd van 100 kB naar 120 kB.
- **Reden:** losse Sections-elementen spreidden kleine informatiedelen over brede desktops, maakten de camera dominant en verloren de hiërarchie van de goedgekeurde desktop- en mobiele renders. Een begrensde component houdt ritme, kolomverhoudingen en responsive disclosure stabiel zonder Home Assistant-bedieningslogica te kopiëren.

## D-030 — Vandaag gebruikt vijf benoemde energie-KPI-mappings

- **Status:** besloten voor `v0.5.0-alpha.3`
- **Besluit:** batterij-SoC, batterij laad-/ontlaadvermogen, zonnepanelenopbrengst, huisverbruik zonder batterijladen en maandelijkse vermogenspiek krijgen elk een eigen optionele entitymapping en een vast UI-label. De bestaande generieke energiecontext blijft alleen als aanvulling en compatibiliteitsveld bestaan.
- **Reden:** een onbenoemde entiteitenlijst maakt de betekenis en volgorde afhankelijk van integratienamen. Expliciete mappings maken de GUI begrijpelijk, houden Home consistent en voorkomen dat technisch gelijksoortige W- en kW-sensoren verkeerd geïnterpreteerd worden.

## D-031 — Enkelvoudige selectors hebben één eigenaar per eventtype

- **Status:** besloten en gecorrigeerd voor `v0.5.0-alpha.4`
- **Besluit:** Home Assistant-entityselectors worden alleen via hun publieke `value-changed`-event bijgewerkt. De generieke native `change`-binding geldt uitsluitend voor echte `input`- en `select`-elementen. Optionele entityselectors krijgen bovendien expliciet `required = false`.
- **Reden:** de Home Assistant-picker vuurt na `value-changed` ook een native `change` af. Wanneer beide bindings dezelfde custom selector verwerken, kan een synchrone rerender de tweede handler met een verouderde lege waarde achterlaten en zo de geldige keuze overschrijven.

## D-032 — Home scheidt realtime stateupdates van structurele renders

- **Status:** besloten voor `v0.5.0-alpha.5`; D-030 verfijnd naar zes KPI-mappings
- **Besluit:** batterij laden en ontladen krijgen elk een eigen optionele entitymapping. Realtime KPI-, afval-, weer- en persoonswaarden worden in-place bijgewerkt; alleen een gewijzigde operationele aandachtstructuur veroorzaakt een volledige Home-rerender. Op brede schermen vormen weer, KPI/afval en security drie kolommen; kleinere schermen stapelen responsief.
- **Reden:** afzonderlijke laad- en ontlaadsensoren hebben een andere betekenis en mogen niet onder één mapping worden samengevoegd. Vermogenssensoren wijzigen bovendien vaak; een volledige DOM-reconstructie per waarde-update herstart weer- en camerachildcards en oogt als een permanente refresh.

## D-033 — Vandaag gebruikt renderhiërarchie en HA-themetokens

- **Status:** besloten voor `v0.5.0-alpha.6`
- **Besluit:** de brede Vandaag-zone gebruikt een compactere weerkolom, zes iconische energiestatussen en security zonder een dubbele buitenkop. Afval wordt uit bronnaam, entitysleutel en bekende datumattributen semantisch als GFT, papier, PMD, groenafval, glas of restafval gepresenteerd, met datum en relatieve termijn. `system` erft de actieve HA-tokens; expliciet licht/donker gebruikt de gedocumenteerde Juiced Horizon Calm-tokens binnen de compositie.
- **Reden:** lange vaste KPI-labels, generieke afvaliconen en een dubbele beveiligingsheading brachten de informatie wel over maar niet de visuele hiërarchie van de goedgekeurde render. De semantische presentatie verbetert herkenning zonder integratiespecifieke of private identifiers in tracked code op te nemen.

## D-034 — Compact weer gebruikt de officiële read-only forecastsubscription

- **Status:** besloten voor `v0.5.0-alpha.7`
- **Besluit:** Home vervangt de hoge native weather-card door een begrensde presentatielaag voor actuele toestand en maximaal drie dagelijkse forecasts. Forecastdata komt via `weather/subscribe_forecast`; de kaart opent alleen `hass-more-info` en voert geen service- of configuratiecall uit. De Juiced Horizon Calm-tokenlaag stuurt voortaan surfaces, schaduw, brandkleur en compacte kaartgroepen consistent aan. Het minified bundlebudget groeit gecontroleerd van 120 kB naar 128 kB.
- **Reden:** de native weather-card houdt in deze driedelige compositie te veel onbruikbare hoogte vast en haar interne Shadow DOM kan niet robuust vanuit de dashboardcard worden gecomprimeerd. De officiële read-only subscription behoudt forecastinformatie zonder Home Assistant-bedieningslogica te kopiëren.
