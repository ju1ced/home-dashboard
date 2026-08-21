# Concept 3 — Hybrid

## Kernidee

Dit concept combineert een rustige, native Home Assistant-shell met precies één kleine, lokaal beheerde summary-component en de drie bestaande specialistische kaarten. Sections, views, subviews, Heading, Tile, Badge en Visibility bepalen de structuur, leesvolgorde, standaardinteracties en responsiviteit. De summary-component heeft drie declaratieve varianten — Kia, robot en tuin — en toont alleen de minimale operationele toestand, één duidelijke navigatie-ingang en hoogstens één aantoonbaar veilige actie. Zij herkent geen entities, berekent geen domeinstatus opnieuw en roept geen complexe services aan.

Home blijft attention-first: eerst kritieke waarschuwingen, dan woningcontext en enkele dagelijkse acties, daarna alleen actieve kamers en compacte specialistische summaries. Een vaste Kamers-view biedt toegang tot alle echte kamers. Woningbrede domeinen staan op een compacte Domeinen-view. Kamer-, specialistische en diagnostische details zijn semantische subviews met een expliciet `back_path`.

De volledige Kia-, robot- en tuinkaarten blijven zelfstandig via HACS geversioneerd en verschijnen uitsluitend op hun full-width detailsubview. Daardoor blijft hun bewezen mapping-, veiligheids-, fout- en detailgedrag intact, terwijl de centrale ervaring visueel en navigatief samenhangend wordt. Geen custom panel, runtime-router, publieke mapping of gekopieerde specialistische code.

## Informatiearchitectuur en navigatiemodel

### Zichtbare hoofdviews

1. **Home** — `/home`; operationeel overzicht en dagelijkse startplek.
2. **Kamers** — `/rooms`; alle 26 echte woon-/buitenareas, gegroepeerd per verdieping en buitenzone.
3. **Energie & water** — `/energy-water`; woningbrede energie-, solar-, EV-, water- en lekcontext.
4. **Domeinen** — `/domains`; compacte ingangen naar mobiliteit, schoonmaak, buiten/tuin, zwembad en secundaire functies.

Voorraad- en beheergroepen worden niet als kamer getoond. Systeembeheer en diagnostiek krijgen een afzonderlijk, nog te beslissen admin-dashboard of een beveiligde beheerroute; Visibility alleen wordt niet als autorisatie gebruikt.

### Subviews en paden

| Doel | Voorbeeldpad | Terugpad |
|---|---|---|
| Kamer | `/rooms/living-room` | `/rooms` |
| Kia | `/mobility/kia` | `/domains` |
| Robot | `/cleaning/robot` | `/domains` |
| Tuin | `/outdoor/garden` | `/domains` |
| Zwembad | `/outdoor/pool` | `/domains` |
| Energiedetail | `/energy-water/electricity` | `/energy-water` |

Home-summaries navigeren rechtstreeks naar de specialistische subview; de gebruiker hoeft niet eerst via Domeinen. Hoofdviews blijven beperkt en stabiel. Er zijn geen numerieke view-indexen of template-gegenereerde navigatieacties.

### Navigatieregels

- Een tap op de inhoud van een summary, kamerkaart of domeintegel opent details.
- Bediening heeft een afzonderlijke, gelabelde control; kaart-tap en actie-tap zijn nooit ambigu.
- Een subview gebruikt de native titel en terugnavigatie. De interne tabs van een specialistische kaart blijven alleen waar zij functionele detailnavigatie bieden.
- Niet-geconfigureerde secties worden niet gerenderd; een ontbrekende specialistische resource verwijdert niet de overige shellnavigatie.
- Frequente acties zijn op Home direct bereikbaar; secundaire acties kosten maximaal één extra navigatiestap.

## Wireframes

De wireframes tonen inhoudsvolgorde, niet de definitieve visuele stijl. Sections gebruikt de bronvolgorde; dense placement staat uit.

### Home

```text
┌─ Home ───────────────────────────────────────────────────────────┐
│ [Kritiek/waarschuwingen: alleen operationeel relevante items]   │
│ [Woningstatus: aanwezig · beveiligd · 2 actieve uitzonderingen] │
│ [Alles uit] [Nachtmodus] [Vertrek]                max. 2–4 acties│
├─ Nu actief ──────────────────────────────────────────────────────┤
│ [Woonkamer · licht/media] [Badkamer · hoge vochtigheid]         │
├─ Mobiliteit, schoonmaak en buiten ───────────────────────────────┤
│ [Kia  68% · 312 km · laden uit · bijgewerkt 8 min] [Details ›]  │
│ [Robot  bezig · 42% · woonkamer]                  [Details ›]  │
│ [Tuin  2 droge zones · irrigatie uit]             [Details ›]  │
├─ Verder ─────────────────────────────────────────────────────────┤
│ [Energie & water] [Zwembad] [Weer/afval] [Alle domeinen]        │
└──────────────────────────────────────────────────────────────────┘
```

Als niets aandacht vraagt, vervalt het waarschuwingsblok volledig en schuift woningcontext omhoog. Normale kamers worden niet als volledige lijst herhaald; die staan onder Kamers.

### Kamer

```text
┌─ ‹ Kamers   Woonkamer ───────────────────────────────────────────┐
│ [Context: 21,4 °C · 52% · bezet] [operationele waarschuwing]    │
├─ Licht ───────────────────────┬─ Klimaat en cover ──────────────┤
│ [Hoofdlicht  aan  60%]       │ [Thermostaat  21 °C]            │
│ [Sfeerverlichting  uit]      │ [Cover  35%]                    │
├─ Media ──────────────────────┴─ Safety ────────────────────────┤
│ [Speler · huidige toestand]    [Raam dicht · rookmelder normaal]│
├─ Meer ───────────────────────────────────────────────────────────┤
│ [Energie van kamer] [Historie] [Diagnostiek, alleen indien nodig]│
└──────────────────────────────────────────────────────────────────┘
```

Dezelfde sectievolgorde wordt voor iedere kamer gebruikt, maar alleen expliciet geconfigureerde capabilities verschijnen. Een operationeel belangrijke `unavailable` blijft zichtbaar met label en herstelroute; normale `unknown`-events/buttons worden niet tot alarm verheven.

### Domeindetail

```text
┌─ ‹ Domeinen   Mobiliteit / Kia ──────────────────────────────────┐
│ [Native contextbalk: status · dataversheid · kritieke melding]  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ custom:kia-dashboard-card                                  │ │
│ │ volledige kaart, full-width, eigen functionele detailtabs   │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ [Gerelateerde ingang: Energie & water / EV]                    │
└──────────────────────────────────────────────────────────────────┘
```

Robot en tuin volgen exact dezelfde shell: native subviewheader, eventueel één compacte contextregel, daarna de bestaande kaart full-width. De centrale laag voegt geen concurrerende detailcontrols toe.

## Prioritering van informatie en acties

### Informatieniveaus

1. **Kritiek:** alarm, lek, relevante beveiligingsstatus, operationele storing of gevaarlijke `unavailable`. Altijd bovenaan, met tekst, icoon en kleur.
2. **Actief/afwijkend:** actieve robot/irrigatie/lading, open relevante opening, uitzonderlijk verbruik, droge zone of belangrijke lage batterij.
3. **Woningcontext:** aanwezigheid, beveiligingssamenvatting en enkele toestanden die de volgende actie bepalen.
4. **Dagelijkse acties:** alleen twee tot vier door eigenaarsonderzoek bevestigde acties.
5. **Navigatie en normaalstatus:** actieve kamers, drie specialistische summaries en secundaire domeiningangen.
6. **Diagnostiek/historie:** uitsluitend op detail- of beheerlaag.

De semantische statussen zijn `normal`, `active`, `warning`, `critical` en `unavailable`. Iedere status heeft een begrijpelijk label en icoon; kleur is ondersteunend. Tijdgevoelige informatie toont relatieve of absolute dataversheid.

### Actieregels

- Toon eerst de huidige toestand, daarna de actie.
- Gewone lichte bediening kan direct; riskante, destructieve, privacygevoelige of kostbare bediening vereist zichtbare confirmation.
- Hold mag extra frictie geven, maar is nooit de enige affordance.
- Locks, voertuigcommando's, beregening, alarm en kostbare energieflows blijven in HA-scripts of specialistische kaarten.
- De lokale summary-component accepteert standaard alleen `navigation_path`. Een optionele actie wordt uitsluitend toegestaan als zij verwijst naar een expliciet goedgekeurd HA-script met confirmation in de kaartconfig of het scriptcontract.

## Kia, robotstofzuiger en tuin

### Eén begrensde summary-component

`home-dashboard` bevat hoogstens één kleine, dependency-vrije summary-component met drie declaratieve presentatiemodi. Gemeenschappelijke velden zijn titel, icoon, primaire status, maximaal drie secundaire waarden, dataversheid, semantische ernst en detailpad. Alle entityreferenties komen uit de lokale mapping. De component bevat geen friendly-name-herkenning, domeinberekeningen, kaartweergave, historie of specialistische serviceflows.

| Variant | Home toont | Detail behoudt | Home toont bewust niet |
|---|---|---|---|
| Kia | acculading, bereik, laadstatus, dataversheid, beveiligingswaarschuwing | volledige `custom:kia-dashboard-card`, inclusief instellingen en geverifieerde acties | trips, kaarten, klimaatdetails, locks en instellingen |
| Robot | taak/status, batterij, fout/onderhoud en eventueel huidige ruimte | volledige `custom:robot-vacuum-dashboard-card`, kaart, kamers/zones en onderhoud | kaart/SVG, zoneselectie, alle data en reverse-engineered commando's |
| Tuin | droge-zonecount, actieve irrigatie, storing en relevante lage batterij | volledige `custom:garden-dashboard-card`, zones, irrigatie en diagnostiek | alle sensoren, drempels en directe ongecontextualiseerde beregening |

Als dezelfde compacte presentatie met native Tile/Badge betrouwbaar en toegankelijk haalbaar blijkt, heeft native markup voorrang en vervalt de custom variant voor dat domein. Als een summary specialistische afleiding nodig heeft, wordt een backwards-compatible `display_mode: summary` in de betreffende bronrepository onderzocht; de logica wordt niet centraal gekopieerd.

### Visuele integratie

- De shell bezit viewtitel, terugpad, sectiespacing en pagina-achtergrond.
- De summaries en kaarten gebruiken alleen ondersteunde HA-themevariabelen en geërfde semantische aliases; geen selectors door Shadow DOM heen.
- Merkaccenten van de domeinkaarten mogen blijven, maar groen/geel/rood krijgen overal dezelfde operationele betekenis.
- Een toekomstige `hide_header`-optie in de bronkaarten is alleen nodig als een kaarttitel aantoonbaar met de subviewheader botst.

## Responsive gedrag

### Telefoon — minimaal 390 × 844

- Eén contentkolom; informatie en controls volgen exact de bronvolgorde.
- Waarschuwingen en woningcontext staan zonder horizontaal scrollen bovenaan.
- Quick actions vormen een raster van twee kolommen of een verticale lijst; touch targets zijn minimaal 44 × 44 px.
- Specialistische summaries staan onder elkaar en tonen hoogstens twee secundaire waarden; de rest blijft op detail.
- Full-width detailcards krijgen geen extra zijpaneel van de shell. Interne tabnavigatie moet toetsenbord- en swipe-onafhankelijk bruikbaar blijven.

### Tablet en wanddisplay

- Twee of drie Sections-kolommen afhankelijk van de beschikbare breedte.
- Kritieke informatie en woningcontext overspannen de volle breedte; acties en actieve kamers kunnen daarnaast staan.
- Een specialistische detailcard blijft full-width om kaarten, sliders en voertuigstatus niet te comprimeren.
- Wanddisplayvalidatie omvat leesafstand, burn-inbewuste contrasten, landscape en bereikbaarheid van bevestigingsdialogen.

### Desktop — 1440 × 900

- Maximaal drie tot vier rustige contentkolommen met begrensde leesbreedte; geen eindeloos uitgerekte tegels.
- Home houdt de verticale prioriteitsvolgorde, ook als blokken naast elkaar passen.
- Kamerpagina's kunnen capabilitysecties naast elkaar tonen. Domeindetails blijven gecentreerd en full-width binnen een maximumcontentbreedte.
- Geen dense placement: visuele positie en DOM-/screenreader-volgorde blijven gelijk.

Light en dark mode delen statusbetekenis. Alle interactieve elementen krijgen zichtbare focus, screenreadernaam en toetsenbordbediening. Eigen strings zijn lokaliseerbaar; HA verzorgt waar mogelijk states, getallen, tijden en eenheden.

## Architectuur en dependencystrategie

### Lagen

1. **Tracked model:** schema's en dashboardsjablonen bevatten alleen locale-onafhankelijke room-/capabilitykeys, fictieve fixtures en semantische statusconfiguratie.
2. **Lokale configuratie:** gitignored mappings verbinden logische keys met echte entities; gegenereerde dashboardartefacten blijven lokaal.
3. **Native shell:** Sections, views/subviews, Heading, Tile, Badge en Visibility verzorgen layout en standaardinteractie.
4. **Lokale summary-laag:** één kleine ES-module zonder framework of externe package; declaratief, presentational en verwijderbaar.
5. **Specialistische laag:** drie onafhankelijk geversioneerde HACS-resources, uitsluitend gerenderd op Kia-, robot- en tuinsubviews.
6. **Actielaag:** Home Assistant-scripts en de bestaande specialistische kaarten bezitten workflows, confirmations en stateverificatie.

Er komt geen custom panel, Python-integratie, runtime-router, private HA-frontendimport of mapping onder `/www`. De bestaande dependency-zware Kia-YAML-referentie wordt niet gebruikt. Legacyresources worden pas na meting en een menselijke productie-gate verwijderd.

### Contract voor de lokale component

- `setConfig()` valideert vereiste velden en geeft een begrijpelijke configfout.
- `set hass()` vergelijkt uitsluitend objectidentiteit van de expliciet geconfigureerde relevante entities.
- Updates worden per microtask samengevoegd; focus en lopende interactie gaan niet verloren.
- `getGridOptions()` ondersteunt Sections; listeners, timers en asyncwerk worden in `disconnectedCallback()` opgeruimd.
- Missing, `unknown` en `unavailable` hebben afzonderlijke, configureerbare fallbacks.
- Geen servicecall op basis van templateresultaat; navigatiepaths en optionele scripts zijn expliciet geconfigureerd.
- De component blijft vervangbaar door native kaarten zonder wijziging van het room-/domeinmodel.

## Performance- en onderhoudsimplicaties

### Verwachte winst

- Home vervangt honderden statusreferenties en zware stacks door een beperkte allowlist en maximaal één kleine lokale componentruntime.
- Volledige specialistische DOM-bomen bestaan alleen wanneer hun subview actief is.
- Relevante-state-gating voorkomt dat iedere brede HA-update alle summaries laat renderen.
- Native Sections vermindert eigen layoutcode en bewaart voorspelbare responsive en toegankelijke basisgedragingen.
- Eén centrale summary-implementatie voorkomt drie licht afwijkende mini-cards.

### Kosten en beheersing

- De lokale component is extra te testen code. Zij krijgt unittests voor status/fallbackconfig, browsertests voor lifecycle/focus en visuele tests op de drie doelgroottes.
- HACS-resources kunnen ook buiten hun actieve subview worden gedownload en geparsed. Meet daarom resourcegewicht, parsekosten en werkelijke lazy-rendering; registreer versies expliciet.
- Robot rendert momenteel op iedere HA-update. Relevante-entity-gating, zichtbare servicefouten en browser-/interactietests zijn een toelatingsvoorwaarde voor brede inzet.
- Kia is de grootste module en heeft async historie-/kaartpaden. Behoud caching en request-tokens en meet navigatie naar de detailview afzonderlijk.
- Garden heeft de beste relevante-state-gating; bewaak cleanup en lokalisatie bij integratie.
- Shadow DOM voorkomt fragiele centrale styling, maar betekent ook dat visuele convergentie hoofdzakelijk via ondersteunde HA-variabelen en bronrepo-opties loopt.

Voorgestelde validatiepoorten zijn: vaste DOM-/resource-/main-threadbaseline, geen summaryrerender bij irrelevante statewijziging, geen focusverlies, bruikbare fallback bij ontbrekende resource/entity, WCAG 2.2 AA-controle en screenshotvergelijking op 390 × 844, tablet/wanddisplay en 1440 × 900. Absolute budgetten worden na de eerste fixturebaseline vastgesteld in plaats van zonder meting verzonnen.

## Voordelen, nadelen en grootste risico's

### Voordelen

- Behoudt alle gespecialiseerde functies zonder code te kopiëren.
- Dagelijkse Home-ervaring blijft veel lichter en rustiger dan het huidige dashboard.
- Native shell sluit aan op het actuele HA-platform en beperkt eigen navigatie- en layoutcode.
- Eén compacte summary-laag geeft Kia, robot en tuin een consistent operationeel gezicht.
- Configuratie blijft privacyveilig, expliciet, version-controlled en zonder runtimeherkenningsmagie.
- Detailkaarten blijven onafhankelijk releasen en testen in hun eigen repositories.

### Nadelen

- Eén extra lokale frontendcomponent ten opzichte van een zuiver native concept.
- De gebruiker ziet op detailniveau nog drie enigszins verschillende interne designs en navigatiemodellen.
- Vier frontendresources blijven nodig zolang alle drie specialistische kaarten en de summary-component bestaan.
- Configuratie raakt verdeeld over centrale mappings en kaart-specifieke opties; documentatie en schema-validatie moeten dit bijeenhouden.

### Grootste risico's en mitigaties

| Risico | Effect | Mitigatie / go-no-go |
|---|---|---|
| Summary groeit uit tot vierde domeindashboard | duplicatie, regressies, zwaarder Home | harde presentational API; maximaal drie secundaire waarden en één veilige actie |
| Robot blijft breed rerenderen | traagheid op iedere HA-update | bronrepo-gating en browsermeting vóór productie |
| Globale resourcekosten blijven hoog | tragere eerste load ondanks detail-only DOM | meet download/parse; cacheversies; verwijder oude resources na gate |
| Statusafleiding wijkt af van detailkaart | tegenstrijdige informatie | summaries lezen basale states; samengestelde logica blijft in bronkaart/script |
| Automatische mapping koppelt verkeerd | onveilige of misleidende controls | geen runtimeherkenning; suggesties alleen bij gecontroleerde onboarding |
| `unavailable` geeft alarmmoeheid | belangrijke signalen verdwijnen in ruis | operationele allowlist en entity-categoryfilter; diagnose apart |
| Dubbele headers/interne tabs | visuele onrust | eerst testen; alleen dan ondersteunde `hide_header`-optie in bronrepo |
| Visibility wordt als security gezien | onbevoegde toegang via URL | beheeracties via admin-dashboard/backendrechten, niet Visibility |
| Custom component faalt | drie Home-ingangen ontbreken | native Domeinen-ingangen blijven; gedocumenteerde native fallbackconfig |
| Publieke repo lekt installatiegegevens | privacy- en veiligheidsincident | gitignored mappings, fictieve fixtures en CI-privacyguard |

## Aannames en validatievragen

### Aannames

- Richtplatform is Home Assistant 2026.8.x; de definitieve minimumversie volgt later.
- Het gezin verkiest een rustige Nederlandstalige interface en gebruikt telefoon plus tablet/wanddisplay.
- De drie specialistische cards blijven als HACS-resources beschikbaar en hun publieke config-API blijft bruikbaar.
- Native summaries mogen dezelfde expliciet gemapte states lezen zonder specialistische logica over te nemen.
- Een verse export en menselijke gate gaan vooraf aan ieder testdashboard; default blijft read-only.

### Te valideren

1. Welke twee tot vier quick actions worden werkelijk dagelijks gebruikt, en welke mogen nooit op Home?
2. Is één lokale summary-component aantoonbaar duidelijker/compacter dan drie volledig native Tile-groepen? Zo niet, vervalt zij.
3. Welke operationele entities mogen `unavailable` op Home veroorzaken; wat hoort uitsluitend in diagnostiek?
4. Welke kamerindeling en labels herkent het gezin, vooral voor buitenzones en area-loze apparatuur?
5. Voldoen interne tabs, focusvolgorde, labels en dialogs van alle drie kaarten op telefoon en wanddisplay?
6. Wat zijn de gemeten download-, parse-, DOM- en updatekosten van iedere resource in de echte HA-frontend?
7. Is de optionele robot companion-map aanwezig en zijn reverse-engineered zonecommando's voor de doelmodellen toegestaan?
8. Moet beheer in een apart `require_admin`-dashboard of in een backend-beveiligde beheerroute van hetzelfde dashboard?
9. Welke minimale Home Assistant-versie wordt officieel ondersteund?

## Scorevoorstel

Schaal: 1 is zwak, 10 is sterk. Gewichten zijn een voorstel voor vergelijkbaarheid; de hoofdagent bepaalt de definitieve scorematrix.

| Criterium | Gewicht | Score | Motivering |
|---|---:|---:|---|
| Dagelijks gebruiksgemak voor het gezin | 17% | 9 | attention-first Home, directe summaries en maximaal één extra stap |
| Snelheid en waargenomen performance | 13% | 8 | lichte native shell en detail-only DOM; resourceparse en robotgating blijven aandachtspunt |
| Functionele volledigheid | 12% | 9 | volledige bestaande specialistische ervaringen blijven behouden |
| Mobiele en tabletbruikbaarheid | 10% | 9 | Sections, vaste bronvolgorde, compacte summaries en full-width details |
| Visuele rust en duidelijke hiërarchie | 10% | 9 | expliciete informatieniveaus, lege secties weg en diagnostiek uit Home |
| Onderhoudbaarheid en uitbreidbaarheid | 10% | 8 | duidelijke repositorygrenzen; wel één lokale component plus drie onafhankelijke releases |
| Betrouwbaarheid bij `unknown`, `unavailable` of ontbrekende entities | 8% | 9 | operationele allowlist, expliciete fallbacks en bewezen detailkaartcontracten |
| Toegankelijkheid | 7% | 8 | native basis en expliciete AA-/focusregels; custom cards moeten nog integraal worden gevalideerd |
| Privacy en configureerbaarheid | 5% | 9 | logische keys, lokale mappings, privacyguard en geen publieke/runtimeconfig |
| Integratie van Kia, robotstofzuiger en tuin | 5% | 10 | consistente summaries plus volledige originele detailcards zonder duplicatie |
| Migratierisico | 3% | 8 | parallel op apart dashboard en per route migreerbaar; resource- en mappingmigratie blijft nodig |

**Voorlopige gewogen score: 8,72/10.** De grootste onzekerheidsmarge zit in gemeten frontendperformance, toegankelijkheid van de bestaande kaarten en de vraag of de lokale summary-component voldoende UX-winst boven native Tiles levert.
