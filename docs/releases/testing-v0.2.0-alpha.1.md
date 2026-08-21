# Testchecklist v0.2.0-alpha.1 — schema en GUI-configuratie

Deze prerelease test het configuratieschema, de editor en de minimale Community dashboard-registratie. De vijf productviews volgen in `v0.3.0-alpha.1`; maak daarom uitsluitend een expliciet tijdelijk dashboard aan en overschrijf nooit het default dashboard.

## Voorwaarden

- Home Assistant 2026.8.2 of nieuwer;
- werkende HACS-installatie van deze custom Dashboard-repository;
- privé-back-up van eventuele testconfiguratie;
- geen productieacties of servicecalls.

## Installatie en resource

- [ ] HACS biedt `v0.2.0-alpha.1` als update vanaf `v0.1.0-alpha.1`.
- [ ] Resource laadt zonder JavaScript-fout.
- [ ] Consolebadge toont `0.2.0-alpha.1`.
- [ ] Verwijderen en herinstalleren blijven werken.

## Editor

- [ ] De Community dashboards-kiezer toont **Home Dashboard**.
- [ ] Een nieuw tijdelijk dashboard opent eerst de verplichte editor en toont na opslaan één read-only configuratiepreview.
- [ ] Alle tien editoronderdelen zijn zichtbaar.
- [ ] Entity-, area-, floor-, icon- en actionselectors openen native HA-keuzes.
- [ ] Een persoon kan worden toegevoegd, opgeslagen en heropend.
- [ ] Een kamer kan aan floor/area worden gekoppeld met maximaal twee quick actions.
- [ ] Een kamer kan expliciete devices, licht, covers/openingen, media, safety, camera, power, historie en HVAC mode/preset/fan/swingbronnen opslaan.
- [ ] Security wordt pas geldig met exact drie camera's.
- [ ] Camera, privacyinstelling, privacyactie en confirmation zijn per camera configureerbaar.
- [ ] Energiebronnen omvatten stroom, zon, batterij, gas, water, apparaten, piek, EV, UPS en fases.
- [ ] Kia, robot, tuin en zwembad kunnen afzonderlijk worden geconfigureerd.

## Validatie en roundtrip

- [ ] Ongeldige logical keys en dubbele keys geven een gerichte fout.
- [ ] Riskante actie zonder bevestiging wordt niet opgeslagen.
- [ ] Een ongeldige tussenstand overleeft het bewerken maar niet een geldige save-event.
- [ ] Een future `schema_version` blokkeert alle save-events en schrijft geen v1-defaults terug.
- [ ] Een serviceactie zonder target of een actie zonder verificatie-entity wordt geweigerd.
- [ ] Room- en viewvolgorde kunnen met toetsenbordbedienbare omhoog/omlaagknoppen worden aangepast.
- [ ] Export toont eerst een privacywaarschuwing.
- [ ] Export/import heeft een verliesvrije v1-roundtrip.
- [ ] Een config met een toekomstige schema-versie wordt geweigerd.

## Responsive en toegankelijkheid

- [ ] Desktop, tablet en 390×844 hebben geen horizontale overflow.
- [ ] Alle velden zijn met toetsenbord bereikbaar.
- [ ] Labels, foutmeldingen en focus zijn zichtbaar in light en dark mode.
- [ ] Status en validatiefouten worden als live status/alert aangekondigd; focus blijft na een veldwijziging op hetzelfde veld.
- [ ] 200% zoom blijft bruikbaar.

## Privacy en veiligheid

- [ ] Export wordt niet aan Git, issue of supportbericht toegevoegd.
- [ ] De test voert geen Home Assistant-servicecall uit.
- [ ] Default `lovelace` en globale resources blijven ongewijzigd, buiten de HACS-resource-update zelf.

## Resultaat

Noteer versie, browser, getest dashboard/configuratiepad en blockers zonder echte IDs of URLs. Een blocker krijgt `v0.2.0-alpha.2`; zonder blocker kan delivery-PR 3 de echte dashboard strategy en vijf views bouwen.
