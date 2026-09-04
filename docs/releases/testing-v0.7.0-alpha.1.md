# Testchecklist v0.7.0-alpha.1 — Kia-integratie

Test uitsluitend op het vooraf goedgekeurde tijdelijke dashboard. Deel geen exports, entity-ID's, interne URL's, voertuiglocatie, VIN of andere private waarden.

## Update en route

- [ ] Werk via HACS bij naar `v0.7.0-alpha.1`, controleer dat `custom:kia-dashboard-card` als resource is geladen en herlaad de browser.
- [ ] De vijf hoofdviews openen ongewijzigd; Kia verschijnt alleen wanneer deze specialist expliciet is ingeschakeld.
- [ ] De Kia-ingang op Home en onder Domeinen opent `specialist-kia`; de terugroute gaat naar Domeinen.
- [ ] De summary en detailview blijven leesbaar in systeem-, licht- en donker thema op 390×844, tablet en desktop.

## Summary en datakwaliteit

- [ ] De summary toont acculading, bereik, laadstatus en begrijpelijke dataversheid vanuit de privé Kia-cardconfiguratie.
- [ ] Tijdens laden staat een actieve, tekstuele laadstatus zichtbaar; een bekende ontgrendelde lock geeft een waarschuwing.
- [ ] Ontbrekende mapping toont **Voertuigstatus onvolledig** zonder waarden te verzinnen.
- [ ] `unknown`, `unavailable` of oude `last_updated` toont geen verouderde waarde als actuele voertuigstatus.
- [ ] De summary is volledig toetsenbordbereikbaar en heeft een zichtbare focusring; kleur is niet de enige statusdrager.

## Resource en detailkaart

- [ ] Met ontbrekende of verouderde Kia-resource toont de subview een native installatiehint met het verwachte cardtype en blijft de rest van het dashboard bruikbaar.
- [ ] Met geldige resource wordt de bestaande `custom:kia-dashboard-card` full-width getoond en blijven haar Overview, Battery, Vehicle, Climate, Energy, Location en Settings bruikbaar volgens de eigen kaartversie.
- [ ] De centrale kaart kopieert geen voertuigkaart, locatiebeeld, trip, lock- of klimaatflow; mappingdiagnose blijft eigendom van de Kia-card.
- [ ] Controleer de daadwerkelijk geïnstalleerde Kia-cardversie tegen de in de dashboardconfiguratie ingevoerde minimumversie.

## Veiligheid

- [ ] De Home Dashboard-summary en route voeren geen servicecall of configuratiewrite uit.
- [ ] Voertuigacties, waaronder lock, klimaat en laden, blijven uitsluitend in de bestaande Kia-card en volgen daar confirmation en resultaatcontrole.
- [ ] Controleer in browserontwikkelaarstools dat openen, navigeren en de fallback geen onverwachte write-servicecall uitvoeren.

Deze testrelease wijzigt het default `lovelace`-dashboard niet automatisch. Een runtime-test vereist de bestaande menselijke target-, snapshot- en rollbackgate.
