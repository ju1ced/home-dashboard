# Testchecklist v0.8.0-alpha.28

## Verhouding tot alpha.27

Deze release bundelt vier afgeronde tickets in één release in plaats van vier losse releases. Alle bestaande functionaliteit uit alpha.27 (de volledige productaudit/privacy-fail-closed-fix, de echte statistics/history/logbook-data, de performancebaseline, de resource-audit) is ongewijzigd — zie de [alpha.27-testchecklist](testing-v0.8.0-alpha.27.md). Dit document beschrijft alleen wat sindsdien is toegevoegd of gefixt.

## Wat is toegevoegd of gefixt sinds alpha.27

- **Nieuw — privacy-actieknop op de camerastrook (HD-214, D-066).** `ActionConfig`/`CameraConfig.privacy_action_key` waren volledig gedefinieerd, GUI-editable en schema-gevalideerd, maar werden door geen enkele kaart ooit gelezen of uitgevoerd (gevonden tijdens alpha.27's HD-201-audit). De camerastrook's privacystatuschip wordt nu een echte knop wanneer privacy actief is, een geldige gekoppelde actie bestaat (via `privacy_action_key`) en `hass.callService` beschikbaar is. Bevestiging via een native dialoog is vereist zodra de camera dat vraagt (`confirm_privacy_disable`) óf de actie's `risk` niet `"safe"` is. Bij bevestiging voert `executeConfiguredAction()` de actie's geconfigureerde `sequence` stap voor stap uit via `hass.callService` — **dit is de eerste functionaliteit in dit product die zelf, buiten de bestaande kamerbediening om, een service-aanroep doet op basis van een losse, door de eigenaar samengestelde actiesequentie.**
- **Interne opschoning, zelfde ticket:** `perform()` (de kamerbedieningsklikhandler in `home-dashboard-room-controls.ts`) herimplementeerde voorheen een equivalente bevestigingscontrole inline in plaats van de al-geteste `executeRoomControl`-logica te gebruiken. Beide paden (kamerbediening én de nieuwe privacyknop) gebruiken nu dezelfde geëxporteerde `executeEntityControl()`-functie voor hun confirmed-gate. Geen gedragswijziging voor bestaande kamerbediening.
- **Performance — Home/Energie/pool-specialist schrijven niet langer onvoorwaardelijk naar de DOM (HD-213, D-065).** Elke `textContent`/`setAttribute`/`classList`/`icon`-schrijfactie wordt nu eerst tegen de huidige weergegeven waarde vergeleken; identiek blijft ongeschreven. Gemeten op 500 irrelevante updates: Home 32.000 → 2.000 mutaties (-94%), Energie en de poolspecialist 100% naar nul. **Geen wijziging aan wélke waarden getoond worden** — dit is uitsluitend een her-renderoptimalisatie.
- **Performance — printersamenvatting rendert niet langer onvoorwaardelijk bij elke `hass`-toewijzing (HD-211, D-063).** Een nieuwe stabiele sleutel (`printerStateKey()`) over de zeven relevante entiteiten (status, progress, time_remaining, nozzle_temperature, bed_temperature, job_failed, insufficient_filament) bepaalt of een her-render nodig is.
- **Kwaliteit — `mountCard()`'s resourcefallback nu daadwerkelijk door een test afgedekt (HD-212, D-064).** Zuiver een testtoevoeging, geen `src/`-wijziging: het bestaande `"Kaart niet beschikbaar."`-catchpad (gedeeld door de LINAK-bureaucard en history-graph) werd nooit uitgeoefend door een test.

## Extra releasegate (aanvullend op alpha.27)

- **HD-214-regressiebewijs:** nieuwe eenheidstests voor `findPrivacyAction()`/`executeConfiguredAction()` in `tests/strategy.test.mjs` (koppeling camera → actie, meerstaps-sequenties, risicogate-afwijzing/-acceptatie). Een nieuw browserscenario (`home/privacy-action` in `scripts/render-room-controls.mjs`) bewijst de knop end-to-end tegen een fixture: dialoogannulering doet geen `callService`-aanroep, bevestiging roept de juiste service aan met de echte privacy-entiteit van de camera.
- **HD-214-veiligheidswaarborg, bewust gecontroleerd:** `ActionConfig.sequence[]`-items gebruiken dezelfde `{action, target, data}`-vorm als een natieve Lovelace-actiedescriptor (ze komen uit dezelfde HA-actionselector), maar worden nooit als geneste objecten in de statische, door Home Assistant uitgelezen strategy-output geplaatst — `home-dashboard-view-strategy.ts` codeert `actions` als een opaque JSON-string, pas door de kaart zelf geparsed. De bestaande veiligheidstest ("iedere viewstrategy levert native Sections zonder serviceactie") die dit soort objecten in de gegenereerde boom blokkeert, bleef ongewijzigd groen.
- **HD-213-regressiebewijs:** de volledige bestaande `pnpm run test:browser`-matrix (normal/warning/missing/unavailable-fixtures voor Home/Energie/Domeinen/pool) bevestigt dat relevante updates het display nog altijd correct bijwerken, niet alleen dat irrelevante updates geen DOM-mutaties meer geven.
- `pnpm test` (125/125) en de volledige `pnpm run test:browser`-matrix (inclusief het nieuwe privacy-action-scenario) zijn groen. `git diff --check` is schoon.
- Bundel: hoofdbundel 214.427 van 215.000 bytes (budget verhoogd van 213 kB → 215 kB voor HD-214, D-066); editorbundel ongewijzigd binnen budget (D-055).
- Decision log: [D-063](../design/decision-log.md#d-063--printersummary-krijgt-relevante-state-gating-hd-211) t/m [D-066](../design/decision-log.md#d-066--actionconfigprivacy_action_key-daadwerkelijk-aangesloten-op-een-echte-bediening-hd-214).

## Niet-geverifieerde aannames — vereisen live bevestiging

- **Nieuw, hoogste prioriteit voor deze release:** `executeConfiguredAction()` voert `ActionConfig.sequence[]` uit zoals de HA-actionselector die zelf produceert (elke stap als `{action: "domain.service", target: {...}, data: {...}}`, waarbij `target`'s velden rechtstreeks in de `hass.callService`-payload worden samengevoegd). Dit is **nooit tegen een door een echte Home Assistant-instantie geproduceerde actionselector-output getest** — alleen tegen een zelf samengestelde fixture. Bevestig in een live sessie dat een via de editor's actionselector samengestelde uitschakel-actie op de privacy-entiteit daadwerkelijk en correct uitgevoerd wordt wanneer de privacyknop bevestigd wordt.
- **Nieuw:** bevestig dat de privacyknop alléén verschijnt wanneer bewust een `privacy_action_key` is gekoppeld, en dat zonder koppeling het bestaande read-only statuschip ongewijzigd blijft (geen onbedoelde knop op camera's zonder geconfigureerde actie).
- **Nieuw:** bevestig dat de bevestigingsdialoog daadwerkelijk blokkerend is in de echte HA-frontend-context (niet alleen in de headless-browsertest) en dat annuleren gegarandeerd geen service-aanroep doet.
- De bestaande, nog niet live geverifieerde aanname over de `media_source/resolve_media`-responsvorm (alpha.25, D-054) blijft ongewijzigd staan.
- HD-205's aanname dat `recorder/statistics_during_period` effectief langetermijnstatistiek teruggeeft voor de gemapte energiebronnen (alpha.27, D-059) blijft ongewijzigd staan.

## Testdashboardgate — ongewijzigd, vóór iedere Home Assistant-write invullen

- Exact testdashboard: **nog goed te keuren**.
- Verse dashboardexport/snapshot: **vereist**.
- Default `lovelace`-hash vóór test: **vereist**.
- Targetallowlist voor veilige acties: **vereist** — **voor deze release expliciet uit te breiden met de exacte entiteit(en) die de geteste privacyactie aanroept**, zodat de live test niet per ongeluk een andere entiteit raakt.
- Goedgekeurde resourceversie en rollbackversie: **vereist**.
- **Extra voor deze release:** bevestig vóór de eerste bevestigde knopklik welke entiteit en service de geconfigureerde privacyactie exact aanroept (lees de actie's `sequence` in de editor na), en bevestig na de klik dat alléén die entiteit gewijzigd is — niets anders op het testdashboard of de instantie.

Zonder alle waarden wordt de live test niet gestart.

## Rollbackscope

- Vóór deze release: geen wijziging, `main` stond op `v0.8.0-alpha.27`.
- Na deze release maar vóór testdeployment: verwijder de `v0.8.0-alpha.28`-release/tag en herstel de HACS-resource naar `v0.8.0-alpha.27`.
- Na een goedgekeurde testdeployment: herstel uitsluitend het testdashboard uit de verse snapshot en zet de eerder goedgekeurde resourceversie terug. Verwijder of deactiveer bovendien de geteste privacyactie uit `config.actions` als de live test een onverwacht effect toont — dit vereist geen aparte migratie, de editor laat het veld gewoon leeg (`privacy_action_key: ""`) achter.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.
