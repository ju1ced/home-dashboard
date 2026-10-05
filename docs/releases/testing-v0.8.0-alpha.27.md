# Testchecklist v0.8.0-alpha.27

## Verhouding tot alpha.26

Deze release bundelt zeven afgeronde tickets in één release in plaats van zeven losse releases. Alle bestaande Control Deck-functionaliteit, de lazy-geladen editor (D-055/D-059) en de kamerfoto-upload (D-054) zijn ongewijzigd — zie de [alpha.26-testchecklist](testing-v0.8.0-alpha.26.md). Dit document beschrijft alleen wat sindsdien is toegevoegd of gefixt.

## Wat is toegevoegd of gefixt sinds alpha.26

- **Beveiligingsfix — camera-privacy faalt nu dicht (HD-201, D-062):** een privacy-entiteit die naar `unavailable`/`unknown` valt (bv. tijdens een Zigbee-/Z-Wave-uitval of HA-herstart) toonde voorheen alsnog het live camerabeeld, exact als een bevestigde "privacy uit". `getCameraPresentation()` faalt nu dicht in die gevallen. Eerste volledige productaudit over privacy en beveiliging uitgevoerd over het hele samengevoegde product; zie `docs/quality/privacy-security-audit.md`.
- **Echte HA-statistics/history/logbook-data (HD-205, D-058/D-059):** Verbruik krijgt een echt dagstaafdiagram per apparaat; Historie is herbouwd van een per-entiteit dialoog naar een tabblad met temperatuur-/luchtvochtigheidslijngrafiek en een strikt tot de kamer beperkt gebeurtenissenlogboek (max 50, nooit woningbreed). Hoofdbundelbudget 210 kB → 213 kB.
- **Performancebaseline en budgetten (HD-171, D-060):** eerste gemeten baseline voor DOM-grootte, long tasks, koude/warme parse/eval en rerendercost. Geen functionele wijziging, puur meettooling en een rapport (`docs/quality/performance-baseline.md`).
- **Multi-dashboard resource-audit (HD-172, D-061):** alle 48 globale resources geïnventariseerd; geen enkele verwijderd. `docs/quality/resource-audit.md`.
- **Documentatiereconciliatie:** de 3D-printerspecialist (HD-200, D-056) en de LINAK-bureaucard (HD-203, D-057) retroactief vastgelegd in de designbaseline. Geen codewijziging.
- **Drie Control Deck-fixes (HD-207):** Smart-plugs-stagebadge degradeert nu ook bij een unavailable plug-energiesensor; lege deck-head-tellinglabel verwijderd voor comfort-/energie-only kamers; screenshot-evidencevolgorde gefixt.

## Extra releasegate (aanvullend op alpha.26)

- **HD-201 regressiebewijs:** nieuwe test in `tests/strategy.test.mjs` pint het fail-closed-gedrag (unavailable/unknown/undefined privacy-entiteit → `"privacy"`); bestaand gedrag (bevestigd "off", geen privacy-entiteit) ongewijzigd.
- **HD-205 privacybewaking:** logboek strikt beperkt tot al-gemapte entiteiten, hard gecapt op 50, nooit een woningbrede aanroep; een server-geleverde ruwe entity_id in het logboek-`name`-veld wordt genegeerd in plaats van getoond (gevonden en gefixt tijdens onafhankelijke review).
- **HD-171/HD-172 privacywaarborg:** volledige dashboardconfiguraties zijn tijdens het onderzoek opgehaald maar nooit in een rapport of commit beland — alleen kaarttype-identifiers en metingen, geverifieerd met de eigen `findPrivacyMatches`-checker (0 matches) plus een handmatige scan.
- `git diff --stat` tegen alpha.26 op de veiligheidskritische paden (awning-confirmation, plug-tweestapsbevestiging, Kamerverbruik-aggregatie, kamerfoto-levenscyclus) toont geen onbedoelde wijzigingen buiten de hierboven genoemde, bewust gescopte fixes.
- `pnpm test` (122/122) en de volledige `pnpm run test:browser`-matrix (inclusief de nieuwe performancebaseline-sectie en HD-205-scenario's) zijn groen. `git diff --check` is schoon.
- Bundel: hoofdbundel 211.718 van 213.000 bytes (D-059); editorbundel ongewijzigd binnen budget (D-055).
- Decision log: [D-056](../design/decision-log.md#d-056--3d-printerspecialist-retroactief-erkend-als-vijfde-eersteklas-specialist-hd-200) t/m [D-062](../design/decision-log.md#d-062--volledige-productaudit-privacybeveiliging-één-p1-gevonden-en-gefixt-hd-201).

## Niet-geverifieerde aannames — vereisen live bevestiging

- De bestaande, nog niet live geverifieerde aanname over de `media_source/resolve_media`-responsvorm (alpha.25, D-054) blijft ongewijzigd staan.
- HD-205's aanname dat `recorder/statistics_during_period` effectief langetermijnstatistiek teruggeeft voor de gemapte energiebronnen (afhankelijk van hun `state_class`-metadata) kon niet structureel bevestigd worden zonder een draaiende Home Assistant-instantie — defensief afgehandeld met een expliciet onderscheiden "geen langetermijnstatistiek"-status, nooit een gefabriceerde waarde.

## Testdashboardgate — ongewijzigd, vóór iedere Home Assistant-write invullen

- Exact testdashboard: **nog goed te keuren**.
- Verse dashboardexport/snapshot: **vereist**.
- Default `lovelace`-hash vóór test: **vereist**.
- Targetallowlist voor veilige acties: **vereist**.
- Goedgekeurde resourceversie en rollbackversie: **vereist**.
- **Extra voor deze release:** bevestig in een echte sessie dat een privacysensor die `unavailable` wordt, de camera daadwerkelijk verbergt (niet alleen in de fictieve fixtures); bevestig de `statistics_during_period`-aanname hierboven; bevestig de bestaande `media_source/resolve_media`-aanname.

Zonder alle waarden wordt de live test niet gestart.

## Rollbackscope

- Vóór deze release: geen wijziging, `main` stond op `v0.8.0-alpha.26`.
- Na deze release maar vóór testdeployment: verwijder de `v0.8.0-alpha.27`-release/tag en herstel de HACS-resource naar `v0.8.0-alpha.26`.
- Na een goedgekeurde testdeployment: herstel uitsluitend het testdashboard uit de verse snapshot en zet de eerder goedgekeurde resourceversie terug.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.
