# Testrelease v0.8.0-alpha.1 — kamerbediening

Home toont vaste favoriete kamers met compacte bediening. Afvalophaling en weersvoorspelling blijven in Vandaag; generieke Niet recent-labels en ouderdomskleuren verdwijnen van Home. Het volledige Kamers-overzicht gebruikt dezelfde kamerkaart.

## Instellen

1. Installeer deze prerelease via HACS en herlaad de frontend. Bewaar vooraf de huidige configuratie en noteer de vorige release voor rollback.
2. Open Dashboard bewerken → Kamers. Vink **Favoriet op Home** aan voor maximaal vier kamers. De bestaande omhoog/omlaagknoppen bepalen hun volgorde.
3. Kies per kamer de afzonderlijke actiedoelen voor Lichten, Rolluik, Luifel en Radio. Eén doel kan een bewust gekozen HA-groep zijn. Er worden geen actiedoelen uit de oude apparaatlijsten afgeleid.
4. Schakel **Directe bediening toestaan** alleen in voor de gewenste kamer. Zonder deze keuze openen de nieuwe knoppen apparaatdetails. Layout → Quick actions regelt de zichtbaarheid op Home en Kamers.

Bestaande configuraties behouden hun mappings en krijgen geen automatisch geactiveerde bediening of automatisch gekozen favorieten. Zolang geen favorieten gekozen zijn, toont Home de instelhint en Alle kamers. De oude scriptselectie blijft opgeslagen maar wordt niet uitgevoerd door de nieuwe kamerknoppen.

## Te controleren op het goedgekeurde testdashboard

- Vandaag toont weer, drie voorspeldagen waar beschikbaar, zes geconfigureerde energiestatussen en GFT/restafval/papier/PMD met datum en relatieve termijn. Afval staat op mobiel in twee kolommen.
- Nulvermogen, een onveranderde maandpiek en personen krijgen geen ouderdomsmelding of waarschuwingsrand. Echte missing/unknown/unavailable blijft herkenbaar; nulwaarden worden niet verzonnen.
- Favorieten blijven in dezelfde volgorde staan als alle apparaten uitstaan. Safety in een andere kamer blijft bovenaan aandacht vragen. Overige woningactiviteit en specialistische ingangen blijven bereikbaar.
- Lichten bedient alleen het gekozen doel. Een expliciet gemapte lichtgroep houdt de door de eigenaar gekozen scope.
- Rolluiken biedt Open/Stop/Dicht voor de ondersteunde functies; deuren en poorten worden niet via deze controls bediend. Luifel biedt Uit/Stop/In, met bevestiging vóór beweging. Stop blijft beschikbaar terwijl een bewegingsverzoek nog wacht.
- Radio pauzeert en hervat een gepauzeerde bron. Uit/idle of een niet-ondersteunde actie opent details voor bronkeuze; deze release kiest geen radiozender impliciet.
- Geen voortijdig succes: de UI houdt de door HA gemelde toestand aan. Na een aanvraag meldt zij alleen dat het verzoek ontvangen is. Bij weigering/timeout volgt neutrale foutfeedback; controleer de actuele toestand vóór opnieuw proberen.
- Controleer met de bedoelde HA-gebruiker dat backendrechten en luifel-/windbeveiliging gelden. De client verleent geen rechten en dupliceert geen beveiligingslogica.
- Kamernaam/pijl opent het kamerdetail. Expliciete actiedoelen staan ook in het passende detailblok, zonder dubbele bronrijen.
- Controleer 390 px, tablet, desktop en donker thema, toetsenbordfocus en 44 px touchdoelen. Bronupdates mogen een open coverstrook en focus niet vervangen.
- Private camera's tonen geen preview. Controleer de bestaande cameracarrousel en Kia-details als regressiesmoke.

## Lokaal bewijs en grenzen

Op 7 september 2026: `pnpm test` slaagt met 61 tests; TypeScript, reproduceerbare bundle, link-/privacycheck en `git diff --check` slagen. De bundle is 169.550 bytes onder de 180 kB-grens. Zeven browser-renders en de interactie-/GUI-checks slagen. Honderd irrelevante stateupdates namen in het lokale browserharnas 55,3 ms en vervingen de kamer-DOM niet; dit is geen performanceclaim voor een live installatie.

De tests en het [fictieve browserharnas](../../prototype/room-controls.html) gebruiken geen HA-verbinding. [Renders en reproduceerstappen](../renders/room-controls/README.md) dekken normaal, warning, missing en unavailable. Commando's in het harnas worden uitsluitend in geheugen vastgelegd.

Live servicecalls, HA-autorisatie, integratiegedrag en runtimeperformance op een echt wanddisplay zijn nog niet door deze lokale checks bewezen. De publicatie van deze testrelease wijzigt geen HA-dashboard. Een live testwrite blijft onder het bestaande target-/snapshotcontract; default lovelace blijft read-only.

Rollback: zet via HACS de vorige versie terug en herstel zo nodig de bewaarde configuratie. Nieuwe optionele kamervelden kunnen door oudere versies worden genegeerd; bewaar daarom de volledige export.
