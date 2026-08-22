# Geverifieerde requirements

## Doelen en prioriteiten

1. Home toont binnen enkele seconden uitsluitend wat nu aandacht vraagt, primaire woningstatus en de meest gebruikte acties.
2. Dagelijkse acties zijn direct of met maximaal één extra navigatiestap bereikbaar.
3. De view Kamers toont alle bevestigde woon- en buitenruimtes, gegroepeerd per verdieping, met de nodige veilige quick actions en een route naar iedere detailpagina.
4. Kia, robotstofzuiger en tuin zijn eersteklas domeinen: compacte summary plus hun volledige bestaande kaart. Zwembad krijgt een nieuwe volledige specialistische kaart in dezelfde ontwerp- en integratiefamilie.
5. De centrale shell blijft native-first, snel, toegankelijk, responsief en fouttolerant.
6. Publieke broncode bevat uitsluitend logische keys en fictieve fixtures.
7. Het default dashboard blijft tijdens ontwerp, bouw en validatie read-only.

## Informatiearchitectuur

- Hoofdviews: Home, Kamers, Energie, Domeinen en Meer.
- De gewone Home Assistant-sidebar is de applicatieshell; dashboardviews gebruiken native HA-viewnavigatie en bouwen geen tweede custom sidebar.
- Kamer-, specialistische en diagnostische details zijn subviews met expliciete semantische paths en `back_path`.
- Geen numerieke view-indexnavigatie.
- Voorraad-/beheerclassificaties worden niet als kamers gepresenteerd.
- Diagnostiek is bereikbaar maar niet standaard zichtbaar op Home.
- Visibility is een UX-mechanisme, geen autorisatie.

## Home

Home bevat in deze volgorde:

1. kritieke en relevante waarschuwingen;
2. `Vandaag` met compacte weersverwachting, tijdige afvalinfo en actuele globale energie-/laadcontext;
3. privacyveilige person cards, met alleen relevante gekoppelde device-batterijwaarschuwingen;
4. een horizontaal scrollbare beveiligingsstrook met live-preview/fallback voor alle eigenaar-gekozen camera's, zichtbare privacystand en alarmstatus;
5. actieve uitzonderingen en maximaal enkele echte quick actions;
6. kamers met actieve/relevante toestand, zonder volledige kamerlijst te dupliceren;
7. compacte Kia-, robot-, tuin- en zwembadingangen;
8. secundaire domeinnavigatie.

Home bevat geen uitgebreide grafieken, inventarislijsten, alle batterijen, alle updates, netwerkdetails of volledige specialistische kaarten. Camera's die niet voor de Home-strook zijn geconfigureerd blijven op beveiligings- of kamerdetail.

## Kamermodel

- Eén version-controlled configuratiemodel met locale-onafhankelijke room keys en Nederlandse labels.
- De Kamers-hoofdview toont alle bevestigde kamers onder Gelijkvloers, Boven en Buiten; voorraad-/beheergroepen blijven uitgesloten.
- Iedere room summary toont primaire status, een expliciete detailingang en alleen passende quick actions, bijvoorbeeld licht, cover of een benoemde scène. Riskante of brede acties blijven detail-only.
- Capabilities zijn expliciet en optioneel: licht, cover, klimaat, media, safety, camera, energie en andere relevante functies.
- Zware kamerdetails ondersteunen conditioneel volledige HVAC-mode/preset/fan/swing, scènes, openingen, aanwezigheid, CO₂/luchtkwaliteit, lux, geluid/druk, veilige apparaatschakeling, actueel/dagverbruik en beslisrelevante historie.
- Een apparaatblok kan actueel vermogen, dagenergie, optionele spanning, lockstatus, control en `more-info` tonen; ontbrekende velden verdwijnen zonder nulwaarde te fabriceren.
- Lege of niet-geconfigureerde secties worden niet gerenderd.
- Operationele `unavailable` krijgt een duidelijke fallback; diagnostische of semantisch normale `unknown` veroorzaakt geen alarm.
- Area registry is input, maar gecontroleerde mappings ondersteunen area-loze en woningbrede apparatuur.

## Interactie en veiligheid

- Toon toestand vóór bediening.
- Gewone tap opent details; een afzonderlijke, herkenbare control bedient waar passend.
- Riskante, destructieve, privacygevoelige of kostbare acties vereisen confirmation. Hold mag aanvullende frictie zijn, nooit de enige aanwijzing.
- Complexe workflows blijven in HA scripts of specialistische cards.
- Geen service calls of navigatie gebaseerd op templates in de UI-laag.

## Responsiviteit en toegankelijkheid

- Ontwerp en test minimaal op 390×844, tablet/wanddisplay en 1440×900.
- Sections houdt voorspelbare bron-/leesvolgorde; dense placement staat standaard uit.
- Touch targets minimaal 44×44 px, zichtbare focus, toetsenbordbediening en screenreaderlabels.
- Contrast voldoet aan WCAG 2.2 AA; status is nooit alleen kleur.
- Light en dark mode gebruiken dezelfde semantische statusbetekenis.
- Eigen strings zijn lokaliseerbaar; HA formatteert entitynamen, states, getallen, tijden en eenheden.
- Mobiel heeft dezelfde capabilitydekking als desktop. Floors en zware detailsecties mogen progressief inklappen, maar warnings blijven buiten gesloten content zichtbaar en niets wordt permanent verborgen vanwege schermbreedte.

## Energiepariteit

- `energy` bevat minimaal alle voor de live configuratie relevante standaard HA Energy-informatiecategorieën: datum/range en vergelijking, usage per bron/teruglevering, solar/forecast, bronnen/kosten/vergoeding, grid balance/neutrality, solar consumed, koolstofarm aandeel, zelfvoorziening, apparaten total/detail, historische Energy Sankey, actuele Power Sankey, powerhistorie, batterijflow/SoC en conditionele gas-/waterinformatie.
- Officiële HA Energy-cards en hun gedeelde collection/date model hebben de voorkeur boven gekopieerde berekeningen.
- Bovenop standaard HA toont de lokale pagina capaciteitspiek/kwartierpiek, EV-laadcontext, UPS, relevante fasewaarden/-onbalans en actueel/dagverbruik per relevant apparaat.
- De ingebouwde Energy-panelroute blijft een eerste-klas fallback en configuratie-ingang. Pariteit wordt per geconfigureerde bron en zichtbare informatie getest.

## Architectuur en dependencies

- Native Heading, Tile, Badge, Visibility en Sections waar zij het probleem oplossen.
- Beoogd eindbeeld: de drie bestaande specialistische custom cards plus een nieuw te bouwen zwembadcard. Andere dependencies vereisen meetbare UX-winst.
- Volledige specialistische cards worden alleen op detailsubviews gerenderd.
- Custom cards gebruiken relevante-state subscriptions/gating, `getGridOptions()`, cleanup en expliciete configfouten.
- Alleen ondersteunde HA-themevariabelen; geen private frontendimports.

## Privacy en configuratie

- Tracked bestanden gebruiken logische keys en fictieve waarden.
- Lokale mappings en gegenereerde dashboards zijn gitignored.
- Privacyguard blokkeert entity/device-ID's, serienummers, MAC-adressen, interne hostnamen/URL's, coördinaten en secrets.
- Geen mapping onder publiek `/www` en geen installatie-inventaris in renders.
- De vault blijft read-only en wordt niet gekopieerd.

## Validatie en migratie

- Vaste statische en browserbaselines met gedocumenteerde telmethode.
- Tests voor schema/YAML, mappingcompleetheid, privacy, actions/confirmations, visibility, missing/unavailable, responsive layout, visuele regressie, toegankelijkheid en performance.
- Latere testdeployment alleen naar een expliciet goedgekeurd afzonderlijk testdashboard, na verse export en snapshot.
- Menselijke gates vóór testdeployment, productiecutover en verwijdering van oude resources.
- Rollback gebruikt de verse export; MCP Test wordt niet verondersteld identiek te zijn.

## Vastgelegde platform- en navigatiekeuzes

- Minimale ondersteunde versie is Home Assistant 2026.8.2, de actuele live versie op de peildatum.
- Energie is een zelfstandige, volledige hoofdview en geen secundaire ingang onder Domeinen.
- `Open details` voor Kia, robot en tuin opent de volledige bestaande specialistische card. Voor zwembad opent dezelfde route later de nieuwe volledige zwembadcard.
- Alle geconfigureerde camera-previews en hun afzonderlijke privacystanden blijven een cruciaal Home-onderdeel; privacy uitschakelen vereist confirmation en autorisatie in de backend.
- De twee initiële Home-acties zijn `Avondscene` en het expliciet gemapte script `Lichten beneden uit`; zonder goedgekeurde mapping wordt een actie verborgen.
- Diagnostiek en beheer gaan naar een afzonderlijk `require_admin`-dashboard.

## Aannames voor de conceptfase

- Het gezin verkiest een Nederlandstalige, rustige interface.
- Diagnostiek kan als afzonderlijke admin-/beheerlaag worden uitgewerkt.
- Native summaries mogen dezelfde expliciet gemapte states lezen als de specialistische cards, zonder hun domeinlogica te kopiëren.

## Conceptgate

De functionele en navigatiekeuzes zijn voldoende vastgelegd om de niet-live bouwfundering te starten. Een Home Assistant-testwrite blijft een afzonderlijke menselijke gate.
