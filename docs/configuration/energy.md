# Energie en woningbrede domeinen

## Doel van deze alpha

De Energie-hoofdview combineert twee gegevenslagen zonder eigen energieformules te introduceren:

1. expliciet via **Dashboard bewerken → Energie** gemapte actuele sensoren;
2. de officiële Home Assistant Energy-cards en hun gedeelde periodekeuze.

De pagina is volledig read-only. Zij voert geen servicecall of configuratiewrite uit. De ingebouwde route `/energy` blijft de eerste-klas configuratie-, diagnose- en fallbackroute.

Deze eerste `v0.6`-alpha is een echte informatiepagina, maar nog geen afgerond pariteitsbewijs. Kosten, compensatie, bronhiërarchie en historische berekeningen blijven eigendom van de officiële Home Assistant Energy-configuratie. Een latere paritytest controleert iedere geconfigureerde bron en zichtbare officiële categorie in de echte runtime.

## Actuele mappings

| GUI-veld | Gebruik op de pagina | Gedrag als het ontbreekt |
|---|---|---|
| Elektriciteit | net-, import-, export- en woningcontext volgens de gekozen sensoren | groep verdwijnt |
| Zon | actuele productie en gemapte zonbronnen | zonkaarten verschijnen alleen wanneer relevant |
| Batterij | SoC, laden, ontladen of andere expliciet gekozen batterijstatus | groep verdwijnt |
| Gas | gemapte gasbron plus officiële historische gasgrafiek | gasblok verdwijnt |
| Water | gemapte waterbron plus officiële historische watergrafiek | waterblok verdwijnt |
| Apparaten | lokale apparaatbronnen en officiële Energy-apparaatgrafiek | apparaatblok verdwijnt |
| Capaciteitspiek | lokale maand-/kwartierpiek | KPI verdwijnt |
| EV-vermogen | actuele laadcontext | KPI verdwijnt |
| UPS | operationele noodstroomstatus | KPI verdwijnt |
| Fasen | maximaal drie prominente fasewaarden; alle mappings blijven in de bronsectie | fase-KPI's verdwijnen |

De kaart neemt geen richting, kost of eenheid aan op basis van een entitynaam. De geselecteerde Home Assistant-entity bepaalt de geformatteerde waarde en friendly name. Een geconfigureerde maar ontbrekende of `unknown`/`unavailable` bron toont **Niet beschikbaar** en blokkeert de overige pagina niet.

De actuele kaart is begrensd: zij toont een kernset bovenaan en groepeert alle gekozen bronnen daaronder. Een 48-uurs read-only historie helpt bij actuele vermogenscontext; de officiële Energy-grafieken blijven verantwoordelijk voor dag-, week-, maand- en jaarvergelijking.

## Officiële Energy-laag

Wanneer **Link naar standaard Energy-dashboard tonen** actief is, rendert de pagina de betrouwbare officiële frontendkaarten die bij de geconfigureerde categorieën passen:

- gedeelde datum- en vergelijkingselectie;
- energiedistributie;
- usage en bronnentabel;
- solar en zelfvoorzienings-/koolstofinzichten wanneer zon is gemapt;
- apparaten, gas en water wanneer die categorieën zijn gemapt.

Deze kaarten lezen de centrale Home Assistant Energy-collection. De lokale entityselecties vervangen die Energy-configuratie niet. Als de officiële kaarten om configuratie vragen, open dan **Open standaard Energie-dashboard** en beheer de bronnen daar. Het Home Dashboard schrijft die configuratie nooit zelf.

Schakel de standaardlaag alleen uit wanneer je bewust uitsluitend de gemapte actuele bronnen wilt tonen. Daarmee verdwijnt ook de directe fallbackknop; er worden geen Home Assistant-bronnen verwijderd.

## Domeinen

De hoofdview **Domeinen** is geen entityinventaris meer. Zij groepeert geconfigureerde functies en routeert naar hun eigenaarpagina:

- Klimaat & lucht en Verlichting → relevante kamerdetails;
- Veiligheid & openingen → alarmstatus en relevante kamers;
- Water en Energie & apparaten → Energie;
- Media → relevante kamerdetails;
- Mobiliteit & buiten → geactiveerde specialistische ingangen; Kia opent vanaf deze release rechtstreeks `specialist-kia`, de overige ingangen blijven voorlopig via Meer;
- Systeem → het ingestelde beheerdashboard of de veilige Meer-fallback.

Kamerlijsten worden alleen samengesteld uit expliciete capabilities en mappings. Friendly-nameherkenning of automatische runtimeclassificatie wordt niet gebruikt. Daardoor kan een niet-geconfigureerd domein veilig verdwijnen en worden area-loze of woningbrede bronnen niet per ongeluk als kamer gepresenteerd.

## Responsive gedrag en toegankelijkheid

- De actuele KPI's vloeien op smalle schermen naar twee kolommen en daarna via de native Sections-volgorde verder naar beneden.
- Alle waarden hebben tekst naast hun icoon; kleur is nooit de enige statusdrager.
- Navigatie gebruikt native buttons met toetsenbordbediening. Entitytiles hebben alle tap-, hold-, double-tap- en iconacties expliciet op `none`.
- Het designsysteem volgt Home Assistant-tokens in systeemmodus en dezelfde Juiced Horizon Calm-semantiek in expliciete licht/donkermodus.

## Privacy, acties en rollback

- Configuratie-export kan lokale entityreferenties bevatten en blijft privé.
- Tracked voorbeelden en tests gebruiken uitsluitend fictieve logical keys.
- De Energy- en Domeinenpagina's bevatten geen service-, target- of perform-actionconfiguratie.
- Uitschakelen van Energie in de GUI vervangt de pagina door een configuratiehint; Home, Kamers en het standaard Energy-dashboard blijven intact.
- Terugrollen vereist alleen een vorige HACS-release of het terugzetten van de eerdere dashboardconfig. Deze alpha wijzigt geen Home Assistant Energy-bronnen.
