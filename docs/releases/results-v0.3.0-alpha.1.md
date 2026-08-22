# Testresultaat v0.3.0-alpha.1

## Bevestigd

- De HACS-update installeerde en de grafische configuratie bleef bereikbaar op desktop en mobiel.
- Het vrije aantal camera's en de directe route van Security naar Acties waren zichtbaar.
- De camerakeuze, privacystatusbron, fallback en actiekeuze konden per camera worden ingevuld.

## Gevonden blocker

Een camera met een gekozen privacystatusbron kon niet status-only worden opgeslagen. **Privacyactie = Geen** en een uitgeschakelde extra bevestigingskeuze veroorzaakten blokkerende validatie. Bij gekoppelde acties verschenen bovendien generieke configuratievariantmeldingen naast de bruikbare specifieke fout.

Dit wijkt af van het gewenste model: de statusbron is zelfstandig bruikbaar; bediening is optioneel. Alleen een daadwerkelijk gekoppelde privacyactie moet aan het centrale veiligheidscontract voldoen.

## Vervolg

`v0.3.0-alpha.2` corrigeert de validatie en foutpresentatie zonder configuratieschema-migratie. Er zijn geen Home Assistant-servicecalls, dashboardwrites of default-dashboardwijzigingen uitgevoerd. Screenshots, exports en installatie-identifiers zijn niet in de repository opgenomen.
