# Huidige toestand

Peildatum: 2026-08-21. Dit document is een gesaniteerde ontwerpinventaris. Het bevat geen echte entity- of device-ID's, serienummers, interne URL's of secrets.

## Platform en schaal

- Home Assistant Core 2026.8.2 op Home Assistant OS 18.2, Nederlandse taal en tijdzone Europe/Brussels.
- De installatie rapporteert 6 dashboards; de read-only dashboardlijst exposeert er 5. Dit verschil blijft te onderzoeken.
- Het default dashboard gebruikt storage mode en is volledig read-only onderzocht: 27 views, circa 454 kB configuratie en 52 globale frontendresources.
- Er zijn 3 floors en 26 geregistreerde areas. Zes daarvan lijken voorraad- of beheergroepen en horen waarschijnlijk niet in kamernavigatie; de resterende navigeerbare lijst moet vóór bouw door de eigenaar worden bevestigd.
- De installatie is breed: verlichting, klimaat, covers, media, beveiliging, aanwezigheid, energie/EV/solar, water, weer, afval, robotstofzuiger, tuin, zwembad, 3D-printing en systeem/netwerk.
- Een aanzienlijk deel van devices heeft geen area. Het nieuwe dashboard kan daarom niet uitsluitend op de device registry vertrouwen en heeft een gecontroleerde logische mapping nodig.

## Huidig dashboard

- Het default dashboard heeft een platte navigatie met 27 hoofdviews. Alle views zijn zichtbaar als gewone views; er zijn geen subviews.
- Twee views missen een stabiel semantisch pad.
- Home is een zware hub met honderden statusreferenties en zowel dagelijkse bediening als diagnostiek. De publieke migratierepo bevestigt circa 4.200 regels voor alleen deze view.
- De configuratie gebruikt veel stacks, templates, grafieken, card-mod en externe cards. Historische browsermetingen wijzen op duizenden DOM-nodes, lange main-threadtaken en circa 25 MB geladen JavaScript op representatieve views.
- Kia en tuin hebben al een eigen detailview. De robotresource is live geregistreerd, maar de robotkaart staat nog niet in het default dashboard.
- Het afzonderlijke MCP Test-dashboard wijkt inmiddels af van default. Het mag niet als actuele clone of veilige rollbackbasis worden beschouwd.

## Functionele inventaris

| Groep | Primaire informatie | Frequente acties | Achterliggend / diagnostiek |
|---|---|---|---|
| Woning | aanwezigheid, beveiliging, openingen, actieve uitzonderingen | alle relevante lichten uit, alarm/lock via veilige flow | automatiseringen, systeemgezondheid, area-loze techniek |
| Kamers | licht, temperatuur/vocht, cover, media, relevante safety | licht, cover, klimaat, media | batterijen, individuele sensoren, integratiediagnose |
| Energie en water | net/solar/EV, piek of lek als uitzondering | laden of verbruikers alleen met bewuste bediening | historie, tarieven, bronkwaliteit, UPS |
| Mobiliteit | acculading, bereik, laden, dataversheid, beveiligingsstatus | veilige contextuele actie | voertuig-, trip-, klimaat- en mappingdetails |
| Schoonmaak | status, voortgang, batterij, fout/onderhoud | start/pauze/naar basis indien veilig | kaart, zones/kamers, onderhoud en alle data |
| Buiten en tuin | regen, droge zones, actieve irrigatie, storing | irrigatie uitsluitend met bevestiging | zones, drempels, diagnostics, tuin-/terrasbediening |
| Zwembad | waterkwaliteit, filter/verwarming, afwijking | modi en doelinstellingen met bevestiging waar kostbaar | energie, historie en regeltechniek |
| Systeem | alleen kritieke storing op Home | geen dagelijkse beheeractie op Home | netwerk, updates, printers, inventaris en technische details |

## Statuskwaliteit

- Een momentopname bevat honderden `unknown`- en `unavailable`-states. Veel `unknown`-waarden zijn normaal voor buttons, events en helpers; ze mogen niet generiek als alarm worden getoond.
- `unavailable` is vooral relevant wanneer een operationeel belangrijke capability ontbreekt. Area-loze en diagnostische entities veroorzaken anders veel ruis.
- Disabled entities konden via de beschikbare read-only interface niet volledig worden geïnventariseerd. Latere mapping moet daarom entity-category, allowlists en expliciete opt-in gebruiken.
- De live installatie had geen actieve Repairs of persistente notificaties. Momentopnamen zijn geen blijvende requirements.

## Relevante acties en veiligheid

- Dagelijks: licht, covers, klimaat, media, alarm/lock, robot, EV-laden, zwembad en irrigatie.
- Veiligheidskritieke, destructieve of kostbare acties vereisen een duidelijke bevestiging. Een verborgen hold-actie mag nooit de enige affordance zijn.
- Complexe actie- en veiligheidslogica blijft in Home Assistant scripts of in de bestaande specialistische kaart; de centrale shell dupliceert die logica niet.

## Afwijkingen ten opzichte van eerder onderzoek

- De eerdere migratie beschreef 51 resources; live zijn het er 52 en de robotresource is toegevoegd.
- MCP Test was historisch byte-identiek aan default, maar heeft nu een andere grootte en hash.
- Historische kaart- en entityaantallen gebruiken verschillende telmethodes. Alleen trend en orde van grootte zijn bruikbaar; toekomstige regressies krijgen een vaste telmethode.
- Het oudere `juiced-dashboard` is structureel modulair en privacyveilig, maar de inhoud is grotendeels een 1-op-1-migratie. Het is een bron voor tooling en dekking, niet het UX-ontwerp voor Home.

## Beperkingen van de inventaris

- Geen afzonderlijk frontend-buildnummer beschikbaar.
- Complete disabled-registry niet beschikbaar.
- De zesde dashboard-entry kon niet worden verklaard.
- Area-loze apparaten zijn alleen op capability/domein geclassificeerd.
- Geen acties of runtime-tests in Home Assistant uitgevoerd.
