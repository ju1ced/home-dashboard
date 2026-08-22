# Finaal voorstel — startbasis Home Dashboard

## Besluit

We starten met **Huis in beeld**: een informatievol maar rustig Home Assistant Sections-dashboard op minimaal Home Assistant 2026.8.2. De bestaande Home Assistant-sidebar blijft de applicatieshell. Binnen het dashboard staan vijf vaste native views: **Home, Kamers, Energie, Domeinen en Meer**.

De nieuwe ervaring behoudt de bruikbare informatiedekking van het huidige dashboard, maar verdeelt die over een duidelijke hiërarchie. Desktop gebruikt ruimte voor vergelijking; mobiel gebruikt samenvatting-eerst, horizontale rails en gecontroleerde progressive disclosure. “Niet meteen zichtbaar” betekent nooit “niet bereikbaar”.

Dit document sluit de conceptgate. Het autoriseert nog geen Home Assistant-write of deployment.

## Hoofdstructuur

| View | Eerste scherm | Volledige dekking |
|---|---|---|
| Home | aandacht, Vandaag, gezin, security, actieve toestand | compacte kamers, vier specialisten en domeinroutes |
| Kamers | floor-groepen en roomsummaries | alle bevestigde kamers met passende quick actions en detailpad |
| Energie | actuele powerflow en kern-KPI's | volledige standaard HA Energy-informatie plus lokale piek-, fase-, EV- en UPS-context |
| Domeinen | security, klimaat, water, zwembad, mobiliteit en buiten | woningbrede status, veilige acties, historie en specialistdetails |
| Meer | weer, afval, aanwezigheid en secundaire functies | link naar afzonderlijk admin-dashboard |

## Home: definitieve volgorde

1. **Aandacht:** kritieke items en maximaal drie niet-kritieke uitzonderingen.
2. **Vandaag:** compacte weersverwachting, volgende relevante afvalophaling en globale energie-/laadstatus.
3. **Gezin:** individuele person cards met thuis, benoemde zone, onderweg of onbekend; dataversheid en alleen relevante device-batterijwaarschuwingen.
4. **Beveiliging & privacy:** alle geconfigureerde camera's/fallbacks horizontaal scrollbaar, privacystand per camera en alarmstatus met veilige route naar modi.
5. **Nu actief:** maximaal vier echte uitzonderingen.
6. **Snelle acties:** start met `Avondscene` en het expliciet gemapte script `Lichten beneden uit`; ontbrekende of niet-goedgekeurde mapping verbergt de actie.
7. **Actieve ruimtes:** maximaal vier contextuele kamers en `Alle kamers`.
8. **Specialisten:** Kia, robot, tuin en zwembad.
9. **Verder:** maximaal vijf primaire domeinlinks.

Home wordt geen kopie van de volledige kamerlijst of Energy-pagina. De compacte globale statusrail toont alleen actueel huisvermogen, solar/netrichting, batterij/EV-status en waarschuwingen die een snelle beslissing ondersteunen.

## Kamers en kamerdetail

### Kamers-overzicht

- alle bevestigde woon- en buitenruimtes onder Gelijkvloers, Boven en Buiten;
- room summary met comfort, relevante warning, maximaal twee veilige quick actions en een eigen detailpad;
- op mobiel opent de relevante/verstoorde floor standaard; de andere floors zijn inklapbaar maar blijven één tap verwijderd;
- voorraad-, archief- en technische beheergroepen worden geen kamers.

### Kamerdetail

Iedere kamer volgt dezelfde capabilityvolgorde, maar rendert uitsluitend wat is gemapt:

1. context en warnings;
2. licht en scènes;
3. covers en openingen;
4. klimaat/HVAC inclusief setpoint, mode, preset, fan en swing waar ondersteund;
5. media;
6. comfort en aanwezigheid: temperatuur, vocht, CO₂/luchtkwaliteit, lux, geluid en druk;
7. safety en camera-ingang;
8. apparaten/power met actueel vermogen, dagverbruik en veilige bediening;
9. beslisrelevante comfort- en energiehistorie;
10. diagnostiek als laatste, bij voorkeur via admin.

Een lichte kamer blijft compact. Een zware kamer zoals keuken, woonkamer of slaapkamer behoudt de rijke info uit de huidige detailpagina's via secties/subviews. Mobiel toont context, primaire bediening en safety eerst; historie en lange apparatenlijsten worden progressief ontsloten.

## Energie: hard paritycontract

De Energie-hoofdview gebruikt waar mogelijk de officiële Home Assistant Energy-cards en dezelfde geconfigureerde bronnen. Daardoor erven datumselectie, vergelijkingsgedrag, bronberekeningen en toekomstige platformverbeteringen het standaard HA-model.

### Minimaal dezelfde informatie als het standaarddashboard

| Standaard HA-capability | Finale locatie |
|---|---|
| datum/range selecteren en vergelijken | sticky/duidelijk bereikbare datumselectie voor alle historiecards |
| energieverbruik per bron en teruglevering | Historie → energy usage graph |
| solarproductie en forecast | Historie → solar graph |
| gas en water indien geconfigureerd | eigen Energie-tabs/secties, conditioneel |
| bronnentabel inclusief kosten en vergoeding | Overzicht → sources table |
| grid neutrality en grid balance | Overzicht |
| zelfverbruik solar, koolstofarm aandeel en zelfvoorziening | Inzicht |
| individueel apparaatverbruik, totaal en tijdlijn | Apparaten |
| historische Energy Sankey | Historie/Flow |
| actuele Power Sankey | Nu |
| power sources history | Nu/Powerhistorie |
| batterijflow en state of charge | Nu en Overzicht |
| downstream water en waterflow indien geconfigureerd | Water |

De officiële kaartcatalogus is de paritybron: [Energy cards](https://www.home-assistant.io/dashboards/energy/) en [Home energy management](https://www.home-assistant.io/docs/energy/). Een nieuwe HA Energy-card die relevant wordt voor de geconfigureerde bronnen, gaat standaard mee in de parityreview.

### Lokale uitbreiding bovenop standaard HA

- actuele huisconsumptie, solarproductie en import/export;
- Belgische capaciteitspiek/kwartierpiek en kostimpact;
- EV-laadvermogen, sessie, planning en status;
- batterij- en UPS-context;
- fasewaarden en fase-onbalans; normaal compact, afwijking prominent;
- actuele/dagenergie per relevant apparaat op kamerdetail;
- directe route naar de ingebouwde Energy-configuratie zonder configuratielogica te dupliceren.

Als een officiële Energy-card niet bruikbaar blijkt in een gewone Lovelace-view, blijft de ingebouwde Energy-panelroute een eerste-klas fallback. Pariteit wordt op configuratie en zichtbare informatie getest, niet alleen op een gelijk aantal kaarten.

![Energie desktop](../renders/energy-desktop.png)

![Energie mobiel](../renders/energy-mobile.png)

## Security en privacy

- Alle geselecteerde camera's blijven op Home scrollbaar op mobiel en worden responsief over de beschikbare breedte verdeeld.
- Iedere stream faalt zelfstandig met freshness/fallback; andere camera's en alarmbediening blijven bruikbaar.
- Privacy aan/uit is per camera ondubbelzinnig zichtbaar. Privacy uitschakelen vereist confirmation en backendautorisatie.
- Alarmstatus staat vóór de moduscontrols. Arm/disarm en lockacties gebruiken duidelijke labels, confirmation en een actuele resultaatstatus.
- Echte camerabeelden, namen en locatiegegevens komen nooit in tracked fixtures, renders of logs.

## Specialistische details

- Kia, robot en tuin openen full-width hun volledige bestaande, geversioneerde cards uit de bronrepo.
- Zwembad krijgt een zelfstandige full-width card met waterkwaliteit, filter/pomp, verwarming, energie, modi, historie en veilige acties.
- De centrale shell levert titel, terugpad, statussemantiek, fallback en responsive ruimte; specialistische domeinlogica blijft in de broncard.

## Technische keuze

- Native Sections, Heading, Tile, Badge, Visibility en officiële Energy-cards vormen de basis.
- Een bestaande expanderdependency mag uitsluitend voor zware mobiele kamer-/domeinsecties worden behouden wanneer de native 2026.8.2-UX aantoonbaar minder bruikbaar is. Voorwaarden: toetsenbord/screenreader, statebehoud, lazy zware content, meetbare performance en een ongeklapte native fallback.
- Tracked configuratie gebruikt logical keys; echte mappings en generated output blijven gitignored.
- Diagnostiek en beheer gaan naar een afzonderlijk `require_admin`-dashboard.

## Bouwvolgorde waarmee we starten

1. **Foundation en paritymanifest:** logical schema, gitignored mapping, actionscope en current-to-target matrix.
2. **Native shell en Home:** vijf routes, Vandaag, person cards, security/privacy, statusrail en starteracties.
3. **Kamers:** floor-overzicht, lichte en zware referentiekamer, mobiel disclosurecontract.
4. **Energie:** officiële-card parity, lokale uitbreidingen en desktop/mobile baselines.
5. **Domeinen en specialisten:** security, Kia, robot, tuin en daarna de nieuwe zwembadcard.
6. **QA en staging:** accessibility, privacy, performance, verse snapshot, expliciet testdashboard en menselijke gate.

## Startacceptatie

De bouw mag beginnen zodra een lead de volgende niet-live artifacts opzet:

- capabilityschema en paritymanifest;
- logical fixtures voor normal, warning, missing en unavailable;
- mappingtemplate zonder echte identifiers;
- actionallowlist met confirmationbeleid;
- baselines voor Home, Kamers, zware kamer, Energie en Security op 390×844 en 1440×900.

Geen testdeployment vóór een nieuwe expliciete goedkeuring, exacte targetallowlist en verse export/snapshot. Default `lovelace` blijft read-only.
