# Ontwerprichting — vaste kamerbediening

Status: door de eigenaar aanvaard op 7 september 2026, met afvalophaling expliciet behouden. Daarna zijn ontwikkeling, PR en testrelease expliciet aangevraagd; de uitvoering staat in de [v0.8-checklist](../releases/testing-v0.8.0-alpha.1.md). Dit document bepaalt de volgende ontwerpslice; het beschrijft doelgedrag, geen reeds geleverde bediening. Het vervangt voor deze onderwerpen de eerdere limiet van twee kameracties en de uitsluitend actieve kamerset op Home.

## Home en stijl

- Behoud de huidige rustige achtergrond, witte afgeronde kaarten, subtiele randen, bestaande themetokens en zachtblauwe actieve accenten. Geen nieuwe globale themebaseline.
- Vandaag behoudt de samengestelde kaart: weer en voorspelling, zes benoemde energievelden en **Afvalophaling** onderaan. Afval toont per geconfigureerde fractie icoon, naam, volgende datum en relatieve termijn; maximaal vier per rij op desktop en twee op mobiel. Ontbrekende bronnen leveren geen verzonnen datum op.
- Security blijft zelfstandig naast Vandaag op desktop. Bestaande alarm-, camera- en privacyregels blijven gelden; een private camera toont geen preview.
- Gezin blijft compact. Daarna vervangt **Kamers & bediening** de dubbele kamer-/apparaatpresentatie van Nu actief en Kamers in beeld. Woningbrede activiteit die niet in kamerkaarten past blijft conditioneel zichtbaar; safety blijft in Aandacht nodig, onafhankelijk van favorieten.
- Toon maximaal vier expliciet gekozen favoriete kamers in vaste configureerbare volgorde, ook als alles uitstaat. Alle kamers blijft een zichtbare route naar het volledige verdiepingenoverzicht. Vermijd dubbele kamerlinks onder Snel naar; specialistische ingangen blijven behouden.

## Kamerkaart en acties

Iedere kaart toont een kamericoon, naam, maximaal twee contextwaarden en een afzonderlijke detailingang. Daaronder staan maximaal vier passende, expliciet gemapte capabilityknoppen met icoon, label en toestand: Lichten, Rolluiken, Luifel en Radio. Ontbrekende capabilities verdwijnen. Geen automatische selectie van het eerste gevonden apparaat of verborgen uitbreiding van actionscope.

| Bediening | Voorgesteld gedrag |
|---|---|
| Lichten | Direct aan/uit voor de expliciet gekozen lamp of groep; individuele lampen en dimmen via details. |
| Rolluiken | Open een compacte strook met Open, Stop en Dicht; benoem het doel bij meerdere rolluiken. |
| Luifel | Open een compacte strook met Uit, Stop en In; veiligheidsvoorwaarden blijven bij de backend. |
| Radio | Start/pauze voor de gekozen speler en ondersteunde actie; bronkeuze en volume via details. Geen impliciete zenderkeuze. |
| Kamernaam/pijl | Navigeer naar het volledige kamerdetail zonder een apparaat te bedienen. |

Zachtblauw betekent normale activiteit; tekst en icoon dragen dezelfde betekenis. Een open bedieningsstrook is geen indicatie dat een cover beweegt. Houd navigatie en bediening als afzonderlijke focusbare doelen. Op mobiel staan kamerkaarten in één kolom en knoppen waar nodig in twee kolommen; doelen blijven minimaal 44×44 px. Disclosure werkt ook met toetsenbord, zichtbare focus en toegankelijke expanded-status.

## Dataversheid

Home toont geen generiek Niet recent-label, ouderdomstekst of waarschuwingskleur vanwege een verstreken tijdsdrempel. Dit geldt ook voor personen en energievelden. Een onveranderde state, zoals nulvermogen of maandpiek, is op zichzelf geen bewijs van uitval. Bronouderdom hoort bij details/diagnostiek.

Echte missing, unknown en unavailable blijven semantisch onderscheiden: geen gefabriceerde nulwaarden en geen schijnbaar bruikbare bediening. Operationele uitval of safety kan nog steeds aandacht vragen. Voor aantoonbaar tijdkritische bronnen moet de latere implementatie een expliciet broncontract gebruiken; een algemene state-ouderdom is daarvoor onvoldoende.

## Render en acceptatie

De besproken conceptrender is een stijl- en interactiereferentie, geen volledige productbaseline. Hij liet afval en voorspelling weg; die blijven verplicht. De getekende camera naast Privacy aan is evenmin doelgedrag: private camera's blijven zonder preview. Er worden geen persoonlijke screenshots naar de repository gekopieerd.

De volgende implementatieslice omvat:

1. Favorieten, volgorde en actiedoelen expliciet configureren in model en GUI, met compatibiliteit voor bestaande configuratie. Bestaande read-only bediening niet stilzwijgend activeren.
2. Home en het volledige Kamers-overzicht dezelfde kaartgrammatica geven; kaartdetails en specialistische ingangen behouden.
3. Generieke stale-presentatie op Home verwijderen zonder operationele uitval of safety te onderdrukken.
4. Nieuwe reproduceerbare fictieve renders maken met afvalophaling én voorspelling, desktop, tablet, mobiel en dark mode.
5. Normal/warning/missing/unavailable valideren, inclusief onveranderde geldige sensoren, uitgeschakelde favorieten, ontbrekende actiedoelen, cover-stop, radio zonder bron en safety buiten favorieten.
6. Actionscope, autorisatie, confirmation waar nodig, foutfeedback, toetsenbord, responsive gedrag, fallback en performance expliciet reviewen; pnpm test en git diff --check moeten slagen.

Deze projectupdate legt het ontwerp en werkpakket vast. Productcode, directe servicecalls, live testacties, deployment en publicatie volgen niet uit deze documentatie-update; daarvoor blijft de toepasselijke expliciete opdracht/gate vereist.
