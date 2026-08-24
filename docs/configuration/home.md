# Home

Home is een operationeel startscherm, geen volledige inventaris. `v0.5.0-alpha.5` rendert de inhoud als één begrensde, responsive compositie in plaats van losse Sections-kolommen:

1. **Aandacht nodig** verschijnt alleen wanneer een entity uit **Diagnostiek → operationele entities** `unknown` of `unavailable` is. Generieke buttons, events of overige diagnostiek worden niet als alarm behandeld.
2. **Vandaag** toont de ingeschakelde weerbron, een afzonderlijk herkenbaar blok **Afvalophaling** en zes benoemde energie-KPI's: thuisbatterij-SoC, batterij laden, batterij ontladen, zonnepanelenopbrengst, huisverbruik zonder batterijladen en maandelijkse vermogenspiek. Extra energiecontext blijft optioneel.
3. **Gezin** toont de geconfigureerde person cards compact en respecteert `show_location`. Een geconfigureerde persoonsbatterij verschijnt alleen onder 20%.
4. **Snel naar** groepeert maximaal vier rechtstreekse kamerdetailroutes en ingeschakelde specialistische ingangen.
5. **Beveiliging & privacy** staat op brede schermen als compacte derde kolom naast weer en energiesensoren, en stapelt op tablet/mobiel. Het toont alarmstatus en één camerabeeld per positie; private camera's verdwijnen uit de carrousel en blijven alleen in de smalle privacyrail zichtbaar.

Statecards openen het standaard Home Assistant-detailvenster; camerakaarten blijven read-only. De bundle roept zelf geen service aan. De algemene acties, actieve-kamersamenvatting en `Nu` worden pas toegevoegd wanneer hun action- en datacontracten hun eigen testgate hebben doorlopen.

Ieder benoemd KPI-veld is optioneel. Realtime waardewijzigingen werken bestaande teksten en childcards in-place bij; alleen een structurele statuswijziging zoals een nieuw operationeel aandachtspunt bouwt Home opnieuw op. Wanneer alle benoemde velden én **Extra energiecontext** leeg zijn, gebruikt Home maximaal één bron uit de geconfigureerde zon-, elektriciteit-, batterij- en EV-context als veilige informatieve fallback. Energie/Domeinen en specialistische detailpagina's behouden hun afzonderlijke PR's en prereleases.
