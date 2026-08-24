# Home

Home is een operationeel startscherm, geen volledige inventaris. `v0.5.0-alpha.9` rendert de inhoud als één begrensde, responsive compositie in plaats van losse Sections-kolommen:

1. **Aandacht nodig** verschijnt alleen wanneer een entity uit **Diagnostiek → operationele entities** `unknown` of `unavailable` is. Generieke buttons, events of overige diagnostiek worden niet als alarm behandeld.
2. **Vandaag** vormt op desktop één samengestelde kaart over de twee linker kolommen: weer, energie-rail en **Afvalophaling** delen één buitenrand en worden alleen door interne lijnen gescheiden. Maximaal vier afvalfracties staan in één rij; op mobiel blijven ze twee per rij. Security blijft als derde kolom rechts staan en stapelt op smallere schermen. Afvalfracties krijgen waar herkenbaar hun eigen icoon en korte naam, plus datum en `Vandaag`, `Morgen` of `Over n dagen`. Extra energiecontext blijft optioneel.
3. **Gezin** toont de geconfigureerde person cards compact en respecteert `show_location`. Een geconfigureerde persoonsbatterij verschijnt alleen onder 20%.
4. **Snel naar** groepeert maximaal vier rechtstreekse kamerdetailroutes en ingeschakelde specialistische ingangen.
5. **Beveiliging & privacy** staat zonder dubbele buitenkop op brede schermen als compacte derde kolom naast weer en energiesensoren, en stapelt op tablet/mobiel. Het toont alarmstatus en één camerabeeld per positie; private camera's verdwijnen uit de carrousel en blijven alleen in de smalle privacyrail zichtbaar.

De Home-compositie erft standaard de actieve Home Assistant-themetokens. Wanneer **Thema** expliciet op licht of donker staat, begrenst die keuze dezelfde Juiced Horizon Calm-tokens tot de dashboardcompositie en haar childcards.

Statecards en de weerkaart openen het standaard Home Assistant-detailvenster; camerakaarten blijven read-only. De dagelijkse forecast gebruikt uitsluitend de officiële read-only `weather/subscribe_forecast`-subscription. De bundle roept zelf geen service aan. De algemene acties, actieve-kamersamenvatting en `Nu` worden pas toegevoegd wanneer hun action- en datacontracten hun eigen testgate hebben doorlopen.

Ieder benoemd KPI-veld is optioneel. Realtime waardewijzigingen werken bestaande teksten en childcards in-place bij; alleen een structurele statuswijziging zoals een nieuw operationeel aandachtspunt bouwt Home opnieuw op. Wanneer alle benoemde velden én **Extra energiecontext** leeg zijn, gebruikt Home maximaal één bron uit de geconfigureerde zon-, elektriciteit-, batterij- en EV-context als veilige informatieve fallback. Energie/Domeinen en specialistische detailpagina's behouden hun afzonderlijke PR's en prereleases.
