# Testchecklist v0.7.0-alpha.2 — Kia-herstel

Test uitsluitend op het vooraf goedgekeurde tijdelijke dashboard. Deel geen exports, entity-ID's, interne URL's, voertuiglocatie, VIN of andere private waarden.

## Update en herstel

- [ ] Werk via HACS bij naar `v0.7.0-alpha.2` en herlaad de browser volledig.
- [ ] Open **Dashboard bewerken → Kia, robot, tuin en zwembad**. Een bestaande `custom:ha-kia-connect-dashboard`-waarde is automatisch gemigreerd naar `custom:kia-dashboard-card`; de private Kia-cardconfiguratie blijft behouden.
- [ ] Vul een geteste minimumversie in en sla het dashboard op. De Kia-resource geeft daarna **Resource is geladen** weer.
- [ ] Open de Kia-route alleen op het vooraf goedgekeurde testdashboard. De summary en detailview blijven leesbaar op mobiel, tablet en desktop.

## Veiligheid

- [ ] De update wijzigt het default `lovelace`-dashboard niet automatisch.
- [ ] De Home Dashboard-summary en route voeren geen servicecall of configuratiewrite uit.
- [ ] Voertuigacties blijven uitsluitend eigendom van de bestaande Kia-card en volgen haar confirmation- en resultaatcontracten.

Een runtime-test vereist de bestaande menselijke target-, snapshot- en rollbackgate.
