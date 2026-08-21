# Kritische conceptreview

Peildatum: 2026-08-21. Deze review vergelijkt `native-first.md`, `app-like.md` en `hybrid.md` tegen dezelfde discoverybasis. Scores zijn opnieuw bepaald; zelfbeoordelingen gelden niet als bewijs. Er is nog geen runtimeprototype, gebruikersonderzoek of browsermeting van de nieuwe concepten.

## Oordeel

Kies een **combinatie van App-like informatiearchitectuur en Native-first techniek**:

- neem van App-like de vaste hiërarchie **Aandacht → Nu → Acties → Actieve ruimtes → Specialistische ingangen → Domeinen**, de rustige visuele regie en de hoofdviews Home, Kamers, Domeinen en Meer;
- neem van Native-first de dependencygrens: native Sections/Heading/Tile/Badge/Visibility voor shell en summaries, met uitsluitend Kia, robot en tuin als custom detailcards;
- neem van Hybrid het expliciete integratie-, fallback- en lifecyclecontract over, maar bouw de lokale summary-component **niet** in de eerste versie.

App-like wint daarmee als gebruikersconcept, niet als aparte frontendarchitectuur. Hybrid introduceert als enige een vierde frontendresource en eigen lifecyclecode zonder gemeten bewijs dat native summaries tekortschieten. Die component blijft hoogstens een later, afzonderlijk go/no-go-experiment. Een custom panel, runtimeherkenning en Casa-code of -visuals blijven buiten scope.

## Belangrijkste reviewbevindingen

### Blokkerend vóór bouw

1. **Het area-aantal is intern niet consistent.** Live evidence noemt 26 areas totaal, waarvan zes voorraad-/beheergroepen zijn; een discoveryzin noemt tegelijk 26 echte woon-/buitenareas. Hybrid belooft expliciet 26 echte kamers en Native-first spreekt over 26 kamerviews. Geen concept mag dit aantal hardcoderen. Herleid vóór generatie de definitieve lijst van navigeerbare kamers uit de gesaniteerde live inventaris en laat de eigenaar die goedkeuren.
2. **Functionele pariteit is nog niet aantoonbaar.** Alle concepten noemen de brede domeinen, maar geen concept bevat een regel-voor-regel dekkingsmatrix voor alle huidige views, gemapte capabilities, relevante helpers, scènes en uitzonderingen. Een mooie Home is geen bewijs dat onderliggende functies behouden zijn.
3. **Quick actions zijn hypothesen.** `Alles uit`, nacht/vertrek, alarm, covers en specialistische acties worden voorgesteld zonder gemeten gezinsgebruik en zonder bewezen veilige scriptcontracten. Ze mogen niet rechtstreeks brede domeinservices aanroepen. Start met navigatie en hoogstens twee omkeerbare, expliciet geallowliste scripts; voeg pas acties toe na eigenaarvalidatie.
4. **De robotintegratie is nog geen productieklare dependency.** De resource is live aanwezig, maar niet in het default dashboard; de kaart rerendert breed en heeft onvoldoende fout-/browserdekking. Relevante-state gating, zichtbare servicefouten en mobiele interactietests zijn een toelatingspoort.
5. **Staging heeft geen betrouwbare uitgangsbasis.** MCP Test wijkt af van default. Geen concept mag migratierisico als laag behandelen zonder verse export, snapshot, afzonderlijk goedgekeurd testdashboard en rollbacktest.

### Hoog risico

- **De drie concepten overschatten performance.** Een card op een subview wordt daar pas gemount, maar geregistreerde HACS-resources kunnen nog steeds globaal worden gedownload en geparsed. “Detail-only” vermindert vooral DOM- en updatekosten, niet automatisch de initiële resourcekost. Eerst meten, daarna legacyresources verwijderen.
- **Native betekent niet automatisch licht.** Veel Visibility/Conditional-regels, state Tiles en geneste secties kunnen nog steeds honderden subscriptions en DOM-nodes veroorzaken. Home heeft een expliciet inhouds- en entitybudget nodig.
- **Native betekent niet automatisch toegankelijk.** De shell heeft een betere uitgangspositie, maar focusvolgorde, dialogs, labels, sliderbediening, interne tabs en kaart/SVG-interactie van de drie detailcards zijn nog niet getest. Een score 9 of 10 is daarom niet verantwoord.
- **Contextlogica kan een tweede rules engine worden.** “Actief”, “afwijkend”, “droog”, “stale” en “kritiek” moeten per logische capability een testbaar contract hebben. Geen friendly-nameheuristiek, frontend-Jinja of gedupliceerde specialistische berekening.
- **Visibility is geen beveiliging.** Beheer, privacygevoelige camera-/locatiegegevens en riskante acties horen achter echte HA-rechten of een apart `require_admin`-dashboard. Een verborgen subview is alleen navigatie-UX.
- **Resourceverwijdering raakt mogelijk andere dashboards.** De huidige 52 resources zijn globaal en niet alleen door default gebruikt. Verwijder geen legacyresource voordat alle dashboards en kaarten aantoonbaar onafhankelijk zijn of gemigreerd zijn.

### Middelgroot risico

- App-like en Native-first tonen op Home zes à zeven inhoudsblokken. Op 390 × 844 kan dit alsnog een lange feed worden. Beperk Aandacht, actieve kamers en domeiningangen en valideer wat zonder scroll zichtbaar moet zijn.
- Een generator plus capabilitymodel kan ongemerkt een tweede configuratietaal worden. Houd het schema klein, declaratief en inspecteerbaar; genereer geen runtimegedrag.
- Hybrid gebruikt padvoorbeelden met meerdere `/`-segmenten. Behandel die alleen als conceptuele routes; verifieer HA-routing en gebruik voorlopig enkelvoudige stabiele viewpaths zoals `room-woonkamer` en `domain-energy`.
- Visuele convergentie van drie Shadow DOM-cards blijft beperkt. Ondersteunde themevariabelen en een gedeelde statussemantiek zijn haalbaar; pixelgelijke styling is geen realistisch acceptatiecriterium.

## Toets per concept

### Native-first

**Sterk**

- Kleinste eigen frontendoppervlak en beste aansluiting op officiële HA-patronen.
- Duidelijke status-vóór-bedieningregel, stabiele paths en goede scheiding van dagelijks gebruik en diagnostiek.
- Specialistische logica blijft correct in de bronkaarten; privacy- en mappingmodel zijn realistisch.

**Kritiek**

- De aparte hoofdview Energie is niet onderbouwd met gebruiksonderzoek en kan andere woningbrede domeinen onnodig degraderen. Maak Energie pas een hoofdbestemming als gebruiksdata dat rechtvaardigt; anders staat het onder Domeinen met een directe Home-ingang.
- “Native summaries” kunnen uitwaaieren tot veel Tiles als de benodigde aggregaten ontbreken. De voorgestelde helper/upstream-route is juist, maar nog niet gespecificeerd.
- De zelfscore 9 voor performance, onderhoud en toegankelijkheid is te hoog zonder generatorprototype, browserbaseline en WCAG-test van detailcards.
- De tekst veronderstelt op één plek 26 kamerviews; dit volgt niet betrouwbaar uit de evidence.

**Conclusie:** beste technische baseline, maar minder sterk uitgewerkt als gezinsproduct. Gebruik als architectuurgrens.

### App-like

**Sterk**

- Beste prioriteits- en navigatieverhaal voor niet-technische gezinsleden.
- Vaste volgorde zonder algoritmisch herschikken voorkomt dat contextueel gedrag ruimtelijk geheugen breekt.
- Geen extra lokale custom component; Casa-inspiratie blijft beperkt tot IA en disclosure.
- Privacygevoelige camera-, trip- en locatiegegevens zijn expliciet uit Home en publieke fixtures gehouden.

**Kritiek**

- “App-like” kan meer visuele vrijheid suggereren dan native Lovelace werkelijk biedt. Een native prototype moet bewijzen dat de gewenste hiërarchie zonder card-mod, custom dock of private CSS overtuigend werkt.
- Home bevat potentieel Aandacht, Nu, quick actions, actieve ruimtes, drie specialistische summaries én zes domeinlinks. Stel harde maxima vast en test de eerste mobiele viewport.
- De contextkop “veilig/actief” vraagt betrouwbare aggregaten. Het concept benoemt het contract, maar niet welke bron de waarheid bezit.
- De zelfscores 5/5 voor mobiel, visuele rust, privacy en integratie zijn te stellig vóór fixtures, visuele QA en gezinstest. Privacy is architecturaal sterk, maar renders en live friendly names blijven een lekpad.
- Scènes, automations, 3D-printing en systeembeheer zijn minder concreet geplaatst dan in Native-first. Ze horen expliciet in Meer of een adminlaag, niet impliciet “ergens achterliggend”.

**Conclusie:** beste gebruikersconcept, mits uitgevoerd op de Native-first dependencygrens en met vaste contentbudgetten.

### Hybrid

**Sterk**

- Meest concrete integratiecontract voor de drie specialistische kaarten.
- Goede lifecycle-eisen voor `setConfig`, relevante-state-gating, cleanup, focus en Sections-gridgedrag.
- Sterke fallbackgedachte: de shell blijft navigeerbaar wanneer een resource ontbreekt.

**Kritiek**

- De lokale summary-component is verborgen complexiteit: vierde resource, eigen rendering, toegankelijkheid, localization, lifecycle, versiematrix en tests. De requirements laten extra dependencies alleen toe bij meetbare UX-winst; die meting ontbreekt.
- Eén component met drie varianten dreigt alsnog specialistische statusafleiding te dupliceren. Een harde “presentational only”-API helpt, maar lost ontbrekende aggregaten niet op.
- Een optionele scriptactie in de summary vergroot het veiligheidsoppervlak. In versie 1 moet de component, als hij ooit wordt gebouwd, uitsluitend navigeren.
- De expliciete 26 “echte” areas is waarschijnlijk een verkeerde interpretatie van de inventaris.
- De zelfscore 10 voor specialistische integratie en 9 voor reliability is niet houdbaar zolang robot-QA, mobiele cardtoegankelijkheid en globale resourcekosten openstaan.

**Conclusie:** inhoudelijk bruikbare fallback, maar niet de aanbevolen startarchitectuur. De lifecycle-eisen gaan wel naar het gemeenschappelijke integratiecontract.

## Functionele dekking die nog expliciet moet worden bewezen

| Live functie | Vereiste bestemming | Reviewopmerking |
|---|---|---|
| verlichting, covers, klimaat en media | Home-actie waar bewezen; verder kamerview | alle concepten dekken dit, maar actieallowlists ontbreken |
| alarm, lock, openingen, rook/water en camera | Aandacht + `domain-security` + relevante kamer | geen camera-preview op Home; alarm/lock niet als onduidelijke one-tap quick action |
| aanwezigheid en weer | compacte woningcontext; detail onder Domeinen/Meer | bronkwaliteit en privacy van persoonsnamen testen |
| energie, solar, EV, piek en UPS | compacte Home-uitzondering + domeindetail | bepaal met gebruiksonderzoek of Energie een hoofdview verdient |
| water, warm water en lek | waarschuwing + `domain-water` | lekkage kritisch; tarieven en historie secundair |
| afval | Meer of compacte tijdige Home-uitzondering | niet permanent op Home |
| Kia | native summary + volledige detailsubview | stale/mapping health en veilige acties behouden |
| robot | native summary + volledige detailsubview | upstream performance-/foutgate blokkeert productie |
| tuin/irrigatie en plantstatus | summary/waarschuwing + volledige detailsubview | droge-zoneaggregaat en confirmationbron vastleggen |
| zwembad | Domeinen + `domain-pool` | filter, waterkwaliteit, verwarming en kostbare modi expliciet testen |
| scènes, scripts en automations | benoemde dagelijkse scène waar bewezen; beheerstatus in adminlaag | uitgeschakelde/unavailable automation niet stilzwijgend als normaal behandelen |
| 3D-printing en inventaris | Meer of admin/techniek | zeer groot live volume; nooit automatisch op Home |
| netwerk, updates, batterijen en area-loze techniek | diagnostiek/admin | operationele subset via allowlist, rest niet als waarschuwing |
| voorraad-/beheergroepen | geen kamernavigatie | definitieve area-lijst eerst oplossen |

## Informatie- en actiebudget voor het gekozen concept

Om te voorkomen dat de nieuwe Home opnieuw groeit tot een inventarisdashboard:

- Aandacht: maximaal drie niet-kritieke items zichtbaar; kritieke items worden nooit door de limiet verborgen en krijgen een duidelijke detailroute.
- Nu: maximaal vier actieve uitzonderingen, in vaste prioriteitsvolgorde.
- Quick actions: bij start maximaal twee; na gebruiksvalidatie maximaal vier.
- Actieve ruimtes: maximaal vier plus `Alle kamers`; geen dynamische score of volledige kamerlijst.
- Kia, robot en tuin: precies drie compacte, vaste native summaries; geen kaart, grafiek of specialistische control op Home.
- Domeinnavigatie: maximaal vijf primaire ingangen; overige functies onder Meer.
- Home: geen camera-stream, energie-/watergrafiek, batterij-/updatelijst, netwerkstatus of inventaris.

Een direct bedienbare action gebruikt een specifiek, beoordeeld script of een native entityfeature met begrijpelijke scope. “Alles uit” mag nooit betekenen “roep een brede service aan op alle switches”: kritieke voedingen, netwerk, koeling, zwembad en andere infrastructuur moeten technisch uitgesloten zijn. Alarm, lock, voertuig, irrigatie, EV-laden en zwembadmodi blijven standaard op detail met confirmation en backend/scriptvoorwaarden.

## Gecorrigeerde scorematrix

Schaal: 1–10; hoger is beter. Voor **Migratierisico** betekent een hoge score een laag en goed beheerst risico. Gewichten leggen de nadruk op dagelijks gezinsgebruik, aantoonbare snelheid en langetermijnbeheer. Privacy, autorisatie en veilige acties blijven harde gates, ook al is hun numerieke gewicht beperkt.

| Criterium | Gewicht | Native-first | App-like | Hybrid |
|---|---:|---:|---:|---:|
| Dagelijks gebruiksgemak voor het gezin | 18% | 8 | 9 | 8 |
| Snelheid en waargenomen performance | 12% | 8 | 8 | 7 |
| Functionele volledigheid | 11% | 8 | 8 | 9 |
| Mobiele en tabletbruikbaarheid | 10% | 8 | 9 | 8 |
| Visuele rust en duidelijke hiërarchie | 9% | 8 | 9 | 9 |
| Onderhoudbaarheid en uitbreidbaarheid | 11% | 8 | 8 | 7 |
| Betrouwbaarheid bij `unknown`, `unavailable` of ontbrekende entities | 8% | 7 | 7 | 7 |
| Toegankelijkheid | 7% | 8 | 8 | 7 |
| Privacy en configureerbaarheid | 5% | 9 | 9 | 9 |
| Integratie van Kia, robotstofzuiger en tuin | 5% | 8 | 8 | 9 |
| Migratierisico | 4% | 7 | 7 | 6 |
| **Gewogen totaal** | **100%** | **7,93** | **8,30** | **7,84** |

### Waarom de scores lager zijn dan de zelfscores

- Geen van de drie concepten is in een echte HA-frontend gerenderd of op 390 × 844, wanddisplay en 1440 × 900 getest.
- Er zijn geen vaste JS-, DOM-, long-task- of rerenderbaselines voor de nieuwe shell.
- Gezinsfrequentie van quick actions en begrijpelijkheid van de IA zijn niet onderzocht.
- De mapping- en dekkingsmatrix is nog niet volledig; disabled entities en een dashboard-entry blijven evidencegaten.
- De drie detailcards hebben ongelijke browser- en toegankelijkheidsdekking; robot heeft een concrete performancegate.
- Een veilige staging- en rollbackbasis moet nog vers worden gemaakt.

## Gekozen combinatie en niet-keuzes

### Overnemen

1. App-like Home-hiërarchie en vier hoofdbestemmingen: `home`, `rooms`, `domains`, `more`.
2. Native-first shell, summaries, actions en enkelvoudige semantische subviewpaths.
3. Eén klein version-controlled room-/capabilitymodel met logische keys; lokale mapping en builds gitignored.
4. Hybrid integratiecontract: onafhankelijke HACS-versies, full-width detailcards, expliciete fallbacks, lifecycle-/focus-/rerendertests en geen Shadow DOM-hacks.
5. Diagnostiek standaard als apart `require_admin`-dashboard, tenzij de eigenaar bewust anders beslist.

### Niet overnemen

- geen lokale summary-component in de eerste bouwfase;
- geen custom panel, router, runtimeherkenning of publieke config;
- geen aparte Energie-hoofdview zonder bewijs van dagelijks gebruik;
- geen brede of onduidelijke quick actions;
- geen geneste slashpaths voordat HA-routing expliciet is bewezen;
- geen resourceverwijdering op basis van alleen het nieuwe dashboard.

### Voorwaardelijke fallback

Alleen als een native prototype op telefoon aantoonbaar faalt op compactheid of begrijpelijkheid, mag Hybrid's summary-component als geïsoleerd experiment worden vergeleken. Go vereist tegelijk:

- meetbare winst in first-viewportbegrip of interactietijd;
- geen relevante payload-, long-task- of rerenderregressie;
- WCAG 2.2 AA, toetsenbord- en screenreadersucces;
- uitsluitend presentatie en navigatie, zonder specialistische berekening of servicecall;
- native fallbackconfig en onafhankelijke verwijderbaarheid.

## Verplichte validatiepoorten

1. **Dekking:** definitieve area-lijst, current-to-target matrix en expliciete plek voor iedere relevante live functie.
2. **Veiligheid:** eigenaar kiest quick actions; scripts/controls krijgen scope-, confirmation-, unavailable- en fouttests.
3. **Prototype:** normale, warning-, critical-, missing- en unavailable-fixtures op telefoon, tablet/wanddisplay en desktop; visuele inspectie en gezinstest.
4. **Performance:** vaste meting van payload, parse, DOM, long tasks, rerenders en navigatie naar iedere specialistische card.
5. **Toegankelijkheid:** toetsenbord, focus, screenreaderlabels, dialogs, touch targets, contrast en reduced-motion waar relevant.
6. **Privacy:** fixtures en screenshots bevatten geen echte namen, locaties, camera-inhoud, identifiers of interne adressen; CI scant tracked bestanden.
7. **Integraties:** compatibiliteitsmatrix en fallback voor Kia, robot en tuin; robotgate eerst groen.
8. **Migratie:** verse read-only export en snapshot, expliciet testdashboard, menselijke gate vóór testdeployment en bewezen rollback vóór cutover.

## Resterende eigenaarbeslissingen

1. Welke twee quick actions starten op Home en welke categorieën blijven altijd op detail?
2. Wordt diagnostiek een apart `require_admin`-dashboard, zoals deze review aanbeveelt?
3. Welke minimale Home Assistant-versie wordt ondersteund?
4. Is Energie op basis van werkelijk gebruik een hoofdview of een directe ingang onder Domeinen?

De keuze kan zonder deze antwoorden conceptueel worden vastgelegd, maar implementatie van acties, autorisatie, compatibiliteit en primaire navigatie moet op de betreffende beslissing wachten.

## Resolutie na eigenaarreview — 2026-08-21

De eigenaar heeft vier eerder open of kritische punten beslist:

- minimale versie: Home Assistant 2026.8.2;
- Energie wordt een volledige hoofdview;
- Kamers toont alle bevestigde kamers met passende quick actions;
- de gewone Home Assistant-sidebar blijft de shell; de prototype-sidebar is geen custom dashboardcomponent.

Daarnaast worden person cards op Home behouden, blijft een horizontaal scrollbare beveiligingsstrook met drie camera's en afzonderlijke privacystanden cruciaal op Home, en krijgt zwembad een nieuwe volledige specialistische card. Deze besluiten vervangen de eerdere reviewaanname dat Energie onder Domeinen blijft en de eerdere aanname dat camera-previews nooit op Home staan. Alleen fictieve beelden komen in tracked fixtures/renders; privacy uitschakelen vraagt confirmation en backendautorisatie. Het integratiebudget groeit bewust van drie naar vier specialistische cards; de nieuwe zwembaddependency moet daarom dezelfde performance-, accessibility-, privacy- en fallbackgates halen.
