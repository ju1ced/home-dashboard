# Informatiepariteit huidige dashboard

## Doel en bron

Deze inventaris vertaalt zes door de eigenaar aangeleverde desktop- en mobiele screenshots van de huidige setup naar functionele requirements. De bestaande layout is nadrukkelijk **geen** visueel doel; de informatiedekking en mobiele bruikbaarheid zijn dat wel.

De screenshots zelf worden niet in de repository opgeslagen. Persoonsnamen, foto's, camerabeelden, locaties en installatie-identifiers zijn niet overgenomen. Onderstaande voorbeelden zijn alleen capabilitycategorieën.

## Wat behouden moet blijven

| Huidige informatie | Finale locatie | Presentatieprincipe |
|---|---|---|
| compacte woning- en energiestatus in de bovenste navigatiestrook | globale statusrail en Energie | alleen kernwaarden en echte uitzonderingen; detail opent de volledige pagina |
| meerdaagse weersverwachting | Home → Vandaag; volledig onder Meer | compacte forecast, geen losse weersensorinventaris |
| person cards met thuis/andere zone en gekoppelde batterijstatus | Home → Gezin; volledig onder Aanwezigheid | persoonstatus primair; optionele telefoon/wearable-batterij secundair en alleen bij aandacht |
| afvalfracties met datum/aftelling | Home → Vandaag; volledig onder Meer | volgende relevante ophalingen, automatisch verborgen buiten de tijdige context |
| alle kamers per verdieping | Kamers | floor-gegroepeerd; mobiel samenvatting-eerst en inklapbaar |
| temperatuur, vocht en waar aanwezig CO₂ op roomsummaries | Kamers en kamerdetail | alleen geconfigureerde comfortwaarden; ontbrekende waarden niet als normale nul tonen |
| licht, covers, scènes, klimaat, media, aanwezigheid en safety per kamer | kamerdetail | vaste capabilityvolgorde; lege secties verdwijnen |
| cameracarrousel, configureerbare privacycontrols en alarmstatus/-modi | Home → Beveiliging & privacy; volledig op Security | camera-uitval is lokaal; privacy uit en alarmwijziging vragen confirmation/autorisatie |
| actueel huisverbruik, netflow, solar, batterij, capaciteitspiek en EV-laden | Energie → Nu | actuele waarden met freshness en richting, niet uitsluitend een gaugekleur |
| fasewaarden, bron-/verbruiksflow, koolstofarm aandeel en water | Energie → Nu/Overzicht | compacte KPI's en officiële flowcards; fases alleen bij afwijking prominent |
| dag-/maand-/jaarhistorie en kosten | Energie → Historie | officiële HA Energy-cards met gedeelde datumselectie en vergelijking |
| individueel apparaatverbruik | Energie → Apparaten en relevante kamer | ranglijst/graph centraal; actuele W en dag-kWh contextueel op kamerdetail |

## Kamerdetail-capabilities uit de voorbeelden

De screenshots tonen dat een kamerdetail veel rijker moet zijn dan alleen licht, cover en thermostaat. Het finale roommodel ondersteunt conditioneel:

1. **Context:** bezetting, temperatuur, vocht, CO₂, luchtkwaliteit, lux, geluid en druk.
2. **Verlichting en scènes:** aan/uit, dimniveau, kleurprofiel en benoemde scènes.
3. **Covers/openingen:** positie, omhoog/stop/omlaag, raam/deurstatus en relevante batterijstatus.
4. **Klimaat:** actuele temperatuur, setpoint, HVAC-modus, preset, fan speed, swing, boost/afwezig en werkingsstatus.
5. **Media:** bron, titel, volume, transport en power.
6. **Safety en aanwezigheid:** beweging/bezetting, openingen, camera-ingang, rook/water waar aanwezig.
7. **Apparaten en power:** veilige switch, lockstatus, actueel vermogen, dagverbruik en optionele spanning.
8. **Historie:** compacte comfortgrafieken en, waar beslisrelevant, energie per dag/maand/jaar.
9. **Specialistisch apparaat:** een zelfstandige detailcard of subview wanneer een gewoon apparaatblok onvoldoende is.

Volgorde, labels en dichtheid mogen per breakpoint wijzigen; capabilitydekking en actiescope niet.

## Mobiel contract

- De informatiedekking is gelijk aan desktop; mobiel verbergt niets permanent vanwege schermbreedte.
- Home toont samenvattingen en horizontaal scrollbare rails voor context en camera's.
- Kamers gebruikt floor-groepen. De relevante/verstoorde groep opent standaard; andere groepen blijven één tap verwijderd.
- Kamerdetail toont eerst context, primaire bediening en safety. Comforthistorie, apparaten, energie en diagnostiek volgen in inklapbare secties of stabiele subviews.
- Inklappen verandert alleen presentatie. Critical/warning blijft altijd buiten een gesloten sectie zichtbaar.
- Controls hebben minimaal 44×44 px touch targets; horizontale pagina-overflow is niet toegestaan.
- Scrollpositie en gekozen detailsectie blijven bij terugnavigatie behouden waar Home Assistant dit ondersteunt.

## Wat bewust niet wordt overgenomen

- de extreem brede desktopkolommen en gelijktijdige weergave van vrijwel alle controls;
- betekenis die alleen via rood/groen/oranje wordt gecommuniceerd;
- icon-only bediening zonder toegankelijke naam of toestand;
- volledige apparaatlijsten en alle historische grafieken boven de vouw;
- precieze persoonsgegevens, cameraframes of echte installatiewaarden in fixtures en renders;
- een generieke toggle voor riskante, dure of privacygevoelige acties.
