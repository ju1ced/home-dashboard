# Testchecklist v0.3.0-alpha.2 — optionele privacybediening

Deze prerelease corrigeert uitsluitend de Security-configuratie en foutpresentatie. Test in het bestaande tijdelijke dashboard; het default dashboard blijft read-only.

## Update en behoud

- [ ] HACS biedt `v0.3.0-alpha.2` aan en de resource laadt zonder consolefout.
- [ ] De bestaande schema-v1-configuratie opent zonder migratie of dataverlies.
- [ ] Kamers, personen, Energie en de vijf dashboardviews blijven ongewijzigd bereikbaar.

## Status-only

- [ ] Kies een camera en een privacyinstelling, laat **Privacyactie** op **Geen** en zet de extra bevestigingskeuze uit.
- [ ] Deze configuratie is geldig en kan worden opgeslagen.
- [ ] De privacystatus is read-only zichtbaar; tikken, lang indrukken en dubbel tikken voeren geen actie uit.

## Optionele bediening

- [ ] Security vermeldt dat privacybediening optioneel is en **Ga naar Acties** blijft werken.
- [ ] De privacyactielijst toont naast ieder label de risicoklasse.
- [ ] Een gekoppelde actie met risicoklasse `safe` geeft één precieze fout bij die camera, zonder generieke configuratievariantmelding.
- [ ] Een gekoppelde actie met risicoklasse `privacy`, expliciete targetscope, bevestigingstekst en resultaatcontrole is geldig.
- [ ] De extra camerabevestigingskeuze mag zowel aan als uit staan en blokkeert opslaan niet.

## Regressie en veiligheid

- [ ] Security blijft met één, twee, drie en zes camera's configureerbaar.
- [ ] Geen dashboardkaart voert in deze alpha een Home Assistant-servicecall uit.
- [ ] Browserconsole en netwerklog tonen geen dashboardconfigwrite of servicecall door de strategy.

Rapporteer alleen de stap, viewport en fouttekst. Deel geen export, entity-ID, interne URL of echt camerabeeld.
