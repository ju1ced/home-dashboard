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

## D-035 — Weer overspant de twee linker Vandaag-kolommen

- **Status:** besloten voor `v0.5.0-alpha.8`
- **Besluit:** op brede schermen staat de weerkaart over kolom één en twee. Energie en afval volgen in een tweede rij over dezelfde kolommen; security bezet rechts beide rijen. Onder 1050 px worden de zones lineair gestapeld.
- **Reden:** de weerpresentatie profiteert van horizontale ruimte, terwijl de compacte energierail visueel sterker onder het weer staat dan ertussen. De vaste rechter securitykolom blijft daardoor scanbaar zonder de hoofdcontext te versnipperen.

## D-036 — Vandaag is één samengestelde kaart

- **Status:** besloten voor `v0.5.0-alpha.9`
- **Besluit:** weer, energiecontext en afvalophaling delen op Home één buitenrand, surface en schaduw. Interne lijnen scheiden de drie informatielagen. Maximaal vier afvalfracties staan op desktop in één rij en op smalle schermen in twee kolommen. Security blijft een zelfstandige rechterkolom.
- **Reden:** drie afzonderlijke kaartgroepen binnen dezelfde Vandaag-zone voelden visueel versnipperd. Eén compound card maakt hun samenhang duidelijk, terwijl de enkele afvalrij verticale ruimte bespaart zonder informatie weg te nemen.

## D-037 — Semantische hoofdviews krijgen een begrensd bundlebudget van 160 kB

- **Status:** besloten voor de gecombineerde Home-, Kamers- en Energie-alpha
- **Besluit:** het minified bundlebudget groeit gecontroleerd van 128 kB naar 160 kB. De limiet blijft een harde buildgate. De groei is uitsluitend bestemd voor state-aware Home-samenvattingen, semantische kamerbediening via `hass-more-info` en een eerste volledige Energie-/Domeinencompositie; directe servicecalls en specialistische bronlogica worden niet meegebundeld.
- **Reden:** de drie eigen compositielagen vervangen een veel zwaardere verzameling globaal geladen Lovelace-resources en behouden informatiehiërarchie zonder die afhankelijkheden te kopiëren. Een vaste bovengrens houdt verdere groei zichtbaar; runtime-, DOM- en rerendermetingen blijven verplicht vóór productie.

## D-039 — Vaste kamerbediening en rustige dataversheid

- **Status:** ontwerprichting aanvaard door de eigenaar op 7 september 2026; documentatie bijgewerkt, implementatie volgt afzonderlijk.
- **Besluit:** Home krijgt vaste favoriete kamerkaarten met passende licht-, rolluik-, luifel- en radioacties. Generieke Niet recent-presentatie verdwijnt van Home; echte operationele uitval blijft herkenbaar. Afvalophaling en weersvoorspelling blijven in Vandaag behouden, ook al ontbraken ze in de conceptafbeelding.
- **Uitwerking:** [ontwerprichting en acceptatiecriteria](room-controls-direction.md). Dit verfijnt de eerdere Home-hiërarchie en vervangt de tweeknoppenlimiet voor deze kamerkaarten. Huidige read-only code en live gates blijven van kracht tot de afzonderlijke implementatiestap.

## D-038 — Kia-integratie krijgt een afzonderlijk begrensd bundlebudget

- **Status:** besloten voor `v0.7.0-alpha.1`
- **Besluit:** de harde minified bundlelimiet groeit van 160 kB naar 168 kB. De extra ruimte is uitsluitend voor de native read-only Kia-summary, resource-/mappingfallback en de `specialist-kia`-route. De bestaande HACS Kia-card blijft extern geladen en haar voertuiglogica, acties en configuratie worden niet meegebundeld.
- **Reden:** de eerdere 160 kB-limiet dekte alleen de semantische Home-, Kamers-, Energie- en Domeinencompositie. De beperkt gehouden specialistische integratielaag vraagt aantoonbaar circa 2 kB meer, terwijl een nieuwe harde grens verdere ongecontroleerde groei verhindert.

## D-040 — Opt-in kameracties en begrensde runtime-uitbreiding

- **Status:** ontwikkeling, PR en testrelease expliciet aangevraagd op 7 september 2026; v0.8.0-alpha.1.
- **Besluit:** maximaal vier afzonderlijke capabilitydoelen per kamer en een standaard uitgeschakelde bedieningsoptie. Eén gedeelde kamercomponent voor Home en Kamers; vaste service-allowlist, backendautorisatie, luifelbevestiging, capabilitygating en geen optimistische apparaatstate.
- **Budget:** de harde bundlegrens groeit van 168 naar 180 kB voor gedeelde bediening, editor, scopevalidatie en foutafhandeling. Overbodige oude overzichtsstyling is verwijderd. De gemeten omvang staat in de buildcheck; verdere groei blijft begrensd.
- **Bewijs:** fictieve browserchecks en [releasechecklist](../releases/testing-v0.8.0-alpha.1.md). Live HA-writes blijven een afzonderlijke gate.

## D-041 — Kamerkop opent bediening op Home

- **Status:** richting en publicatie als testrelease goedgekeurd door de eigenaar op 7 september 2026.
- **Besluit:** de kamerkop klapt een paneel open met chips voor verlichting, radio, rolluiken, luifel en airco/verwarming. Alleen Volledige kamer navigeert. Klimaat gebruikt de bestaande bron en het native detailvenster; oude apparaatmappings blijven bereikbaar zonder impliciete directe actiedoelen.
- **Layout:** de interne Home-limiet van 1180 px vervalt; de beschikbare HA-dashboardbreedte bepaalt de buitenmaat. Responsive stapeling en afvalophaling blijven behouden.
- **Validatie:** 62 tests en zeven fictieve browser-renders; toetsenbord, focus, bronfallback en bestaande actiegates gecontroleerd. Zie [runtime-renders](../renders/expandable-rooms/README.md). Publicatie wijzigt geen Home Assistant-dashboard en voert geen live HA-write uit.

## D-042 — Uitlijning en navigatie van Home en kamerdetail

- **Status:** uitwerking en publicatie als testrelease gevraagd door de eigenaar op 8 september 2026; v0.8.0-alpha.3.
- **Besluit:** Vandaag en camera delen op desktop één uitgelijnde rij. Bron- en actiestroken binnen een kamer gedragen zich als sub-accordion. Kamerdetails gebruiken de beschikbare breedte.
- **Navigatie:** de native terugpijl behoudt de hiërarchische route naar Kamers. Een expliciete Home-knop in de kamerheader biedt de rechtstreekse route naar Home, ongeacht vanwaar de kamer werd geopend.

## D-043 — Geordende quick actions en één native terugroute

- **Status:** uitwerking gevraagd door de eigenaar op 8 september 2026; lokale candidate `v0.8.0-alpha.4`.
- **Besluit:** een optionele `control_entities`-lijst bepaalt per kamer exact welke nul tot zestien quick-actionchips zichtbaar zijn en in welke volgorde. Licht, cover, mediaspeler en klimaat mogen elk meermaals voorkomen. Iedere directe servicecall blijft beperkt tot de gekozen entiteit en bestaande capability- en confirmationregels.
- **Migratie:** zolang het nieuwe veld ontbreekt, blijft de gepubliceerde bediening uit alpha.3 zichtbaar. Een opgeslagen lege lijst is een bewuste keuze voor geen quick actions.
- **Navigatie:** de extra Home-knop verdwijnt uit de kamerhero. De native terugpijl krijgt `back_path: home`, zodat Home op hetzelfde niveau als de pijl bereikbaar is.

## D-044 — Directe ordening en semantisch contrast

- **Status:** visuele uitwerking gevraagd door de eigenaar op 8 september 2026; lokale candidate `v0.8.0-alpha.5`.
- **Besluit:** iedere quick action krijgt in de editor een directe positiekeuze. Chips gebruiken het entiteitsicoon, verwijderen een dubbele kamernaam en tonen actieve verlichting, media, covers en klimaat met een eigen contrastrijke accentkleur, rand, linkerbalk en gevulde icoontegel.
- **Visuele taal:** Home gebruikt een vaste blauwe welkomstbalk zoals de kamerhero's. De expliciete light/dark-paletten verschuiven naar koel blauwgrijs; Home Assistant-themevariabelen blijven in systeemmodus leidend.
- **Budget:** de harde minified bundlegrens groeit van 180 naar 184 kB voor naamnormalisatie, entiteitsiconen, directe herordening en de semantische actieve-statepresentatie. De limiet blijft een buildgate.

## D-045 — Configureerbare rustige paletten

- **Status:** integratie van alle vier varianten gevraagd door de eigenaar op 8 september 2026; candidate `v0.8.0-alpha.6`.
- **Besluit:** `general.palette` kiest tussen het compatibele Huidig blauw, Warm zand, Rustig salie, Zacht leisteen en Gedempt petrol. Ieder palet bevat afzonderlijk gecontroleerde light- en dark-tokens; system mode erft de HA-oppervlakken en past merk- en statusaccenten toe.
- **Scope:** de keuze loopt door naar Home, Kamers, kamerdetail, Energie en de centrale Kia-samenvatting. Native Home Assistant-kaarten en de globale HA-shell blijven hun actieve HA-thema volgen.
- **Budget:** de harde bundlegrens groeit van 184 naar 190 kB voor vijf complete tokenreeksen, configuratievalidatie en toepassing op alle eigen kaarten. De gemeten candidate blijft onder deze buildgate.

## D-046 — Brede compositie, lokale ordening en optionele kiosknavigatie

- **Status:** gevraagd door de eigenaar op 9 september 2026; candidate `v0.8.0-alpha.7`.
- **Besluit:** Home gebruikt standaard vier Sections-kolommen. Snel naar verhuist onder de afvalophaling en Nu actief vervalt omdat dezelfde toestand al in de contrastrijke kamerknoppen zichtbaar is.
- **Ordening:** pijlen wijzigen de quick-actionvolgorde uitsluitend lokaal. **Volgorde toepassen** veroorzaakt daarna één configuratieopslag en één dashboardherbouw.
- **Kiosk:** `layout.navigation_mode` ondersteunt native, geïntegreerd en kiosk. Geïntegreerd toont interne hoofdnavigatie met behoud van de HA-balk. Kiosk voegt `kiosk_mode.hide_header` toe; de optionele frontendresource of Companion App voert het verbergen uit. Dit is presentatie en geen autorisatiegrens.
- **Budget:** de harde bundlegrens groeit van 190 naar 195 kB voor de gedeelde interne navigatie en configuratiecontracten.

## D-047 — Zichtbare interne navigatie en specialistlinks

- **Status:** gevraagd door de eigenaar op 9 september 2026; candidate `v0.8.0-alpha.8`.
- **Navigatie:** geïntegreerde navigatie wordt de standaard en staat in dezelfde gekleurde balk als de begroeting. Home, Kamers, Energie, Domeinen en Meer behouden op alle pagina's dezelfde volgorde en een contrastrijke actieve toestand. Op mobiel blijft het label van de actieve route zichtbaar.
- **Kiosk:** kiosk gebruikt exact dezelfde interne routes en levert daarnaast `kiosk_mode.hide_header`. Het effectief verbergen van de Home Assistant-bovenbalk blijft afhankelijk van de optionele kiosk-mode-resource of een kioskfunctie van de Companion App.
- **Snel naar:** specialistische routes vullen samen de beschikbare rij en tonen een gevulde icoontegel, korte context en richtingspijl. Hierdoor zijn ze duidelijk als navigatie herkenbaar.
- **Budget:** de harde minified bundlegrens groeit van 195 naar 198 kB voor de aanvullende navigatiesemantiek en styling.

## D-048 — Eén navigatieframe, lokale kiosk en native configuratie-ingang

- **Status:** PR, merge na groene checks en alpha-release door de eigenaar goedgekeurd op 11 september 2026; candidate v0.8.0-alpha.9. Geen Home Assistant-write of deployment goedgekeurd.
- **Navigatie:** alle vijf hoofdviews, kamerdetails en Kia gebruiken dezelfde eerste volle-breedte navigatiecard van 66 px. De knoppen behouden hun positie, ook op mobiel; alle routelabels blijven zichtbaar. Home-context staat afzonderlijk onder de balk. Dit vervangt de afwijkende Home-begroetingsbalk uit D-047.
- **Kiosk:** het externe configuratieveld bood geen zelfstandig werkende verberging. Een begrensde adapter in de huidige `hui-root` verbergt alleen de header en diens ruimte. Cleanup, native edit mode, een herstelknop en `?disable_km` voorkomen vastlopen. Geen globale resourcewijzigingen, private frontendimports of opgeslagen shellconfiguratie.
- **Configuratie:** het beheerdersstandwiel gebruikt het bestaande native editor-menu. Bij onbekende markup volgt een zichtbare HA-balk met uitleg en dashboardbeheerlink, niet een eigen opslagpad. Visibility vervangt geen backendautorisatie.
- **Compatibiliteit:** deze DOM-grens is versiegevoelig. Fictieve browsertests bewijzen het adaptergedrag, niet de runtime op de woninginstallatie. Live rooktest op exact goedgekeurd testdashboard blijft verplicht. Het bestaande bundlebudget blijft ongewijzigd.
- **Bewijs:** [testscope en herstel](../releases/testing-navigation-consistency.md).

## D-049 — Home-context blijft in een gekleurde header

- **Status:** testcandidate v0.8.0-alpha.10, na expliciete publicatiegoedkeuring door de eigenaar; geen HA-write of deployment goedgekeurd.
- **Besluit:** datum, begroeting en de drie statuschips (thuis, weer, aandacht) blijven samen in een gekleurde Home-header met dezelfde achtergrond-, tekst- en afrondingsstijl als Kamers, met responsieve padding. Op brede schermen staan datum/begroeting in het midden en de chips rechts; op mobiel stapelen ze binnen dezelfde header.
- **Navigatie:** de gedeelde navigatiecard blijft afzonderlijk erboven staan. Haar maat, routes, configuratie-ingang en kioskgedrag veranderen niet. Dit corrigeert de transparante Home-contextpresentatie uit alpha.9 zonder de vaste navigatiepositie terug te draaien.
- **Validatie:** de bestaande fictieve browsermatrix controleert nu ook de drie chips, gecentreerde begroeting/datum, rechteruitlijning en vergelijking met de Kamers-header in geïntegreerde, kiosk- en native modus. Normal/warning/missing/unavailable en light/dark blijven afgedekt. Geen nieuwe acties, configuratievelden of dependencies; bestaande autorisatie en confirmations blijven ongewijzigd.

## D-050 — Home-header componeert navigatie en context responsief

- **Status:** testcandidate v0.8.0-alpha.15, na expliciete publicatiegoedkeuring door de eigenaar; geen Home Assistant-write of deployment goedgekeurd.
- **Besluit:** Home gebruikt in geïntegreerde en kioskmodus één section met één gekleurde header. Bij minstens 1200 px beschikbare kaartbreedte staan navigatie links, datum/begroeting gecentreerd en statuschips rechts op één horizontale rij. Onder die grens stapelen dezelfde onderdelen zonder clipping of overlap.
- **Compatibiliteit:** native modus behoudt de zelfstandige Home-header. Routes, kioskherstel, editoringang, actie- en autorisatiepaden blijven ongewijzigd; het configuratieschema verandert niet.
- **Validatie:** de regressiecheck dekt brede uitlijning en mobiele stapeling voor geïntegreerde en kioskmodus. De bestaande browsermatrix blijft normal/warning/missing/unavailable, thema's, focus, overflow en navigatiegedrag controleren.

## D-051 — Control Deck vervangt de kamerdetailcompositie

- **Status:** candidate `v0.8.0-alpha.20`, lokaal geverifieerd op 28 september 2026; geen Home Assistant-write of deployment goedgekeurd. Vastgelegd achteraf op verzoek van de eigenaar, samen met HD-202's documentatiereconciliatie.
- **Besluit:** het kamerdetail wordt een capability-gedreven Control Deck: een vaste header met kernstatus en optionele privacyveilige afbeelding, een capabilityrail met alleen werkelijk geconfigureerde functies, en vier tabs (Bediening, Apparaten, Energie, Historie). Bediening ondersteunt meerdere lichtgroepen (uit/aan/gedeeltelijk aan via tekst en semantiek), getypeerde openingen (rolluik/screen/luifel) met Open/Stop/Dicht of Uit/Stop/In en confirmationbeleid, en beschermde of gewone smart plugs zonder optimistische apparaatstate.
- **Energie en historie:** kamer- en apparaatenergie ondersteunen afzonderlijke dag-/maand-/jaarbronnen zonder samengevoegde schaal en zonder dubbeltelling t.o.v. de officiële Energy-totalen; de Historie-tab is de enige eigenaar van de native `history-graph`, ter vervanging van de eerder dubbele strategiegrafiek.
- **Reden:** dit vervangt de eerdere lichte/zware kamerdetailindeling uit D-028/D-039–D-044 door één herbruikbaar model zonder kamerspecifieke hardcoding, met behoud van de bestaande actionscope-, confirmation- en privacyregels.
- **Bewijs:** [Control Deck-kamerdashboardcontract](control-deck-room-dashboard.md), [HD-202](../planning/tickets.md#hd-202--control-deck-kamerdashboard-implementeren) en de [versiechecklist](../releases/testing-v0.8.0-alpha.20.md).
- **Openstaand:** de vierkamer-visuele baselinereview (HD-170), 200%-zoom/screenreader/echte themacontrast en live runtimeacceptatie blijven afzonderlijke gates.

## D-052 — Control Deck-rail wordt hoofdnavigatie; bundlebudget naar 254 kB

- **Status:** candidate `v0.8.0-alpha.22` (voorgesteld), lokaal geverifieerd op 29 september 2026; geen Home Assistant-write of deployment goedgekeurd.
- **Besluit:** D-051's beschrijving "vier tabs (Bediening, Apparaten, Energie, Historie)" wordt hierbij gecorrigeerd: de capabilityrail (Verlichting, Rolluiken/Luifel & screens, Comfort, Smart plugs, Verbruik) is de hoofdnavigatie op paginaniveau en toont telkens één geïsoleerde stage; "Bediening" bestaat niet meer als aparte tab. Het "Details, apparaten, energie en historie"-blok blijft daaronder met zijn eigen 3 tabs (Apparaten, Energie, Historie). Dit is de daadwerkelijke, exacte implementatie van de op 24 september 2026 afgetikte v3-ontwerpstudie (`generated/room-dashboard-concepts/index.html`), nadat sessieanalyse op 28 september 2026 vaststelde dat de eerder uitgebrachte 4-tabsindeling zonder gedocumenteerde reden van v3 was afgeweken.
- **Toevoegingen:** dimsliders op individuele lampen (de bestaande `turn_on`-lichtservice met `brightness_pct`, alleen op `change` niet op elke `input`-tick), lichtgroep-styling die actief/gedeeltelijk/uit visueel onderscheidt, een samenvattingsstrip en positiebalk per opening, een samenvattingsstrip en dag/maand/jaar-metricsgrid per smart plug, en een geconsolideerde Comfort-stage (klimaat, media, veiligheid, camera's, bureau) zonder capabiliteitsverlies. Verbruik (rail) hergebruikt de bestaande `energyPeriodGroup()`-uitvoer in plaats van een nieuwe samenvatting te bouwen; Historie behoudt voorlopig de native `history-graph`-fallback (zie HD-205 voor de echte statistics-/logbookkoppeling).
- **Budget:** de harde minified bundlegrens groeit van 245 kB naar **254 kB**. Gemeten kandidaat na deze slice: 251.696 bytes (± 2,3 kB marge). De vorige grens liet volgens HD-171 nog maar 603 bytes marge — bewust iets ruimer dit keer, in lijn met HD-171's eigen waarschuwing dat een volgende specialistintegratie (HD-131/141/152) anders meteen tegen de grens zou lopen. De marge is nog steeds krap; HD-171 blijft de plek waar dit structureel wordt opgelost.
- **Bewijs:** onafhankelijke pre-mergereview vond één scope-afwijking (Verbruik-stage) en één mockup-labelfout ("Openingen" i.p.v. "Rolluiken"), beide opgelost; awning-confirmation- en plug-tweestapsbevestiging zijn geverifieerd byte-identiek aan `v0.8.0-alpha.21`. `pnpm test` (103/103 losstaand van de bundlegate), volledige `pnpm run test:browser`-matrix en `git diff --check` zijn groen.
- **Openstaand:** live Home Assistant-acceptatie, HD-170's resterende menselijke QA en HD-205's echte data-koppeling blijven afzonderlijke gates.

## D-053 — Control Deck-omkadering (deck-head, stage-head, rail-iconen, hero-pillen); bundlebudget naar 258 kB

- **Status:** candidate `v0.8.0-alpha.23` (voorgesteld), lokaal geverifieerd op 30 september 2026; geen Home Assistant-write of deployment goedgekeurd.
- **Besluit:** de "chrome" rond de HD-204-rail die bij die slice over het hoofd werd gezien, is alsnog toegevoegd: een deck-head boven de rail (kamernaam + telling van werkelijk geconfigureerde lampen/openingen/plugs), een gedeelde stage-head bovenaan elke functie-inhoud (titel, omschrijving en een statusbadge), iconen en een korte statusregel per rail-knop, en een rijkere hero (meerdere statuspillen in plaats van één generieke pil, plus een neutrale placeholder-illustratie wanneer geen kamerfoto is ingesteld). Niets hiervan gebruikt een nieuwe databron of fabriceert een waarde die niet al ergens gemapt is.
- **Statusbadge:** drie tonen — "Beschikbaar", "Aandacht" (hergebruikt de bestaande `deviceTone()`-waarschuwingslogica) en "Deels niet beschikbaar" — met prioriteit unavailable > warning > normal. Wanneer een functie wel geconfigureerd is maar geen enkele controleerbare entiteit heeft (bv. een Comfort-stage die alleen uit de LINAK-bureaukaart bestaat), wordt geen badge getoond in plaats van een verzonnen "Beschikbaar".
- **Gecorrigeerd tijdens review:** de eerste versie kon een vals "Beschikbaar" tonen wanneer de enige geconfigureerde energiebron buiten de gecontroleerde entiteitenlijst viel (bv. een kamer met alleen een plug-maandsensor); de energie-verbruikssamenvatting kon stilzwijgend wisselen naar een ander, kleiner cijfer onder hetzelfde label wanneer de primaire bron unavailable werd; en de rail-tellingen ("N van M aan") telden unavailable apparaten mee als "uit". Alle drie zijn opgelost en met gerichte fixtures/browsertests afgedekt.
- **Budget:** de harde minified bundlegrens groeit van 254 kB naar **258 kB**. Gemeten kandidaat: 256.821 bytes (± 1,2 kB marge). Dit is de derde budgetverhoging in evenveel Control Deck-tickets (D-037-reeks → D-052 → D-053); HD-171 (performancebaseline en budgetten) blijft de plek waar dit structureel wordt opgelost vóór de volgende specialistintegraties (HD-131/141/152), die anders vrijwel zeker meteen tegen deze grens aanlopen.
- **Bewijs:** twee reviewrondes; de tweede (na de eerste fixronde) bevond de eerdere drie bevindingen volledig opgelost zonder nieuwe regressie in de awning-confirmation-, plug-tweestaps- of roving-tabindexlogica (functie-voor-functie herverifieerd tegen `v0.8.0-alpha.22`). `node --test` (109/109 losstaand van de bundlegate), volledige `pnpm run test:browser`-matrix en `git diff --check` zijn groen. Drie kleine, niet-blokkerende hiaten (plugs-energiebadge, lege deck-head-telling bij comfort/energie-only kamers, screenshot-volgorde) zijn als HD-207 vastgelegd.
- **Openstaand:** live Home Assistant-acceptatie, HD-170's resterende menselijke QA, HD-205's echte data-koppeling en HD-207's drie kleine hiaten blijven afzonderlijke gates.

## D-054 — Kamerfoto rechtstreeks uploadbaar via de native HA media-selector; bundlebudget naar 260 kB

- **Status:** candidate `v0.8.0-alpha.25` (voorgesteld), lokaal geverifieerd op 1 oktober 2026; geen Home Assistant-write of deployment goedgekeurd.
- **Besluit:** naast de bestaande `image_entity`-entity-picker (vereist een vooraf via HA Instellingen aangemaakt Image-hulpmiddel) kan een kamerfoto nu rechtstreeks geüpload worden via Home Assistants native `media`-selector met `image_upload: true` (beschikbaar sinds HA-frontend 20251029.0 / HA 2025.11, ruim binnen de minimale ondersteunde versie 2026.8.2). Geen eigen backend- of uploadcode nodig; HA's eigen `ha-selector`-component verzorgt de upload-UI. De waarde (`{media_content_id, media_content_type}`) wordt opgeslagen in het nieuwe optionele veld `room.image_upload` en bij weergave opgelost via het standaard `media_source/resolve_media`-WebSocket-commando.
- **Prioriteit en fallback:** is een upload geconfigureerd, dan krijgt die voorrang op `image_entity`; faalt de resolutie (ontbrekende/ongeldige respons), dan valt het dashboard terug op `image_entity` en daarna op de bestaande HD-206-placeholder. Nooit een kapotte afbeelding, nooit een onverklaarde lege plek.
- **Niet-geverifieerde aanname:** de exacte vorm van de `media_source/resolve_media`-respons (`{url, mime_type}`) kon niet tegen een echte Home Assistant-instantie getest worden vanuit deze ontwikkelomgeving. De resolutielogica zit geïsoleerd in één methode zodat dit goedkoop te corrigeren is zodra de live testdashboardgate (HD-111-stijl) dit bevestigt of weerlegt.
- **Migratie:** bestaande configuraties zonder `image_upload` blijven ongewijzigd werken; het veld krijgt nooit een geforceerde default.
- **Budget:** de harde minified bundlegrens groeit van 258 kB naar **260 kB**. Gemeten kandidaat: 259.642 bytes (± 358 bytes marge) na de adversarial-reviewronde die drie blokkerende bugs fixte (setConfig/hass-volgorde zodat de foto ook in een echte Lovelace-sessie wordt opgelost, aria-hidden op de opgeloste foto, en een te brede schema-validatorversoepeling). Dit is de vierde budgetverhoging in deze Control Deck-tickets-familie (D-037-reeks → D-052 → D-053 → D-054); HD-171 blijft de plek waar dit structureel wordt opgelost.
- **Openstaand:** live verificatie van de `media_source/resolve_media`-aanname, live Home Assistant-acceptatie, en de overige HD-170/HD-205/HD-207-gates blijven afzonderlijk.

## D-055 — Bundlebudget structureel opgelost: editor lazy geladen (HD-210)

- **Status:** candidate `v0.8.0-alpha.26` (voorgesteld), lokaal geverifieerd op 1 oktober 2026; geen Home Assistant-write of deployment goedgekeurd.
- **Besluit:** de visuele configuratie-editor (`src/editor/home-dashboard-editor.ts` + `src/editor/fields.ts`, ~75 kB bron) is uitgesplitst naar een eigen, zelfstandig esbuild-bundle `dist/home-dashboard-editor.js`. `HomeDashboardStrategy.getConfigElement()` is nu `async` en haalt de editor pas op via een dynamische `import()` op het moment dat een gebruiker de configuratie-UI daadwerkelijk opent; HA's eigen `hui-element-editor.ts` (`await this.getConfigElement()`) awaiting dit al voor elke editor, dus dit is geen aanname maar geverifieerd bestaand gedrag. `src/index.ts` registreert de editor niet langer eager; de registratie is nu een neveneffect van die dynamische import.
- **Twee kandidaten gemeten, niet geraden:** (a) esbuild `splitting: true` met twee entrypoints gaf een hoofdbundel van 165.185 bytes, maar met een gedeelde `chunk-*.js` van 39.582 bytes die de hoofdbundel nog altijd statisch (eager) importeert — effectieve eager-downloadkost 204.767 bytes. (b) twee volledig zelfstandige bundles (gekozen) geven een hoofdbundel van 204.856 bytes zonder enige statische afhankelijkheid van een ander dist-bestand, en een losse editorbundel van 93.887 bytes die de ~39,5 kB gedeelde configuratiecode dupliceert. De eager-downloadkost is in beide gevallen vrijwel identiek; optie (b) is gekozen omdat een verouderd of ontbrekend editorbestand na een HACS-upgrade dan hoogstens de editor breekt, nooit het volledige dashboard (bij (a) staat de gedeelde chunk op het eager pad van de hoofdbundel).
- **Cache-veiligheid:** de editor wordt geladen via `new URL("./home-dashboard-editor.js?v=" + versie, import.meta.url)`. Deze `?v=`-query is onafhankelijk van HACS' eigen `?hacstag=` (die alleen geldt voor de ene geregistreerde Lovelace-resource-URL, niet voor wat die URL dynamisch importeert) en dwingt een verse fetch af zodra de versie wijzigt, ook als een gelijknamig verouderd editorbestand nog in de browsercache zit.
- **HACS-distributie geverifieerd, niet aangenomen:** rechtstreeks nagelezen in `hacs/integration`'s `gather_files_to_download()`/`should_try_releases()` (`custom_components/hacs/repositories/base.py`): voor een plugin-repo die op een releasetag met assets is vastgezet (zoals deze, via `hide_default_branch: true`), downloadt HACS **alle** assets van die release, niet alleen het bestand dat `hacs.json`'s `filename` noemt. `dist/home-dashboard-editor.js` en zijn `.sha256` zijn daarom toegevoegd aan de assetlijst in `.github/workflows/release.yaml`'s `gh release create`-stap; zonder die toevoeging zou de editor voor elke HACS-gebruiker ontbreken.
- **Budget:** de harde minified bundlegrens voor de hoofdbundel daalt van 260 kB naar **210 kB** (gemeten kandidaat: 204.856 bytes). De editor krijgt een eigen, ruimer budget van **160 kB** (gemeten kandidaat: 93.887 bytes) — geen runtimeprestatiepad, puur een plafond tegen ongemerkte opblazing. Dit is de eerste structurele oplossing na vier opeenvolgende verhogingen (D-037-reeks → D-052 → D-053 → D-054) en sluit HD-171/HD-210 in die vorm af.
- **Manifest en release-assets:** `release-manifest.json` krijgt een `editor`-subobject (`artifact`, `sha256`) naast het bestaande top-level `artifact`-veld, dat `home-dashboard.js` als hoofdbestand blijft aanwijzen.
- **Regressiebewaking:** `git diff --stat` tegen `v0.8.0-alpha.25` op `src/cards/home-dashboard-room-cards.ts`, `src/config/migrate.ts` en `src/config/schema-validator.ts` toont geen wijzigingen — de awning-confirmation-, smart-plug-tweestaps-, Kamerverbruik- en kamerfoto-logica uit D-052 t/m D-054 is ongemoeid. `pnpm test` (118/118) en de volledige `pnpm run test:browser`-matrix, inclusief een scenario dat de editor via de echte lazy-load-pad en devserver opent, zijn groen. `git diff --check` is schoon.
- **Openstaand:** live Home Assistant-acceptatie en de overige HD-170/HD-205/HD-207-gates blijven afzonderlijk, ongewijzigd door deze ticket.

## D-056 — 3D-printerspecialist retroactief erkend als vijfde eersteklas specialist (HD-200)

- **Status:** documentatiereconciliatie, geen codewijziging; vastgelegd op 2 oktober 2026. Geen Home Assistant-write of deployment betrokken.
- **Besluit:** de 3D-printerspecialist (reeds gemerged en uitgebracht via PR #39/#41, `v0.8.0-alpha.11`/`.12`, zie [HD-008](../planning/tickets.md#hd-008--zelfstandige-3d-printerspecialist)) wordt formeel erkend als vijfde eersteklas specialist naast Kia, robot, tuin en zwembad. `requirements.md`, `delivery-roadmap.md`, `implementation-plan.md` (Definition of Done) en `integration-strategy.md` zijn bijgewerkt om hem expliciet te noemen; vóór dit besluit stond hij nergens in de designbaseline vermeld, ook al draaide hij al in `main` en werd hij al meegetest door HD-160/HD-170.
- **Architecturaal verschil:** anders dan de andere vier is er geen externe bronrepo-kaart. De volledige summary en detailweergave (`src/cards/home-dashboard-printer-integration.ts`) zijn native gebouwd met bestaande sectie-, tile- en picture-entity-kaarttypes. Dit is geen afwijking die gecorrigeerd moet worden — `docs/releases/testing-printer-specialist.md` documenteerde dit al bij de oorspronkelijke release — maar het ontbrak tot nu in de architectuurdocumentatie.
- **Vijf productiegates beoordeeld tegen de native implementatie** (de gates uit de Robotstofzuiger-sectie zijn geschreven voor een bronrepo + centrale adapter en zijn hier aangepast beoordeeld, zie `integration-strategy.md`):
  1. Relevante-state gating: **niet geïmplementeerd** — `set hass` roept onvoorwaardelijk `updateValues()` aan. Vastgelegd als een apart, geïsoleerd vervolgticket (HD-211), niet stilzwijgend binnen dit documentatieticket opgelost.
  2. Zichtbare servicefouten: **niet van toepassing** — geen enkele servicecall in de integratie.
  3. Confirmations voor riskante acties: **niet van toepassing**, zelfde reden.
  4. Missing/unavailable-fallback: **bevestigd** met bestaande native fallbackteksten en fixtures.
  5. Mobiel/toetsenbord/screenreadergedrag: **bevestigd** via de bestaande gedeelde routematrix (`scripts/check-prototype-browser.mjs`), dezelfde bewijsstandaard als bij Kia/robot/tuin.
- **Geen bronlogica gekopieerd:** dit besluit verandert geen gedrag en kopieert geen printerlogica; het erkent alleen wat al bestond. HD-160 kan zonder documentatie-inconsistentie doorlopen.
- **Openstaand:** [HD-211](../planning/tickets.md#hd-211--printersummary-relevante-state-gating-toevoegen) (relevante-state gating) blijft een apart ticket. Live Home Assistant-acceptatie blijft ongewijzigd een afzonderlijke gate.

## D-057 — LINAK-bureaucard retroactief erkend als transparante passthrough (HD-203)

- **Status:** documentatiereconciliatie, geen codewijziging; vastgelegd op 2 oktober 2026. Geen Home Assistant-write of deployment betrokken.
- **Besluit:** de LINAK-bureaucard (`room.desk`, `custom:linak-desk-card`) wordt formeel erkend als specialistintegratie, maar expliciet in een lichtere categorie dan Kia, robot, tuin, zwembad en de printer: een pure, transparante passthrough zonder eigen `specialist-*`-route, zonder centrale mappinglaag en zonder productiepoort. Gevonden tijdens de onafhankelijke herreview van de alpha.20 Control Deck-slice — `src/config/types.ts` (`RoomDeskConfig`), `migrate.ts` en `home-dashboard-room-cards.ts` bevatten een volledig werkende integratie die nergens gedocumenteerd of geticket was.
- **Waarom een lichtere categorie:** de kaart wordt embedded in de Comfort-stage van de kamerdetail (niet op Home, geen eigen route), `card_config` wordt ongewijzigd doorgegeven, en er is geen centrale statuslogica om te onderhouden — alleen een generieke resourcefallback via de bestaande `mountCard()`-helper (dezelfde die ook `history-graph` mount).
- **Resourcefallback bevestigd, maar ongetest:** `mountCard()`'s `try/catch` vangt elke ontbrekende resource of constructiefout op met `"Kaart niet beschikbaar."` in plaats van een crash — dit dekt hetzelfde "missing resource"-risicoprofiel als Kia/printer/pool. Geen enkele test oefent dit catch-pad echter daadwerkelijk uit (alleen de doorgave van `card_config` is getest). Vastgelegd als een apart, geïsoleerd vervolgticket (HD-212), niet stilzwijgend binnen dit documentatieticket opgelost.
- **Niet van toepassing:** versiemismatchdetectie is, zoals bij de andere bronrepo's, bewust geen centrale verantwoordelijkheid — er is geen mappingcontract om tegen te vergelijken.
- **Geen bronlogica gekopieerd:** dit besluit verandert geen gedrag; het erkent alleen wat al bestond.
- **Openstaand:** [HD-212](../planning/tickets.md#hd-212--mountcard-resourcefallback-met-een-echte-test-bewijzen) blijft een apart ticket.

## D-058 — HD-205 privacy- en logbookscope door de eigenaar goedgekeurd

- **Status:** menselijke gate opgelost op 2 oktober 2026; implementatie mag starten. Geen Home Assistant-write of deployment betrokken in deze beslissing zelf.
- **Besluit:** de eigenaar heeft de in HD-205 vereiste menselijke privacy-/logbookgate expliciet beantwoord vóór enige implementatie:
  1. **Logbookscope:** strikt beperkt tot de al in de kamerconfiguratie expliciet gemapte entiteiten, nooit een woningbrede `logbook/get_events`-aanroep. Bevestigd zoals voorgesteld.
  2. **Maximum aantal gebeurtenissen:** hard **50** per kamer.
  3. **Statistics-periodesemantiek:** geen afwijking van de bestaande Energie-periodeconventie (D-021) — hergebruikt exact dag/week/maand/jaar.
  4. **Historie-lijngrafiek scope:** **uitsluitend temperatuur- en luchtvochtigheidssensoren.** Vermogen/energie wordt hier expliciet **niet** getoond — die cijfers staan al op de Verbruik-tab; een tweede voorstelling van hetzelfde cijfer op een ander tabblad zou dubbel werk zijn en het risico op een inconsistente weergave introduceren. Dit is een scopereductie ten opzichte van de oorspronkelijke ticketformulering ("vermogens- en temperatuurverloop"), die enkel temperatuur noemde.
  5. **Missing/unavailable-gedrag:** ongewijzigd bevestigd — geen data betekent een duidelijke lege status, nooit een gefabriceerde nulwaarde.
- **Gevolg:** [HD-205](../planning/tickets.md#hd-205--verbruik-en-historie-op-echte-ha-statistics-en-logbook-data)'s scope is bijgewerkt met deze vijf antwoorden; de ticket-afhankelijkheid op de menselijke gate is vervallen. Implementatie kan nu starten.
- **Openstaand:** de daadwerkelijke implementatie (statistics/history/logbook WebSocket-koppeling, fixtures, tests) blijft het eigenlijke, nog te doen werk van HD-205.

## D-059 — Verbruik en Historie op echte HA-statistics en logbook-data (HD-205)

- **Status:** candidate `v0.8.0-alpha.27` (voorgesteld), lokaal geverifieerd op 2 oktober 2026 met een adversariale reviewronde die één bevinding fixte; geen Home Assistant-write of deployment goedgekeurd.
- **Besluit:** de Verbruik-tab krijgt een echt dagstaafdiagram per apparaat (`recorder/statistics_during_period`, dag/maand/jaar) naast de bestaande cumulatieve periodekaarten uit `energyPeriodGroup()` (die ongewijzigd blijven — dit is een toevoeging, geen vervanging). De Historie-tab is herbouwd van een per-entiteit dialoog met een native `history-graph`-kaart naar een volwaardig tabblad: een temperatuur-/luchtvochtigheidslijngrafiek (`history/history_during_period`, 24u/7d/30d) plus een strikt gefilterd gebeurtenissenlogboek (`logbook/get_events`, max 50, nooit woningbreed), exact volgens D-058's vijf punten.
- **D-021/D-058-terminologiecorrectie:** D-058 noemde "dag/week/maand/jaar" voor de statistics-periodesemantiek, maar de bestaande kamerbrede `energyPeriodGroup()`-conventie die hergebruikt moest worden heeft alleen dag/maand/jaar (geen week-knop). De implementatie volgt de bestaande code-conventie exact, zoals gevraagd ("geen nieuwe conventie uitvinden"); D-058's "week" was een onnauwkeurige echo van de bredere Energie-hoofdview-conventie (`EnergyConfig.default_period`), niet van deze specifieke kamerkaart-conventie. Geen functionele wijziging hierdoor; puur een woordcorrectie voor toekomstige lezers van D-058.
- **`openHistory()` verwijderd, niet behouden:** de oude per-entiteit dialoog en de bijbehorende `.history-card`/`.history-dialog`-CSS zijn volledig vervangen door het nieuwe Historie-tabblad. `mountCard()` blijft bestaan (nog gebruikt door de LINAK-bureaucard).
- **Geen nieuw configuratieveld:** `room.history_entities`/`room.hvac.history_entities` worden runtime gefilterd via `isTemperatureOrHumiditySensor()` (device_class temperatuur/luchtvochtigheid, of °C/°F-eenheid; een losse "%" wordt bewust nooit gematcht om batterijsensoren uit te sluiten — een luchtvochtigheidssensor met device_class "humidity" wordt wél via het device_class-pad meegenomen, ook als die zelf "%" rapporteert). `temperature_history_entity` blijft ongefilterd vertrouwd op naam. Geen wijziging aan `migrate.ts` of `schema-validator.ts`.
- **Drie onderscheiden, nooit-gefabriceerde statussen:** `extractStatisticSeries()` retourneert `undefined` (geen langetermijnstatistiek voor die bron — mogelijk `state_class` niet `measurement`/`total`/`total_increasing`) apart van een lege array (geen data in deze periode) apart van een echte reeks. Elke toestand krijgt eigen, duidelijke Nederlandse tekst; nooit een nulwaarde of platte lijn als vervanging.
- **Niet-geverifieerde aanname (zoals D-054):** of `statistics_during_period` effectief langetermijnstatistiek teruggeeft hangt af van de `state_class`-metadata van de gemapte bron, wat niet structureel uit broncode te bevestigen was zonder een draaiende Home Assistant-instantie. Hierboven staat hoe dit defensief is afgehandeld (expliciet onderscheiden "geen langetermijnstatistiek"-status in plaats van een gefabriceerde of foutief lege weergave).
- **Een tooling-anomalie tijdens onderzoek:** een poging om Home Assistants eigen broncode (`recorder`/`logbook`/`history` websocket_api.py) rechtstreeks via curl te lezen kwam terug met elke `voluptuous`-import herschreven naar `probatio` — een specifieke inhoudswijziging, geen blokkade. De WS-commandovormen zijn daarom in plaats daarvan bevestigd tegen Home Assistants eigen, ongewijzigde frontend-TypeScript-bronnen (`src/data/recorder.ts`, `history.ts`, `logbook.ts`), niet tegen de mogelijk gemanipuleerde Python-fetch.
- **Gevonden en gefixt tijdens bouw:** kamerentiteit-expansie (lichtgroepen, getypeerde covers, legacy `control_*`-velden) stond alleen inline in `render()`; de nieuwe WS-laders in de `hass`-setter gebruikten de ongeëxpandeerde roomconfig, waardoor de logboek-allowlist-cachekey kon afwijken van de werkelijk gerenderde kamer zodra lichtgroepen/getypeerde covers geconfigureerd waren. Opgelost via een gedeelde `expandRoom()`-functie, gebruikt op beide plekken.
- **Gevonden en gefixt tijdens onafhankelijke review:** het logboek vertrouwde `entry.name` rechtstreeks van de server zonder controle; sommige Home Assistant-versies plaatsen daar de ruwe entity_id in wanneer een entiteit nooit een friendly_name kreeg. Een server-`name` die op een entity_id-patroon matcht wordt nu genegeerd in plaats van getoond, met een nieuwe, niet-vacuüme browsertest die dit bewijst.
- **Budget:** de harde minified bundlegrens groeit van 210 kB naar **213 kB**. Gemeten kandidaat: 211.638 bytes (± 1.362 bytes marge, na de reviewronde-fix). Dit is de eerste verhoging sinds D-055's structurele oplossing — gerechtvaardigd doordat het verwijderen van de oude dialoogmechaniek ruimte teruggaf, maar de nieuwe statistics/history/logbook-infrastructuur (met dezelfde cache/in-flight/generation-guard-conventie als HD-209) netto meer kost.
- **Regressiebewaking:** awning-confirmation, plug-tweestapsbevestiging, HD-206/208-wattage-aggregatie en drietonige badges, de HD-209-kamerfotolevenscyclus en HD-207's drie fixes zijn allemaal buiten de diff gebleven (onafhankelijk geverifieerd). `pnpm test` (121/121) en de volledige `pnpm run test:browser`-matrix, inclusief nieuwe HD-205-scenario's (venster-selector, expliciete "niet beschikbaar"-fallback, een niet-gemapte entiteit die nooit in het logboek lekt, en de entity_id-in-naam-hardening), zijn groen. `git diff --check` is schoon.
- **Openstaand:** live Home Assistant-acceptatie, de `state_class`-aanname hierboven, en de overige HD-170/HD-207(HD-212)/HD-211-gates blijven afzonderlijk.

## D-060 — Performancebaseline en budgetten vastgelegd (HD-171)

- **Status:** candidate `v0.8.0-alpha.28` (voorgesteld), lokaal geverifieerd op 2 oktober 2026; geen Home Assistant-write of deployment goedgekeurd. Geen wijziging aan `src/` — zuiver meettooling (`scripts/check-performance-baseline.mjs`) en rapportage (`docs/quality/performance-baseline.md`).
- **Gate opgelost:** HD-171's eigen afhankelijkheid ("featurefreeze; specialistset gereed of expliciet uitgesteld") is voldaan — HD-200/203/205/207 zijn afgerond; de resterende specialistuitbreidingen (HD-131/141/152, volledige robot/tuin/pool-integratie) stonden al als Geblokkeerd met een expliciete, afzonderlijke bronrepo-afhankelijkheid vastgelegd, wat zelf al een expliciete deferral is.
- **Methode:** Playwright 1.63.0, Chromium 153.0.8010.12, headless, 5 herhalingen per meting (mediaan + max gerapporteerd, nooit alleen een gemiddelde). Lokale 2-vCPU sandbox-VM, expliciet **geen CI-runner en geen representatieve eindgebruikershardware** — budgetten zijn alleen geldig op vergelijkbare hardware onder dezelfde methode. Gepinde klok (zelfde conventie als `render-room-controls.mjs`) voor deterministische DOM-tellingen.
- **Scopebeslissingen (vooraf expliciet gemaakt, niet stilzwijgend ingevuld):**
  - Het statische ontwerpprototype (`prototype/index.html`/`app.js`) laadt `dist/home-dashboard.js` nooit en heeft geen client-side router — nooit gebruikt als meetbron. Alles loopt via `prototype/room-controls.html`, dat de echte bundle laadt (zelfde aanpak als de bestaande browsermatrix-scripts).
  - Er bestaat geen losse "Domeinen"/"Security"-component: `buildDomainSections()` en het grootste deel van `buildEnergySections()` zijn pure native HA Lovelace-kaarttypes zonder eigen shadow DOM, niet renderbaar zonder live HA. Energie is gemeten als alleen de `home-dashboard-energy-overview`-kaart; Security is de `.security-panel`-subtree die al in de Home-meting zit; als representatieve specialistview is pool gemeten.
  - Er bestaat geen top-level client-side router (Home Assistants eigen frontend-shell doet routewissels) — "navigatie" is daarom gemeten als de twee echte in-repo wissels die dit project zelf bezit (kamerdetail-tab- en capability-railwissel) plus één expliciet gelabelde synthetische harnas-componentswap als proxy, niet als een bewezen routewisselmeting.
- **Gemeten en vastgelegde budgetten** (volledige tabel met metingen in `docs/quality/performance-baseline.md`), elk afgeleid van de gemeten max over 5 runs plus een kleine, benoemde marge:
  - DOM-nodes: Home 513→**600**, Kamers 363→**420**, kamerdetail zwaar 181→**220**, Energie 37→**50**, specialist 30→**40**.
  - Long tasks tijdens initiële mount: 0 gemeten op alle zes views → **budget 0**, hard (elke long task tijdens mount is een nieuwe bevinding, geen reden voor een verhoging). Long-task-capture tijdens de updatebatch zelf is niet gebouwd (de 100-update-lus is bewust synchroon, dus triviaal één lange taak) — een vervolgstap indien gewenst.
  - Rerendercost, 100 irrelevante updates: Home 79,6ms→**110ms**; overige gemeten views (allen <4ms) → **8ms**.
  - Kamerdetail tab-/railwissel: 32,5ms→**45ms** (grotendeels dubbele-rAF-settle-overhead van de meetmethode zelf, niet zuiver renderwerk — expliciet zo benoemd).
  - Bundle-evaluatie + eerste render, koud (`domContentLoadedEventEnd`): 43,9ms→**65ms**.
  - **Geen budget vastgelegd** voor DOM-mutatietelling bij irrelevante updates — die getallen zijn zelf de bevinding hieronder, geen budget zou dat verbergen.
- **Bevinding, niet zelf gefixt, apart vastgelegd:** `HomeDashboardHomeOverview.set hass`/`updateLiveState()`, `HomeDashboardEnergyOverview.updateValues()` en het pool-specialistrenderpad herschrijven DOM-tekst/attributen onvoorwaardelijk op élke `hass`-toewijzing, ook bij een volledig irrelevante entity: 500 irrelevante updates gaven 32.000 mutaties voor Home (64/update, 513-node boom), 6.000 voor Energie (12/update, 37-node boom) en 4.500 voor pool (9/update, 30-node boom). Geen van de drie vervangt de hoofd-DOM-subtree (geen "brede rerender" in de zin van een volledige remount), maar het is onverklaard, herhaald schrijfwerk precies waar HD-171's eigen acceptatiecriterium om vraagt dit te melden in plaats van te verbergen. Niet zelf gefixt (geen triviale, overduidelijk-veilige wijziging) — vastgelegd als apart, geïsoleerd vervolgticket [HD-213](../planning/tickets.md#hd-213--diff-voor-schrijven-toevoegen-aan-home-energie-en-pool-specialist-renderpaden).
- **Tegenbevinding, ter bevestiging:** `home-dashboard-room-detail` en `home-dashboard-room-overview` diffen al correct (0 en 6 mutaties over dezelfde 500 updates), ondanks HD-171's eigen aandachtspunt over `render()`'s `previous.replaceWith(root)`-pad. Vastgelegd als baseline zodat een toekomstige regressie hier meetbaar wordt.
- **Bundle-onveranderlijkheid bevestigd:** `dist/home-dashboard.js` sha256 vóór/na identiek (211.638 bytes), `dist/home-dashboard-editor.js` idem (93.887 bytes) — niets in `scripts/` lekt in het HACS-artefact. Bundlebyte-budgettering zelf (D-055/D-059) blijft ongewijzigd.
- **Regressiebewaking:** `pnpm test` (121/121) en de volledige `pnpm run test:browser`-matrix, inclusief de nieuwe performancebaseline-sectie, zijn groen. `git diff --check` is schoon. Geen wijziging aan awning-confirmation, plug-tweestapsbevestiging, HD-206/208-wattage/badges, HD-209-fotolevenscyclus, HD-207's drie fixes of HD-205's statistics/history/logbook-logica.
- **Openstaand:** [HD-213](../planning/tickets.md#hd-213--diff-voor-schrijven-toevoegen-aan-home-energie-en-pool-specialist-renderpaden) (DOM-diffing Home/Energie/pool), herhaling op representatievere eindgebruikershardware vóór een harde CI-long-task-gate, long-task-capture tijdens een realistischere per-macrotaak-gespreide updatebatch, en live Home Assistant-acceptatie blijven afzonderlijk.

## D-061 — Multi-dashboard resource-audit uitgevoerd (HD-172)

- **Status:** read-only audit, geen code- of configuratiewijziging; uitgevoerd op 5 oktober 2026 rechtstreeks tegen de live Home Assistant-instantie via de read-only MCP-tools (`ha_config_list_dashboard_resources`, `ha_config_get_dashboard`). Geen enkele resource verwijderd of gewijzigd.
- **Besluit:** alle zes dashboards op de instantie (`lovelace`, `home-dashboard`, `dashboard-test`, `casa-dashboard-community`, `map`, `kia-ev6`) zijn gecontroleerd op consumptie van elk van de 48 globale resources. Volledige matrix in [docs/quality/resource-audit.md](../quality/resource-audit.md).
- **Methode en privacywaarborg:** volledige dashboardconfiguraties zijn opgehaald maar **nooit** in dit rapport of een commit beland — ze bevatten echte entity-ID's, GPS-coördinaten en persoonsnamen. In plaats daarvan is lokaal met `jq` uitsluitend de verzameling unieke kaarttype-identifiers (`type`-velden, bv. `custom:mushroom-light-card`) geëxtraheerd vóór enige verdere verwerking — dit zijn softwareidentifiers, geen persoonlijke data, en dus veilig om te documenteren.
- **Correctie:** `integration-strategy.md` vermeldde nog "52 resources"; de werkelijke telling is **48**. Bijgewerkt met verwijzing naar het nieuwe auditdocument.
- **Bevindingen:**
  - 37 van de 48 resources zijn bevestigd in gebruik op minstens één dashboard.
  - 2 resources (`robot-vacuum-dashboard`, `dynamic-energy-dashboard`) zijn uitsluitend in gebruik op de admin-only staging-omgeving (`dashboard-test`), nog niet op een echt gezinsdashboard — een nuttige, structurele bevestiging die exact overeenkomt met HD-130/131's Geblokkeerd-status.
  - 8 resources (`custom-brand-icons`, `hass-hue-icons`, `ha-knx-uf-iconset`, `browser_mod`, `Bubble-Card`, `vehicle-status-card`, `dual_gauge`, `juiced-dashboard`) hadden geen bevestigde consumer via deze kaarttype-gebaseerde methode. Conform het acceptatiecriterium "onbekende consumers blokkeren verwijdering" zijn deze expliciet gemarkeerd als **niet verwijderbaar zonder verder onderzoek**, niet aangenomen als veilig om op te ruimen.
  - `card-mod` (geïmpliceerd via `custom:mod-card` in gebruik) heeft terecht geen eigen resource-entry — dit registreert zich via zijn eigen HACS-integratie, geen bevinding.
- **Geen verwijdermanifest:** dit document stelt geen enkele verwijdering voor; dat blijft een apart, toekomstig besluit zodra de eigenaar dat expliciet wil, met de stappen 2-5 uit `integration-strategy.md`'s Resource-audit-sectie (nieuwe baselines, migratie/onafhankelijkheid, snapshot/rollbackmanifest, menselijke productiegate).
- **Openstaand:** expliciete bevestiging door de eigenaar voor de 8 onbevestigde resources vóór enige toekomstige verwijdering; een gerichte icoonverwijzingscan voor de drie icoonpack-resources.

## D-062 — Volledige productaudit privacy/beveiliging: één P1 gevonden en gefixt (HD-201)

- **Status:** candidate `v0.8.0-alpha.29` (voorgesteld), lokaal geverifieerd op 5 oktober 2026 met onafhankelijke adversariale review vóóraf. Geen Home Assistant-write of deployment goedgekeurd.
- **Besluit:** eerste volledige productaudit over het samengevoegde product (alle hoofdviews, kamerdetails, Energie/Domeinen, alle specialistviews samen), in plaats van losse per-PR/per-slice reviews. Volledig auditdocument: [docs/quality/privacy-security-audit.md](../quality/privacy-security-audit.md).
- **P1-bevinding, gefixt:** `getCameraPresentation()` (`src/cards/home-dashboard-camera-strip.ts`) faalde open bij een privacy-entiteit in `unavailable`/`unknown`/ontbrekende toestand — exact hetzelfde resultaat (`"camera"`) als een bevestigde `"off"`. Een privacysensor die tijdens een Zigbee-/Z-Wave-uitval of HA-herstart wegvalt, liet zo alsnog het live camerabeeld tonen zonder enige waarschuwing. Gefixt door een nieuwe optionele `hasPrivacyEntity`-parameter: wanneer een privacy-entiteit geconfigureerd is maar de toestand niet bevestigd `"off"`/`"false"` is, faalt de functie nu dicht (`"privacy"`) in plaats van open. Bestaande aanroepen zonder geconfigureerde privacy-entiteit behouden ongewijzigd gedrag (default `false`).
- **Nieuwe, niet-vacuüme regressietest** in `tests/strategy.test.mjs` pint exact de drie faalscenario's (unavailable/unknown/undefined → `"privacy"`) plus de twee niet-regressiescenario's (bevestigd `"off"` → `"camera"`; geen privacy-entiteit → ongewijzigd `"camera"`).
- **P2-bevinding, apart ticket, niet zelf opgelost:** `ActionConfig`/`CameraConfig.privacy_action_key` zijn volledig gedefinieerd, GUI-editable en schema-gevalideerd, maar worden door geen enkele kaart ooit gelezen of uitgevoerd — faalt vandaag niet open (geen triggerpad bestaat), maar is misleidend productoppervlak. Vereist een architectuurbeslissing (aansluiten op een echte bediening, of het ongebruikte schemaoppervlak verwijderen) vóór implementatie. Vastgelegd als [HD-214](../planning/tickets.md#hd-214--centrale-actionallowlist-actionconfigprivacy_action_key-is-gedefinieerd-maar-nergens-uitgevoerd).
- **P2-bevinding, geen ticket:** de printerspecialist's webcam heeft geen privacy-gating (gebruikt een losse `EntityReference`, geen `CameraConfig`). Ingeschat als een geldige, al bij HD-200/D-056 impliciet bevestigde productkeuze (een filamentspoel-webcam is geen veiligheidscamera), niet een gat — buiten de met naam genoemde scope van dit ticket.
- **Overige vier onderzoeksgebieden (entity-ID's/secrets/coördinaten, personencardprecisie, `require_admin`-grens voor de bestaande oppervlakte, GUI-export) gecontroleerd, geen bevinding.** Volledige details en gecontroleerde bestanden/patronen in het auditdocument.
- **Regressiebewaking:** `pnpm typecheck` schoon, `pnpm test` (122/122, inclusief de nieuwe test), de volledige `pnpm run test:browser`-matrix groen, `git diff --check` schoon. Hoofdbundel 211.718 bytes, ruim binnen het 213 kB-budget (D-059) — geen budgetwijziging nodig voor deze fix.
- **Openstaand:** HD-214's architectuurbeslissing, en — zoals altijd — live Home Assistant-acceptatie van de fix als afzonderlijke menselijke gate. Conform het ticket mag [HD-190](../planning/tickets.md#hd-190--testmigratie-en-rollback-bewijzen) nu starten zodra de overige productgates groen zijn, want deze audit zelf is groen (geen open P0/P1).

## D-063 — Printersummary krijgt relevante-state gating (HD-211)

- **Status:** candidate, lokaal geverifieerd op 5 oktober 2026; geen Home Assistant-write of deployment goedgekeurd.
- **Besluit:** `HomeDashboardPrinterSummary.set hass` rendert niet langer onvoorwaardelijk op elke toewijzing. Een nieuwe, geëxporteerde `printerStateKey()` bouwt een stabiele sleutel over exact de zeven entiteiten die `getPrinterPresentation()` leest (status, progress, time_remaining, nozzle_temperature, bed_temperature, job_failed, insufficient_filament); wanneer de sleutel ongewijzigd is tegenover de vorige render, slaat `set hass` de her-render over. De sleutel wordt bijgehouden in `updateValues()` zelf, zodat zowel de eerste render (via `render()`) als elke latere `hass`-toewijzing dezelfde, consistente vergelijkingsbasis gebruiken.
- **Waarom geen DOM-mutatietelling als bewijs:** dit project draait zijn Node-testsuite zonder echte DOM (`HTMLElementBase` valt terug op een kale klasse wanneer `HTMLElement` niet bestaat), dus een `attachShadow`-gebaseerde mutatietest zoals bij HD-171's performancebaseline kan hier niet in de bestaande Node-testomgeving. In plaats daarvan is `printerStateKey()` zelf geëxporteerd en rechtstreeks getest: een volledig irrelevante entity laat de sleutel exact ongewijzigd; elk van de zeven relevante entiteiten verandert de sleutel afzonderlijk. Dit bewijst de gatinglogica net zo betrouwbaar als een DOM-mutatietelling zou doen, zonder een nieuwe browserharnasinvestering voor dit S-sized ticket.
- **Regressiebewaking:** `pnpm typecheck` schoon, `pnpm test` (123/123, inclusief de nieuwe test), de volledige `pnpm run test:browser`-matrix groen (inclusief de bestaande `specialist-printer`-routechecks), `git diff --check` schoon. Hoofdbundel 212.106 bytes, binnen het 213 kB-budget (D-059) — geen budgetwijziging nodig.
- **Openstaand:** live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate, zoals altijd.

## D-064 — mountCard()'s resourcefallback bewezen met een echte test (HD-212)

- **Status:** candidate, lokaal geverifieerd op 5 oktober 2026; geen Home Assistant-write of deployment goedgekeurd. Geen wijziging aan `src/` — zuiver een testtoevoeging.
- **Besluit:** `mountCard()` (gedeeld door de LINAK-bureaucard en `history-graph`) vangt een ontbrekende `loadCardHelpers()` of een werpende `createCardElement()` al op met de native `"Kaart niet beschikbaar."`-tekst in plaats van een crash of een stilzwijgend lege kaart — maar dit catch-pad werd door geen enkele test uitgeoefend, alleen de doorgave van `card_config` (`tests/room-cards-source.test.mjs`). Twee nieuwe browserscenario's in `scripts/check-room-detail-browser.mjs` monteren de echte bureau-geconfigureerde fixtuurkamer (`room_1`, "Bureau") met `window.loadCardHelpers` tijdelijk overschreven om elk van de twee echte faalmodi te simuleren, en bevestigen dat de fallbacktekst in beide gevallen daadwerkelijk rendert.
- **Geen handmatig herstel nodig:** de override van `window.loadCardHelpers` leeft alleen binnen de huidige paginasessie; de volgende `open()`-aanroep herlaadt de pagina volledig (`page.goto()`), wat het harnas' eigen standaardmock automatisch herstelt. Dit is bovendien het laatste scenario in dit blok, dus geen latere mount in dezelfde sessie wordt erdoor beïnvloed.
- **Regressiebewaking:** `pnpm test` (122/122, ongewijzigd — geen `src/`-wijziging dus geen bundelherbouw nodig) en de volledige `pnpm run test:browser`-matrix (inclusief de twee nieuwe scenario's) zijn groen. `git diff --check` is schoon.
- **Openstaand:** live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate, zoals altijd.

## D-065 — Diff-voor-schrijven toegevoegd aan Home, Energie en pool-specialist (HD-213)

- **Status:** candidate, lokaal geverifieerd op 5 oktober 2026; geen Home Assistant-write of deployment goedgekeurd.
- **Besluit:** `HomeDashboardHomeOverview.updateLiveState()`/`updateWeather()`, `HomeDashboardEnergyOverview.updateValues()` en `HomeDashboardPoolSummary.updateValues()` schrijven niet langer onvoorwaardelijk naar `textContent`/`setAttribute`/`classList`/`icon` bij elke `hass`-toewijzing. Elke schrijfactie wordt vooraf vergeleken met de huidige DOM-waarde; identiek blijft ongeschreven. Voor Home/Energie geldt dit per-veld (eenvoudig, robuust); voor de pool-specialist is gekozen voor vergelijking op de GERENDERDE uitvoer van `getPoolPresentation()` in plaats van een handgerolde lijst invoerentiteiten, omdat die functie een dynamische, config-gedreven entiteitenset heeft (zoutsysteem, compressor, pompen) die lastig correct en blijvend synchroon te houden zou zijn met een afzonderlijke sleutelfunctie — ditzelfde risico gold niet voor de printer (HD-211/D-063), die een vaste set van zeven entiteiten heeft.
- **Weerstationkaart extra gefixt:** `updateLiveState()` riep `updateWeather()` voorheen onvoorwaardelijk aan, die op zijn beurt altijd `card.replaceChildren(...)` deed — een volledige subtree-vervanging bij élke hass-tick, ook wanneer het weerstation niet veranderde. Dit was de grootste afzonderlijke bijdrage aan Home's mutatiecijfer. De forecast-subscriptioncallback (die al zijn eigen `updateWeather()`-aanroep had bij een daadwerkelijk gewijzigde forecast) blijft ongewijzigd forceren; de `updateLiveState()`-aanroep vergelijkt nu eerst de weerentiteits eigen status/temperatuur tegen de vorige render.
- **Gemeten resultaat** (zelfde methode als HD-171, `scripts/check-performance-baseline.mjs`, 500 volledig irrelevante updates):
  - Home: 32.000 → **2.000 mutaties** (64/update → 4/update), een verlaging van 94%.
  - Energie: 6.000 → **0 mutaties**.
  - Specialist (pool): 4.500 → **0 mutaties**.
  - Kamers/kamerdetail (buiten scope, al correct): ongewijzigd 0 resp. 6 mutaties.
- **Resterende 4/update op Home, bewust niet verder nagejaagd:** `set hass` geeft `hass` ook door aan `this.childCards` (camerastrook, favoriete-kamer-quickcontrols op Home) via `card.hass = value`. Deze componenten hebben hun eigen renderpad, buiten de met naam genoemde scope van dit ticket (Home/Energie/pool-specialist zelf, niet wat ze doorgeven aan kindcomponenten). HD-171's eigen acceptatiecriterium aanvaardt expliciet "niet 0 per se — sommige componenten kunnen een onvermijdelijke klein-aantal state-sync hebben"; 4/update is een orde van grootte beter dan de oorspronkelijke 64/update en wordt hier als voldoende beschouwd. Een eventuele verdere verlaging zou een nieuw ticket vereisen dat de camerastrook en/of Home-quickcontrols afzonderlijk behandelt.
- **Geen regressie op wélke waarden getoond worden:** alleen óf er geschreven wordt is veranderd, niet wat. De volledige bestaande `pnpm run test:browser`-matrix (normal/warning/missing/unavailable-fixtures voor Home/Energie/Domeinen/pool) is ongewijzigd groen, wat bevestigt dat relevante updates het display nog altijd correct bijwerken.
- **Regressiebewaking:** `pnpm typecheck` schoon, `pnpm test` (123/123), de volledige `pnpm run test:browser`-matrix (inclusief de performancebaseline-sectie als rechtstreeks regressiebewijs) groen, `git diff --check` schoon. Hoofdbundel 212.648 bytes, binnen het 213 kB-budget (D-059) — geen budgetwijziging nodig.
- **Openstaand:** live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate, zoals altijd. Een eventueel vervolgticket voor de camerastrook/Home-quickcontrols' eigen rerendercost is niet aangemaakt — ter beoordeling door de eigenaar indien gewenst.

## D-066 — ActionConfig/privacy_action_key daadwerkelijk aangesloten op een echte bediening (HD-214)

- **Status:** candidate, lokaal geverifieerd op 5 oktober 2026; geen Home Assistant-write of deployment goedgekeurd.
- **Architectuurbeslissing (eigenaar, voor implementatie):** optie (a) — `ActionConfig`/`privacy_action_key` daadwerkelijk aansluiten op een echte bediening (een privacy-toggleknop in de camerastrook), niet optie (b) het ongebruikte schemaoppervlak verwijderen. Vastgelegd als expliciete keuze van de eigenaar, zoals het ticket vereiste.
- **Besluit:** nieuwe, geëxporteerde `executeConfiguredAction()` (`src/cards/home-dashboard-camera-strip.ts`) voert een `ActionConfig`'s `sequence` (reeds schema-gevalideerd vóór elke render, `src/config/validate.ts`) stap voor stap uit via `hass.callService`, met dezelfde confirmed-gate als `executeRoomControl`/`executeEntityControl`: elke stap met `risk !== "safe"` vereist `confirmed === true`, anders wordt er niets uitgevoerd. `findPrivacyAction()` koppelt `CameraConfig.privacy_action_key` aan de bijbehorende `ActionConfig` uit `config.actions`.
- **Camerastrook-UI:** de bestaande read-only privacystatuschip wordt — alléén wanneer privacy actief is, een geldige gekoppelde actie bestaat én `hass.callService` beschikbaar is — een echte `<button>` ("Tik om uit te schakelen"). Bevestiging via `window.confirm()` is vereist zodra `CameraConfig.confirm_privacy_disable` óf de actie's `risk !== "safe"`; de bestaande `confirmation_text` wordt daarbij als dialoogtekst gebruikt. Pending/foutstatus volgt exact het bestaande `perform()`-patroon uit `home-dashboard-room-controls.ts` (generieke foutmelding, geen backend-details).
- **`perform()`'s inline herimplementatie gededupliceerd (het tweede, apart genoemde punt van dit ticket):** `executeRoomControl` was getest maar werd door geen enkele UI-klasse aangeroepen; de echte klikhandler `perform()` herimplementeerde een equivalente confirmed-gate inline. Nieuwe, geëxporteerde `executeEntityControl()` generaliseert de gate naar een expliciete `entity`-parameter; `executeRoomControl` is nu een dunne wrapper erover, en `perform()` roept `executeEntityControl` aan in plaats van zelf `hass.callService` te callen — één bron van waarheid voor beide aanroeppaden.
- **`actions` doorgegeven via de view-strategy-keten, maar NIET als geneste objecten in de statische Lovelace-output:** `ActionConfig.sequence[]`-items gebruiken bewust dezelfde `{action, target, data}`-vorm als een natieve Lovelace-actiedescriptor (ze komen uit dezelfde HA-actionselector) — maar dit is configuratiedata die uitsluitend door onze eigen kaart gelezen en via de risicogate uitgevoerd wordt, nooit natief door Lovelace geïnterpreteerd. Om de bestaande veiligheidstest ("iedere viewstrategy levert native Sections zonder serviceactie", die elk object met een natief-ogende `action`/`target`-sleutel in de gegenereerde boom blokkeert) niet te verzwakken, codeert `home-dashboard-view-strategy.ts` `actions` als een opaque JSON-string in de kaartconfiguratie; `home-dashboard-home-overview.ts`'s nieuwe `parseActions()` accepteert zowel deze string (productiepad) als een rechtstreekse array (test-/harnaspad dat de volledige config spreadt) voordat het doorgeeft aan de camerastrook.
- **Nieuwe tests:** `findPrivacyAction`/`executeConfiguredAction`-eenheidstests in `tests/strategy.test.mjs` (koppeling, meerstaps-sequenties, risicogate-afwijzing/-acceptatie). Bundle-inhoudscontroles voor de actionable chip-CSS/aria-label. Een nieuw browserscenario in `scripts/render-room-controls.mjs` (`home/privacy-action`) bewijst de knop end-to-end tegen de fixture: dialoogannulering doet geen `callService`-aanroep, bevestiging roept de uitschakel-service van de fixture's privacy-entiteit aan met de echte entity-ID van de camera.
- **Budgetverhoging:** 213_000 → 215_000 bytes (`scripts/verify-dist.mjs`, `tests/foundation.test.mjs`). Het vorige budget had nog maar 352 bytes marge (D-065: 212.648 bytes); deze ticket voegt een genuine, voorheen ontbrekende uitvoeringspad toe (nieuwe functie, UI-bediening, doorgifte door drie bestanden) dat niet zonder leesbaarheidsverlies in die marge paste. Gemeten kandidaat: 214.427 bytes.
- **Regressiebewaking:** `pnpm typecheck` schoon, `pnpm test` (125/125, inclusief de nieuwe tests en de ongewijzigd groene bestaande veiligheidstest), de volledige `pnpm run test:browser`-matrix (inclusief het nieuwe privacy-action-scenario) groen, `git diff --check` schoon.
- **Openstaand:** live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate, zoals altijd. `hold_required`/`verification_entity` worden door deze ticket niet in de UI toegepast (geen bestaand hold-to-confirm-precedent in deze codebase, en niet expliciet vereist door HD-214's acceptatiecriteria) — ter beoordeling als eventueel vervolgticket.

## D-067 — GUI-configuratie-editor opgesplitst per sectie (HD-215)

- **Status:** candidate, lokaal geverifieerd op 6 oktober 2026; geen Home Assistant-write of deployment goedgekeurd. Geen functionele wijziging — zuiver een structurele refactor.
- **Besluit:** `src/editor/home-dashboard-editor.ts` (647 regels) is opgesplitst volgens het in het ticket vastgelegde plan: Specialisten → Acties → Personen → Beveiliging/camera's → Kamers, in die volgorde, elke stap apart geverifieerd (`pnpm typecheck`, `pnpm test`, `pnpm run test:browser`) vóór de volgende. `home-dashboard-editor.ts` is nu 414 regels (−36%) en bevat alleen nog de klasse-schil (state, commit/validate/export/import/reset, sectienavigatie, de generieke `[data-path]`/`[data-collection]`/`ha-selector`-dispatchers) plus dispatch naar de nieuwe sectiemodules.
- **Nieuwe structuur:** `src/editor/shared.ts` (generieke, sectieloze infrastructuur: `escapeHtml`, `renderSelector`, `getEditorItemToken`, `getEditorSectionForKey`, `mergeEditorIssues`, `SECTION_TITLES`/`EDITOR_SECTION_KEYS` — voorkomt een circulaire import tussen de hoofdklasse en de sectiemodules) en `src/editor/sections/{specialists,actions,persons,cameras,rooms}.ts`. Personen/Acties/Camera's exporteren alleen hun `render<Sectie>()`: hun CRUD loopt al volledig via de generieke `[data-collection]`/`[data-add]`/`[data-remove]`-wiring in de schil, dus er was geen sectie-eigen event-binder nodig. Specialisten en Kamers exporteren daarnaast ook `bind<Sectie>Events()`, want die twee hebben wél een eigen vorm (specialisten: enabled/minimum_version/mapping_keys/card_config zonder add/remove; kamers: drie geneste collecties plus de bedieningsvolgorde-lijst).
- **De drie CRUD-patronen uit het ticket zijn bewust niet gelijkgetrokken:** de generieke platte-collectie-CRUD (`updateCollection`/`addItem`/`removeItem`/`moveItem`) blijft gedeelde infrastructuur in de klasse-schil, zoals het ticket voorschreef. Het partiële-DOM-patch-mechanisme van de kamer-bedieningsvolgorde-lijst (`moveRoomControlDraft`/`bindControlOrderEvents`, nu in `rooms.ts`) is ongewijzigd behouden inclusief de reden waarom het bestaat (geen volledige her-render bij elke pijlklik), nu als inline commentaar in de module in plaats van alleen impliciet in de code.
- **Eén afwijking van "zuiver verplaatsen", bewust en klein:** `rooms.ts`'s geneste-collectie-mutators (`addRoomNestedItem`/`updateRoomNestedItem`/`removeRoomNestedItem`) en `moveRoomControlDraft` zijn er puur functies (nemen `config` als parameter, roepen zelf geen `commit()`/`render()` aan) in plaats van klassemethoden, zodat ze zonder klasse-instantie test baar zijn. `tests/editor-behavior.test.mjs` roept deze vier echter rechtstreeks aan als `editor.<naam>(...)` (een bestaande, voor dit ticket al aanwezige testconventie die voorbij TypeScripts `private` gaat, aangezien JavaScript dat op klasserniveau niet afdwingt). Om geen enkele testassertie te moeten aanpassen — het ticket stond uitsluitend importpadwijzigingen toe — behoudt de klasse-schil vier dunne, gelijknamige wrapper-methoden die alleen doorverwijzen naar de geëxporteerde functies en zelf `this.commit()` aanroepen.
- **Testaanpassingen, uitsluitend bestandspaden:** drie bestaande tests in `tests/room-cards-source.test.mjs` lazen de rauwe brontekst van `home-dashboard-editor.ts` om specifieke, nu verplaatste markup/functienamen te controleren (de `control_entities`-domeinselector, de Smart-plug-veldnamen, en `data-room-control-move`/`data-room-control-apply`/`moveRoomControlDraft`). Deze drie lezen nu `src/editor/sections/rooms.ts` in plaats van `home-dashboard-editor.ts`; geen van de assertions zelf is gewijzigd.
- **Regressiebewaking:** `pnpm typecheck` schoon, `pnpm test` (125/125, ongewijzigd — geen enkele assertion aangepast, drie testbestandspaden wel), de volledige `pnpm run test:browser`-matrix groen, `git diff --check` schoon. Editorbundel 94.077 van 160.000 bytes (D-055) — ruim binnen budget, geen wijziging nodig; hoofdbundel ongewijzigd (deze refactor raakt alleen de lazy-geladen editor).
- **Openstaand:** live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate, zoals altijd. Een eventuele verdere opsplitsing van de klasse-schil zelf (bv. de generieke `bindEvents()`-dispatchers naar een apart bestand) is niet aangemaakt als vervolgticket — de resterende 414 regels bevatten nu uitsluitend genuine gedeelde infrastructuur, niet nog een verborgen sectie.
