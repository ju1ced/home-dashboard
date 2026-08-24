# Home

Home is een operationeel startscherm, geen volledige inventaris. `v0.5.0-alpha.4` rendert de inhoud als één begrensde, responsive compositie in plaats van losse Sections-kolommen:

1. **Aandacht nodig** verschijnt alleen wanneer een entity uit **Diagnostiek → operationele entities** `unknown` of `unavailable` is. Generieke buttons, events of overige diagnostiek worden niet als alarm behandeld.
2. **Vandaag** toont de ingeschakelde weerbron, afvalbronnen en vijf benoemde energie-KPI's: thuisbatterij-SoC, batterij laad-/ontlaadvermogen, zonnepanelenopbrengst, huisverbruik zonder batterijladen en maandelijkse vermogenspiek. Extra energiecontext blijft optioneel.
3. **Gezin** toont de geconfigureerde person cards compact en respecteert `show_location`. Een geconfigureerde persoonsbatterij verschijnt alleen onder 20%.
4. **Snel naar** groepeert maximaal vier rechtstreekse kamerdetailroutes en ingeschakelde specialistische ingangen.
5. **Beveiliging & privacy** toont alarmstatus en één camerabeeld per positie. Het beeld is begrensd tot circa 520 px; private camera's verdwijnen uit de carrousel en blijven alleen in de smalle privacyrail zichtbaar.

Statecards openen het standaard Home Assistant-detailvenster; camerakaarten blijven read-only. De bundle roept zelf geen service aan. De algemene acties, actieve-kamersamenvatting en `Nu` worden pas toegevoegd wanneer hun action- en datacontracten hun eigen testgate hebben doorlopen.

Ieder benoemd KPI-veld is optioneel. Wanneer alle benoemde velden én **Extra energiecontext** leeg zijn, gebruikt Home maximaal één bron uit de geconfigureerde zon-, elektriciteit-, batterij- en EV-context als veilige informatieve fallback. Energie/Domeinen en specialistische detailpagina's behouden hun afzonderlijke PR's en prereleases.
