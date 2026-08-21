# Concept 2 — App-like

## Kernidee

**Huis in beeld** voelt als een rustige woningapp, maar blijft technisch een native Home Assistant Sections-dashboard. De ervaring begint niet bij apparaten, maar bij drie vragen: *vraagt iets aandacht, wat gebeurt er nu, en wat wil ik doen?* Home toont daarom een compacte aandachtstrook, een leesbare woningcontext, twee tot vier bewuste quick actions, actieve kamers en drie specialistische ingangen. Normale, inactieve informatie verdwijnt naar kamer- en domeinsubviews.

Het concept neemt van Casa alleen de bruikbare patronen over: een duidelijke overview, lijstgestuurde kamers, progressive disclosure, lege secties verbergen en een herkenbare app-hiërarchie. Het kopieert geen panelruntime, router, herkenningsmagie, code, assets of merkidentiteit. Een version-controlled model met logische keys bepaalt kamers, capabilities, volgorde en zichtbaarheid. Daardoor blijft gedrag voorspelbaar en privacyveilig.

Visueel ontstaat samenhang door rustige oppervlakken, grote statuslabels, consistente iconen en één semantisch statuscontract. Kleur ondersteunt tekst en icoon, maar draagt nooit alleen de betekenis. Native Heading, Tile, Badge, Visibility en Sections vormen de shell. Alleen de bestaande Kia-, robot- en tuinkaarten blijven custom en verschijnen pas op hun eigen detailsubview.

## Informatiearchitectuur en navigatiemodel

De navigatie heeft vier vaste bestemmingen. Ze blijven in dezelfde volgorde en krijgen stabiele, semantische paths.

| Niveau | Bestemming | Pathvoorstel | Functie |
|---|---|---|---|
| Hoofdview | Home | `home` | aandacht, woningcontext, quick actions en actieve uitzonderingen |
| Hoofdview | Kamers | `rooms` | floor-gegroepeerde lijst van echte kamers en buitenareas |
| Hoofdview | Domeinen | `domains` | energie, klimaat, water, beveiliging, mobiliteit, schoonmaak, buiten, zwembad en systeem |
| Hoofdview | Meer | `more` | afval, aanwezigheid, 3D-printing en overige secundaire functies; beheer alleen waar passend |
| Subview | Kamer | `room-<key>` | alle relevante bediening en status van één kamer |
| Subview | Domein | `domain-<key>` | woningbrede details, historie en veilige acties |
| Subview | Specialist | `specialist-kia`, `specialist-robot`, `specialist-garden` | volledige bestaande HACS-card |
| Subview of apart dashboard | Diagnostiek | `diagnostics` | updates, netwerk, batterijen, bronkwaliteit en area-loze techniek |

Iedere subview heeft een expliciete `back_path` naar zijn natuurlijke ouder. Navigatie gebruikt nooit numerieke indexen. De vier hoofdbestemmingen vormen de mentale app-structuur; aanvullende domeinen worden niet als extra tab toegevoegd. Visibility bepaalt presentatie, niet autorisatie. Admininhoud krijgt een afzonderlijk `require_admin`-dashboard als de eigenaar daarvoor kiest.

Het Kamers-overzicht groepeert alleen echte areas onder **Gelijkvloers**, **Boven** en **Buiten**. Voorraad-, kast-, shipment- en archiveclassificaties verschijnen niet als kamers. Apparatuur zonder area krijgt via de gecontroleerde mapping een woningbreed domein of de diagnostieklaag.

## Wireframes

### Home

```text
┌──────────────────────────────────────────────────────────────┐
│ Goedemorgen                         Thuis · Regen · 2 actief │
├──────────────────────────────────────────────────────────────┤
│ AANDACHT                                                    │
│ [! operationele storing] [! open beveiligingszaak]          │
├──────────────────────────────────────────────────────────────┤
│ NU                                      SNEL BEDIENEN        │
│ Woning veilig · klimaat rustig          [Alles uit] [Alarm]  │
│ 3 lichten · 1 medium actief              [Covers]    [Meer]   │
├──────────────────────────────────────────────────────────────┤
│ ACTIEVE RUIMTES                                             │
│ [Woonkamer · media actief] [Tuin · irrigatie actief]         │
├──────────────────────────────────────────────────────────────┤
│ ONDERWEG & BUITEN                                           │
│ [Kia · laden 64%] [Robot · gereed] [Tuin · 2 droge zones]    │
├──────────────────────────────────────────────────────────────┤
│ [Kamers] [Energie] [Klimaat] [Water] [Beveiliging] [Meer]   │
└──────────────────────────────────────────────────────────────┘
```

- **Aandacht** bestaat alleen als een operationele allowlist iets relevants meldt. Geen generieke lijst met `unknown` of alle lage batterijen.
- **Nu** vat aanwezigheid, beveiliging, openingen, actieve apparaten en woningklimaat samen zonder grafieken.
- **Snel bedienen** bevat maximaal vier door de eigenaar gekozen acties. Toestand en gevolg staan naast de control; riskante of kostbare acties vragen confirmation.
- **Actieve ruimtes** heeft een vaste volgorde en toont alleen kamers met relevante activiteit of afwijking. Cards verspringen niet op basis van een ondoorzichtige score.
- **Onderweg & buiten** geeft Kia, robot en tuin gelijkwaardige compacte ingangen. Bij normale toestand blijven ze bescheiden; een storing promoveert naar Aandacht.

### Kamer

```text
┌──────────────────────────────────────────────────────────────┐
│ ‹ Kamers   Woonkamer                         21,2 °C · Goed  │
├──────────────────────────────────────────────────────────────┤
│ PRIMAIR                                                     │
│ [Licht status + aparte control] [Cover status + control]     │
│ [Klimaat status + detail]      [Media status + detail]       │
├──────────────────────────────────────────────────────────────┤
│ IN DEZE KAMER                                               │
│ comfort · lucht · aanwezigheid · relevante opening/safety    │
├──────────────────────────────────────────────────────────────┤
│ DETAILS                                                     │
│ [Energie] [Historie] [Camera, indien bewust geconfigureerd]  │
├──────────────────────────────────────────────────────────────┤
│ DIAGNOSTIEK                         ingeklapt / aparte route  │
└──────────────────────────────────────────────────────────────┘
```

Elke kamer gebruikt hetzelfde leespatroon, maar alleen expliciet gemapte capabilities worden gerenderd. De header gebruikt een icoon en rustige accentoppervlakte, geen privacygevoelige kamerfoto. De eerste sectie bevat de dagelijkse bediening; sensordetails en historie staan lager. Camera-inhoud krijgt geen automatische preview op Home en is alleen zichtbaar waar bewust geconfigureerd.

### Domeindetail

```text
┌──────────────────────────────────────────────────────────────┐
│ ‹ Domeinen   Energie                         Normaal · 1,8 kW │
├──────────────────────────────────────────────────────────────┤
│ KERNSTATUS                                                   │
│ [Net] [Zon] [Opslag] [EV]                                    │
├──────────────────────────────────────────────────────────────┤
│ ACTIES                                                       │
│ [Laadmodus bekijken] [Kostbare actie met confirmation]       │
├──────────────────────────────────────────────────────────────┤
│ INZICHT                                                      │
│ één primaire trend · periodekeuze · begrijpelijke eenheden   │
├──────────────────────────────────────────────────────────────┤
│ BRONNEN & DIAGNOSTIEK                                       │
│ dataversheid · unavailable fallback · technische details     │
└──────────────────────────────────────────────────────────────┘
```

Domeinen delen dezelfde hiërarchie, maar niet noodzakelijk dezelfde cards. Energie en water mogen één relevante trend tonen; Beveiliging toont openingen en alarmstatus; Klimaat toont zones en uitzonderingen; Zwembad toont waterkwaliteit, filter en verwarming. Systeemdiagnostiek begint nooit op Home.

## Prioritering van informatie en acties

| Prioriteit | Inhoud | Plaatsing en gedrag |
|---|---|---|
| P0 — kritiek | operationele beveiligings-, lek-, brand- of essentiële systeemmelding | bovenaan Home met tekst, icoon, tijd/context en duidelijke detailroute |
| P1 — aandacht | relevante unavailable capability, uitzonderlijk verbruik, droge tuinzone, specialistische fout | Aandacht op Home; verdwijnt zodra de toestand normaal is |
| P2 — actief | media, laden, irrigatie, robottaak, open cover of verlichting buiten de normale context | Nu of Actieve ruimtes; vaste volgorde |
| P3 — dagelijks | primaire kamerstatus en twee tot vier quick actions | Home en eerste kamersectie |
| P4 — inzicht | trends, historie, tarieven, waterkwaliteit en onderhoud | domein- of specialistische subview |
| P5 — beheer | updates, netwerk, batterijen, 3D-printinventaris, integratiediagnose | diagnostiek/Meer; nooit standaard op Home |

`unknown` bij buttons, events en helpers is geen waarschuwing. `unavailable` promoveert alleen als een expliciet gemapte operationele capability ontbreekt. De shell berekent geen complexe betekenis uit friendly names; statusregels zijn configureerbaar en testbaar.

## Kia, robotstofzuiger en tuin

### Kia

- Compacte summary: acculading, bereik, laadstatus, dataversheid en uitsluitend relevante beveiligingswaarschuwing.
- Tap opent `specialist-kia`; riskante voertuigacties blijven in `custom:kia-dashboard-card` met de bestaande verificatie- en veiligheidslogica.
- Trip-, locatie-, mapping- en identifierdata verschijnen niet in Home, fixtures of publieke configuratie.

### Robotstofzuiger

- Compacte summary: taakstatus, batterij, voortgang of fout en één veilige contextuele actie, bijvoorbeeld pauzeren of naar basis wanneer het kaartcontract dat veilig ondersteunt.
- Tap opent `specialist-robot` met kaart, kamers/zones en onderhoud via `custom:robot-vacuum-dashboard-card`.
- Productie-integratie volgt pas na relevante-state gating, zichtbare servicefouten en interactietests in de bronrepo. Reverse-engineered zones blijven opt-in.

### Tuin

- Compacte summary: aantal droge zones, actieve irrigatie, storing en alleen relevante lage batterij.
- Tap opent `specialist-garden` met zones, vocht, irrigatie en diagnostiek via `custom:garden-dashboard-card`.
- Handmatige irrigatie en andere potentieel kostbare acties vragen confirmation; missing/unavailable blijft expliciet zichtbaar.

De drie summaries gebruiken native cards en een klein, expliciet mappingcontract. Ze kopiëren geen berekeningen of serviceflows uit de bronrepos. De volledige cards krijgen dezelfde paginatitel, breedte, spacing en ondersteunde themevariabelen, maar hun Shadow DOM wordt niet met selectors gemanipuleerd.

## Responsief gedrag

### Mobiel — 390 × 844

- Eén kolom met bronvolgorde: Aandacht → Nu → quick actions → actieve ruimtes → specialisten → domeinen.
- Quick actions vormen een 2×2 grid; minimaal 44×44 px, met tekstlabels en voldoende tussenruimte.
- Geen horizontale carrousels: belangrijke inhoud blijft zichtbaar, logisch te swipen/scrollen en bruikbaar voor screenreaders.
- Lange secundaire secties blijven achter navigatie, niet achter onverwachte accordions.

### Tablet en wanddisplay

- Twee tot drie kolommen. Aandacht gebruikt de volle breedte; Nu en quick actions staan naast elkaar.
- Kamers en specialistische summaries vormen gelijkmatige cards. De lay-out blijft leesbaar op afstand en touchvriendelijk.
- Een rustige standaardtoestand voorkomt een permanent alarmbord; acties blijven herkenbaar als controls.

### Desktop — 1440 × 900

- Een begrensde contentbreedte voorkomt uitgerekte cards. Een 12-koloms Sections-grid geeft Aandacht 12 kolommen, Nu 7–8 en quick actions 4–5.
- Actieve ruimtes en specialistische summaries staan in afzonderlijke visuele rijen. Diagnostiek opent als subview en wordt niet in een zijpaneel gepropt.
- Dense placement blijft uit, zodat visuele en toetsenbordvolgorde gelijk blijven.

## Architectuur en dependencystrategie

```text
logische room/domain-config + fictieve fixtures
                    │
                    ▼
privacy- en schema-gevalideerde generator
                    │
                    ▼
native Sections-dashboard
  ├─ Home / Kamers / Domeinen / Meer
  ├─ kamer- en domeinsubviews
  └─ specialistische subviews
       ├─ Kia-card
       ├─ Robot-card
       └─ Garden-card
```

- Eén version-controlled model bevat stabiele room keys, Nederlandse labels, floor, volgorde, capabilities en logische entitykeys.
- Lokale mappings en gegenereerde output blijven gitignored. Runtimeherkenning op friendly names, brede entityscans en publieke `/www`-config zijn uitgesloten.
- De generator produceert voorspelbare native YAML/includes; lege capabilities leveren geen lege cards op.
- Native Heading, Tile, Badge, Visibility en Sections zijn de standaardcomponenten. De drie specialistische cards zijn de enige beoogde custom-carddependencies.
- De shell roept geen services vanuit templates aan. Complexe flows blijven in Home Assistant scripts of in de specialistische cards.
- Alleen ondersteunde HA-themevariabelen vormen het visuele contract. Geen card-mod, private frontendimports of fragile Shadow-DOM-selectors.
- De minimale HA-versie wordt vóór implementatie vastgelegd; configvalidatie moet unsupported native opties vroeg afvangen.

## Performance- en onderhoudsimplicaties

**Positief**

- Home bindt slechts de operationele allowlist en primaire summaries, niet honderden diagnostische entities.
- Native summaries vermijden extra renderlifecycles, brede `hass`-updates en duplicatie van domeinlogica.
- Volledige specialistische cards worden alleen op hun subview gemount; relevante-state gating beperkt hun rerenders.
- Geen grafieken, camera-previews, inventarislijsten of auto-discovery op Home.
- Eén room/capabilitymodel voorkomt gekopieerde kamerconfiguratie en maakt mapping-, privacy- en regressietests centraal.

**Kosten en aandachtspunten**

- Home Assistant laadt geregistreerde resources globaal; ook drie specialistische modules hebben dus een download-/parsekost. Stel een meetbaar JS- en loadbudget vast en verifieer cachegedrag.
- Contextuele visibility vergroot het aantal toestandscombinaties. Fixtures moeten normaal, actief, warning, critical, missing en unavailable afdekken.
- De sterke curatie vraagt productbeslissingen over quick actions en waarschuwingen. Zonder gebruikersonderzoek kunnen aannames fout zijn.
- Visuele polish moet binnen ondersteunde themevariabelen blijven. Als native cards een gewenste compositie niet dragen, wordt eerst de informatiehiërarchie vereenvoudigd; er komt niet automatisch custom CSS bij.

## Voordelen, nadelen en grootste risico's

### Voordelen

- Zeer snel te begrijpen: aandacht, context en actie hebben ieder een vaste plaats.
- Sterke mobiele ergonomie en een herkenbare, rustige app-hiërarchie.
- Alle functionele diepte blijft bereikbaar zonder Home tot inventarisscherm te maken.
- De drie eigen domeinen voelen eersteklas, maar blijven onafhankelijk geversioneerd.
- Privacy en onderhoudbaarheid volgen uit expliciete mapping in plaats van runtime-magie.

### Nadelen

- Minder informatie staat gelijktijdig in beeld dan in het huidige dashboard; ervaren beheerders navigeren vaker naar details.
- Een sterk gecureerde Home vraagt eigenaarstuning en periodieke evaluatie.
- Native HA-componenten begrenzen de visuele vrijheid; het concept is app-like, niet pixelvrij.
- Drie custom resources blijven een globale frontendkost en versiecompatibiliteitsrisico.

### Grootste risico's en mitigaties

| Risico | Gevolg | Mitigatie |
|---|---|---|
| Belangrijke status wordt te agressief verborgen | functionele regressie | evidence-dekkingsmatrix per capability; normale én uitzonderingsfixtures; eigenaaracceptatie |
| Contextuele cards verschijnen onverwacht | onrust en verloren ruimtelijk geheugen | vaste sectie- en cardvolgorde; visibility zonder dynamische herschikscore |
| Quick actions weerspiegelen niet het gezinsgebruik | lage dagelijkse waarde | meet/observeer gebruik; kies eerst twee omkeerbare acties; human gate voor uitbreiding |
| Specialistische module vertraagt of breekt | incomplete domeinervaring | fallback-summary, versiecontract, bronrepo-QA en onafhankelijke rollback |
| Theme-polish leunt op interne CSS | breuk bij HA-update | alleen ondersteunde tokens; visuele regressie tegen minimale en actuele HA-versie |
| `unavailable` veroorzaakt alarmmoeheid | waarschuwingen worden genegeerd | operationele allowlist, dataversheid en afzonderlijke diagnostiek |
| Camera of mobiliteitsdata lekt in Home/render | privacyincident | geen automatische preview; fictieve fixtures; privacyguard op mappings, URLs en coördinaten |

## Aannames en validatievragen

### Aannames

- Het gezin verkiest een rustige Nederlandstalige interface boven maximale informatiedichtheid.
- Twee tot vier quick actions zijn voldoende voor Home; overige acties zijn binnen één extra stap bereikbaar.
- Een vaste room-/domainvolgorde is wenselijker dan algoritmisch herschikken.
- Native summaries mogen dezelfde expliciet gemapte states lezen als specialistische cards, zonder hun domeinlogica te kopiëren.
- Diagnostiek mag visueel en navigatief ondergeschikt zijn.

### Validatievragen

1. Welke twee tot vier acties worden door meerdere gezinsleden werkelijk dagelijks gebruikt, en welke vereisen altijd confirmation?
2. Moet diagnostiek in `Meer` als admin-only subview komen of in een afzonderlijk `require_admin`-dashboard?
3. Welke operationele unavailable-capabilities zijn belangrijk genoeg voor Home, met name bij beveiliging, EV-laden, irrigatie en zwembad?
4. Is een vaste specialistische rij Kia–Robot–Tuin gewenst, of moeten normale summaries alleen op hun domeinhub staan en uitsluitend bij activiteit op Home verschijnen?
5. Welke minimale Home Assistant-versie bepaalt de toegestane native Sections- en Tile-opties?

## Scorevoorstel

Schaal: 1 = zwak, 3 = voldoende, 5 = uitstekend. Dit zijn conceptinschattingen; browsermetingen en gebruikerstests kunnen de score wijzigen.

| Beoordelingscriterium | Score | Motivering |
|---|---:|---|
| Dagelijks gebruiksgemak voor het gezin | 5.0 | aandacht en primaire acties staan vast bovenaan; technische details zijn uit het dagelijkse pad |
| Snelheid en waargenomen performance | 4.5 | kleine native Home en detail-only mounting; drie globale modules blijven meetkosten |
| Functionele volledigheid | 4.5 | alle kamers en domeinen blijven bereikbaar; curatie moet tegen de dekkingsmatrix worden gevalideerd |
| Mobiele en tabletbruikbaarheid | 5.0 | mobile-first bronvolgorde, grote tapdoelen, geen carrousels en voorspelbare Sections |
| Visuele rust en duidelijke hiërarchie | 5.0 | vaste lagen Aandacht, Nu, Acties en Details; diagnostiek is apart |
| Onderhoudbaarheid en uitbreidbaarheid | 4.0 | expliciet model en native shell zijn sterk; contextregels en drie kaartcontracten vragen beheer |
| Betrouwbaarheid bij `unknown`, `unavailable` of ontbrekende entities | 4.5 | operationele allowlist, expliciete fallbacks en conditionele capabilities; disabled-registry blijft evidencegap |
| Toegankelijkheid | 4.5 | native semantiek, vaste DOM-volgorde en expliciete WCAG-eisen; moet nog met screenreader/toetsenbord worden bewezen |
| Privacy en configureerbaarheid | 5.0 | logische keys, lokale mappings, fictieve fixtures en geen runtimeherkenning of publieke config |
| Integratie van Kia, robotstofzuiger en tuin | 5.0 | gelijkwaardige summaries en volledige bestaande detailcards met duidelijke dependencygrenzen |
| Migratierisico | 3.5 | nieuw informatiemodel verlaagt legacycomplexiteit, maar curatie en afwijkend testdashboard vereisen gefaseerde parity-checks en gates |

**Ongewogen gemiddelde: 4,55 / 5.** De onderscheidende kracht is dagelijkse helderheid; het voornaamste selectiepunt tegenover Native-first en Hybrid is of de extra curatie en visuele regie voldoende waarde bieden om de hogere product- en validatielast te rechtvaardigen.
