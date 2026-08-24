# Home

Home is een operationeel startscherm, geen volledige inventaris. `v0.4.0-alpha.2` gebruikt de beschikbare Sections-breedte als volgt:

1. **Aandacht nodig** verschijnt alleen wanneer een entity uit **Diagnostiek → operationele entities** `unknown` of `unavailable` is. Generieke buttons, events of overige diagnostiek worden niet als alarm behandeld.
2. **Vandaag** toont de ingeschakelde weerbron, afvalbronnen en korte energiecontext.
3. **Gezin** toont de geconfigureerde person cards compact en respecteert `show_location`. Een geconfigureerde persoonsbatterij verschijnt alleen onder 20%.
4. **Beveiliging & privacy** gebruikt de volledige breedte voor alarmstatus en de camerastrook.
5. **Snel naar** groepeert maximaal vier kamerlinks en ingeschakelde specialistische ingangen.

Alle statustiles en camerakaarten zijn read-only. Alleen semantische navigatieknoppen zijn actief. De algemene acties, actieve-kamersamenvatting en `Nu` worden pas toegevoegd wanneer hun action- en datacontracten hun eigen testgate hebben doorlopen.

Kamers, Energie/Domeinen en specialistische detailpagina's worden niet in deze Home-release herontworpen; ze hebben afzonderlijke PR's en prereleases.
