# Testchecklist v0.2.0-alpha.3 — flexibele camera's

Deze patchrelease verandert alleen de Security-configuratie en de verwijzing naar Acties. Gebruik uitsluitend het expliciete tijdelijke testdashboard; het default dashboard blijft read-only.

## Update en behoud

- [ ] HACS biedt `v0.2.0-alpha.3` als update aan.
- [ ] De bestaande schema-v1-configuratie opent zonder migratie of dataverlies.
- [ ] Preview, export/import en kamerconfiguratie blijven werken.

## Camera's

- [ ] Security kan uitgeschakeld en zonder camera's worden opgeslagen.
- [ ] Ingeschakelde Security vraagt minstens één camera.
- [ ] Configuraties met één, twee, drie en zes camera's kunnen worden opgeslagen.
- [ ] **Camera toevoegen** blijft ook na de derde camera beschikbaar.
- [ ] Camera-items blijven afzonderlijk inklapbaar en verwijderbaar.

## Privacyacties

- [ ] Security legt zichtbaar uit dat privacyacties eerst onder **Acties** worden aangemaakt.
- [ ] **Ga naar Acties** opent en focust het onderdeel Acties.
- [ ] De hulptekst bij **Privacyactie** herhaalt de configuratieroute.
- [ ] Een gekozen privacyinstelling zonder gekoppelde privacyactie blijft bewust ongeldig.
- [ ] Een gekoppelde actie zonder risicoklasse **privacy** of zonder bevestiging blijft bewust ongeldig.

## Mobiel en veiligheid

- [ ] De uitleg en navigatieknop zijn op mobiel volledig zichtbaar en bedienbaar.
- [ ] Ongeldige tussenstanden worden niet opgeslagen.
- [ ] De test voert geen dashboardactie of Home Assistant-servicecall uit.

Na deze korte regressietest kan `v0.3.0-alpha.1` de eerste echt renderende Home-view leveren.
