# Home

Home is een operationeel startscherm, geen volledige inventaris. `v0.5.0-alpha.9` rendert de inhoud als één begrensde, responsive compositie in plaats van losse Sections-kolommen:

1. **Aandacht nodig** combineert operationele uitval en expliciet gemapte kamer-safety. Onveilige/probleemstates staan vóór open/unlocked en die staan vóór `unknown`/`unavailable`. De banner toont de volledige telling en maximaal drie doelgerichte detailknoppen; iedere knop opent uitsluitend het standaard entitydetail. Generieke buttons, events of overige diagnostiek worden niet als alarm behandeld.
2. **Vandaag** vormt op desktop één samengestelde kaart over de twee linker kolommen: weer, energie-rail en **Afvalophaling** delen één buitenrand en worden alleen door interne lijnen gescheiden. Maximaal vier afvalfracties staan in één rij; op mobiel blijven ze twee per rij. Security blijft als derde kolom rechts staan en stapelt op smallere schermen. Afvalfracties krijgen waar herkenbaar hun eigen icoon en korte naam, plus datum en `Vandaag`, `Morgen` of `Over n dagen`. Extra energiecontext blijft optioneel.
3. **Gezin** toont de geconfigureerde person cards compact, vermeldt de dataversheid en toont een geconfigureerde persoonsbatterij alleen onder 20%. `show_location` maakt geen vrije locatielekken mogelijk: Home toont **Thuis**, een expliciet toegestane zone, **Andere locatie** of een onbekend/onbeschikbaar fallbacklabel.
4. **Nu actief** toont maximaal vier betrouwbare toestanden uit bestaande mappings: spelende media, actieve HVAC, bewegende covers, ingeschakelde verlichting en EV-laden. De kaarten zijn read-only en openen alleen entitydetails.
5. **Kamers in beeld** toont maximaal vier kamers met een safety-afwijking of actuele activiteit. Safety krijgt voorrang; een kaart navigeert naar de stabiele kamerdetailroute.
6. **Snel naar** groepeert maximaal vier rechtstreekse kamerdetailroutes en ingeschakelde specialistische ingangen.
7. **Beveiliging & privacy** staat zonder dubbele buitenkop op brede schermen als compacte derde kolom naast weer en energiesensoren, en stapelt op tablet/mobiel. Het toont alarmstatus en één camerabeeld per positie; private camera's verdwijnen uit de carrousel en blijven alleen in de smalle privacyrail zichtbaar.

De Home-compositie erft standaard de actieve Home Assistant-themetokens. Wanneer **Thema** expliciet op licht of donker staat, begrenst die keuze dezelfde Juiced Horizon Calm-tokens tot de dashboardcompositie en haar childcards.

Statecards en de weerkaart openen het standaard Home Assistant-detailvenster; camerakaarten blijven read-only. De dagelijkse forecast gebruikt uitsluitend de officiële read-only `weather/subscribe_forecast`-subscription. De bundle roept zelf geen service aan. De algemene quick actions blijven verborgen tot hun afzonderlijke action- en confirmationgate is doorlopen.

Ieder benoemd KPI-veld is optioneel. Iedere KPI toont naast icoon en waarde ook een compact semantisch label. Een ontbrekende, `unknown` of `unavailable` bron krijgt tekstuele uitleg; een bron ouder dan **Diagnostiek → stale after** wordt als **Niet recent** aangeduid. Daarmee is geen status uitsluitend van kleur of icoon afhankelijk.

Realtime waardewijzigingen werken bestaande teksten en childcards in-place bij. Alleen een structurele wijziging — nieuw aandachtspunt, gestart/gestopt actief proces of een veranderde actieve-kamerset — bouwt Home opnieuw op. Een wijzigend vermogen alleen veroorzaakt dus geen permanente refresh. Wanneer alle benoemde velden én **Extra energiecontext** leeg zijn, gebruikt Home maximaal één bron uit de geconfigureerde zon-, elektriciteit-, batterij- en EV-context als veilige informatieve fallback. Energie/Domeinen en specialistische detailpagina's behouden hun afzonderlijke PR's en prereleases.

## Fallbacks en grenzen

- **Normal:** niet-actieve secties verdwijnen; Home blijft een operationeel overzicht en geen inventaris.
- **Warning:** safety-items staan boven operationele uitval en de betrokken kamer verschijnt onder **Kamers in beeld**.
- **Missing:** een ontbrekende optionele KPI toont **Bron ontbreekt**; ontbrekende optionele secties worden niet gefabriceerd.
- **Unavailable/stale:** de waarde blijft zichtbaar als **Niet beschikbaar**, **Controleer bron** of **Niet recent**, met hetzelfde detailpad.
- **Mobiel:** Vandaag blijft de goedgekeurde samengestelde kaart; aandacht, activiteit en kamers worden onder 560 px één kolom met minimaal 44 px hoge doelen.
- **Veiligheid:** deze Home-slice bevat geen servicecall, actionsequence of configuratiewrite. Directe bediening en confirmation blijven een afzonderlijke actiegate.
