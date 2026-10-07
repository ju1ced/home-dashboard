# Testchecklist v0.8.0-alpha.29

## Verhouding tot alpha.28

Deze release bevat één ticket (HD-216), gevonden tijdens een live configuratiesessie met 20 echte kamers. Alle bestaande functionaliteit uit alpha.28 (privacy-actieknop, Home/Energie/pool-performancefix, printersamenvatting-gating, `mountCard()`-fallbacktest) is ongewijzigd — zie de [alpha.28-testchecklist](testing-v0.8.0-alpha.28.md). Dit document beschrijft alleen wat sindsdien is toegevoegd of gefixt. **Deze release raakt uitsluitend de lokale GUI-configuratie-editor — geen runtime-kaart, geen service-aanroep, geen Home Assistant-schrijfactie.**

## Wat is toegevoegd of gefixt sinds alpha.28

- **Performance — kamereditor lazy-mount (HD-216, D-071).** De Kamers-sectie mountte voorheen de volledige veldenset van élke kamer (elke `ha-selector` incluis) bij elke render, ongeacht open/dicht-status. Bij 20 kamers betekende dit honderden gelijktijdig gemonteerde `ha-selector`-instanties — de concrete, geverifieerde oorzaak van de ervaren traagheid. Een gesloten kamer toont nu alleen haar titel; volledige velden worden pas gegenereerd zodra die kamer daadwerkelijk open staat.
- **Nieuw — zoekveld boven de kamerlijst (HD-216).** Filtert op (deel van) naam, sleutel of area, rechtstreeks op de al gerenderde titels — geen her-render per toetsaanslag.
- **Nieuw — smart-plug-koppelhulp (HD-216).** Binnen een kamer's "Apparaten en power"-lijst herkent `suggestSmartPlugPairs()` een schakelaar + zijn vermoedelijke vermogens-/energie-/spanningssensor (gelijke naamstam, herkenbaar achtervoegsel) en toont een knop die ze met één klik samenvoegt tot een smart-plug-item (`promoteToSmartPlug()`). De knop benoemt altijd expliciet welke entiteiten daarbij uit de platte lijst verdwijnen — nooit een stille wijziging. Bewust beperkt tot de kamer's eigen, al geconfigureerde entiteiten (geen `hass.states`-scan).
- Editorbundel 95.111 → 97.238 bytes, ruim binnen het bestaande budget van 160 kB (D-055). Hoofdbundel ongewijzigd (214.801 bytes, D-066).

## Releasegate

- `pnpm test` (131/131, inclusief 5 nieuwe HD-216-tests) en de volledige `pnpm run test:browser`-matrix zijn groen. `git diff --check` en de privacyscan zijn schoon.
- Decision log: [D-071](../design/decision-log.md#d-071--kamereditor-lazy-mount-zoekfilter-en-smart-plug-koppelhulp-hd-216).

## Wat je zelf kan testen (geen Home Assistant-write nodig)

1. Open de editor (`pnpm run serve`, of via de echte configflow na deze release) en ga naar **Kamers**.
2. Met meerdere kamers: bevestig dat openen/sluiten merkbaar vlot blijft, ook met veel kamers.
3. Typ in het zoekveld boven de kamerlijst; bevestig dat alleen bijpassende kamers zichtbaar blijven en dat wissen van de zoektekst alles weer toont.
4. Open een kamer waarvan "Apparaten en power" een schakelaar + zijn vermogenssensor (zelfde naamstam, bv. een schakelaar met bijpassende "...vermogen"/"...power"-sensor) bevat. Bevestig dat er een voorgestelde koppeling verschijnt onder "Smart plugs", dat de knoptekst exact benoemt wat hij verplaatst, en dat klikken een nieuw smart-plug-item aanmaakt én de bron-entiteiten uit "Apparaten en power" haalt.
5. Bevestig dat bestaande kamer-CRUD (toevoegen/verwijderen/verplaatsen van een kamer, lichtgroepen, getypeerde openingen, bestaande smart plugs, de quick-actionvolgorde) zich ongewijzigd gedraagt.

## Niet-geverifieerde aannames — vereisen live bevestiging

- Geen nieuwe. Deze release wijzigt uitsluitend de lokale editor-UI (markup/DOM-timing, geen nieuwe entiteit-lezingen of -schrijfacties); de bestaande, nog niet live geverifieerde aannames uit eerdere releases (alpha.25's `media_source/resolve_media`-vorm, alpha.27's `recorder/statistics_during_period`, alpha.28's `executeConfiguredAction()`-actionselectorvorm) blijven ongewijzigd staan.
- Bewust uitgesteld: de 18 kamers die tijdens de HD-180/181-configuratiesessie een vlakke apparatenlijst kregen in plaats van smart-plug-kaarten, worden nu pas met de nieuwe koppelhulp herpast — een losse, latere stap, geen onderdeel van deze release.

## Testdashboardgate

Niet van toepassing voor deze release — er is geen Home Assistant-write, service-aanroep of nieuwe entiteit-lezing. De editor is alleen lokaal bruikbare configuratie-UI; de eerstvolgende live HACS-upgrade naar deze versie volgt het bestaande, al bewezen lifecycle-pad (D-069).

## Rollbackscope

- Vóór deze release: geen wijziging, `main` stond op `v0.8.0-alpha.28`.
- Na deze release maar vóór HACS-upgrade: verwijder de `v0.8.0-alpha.29`-release/tag; `main` blijft ongewijzigd bruikbaar op de vorige getagde versie.
- Na een HACS-upgrade: zet de HACS-repository terug naar `v0.8.0-alpha.28` (zelfde, al bewezen lifecycle-pad als D-069). Geen migratiescript nodig — deze release wijzigt geen configschema, alleen editor-UI.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.
