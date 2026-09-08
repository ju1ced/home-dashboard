# Testrelease v0.8.0-alpha.4 — geordende kameracties

Deze candidate laat per favoriete kamer nul tot zestien afzonderlijke quick actions kiezen en ordenen. Meerdere lichten, covers, mediaspelers en klimaatbronnen van hetzelfde type zijn toegestaan. Kamers gebruiken de native terugpijl rechtstreeks naar Home.

## Instellen

1. Bewaar de huidige dashboardconfiguratie en noteer `v0.8.0-alpha.3` als rollbackversie.
2. Installeer de prerelease pas na publicatie via HACS en herlaad de frontend volledig.
3. Configureer uitsluitend het goedgekeurde testdashboard; default `lovelace` blijft read-only.
4. Kies onder Dashboard bewerken → Kamers → Knoppen op Home de gewenste entiteiten. Gebruik de pijlen voor de volgorde; een lege selectie is geldig.

## Te controleren

- Twee of meer lichten en twee of meer rolluiken verschijnen als afzonderlijke chips in de ingestelde gemengde volgorde.
- Een lege selectie toont de melding dat geen functies zijn ingesteld en blijft na opslaan leeg.
- Licht en radio bedienen uitsluitend hun eigen gekozen entiteit. Iedere cover opent een eigen Open/Stop/Dicht-strook; een luifel gebruikt Uit/Stop/In en behoudt bevestiging.
- Klimaat opent het native Home Assistant-detailvenster. Missing, unknown en unavailable voeren geen servicecall uit.
- Het openen van een tweede actiestrook sluit de eerste. Alle knoppen behouden toetsenbordfocus en minimaal 44 px touchoppervlak.
- Volledige kamer opent de brede kamerdetailpagina. De native terugpijl voert naar Home; er staat geen tweede Home-knop in de blauwe kamerheader.
- Vandaag en camera blijven op desktop boven en onder uitgelijnd; afvalophaling blijft aanwezig.

## Lokaal bewijs en grenzen

Op 8 september 2026 slagen 64 geautomatiseerde tests en tien fictieve browserrenders. De browsercheck valideert de gekozen volgorde, een exacte servicecall naar het tweede rolluik, een bewust lege lijst, de brede kamerdetailpagina en `back_path: home`. De minified bundle blijft onder 180 kB.

De fixtures maken geen verbinding met Home Assistant. Test echte bediening alleen met de bestaande targetallowlist, verse snapshot en menselijke gate.

Rollback: selecteer via HACS `v0.8.0-alpha.3`, herlaad de frontend en herstel zo nodig de bewaarde configuratie.
