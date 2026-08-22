# Testchecklist v0.3.0-alpha.3 — vrije risicoklasse voor privacyacties

Deze prerelease corrigeert één Security-validatieregel. Test uitsluitend in het bestaande tijdelijke dashboard; het default dashboard blijft read-only.

## Update en behoud

- [ ] HACS biedt `v0.3.0-alpha.3` aan en de resource laadt zonder consolefout.
- [ ] De bestaande schema-v1-configuratie opent zonder migratie of dataverlies.

## Gewenste configuratie

- [ ] Een camera met privacystatus, een gekoppelde actie met risicoklasse `safe` en extra camerabevestiging aan kan worden opgeslagen.
- [ ] Dezelfde configuratie kan ook met de extra camerabevestiging uit worden opgeslagen.
- [ ] **Privacyactie = Geen** blijft geldig voor status-only gebruik.
- [ ] Een gekoppelde actie met risicoklasse `privacy` blijft geldig wanneer de bij die risicoklasse horende bevestigingstekst is ingevuld.
- [ ] Kies daarna een `alarm_control_panel` bij **Alarm**; de keuze blijft zichtbaar en opgeslagen na sluiten en opnieuw openen van de editor.

## Bewaarde veiligheidsregels

- [ ] Een verwijzing naar een verwijderde/onbekende actie blijft geblokkeerd.
- [ ] Een actie zonder expliciete target of resultaatcontrole blijft geblokkeerd.
- [ ] De vijf runtimeviews blijven read-only en voeren geen servicecall uit.

Rapporteer alleen stap en fouttekst. Deel geen export, entity-ID, interne URL of camerabeeld.
