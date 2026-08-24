# Testchecklist v0.4.0-alpha.1 — Home en Security

Test uitsluitend in het bestaande tijdelijke dashboard. Het default dashboard blijft read-only. Deel geen export, entity-ID, interne URL, persoonsnaam of camerabeeld.

## Update

- [ ] HACS biedt `v0.4.0-alpha.1` aan en de resource laadt zonder consolefout.
- [ ] De bestaande schema-v1-configuratie en alle vijf views blijven beschikbaar.

## Desktop en tablet

- [ ] Home toont compacte Vandaag-, Gezin- en Snel-naar-groepen zonder de vroegere verticale camerastapel.
- [ ] Beveiliging & privacy gebruikt de volledige beschikbare Sections-breedte.
- [ ] Alle geconfigureerde camera's staan in bronvolgorde in één horizontale strook.
- [ ] Vorige/volgende en Arrow Left/Right, Home en End verplaatsen de strook; focus blijft zichtbaar.
- [ ] Een privacy-actieve camera toont `Privacy actief` in plaats van een zwart beeld.

## Mobiel en thema

- [ ] Op circa 390 px blijft één camerakaart bruikbaar breed en kan de strook horizontaal scrollen.
- [ ] Geen horizontale paginascroll ontstaat buiten de camerastrook.
- [ ] Tekst, focus en privacyplaceholder blijven leesbaar in light en dark mode.

## Inhoud en veiligheid

- [ ] Person cards tonen de toegestane status; verborgen locatie wordt niet alsnog zichtbaar.
- [ ] Alleen operationele allowlist-entities verschijnen bij `unknown`/`unavailable` onder Aandacht nodig.
- [ ] Alarm, camera, privacy en overige statustiles voeren bij tap, hold of double tap geen serviceactie uit.
- [ ] Kamers, Energie, Domeinen en Meer zijn functioneel ongewijzigd; hun layout is geen acceptatiecriterium van deze release.

Rapporteer alleen apparaatklasse, stap, verwacht/werkelijk en eventuele fouttekst.
