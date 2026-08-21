# Concept 1 — Native-first

## Kernidee

Native-first maakt van het dashboard een rustige Home Assistant-shell die met `sections`,
`heading`, `tile`, badges, visibility en subviews werkt. Home toont geen inventaris, maar een
vaste beslisvolgorde: eerst kritieke waarschuwingen, dan actieve uitzonderingen, enkele
quick actions, relevante kamers en compacte ingangen naar Kia, robot en tuin. Normale of lege
secties verdwijnen; diagnostiek blijft bereikbaar achter een beheerroute.

Alle kamers komen uit één version-controlled capabilitymodel met locale-onafhankelijke keys en
Nederlandse labels. Dat model genereert dunne, herkenbare kamerviews, maar introduceert geen
runtime kamerherkenning. Licht, cover, klimaat, media, safety, camera en energie verschijnen
alleen als ze expliciet zijn gemapt. De native shell bevat geen templates voor servicecalls en
geen gedupliceerde specialistische logica.

De enige beoogde frontenddependencies zijn de bestaande Kia-, robot- en tuinkaarten. Hun Home-
summary is native en leest slechts enkele expliciet gemapte states; hun volledige ervaring
wordt pas op een full-width detailsubview geladen. Daarmee blijft de dagelijkse route licht,
toegankelijk en dicht bij het ondersteunde HA-platform, terwijl specialistische functies niet
verloren gaan.

## Informatiearchitectuur en navigatiemodel

Vier views zijn zichtbaar in de primaire navigatie:

| Path | Rol | Inhoud |
|---|---|---|
| `home` | operationeel overzicht | aandacht, woningcontext, quick actions, actieve kamers, drie specialistische ingangen |
| `rooms` | kamerindex | floors en echte woon-/buitenareas; geen voorraad- of beheergroepen |
| `energy` | dagelijks woningbreed domein | net, solar, batterij, EV-context, piek en waterlink |
| `more` | secundaire domeinen | klimaat, beveiliging, water, zwembad, weer/afval en beheer |

Semantische subviews verzorgen progressive disclosure:

- `room-<room-key>` met `back_path` naar `rooms`;
- `domain-security`, `domain-climate`, `domain-water`, `domain-pool` en vergelijkbare details
  met `back_path` naar `more` of `energy`;
- `mobility-kia`, `cleaning-robot` en `outside-garden` voor de volledige specialistische cards;
- `diagnostics` als verborgen subview of later als afzonderlijk admin-dashboard.

Alle navigatie gebruikt stabiele paden. Visibility bepaalt alleen wat op dat moment nuttig is;
het is nooit de autorisatiegrens. Gewone statusvlakken navigeren of openen `more-info`. Een
bediening is een afzonderlijke, herkenbare Tile-feature of actieknop.

## Wireframe — Home

Bronvolgorde en visuele volgorde blijven gelijk:

1. **Contextkop, full-width** — `heading` met begroeting/tijdcontext; compacte native badges
   voor aanwezigheid, alarmstatus en weer. Geen live KPI-lint op iedere pagina.
2. **Aandacht nodig, full-width** — alleen gerenderd wanneer een allowlisted operationele
   conditie geldt. Eerst kritiek (beveiliging, lek, ernstige storing), daarna waarschuwing
   (belangrijke unavailable capability, relevante lage batterij, kostbare actieve installatie).
   Iedere Tile noemt toestand én locatie en navigeert naar de juiste detailpagina.
3. **Nu actief** — een korte grid met bijvoorbeeld actieve klimaatvraag, laad- of
   schoonmaaktaak, irrigatie en uitzonderlijk verbruik. Een normale lege toestand verbergt de
   hele sectie.
4. **Quick actions** — twee tot vier eigenaar-gekozen acties. Voorstel: relevante lichten uit,
   veilige avondscene, robot pauzeren/naar basis wanneer actief en een contextuele coveractie.
   Alarm, lock, irrigatie, laden en zwembadbediening krijgen confirmation of blijven op detail.
5. **Relevante kamers** — alleen kamers met actieve bediening of een betekenisvolle afwijking;
   maximaal enkele room-summary Tiles. `Alle kamers` navigeert naar `rooms`.
6. **Specialisten** — drie gelijkwaardige native summaryblokken voor Kia, robot en tuin.
7. **Verder in huis** — compacte navigatie naar energie, klimaat, beveiliging, water en meer.

Home bevat geen grafieken, algemene batterijlijst, update-inventaris, netwerkstatus, camera-
streams of volledige specialistische card.

## Wireframe — kamer

Een representatieve kamerpagina gebruikt steeds hetzelfde patroon:

1. **Heading** — terug naar `rooms`, kamerlabel en één korte omgevingsstatus.
2. **Primaire bediening** — native Tiles voor licht, cover en klimaat. De state is zichtbaar;
   tap opent details en features bieden expliciete bediening. Geen kaart wordt getoond voor een
   ontbrekende capability.
3. **Media en scènes** — alleen waar geconfigureerd; scènes zijn benoemde, herkenbare acties.
4. **Comfort** — temperatuur, vocht en eventueel luchtkwaliteit als state Tiles. Historie is
   optioneel achter een uitklapbare/detailsectie, niet standaard bovenaan.
5. **Safety** — openingen, beweging, rook/water en relevante camera-ingang. Een stream wordt pas
   op expliciete interactie of een onderliggende subview geladen.
6. **Details** — energie van lokale apparaten, batterijen en integratiestatus achter een
   secundaire Heading/link. Normale diagnostische `unknown`-states veroorzaken geen waarschuwing.

Een operationeel belangrijke `unavailable` capability blijft als tekstueel herkenbare Tile of
waarschuwing staan. Een optionele diagnostische entity verdwijnt. Zo betekent afwezigheid nooit
automatisch dat alles in orde is.

## Wireframe — woningbreed domein

De representatieve `energy`-view bestaat uit:

1. **Heading en actuele balans** — native state Tiles voor net, solar, batterij en relevante
   laadstatus; piek/lek alleen prominent bij een overschrijding.
2. **Bewuste bediening** — alleen expliciete scripts of controls, met confirmation voor
   kostbare laad- of verbruikersacties.
3. **Historie** — native Energy-, statistic- of historykaarten waar zij de vraag beantwoorden;
   geen stapel alternatieve custom grafiekkaarten.
4. **Bronkwaliteit** — compacte unavailable/stale-melding voor operationele bronnen.
5. **Verdieping** — links naar mobiliteit, water en diagnostiek.

Andere domeinen volgen dezelfde grammatica: status en uitzondering, veilige actie, historie,
details. `domain-security` toont bijvoorbeeld alarm/openingen vóór bediening;
`domain-water` toont huidig gebruik/lek vóór historie; `domain-pool` toont waterkwaliteit en
actieve modi vóór kostbare instellingen.

## Prioritering van informatie en acties

| Niveau | Toon waar | Voorbeelden | Regel |
|---|---|---|---|
| P0 kritiek | Home + detail | alarm, lek, onveilige opening, ernstige storing | tekst, icoon en kleur; nooit automatisch verbergen |
| P1 actief/afwijkend | Home + detail | robot actief/fout, irrigatie actief, EV laadt, hoge piek | alleen zolang relevant; navigeert naar context |
| P2 dagelijks | Home of één stap | quick actions, kamerlicht, cover, klimaat, media | toestand vóór afzonderlijke bediening |
| P3 informatief | kamer/domein | comfort, bereik, weerscontext, korte historie | geen aandachtkleur bij normaal |
| P4 diagnostiek | beheerlaag | alle batterijen, updates, netwerk, bronkwaliteit | niet op Home; expliciete opt-in |

Alerts worden niet uit alle `unknown`/`unavailable` states afgeleid. Iedere Home-conditie heeft
een expliciete operationele allowlist, ernst, boodschap, bestemming en fallback. Complexe
aggregatie hoort in een bestaande HA-helper/script of specialistische component, niet in
frontendtemplating.

## Integratie van Kia, robotstofzuiger en tuin

### Kia

- Native summary: batterijpercentage, bereik, laadstatus, dataversheid en één
  beveiligingswaarschuwing.
- Tap op het statusvlak navigeert naar `mobility-kia`.
- Detail: full-width `custom:kia-dashboard-card`; mapping health, verificatie na lockacties,
  caching en riskante instellingen blijven volledig eigendom van de Kia-repo.
- Home kopieert geen voertuigberekeningen of serviceflow.

### Robotstofzuiger

- Native summary: toestand, voortgang/taak, batterij, fout en onderhoudssignaal.
- Hoogstens één contextuele veilige control: pauze wanneer actief of terug naar basis; start van
  kamer-/zonereiniging blijft op detail.
- Detail: full-width `custom:robot-vacuum-dashboard-card` met kaart, zones en onderhoud.
- Voor brede inzet is relevante-state gating plus zichtbare servicefout- en interactie-QA in de
  robotrepo een dependency-gate.

### Tuin

- Native summary: aantal droge zones, actieve irrigatie, storing en alleen relevante lage
  batterij.
- Irrigatiebediening staat op detail en vereist confirmation.
- Detail: full-width `custom:garden-dashboard-card`; drempels, domeinafleiding, action validation
  en diagnostics blijven in de tuinrepo.

De drie summaries gebruiken hetzelfde native Tile/Heading-patroon en dezelfde semantische
statuswoorden. De Shadow DOM-cards sluiten aan via ondersteunde HA-themevariabelen; geen
`card-mod`-selectors door componentgrenzen heen.

## Mobiel, tablet en desktop

- **Mobiel, 390×844:** één leeskolom; aandacht en context eerst, quick actions als compacte
  twee-koloms Tile-grid waar 44×44 px targets behouden blijven. Specialistische summaries staan
  onder elkaar. Geen horizontale scroll behalve wanneer een native component dat aantoonbaar
  toegankelijk ondersteunt.
- **Tablet/wanddisplay:** twee à drie Sections-kolommen. Aandacht blijft full-width; actieve
  kamers en specialisten staan naast elkaar. Kioskgedrag is een deploymentkeuze en geen
  frontenddependency.
- **Desktop, 1440×900:** maximaal vier kolommen. Waarschuwingen en actuele balans overspannen de
  breedte; bediening en summaries vullen de tweede rij. Extra breedte voegt context toe, geen
  extra diagnostiek.
- Dense placement staat uit. De DOM-/focus-/screenreader-volgorde volgt altijd de YAML-
  bronvolgorde. Tekst mag groeien; labels worden niet alleen voor compactheid afgekapt.
- Light en dark mode gebruiken dezelfde statusbetekenis. Focus, hover en active zijn afzonderlijk
  herkenbaar; status gebruikt altijd tekst of icoon naast kleur.

## Architectuur en dependencystrategie

- Composition root met dunne view-includes en één version-controlled room/capabilitymodel.
- Een offline generator/validator mag repetitieve kamerview-YAML produceren; Home Assistant ziet
  alleen gewone native Lovelaceconfig. Gegenereerde output en lokale entitymapping blijven
  gitignored.
- Tracked configuratie gebruikt logische keys en fictieve fixtures. Privacyguards blokkeren
  entity/device-ID's, serienummers, MAC-adressen, interne adressen, coördinaten en secrets.
- De shell gebruikt native Sections, Heading, Tile, Badge, Visibility, Conditional en
  ondersteunde action-configuratie. Geen Mushroom, decluttering-card, card-mod, browser-mod,
  layout-card of private frontendimports als architectuurvereiste.
- Dependencybudget: uitsluitend `custom:kia-dashboard-card`,
  `custom:robot-vacuum-dashboard-card` en `custom:garden-dashboard-card`, alleen op hun subview.
- Specialistische resources blijven onafhankelijk via HACS geversioneerd. Het centrale project
  definieert compatibele minimumversies, mapping- en themecontracten en een duidelijke fallback
  wanneer een resource ontbreekt.
- Visibility is presentationeel. Een eventuele beheerlaag gebruikt `require_admin` op een apart
  dashboard of een andere echte HA-autorisatiegrens.

## Performance- en onderhoudsimplicaties

Verwachte voordelen:

- de dagelijkse route laadt geen specialistische Shadow DOM-card en vermijdt tientallen legacy
  custom-cardbundels;
- Sections en on-demand subviews houden DOM, histories en camera's lokaal;
- geen globale live KPI-badge, card-mod shadow-DOM-mutaties of brede frontendtemplating;
- één kamermodel voorkomt 26 handmatig divergerende pagina's;
- platformupdates worden vooral tegen native HA-componenten getest.

De winst blijft een hypothese tot een vaste browserbaseline bestaat. Acceptatie vergelijkt
Home, een lichte en zware kamer, energy en iedere specialistische subview op JS-payload,
DOM-nodes, long tasks en interactierespons. Een regressiebudget voorkomt dat native pagina's
opnieuw door veel geneste kaarten zwaar worden.

Onderhoud concentreert zich op mappings, capabilityschema, conditionele alerts en HA-
compatibiliteit. Het generatorpad is extra tooling, maar is eenvoudiger te testen dan runtime
kamerherkenning. Specialistische bugs en releases blijven bij hun bronrepo; het centrale project
test alleen het integratiecontract.

## Voordelen, nadelen en grootste risico's

### Voordelen

- Zeer kleine shell-dependencyoppervlakte en sterke aansluiting op HA 2026.8.x.
- Rustige, voorspelbare UX met native interactie-, lokalisatie- en responsivepatronen.
- Hoge toegankelijkheidskans doordat bediening semantische HA-componenten gebruikt.
- Privacy en reviewbaarheid passen rechtstreeks bij de bewezen mapping/renderaanpak.
- Specialistische functionaliteit blijft volledig zonder duplicatie.

### Nadelen

- Native cards bieden minder compacte aggregatie en visuele curatie dan een eigen summarycard.
- Conditionele Home-secties kunnen YAML-omvang en testmatrix vergroten.
- 26 kamers vereisen generator/tooling of veel dunne subviews.
- De drie volledige detailcards zullen visueel nooit exact native worden.
- Sommige contextuele summaries vragen upstream helpers wanneer één bruikbare samenvattende state
  ontbreekt.

### Grootste risico's en mitigaties

| Risico | Impact | Mitigatie |
|---|---|---|
| Native aggregatie blijkt te beperkt | Home wordt lang of logica lekt naar YAML | maximaal één goed gemotiveerde summary-mode upstream; eerst helpers/native conditionals meten |
| Te veel conditionals veroorzaken verborgen fouten | belangrijke storing ontbreekt | alertcontract met positieve, unavailable- en fixturetests per capability |
| Kamergenerator wordt een tweede configuratietaal | onderhoudscomplexiteit | klein declaratief schema, JSON Schema, golden renders en gegenereerde output inspecteerbaar |
| HA-versiedrift verandert Tile/Sectionsgedrag | layout- of featureverlies | minimale versie vastleggen en runtime-/visual tests op ondersteunde versies |
| Specialistische kaart ontbreekt of faalt | detailview leeg | native foutkaart met installatiestatus en veilige terugnavigatie |
| Visibility wordt als security gezien | beheerdata via URL bereikbaar | adminlaag echt scheiden; dit in docs en tests afdwingen |
| Native uiterlijk voelt te generiek | lagere gezinsacceptatie | sterke typografie, spacing en semantische themevariabelen; prototype met gezin toetsen |

## Aannames en validatievragen

### Aannames

- HA 2026.8.x is het eerste doel; alle gekozen native features zijn daar beschikbaar.
- De drie specialistische resources mogen detail-only geladen worden.
- Benodigde summary states zijn expliciet mapbaar of kunnen later als beheerde HA-helper worden
  aangeboden zonder domeinlogica in de UI te dupliceren.
- Een rustige Nederlandstalige interface heeft voorrang op maximale informatiedichtheid.
- Diagnostiek mag uit de primaire gezinsnavigatie verdwijnen.

### Validatievragen

1. Welke twee tot vier quick actions verdienen Home op basis van echt gezinsgebruik, en welke
   moeten altijd confirmation hebben?
2. Komt diagnostiek als `require_admin`-dashboard of als beheerlaag elders?
3. Wat is de minimale ondersteunde HA-versie en moeten meerdere versies in CI worden getest?
4. Zijn droge-zonecount, Kia security/staleness en robotonderhoud als betrouwbare summary state
   beschikbaar, of is een upstream `display_mode: summary`/helper nodig?
5. Kan de robotcard na relevante-state gating foutvrij en snel op mobiel renderen?
6. Welke area-loze capabilities horen functioneel bij een kamer en welke bij een woningbreed
   domein?
7. Begrijpt het gezin de native scheiding tussen statusvlak en bediening zonder uitleg?

## Scorevoorstel

Schaal 1–10. De gewichten zijn een conceptvoorstel en tellen op tot 100; de hoofdagent kan ze
voor de definitieve vergelijking uniformeren.

| Criterium | Gewicht | Score | Motivering |
|---|---:|---:|---|
| Dagelijks gebruiksgemak voor het gezin | 18 | 8 | zeer voorspelbaar en rustig; minder contextuele magie dan app-like |
| Snelheid en waargenomen performance | 12 | 9 | native shell en detail-only custom cards; conditionals moeten nog gemeten worden |
| Functionele volledigheid | 11 | 8 | specialistische cards behouden volledigheid; native summaries zijn bewust beperkt |
| Mobiele en tabletbruikbaarheid | 10 | 9 | Sections en vaste leesvolgorde passen sterk bij beide |
| Visuele rust en duidelijke hiërarchie | 10 | 9 | attention-first en disclosure; native uiterlijk is minder uniek |
| Onderhoudbaarheid en uitbreidbaarheid | 11 | 9 | kleine dependencyset en één capabilitymodel; generator vraagt discipline |
| Betrouwbaarheid bij `unknown`, `unavailable` of ontbrekende entities | 8 | 8 | expliciet alert-/fallbackcontract, maar veel conditionele combinaties |
| Toegankelijkheid | 7 | 9 | native semantiek als basis plus expliciete WCAG-tests |
| Privacy en configureerbaarheid | 5 | 9 | lokale mapping, fixtures en privacyguards; geen publieke runtimeconfig |
| Integratie van Kia, robotstofzuiger en tuin | 5 | 8 | volledige detailintegratie; summaries minder rijk en robot heeft upstream gate |
| Migratierisico | 3 | 8 | nieuwe shell naast default en incrementele views; roommodel/mapping blijft omvangrijk |

**Gewogen conceptscoresuggestie: 8,6/10.** De sterkste dimensies zijn performance,
onderhoudbaarheid, responsive gedrag en toegankelijkheid. De belangrijkste onzekerheid is of
native summaries voldoende context bieden zonder extra helpers of een vierde custom component.
