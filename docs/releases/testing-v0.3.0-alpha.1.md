# Testchecklist v0.3.0-alpha.1 — eerste echte dashboardviews

Deze prerelease vervangt de preview door de eerste echt renderende dashboardconfig. Test uitsluitend het expliciete tijdelijke dashboard; het default dashboard blijft read-only.

## Update

- [ ] HACS biedt `v0.3.0-alpha.1` aan en de resource laadt zonder consolefout.
- [ ] De bestaande GUI-config opent zonder migratie of dataverlies.
- [ ] Bij een cacheprobleem volstaat een harde refresh; de resource-URL hoeft niet handmatig aangepast te worden.

## Shell en routes

- [ ] Home, Kamers, Energie, Domeinen en Meer verschijnen als vijf stabiele views.
- [ ] De ingestelde startpagina opent als eerste view.
- [ ] Iedere view gebruikt native Sections en toont geen oude configuratiepreview.
- [ ] De tabs en veilige navigatie naar Kamers/Meer werken binnen dit Community-dashboard.
- [ ] **Open standaard Energie-dashboard** navigeert naar het ingebouwde Energy-panel.

## Echte informatie

- [ ] Vandaag toont de geselecteerde weer-, afval- en energiecontextbronnen.
- [ ] Personen tonen entity picture en status; een persoon met verborgen locatie toont geen state.
- [ ] Security toont alarm, alle geconfigureerde camera's en beschikbare privacystatussen in configuratievolgorde.
- [ ] Een camera met fallback `hidden` verdwijnt alleen bij `unavailable`/`unknown`; `placeholder` en `last_image` gebruiken in deze shell-alpha nog de native fout-/snapshotweergave.
- [ ] Kamers toont iedere geconfigureerde kamer en de geselecteerde statusbronnen.
- [ ] Energie groepeert de geselecteerde elektriciteit-, zon-, batterij-, gas-, water-, apparaat- en lokale bronnen.
- [ ] Domeinen groepeert de via kamers geselecteerde licht-, cover-, klimaat-, media-, safety-, camera- en powerbronnen.
- [ ] Meer toont alleen geanonimiseerde configuratieaantallen en geactiveerde specialistnamen.

## Responsive en thema

- [ ] Desktop, tablet en mobiel hebben geen horizontale pagina-overflow.
- [ ] Eén en zes camera's blijven volledig bereikbaar; noteer of de eerste responsive grid al bruikbaar is voordat de definitieve scrollstrook volgt.
- [ ] Light en dark erven de actieve Home Assistant-themakleuren.
- [ ] Tekst, iconen, focus en touch targets blijven leesbaar en bereikbaar.

## Veiligheid

- [ ] Tikken, lang indrukken en dubbel tikken op entity-, entity-icoon- of camerakaarten voert geen actie uit.
- [ ] Navigatieknoppen navigeren alleen en voeren geen servicecall uit.
- [ ] Browserconsole en netwerklog tonen geen dashboardconfigwrite of servicecall door de strategy.
- [ ] Een ongeldige configuratie toont de veilige foutpreview in plaats van een gedeeltelijk dashboard.

Rapporteer per blocker: view, viewport, light/dark, verwachte en actuele uitkomst. Deel geen export, entity-ID, interne URL of echt camerabeeld.
