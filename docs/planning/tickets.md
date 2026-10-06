# Ticketregister

Detail per ticket op het [kanban bord](kanban.md). Backlog- en Review-tickets krijgen scope/afhankelijkheden/acceptatiecriteria voor werk dat nog moet gebeuren; Klaar-tickets zijn een kort record van wat is opgeleverd en waar. Peildatum 25 september 2026.

## Ticketvelden

- **Epic:** functionele werkstroom.
- **Status:** Backlog, In uitvoering, Review/validatie, Geblokkeerd of Klaar.
- **Prioriteit:** P0, P1 of P2.
- **Omvang:** S, M, L of XL; relatieve planningseenheid, geen tijdsbelofte.
- **Eigenaar:** voorgestelde rol uit de deliveryroadmap.
- **Afhankelijkheden:** tickets of menselijke gates die eerst moeten sluiten.

---

## Backlog

### HD-112 — Runtimebevindingen oplossen

- **Epic:** Runtimeacceptatie
- **Status:** Backlog
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Betrokken feature-eigenaar
- **Afhankelijkheden:** HD-111

**Doel**

Alle tijdens de live acceptatie gevonden productproblemen in kleine, geïsoleerde regressieslices oplossen.

**Scope**

Per bevinding een eigen subticket of PR-slice met oorzaak, fixture, test, fix en rollbackimpact.

**Acceptatiecriteria**

- Geen bundeling van ongerelateerde bevindingen.
- Iedere fix heeft een reproduceerbare fictieve regressietest.
- Geen live workaround wordt als productfix vastgelegd.
- HD-111 wordt alleen heropend voor de relevante hertest.

**Validatie**

Volledige lokale suite plus gerichte runtimehertest na nieuwe toestemming.

---

### HD-171 — Performancebaseline en budgetten vastleggen

- **Epic:** Performance
- **Status:** Klaar — candidate `v0.8.0-alpha.28`, lokaal geverifieerd op 2 oktober 2026 ([D-060](../design/decision-log.md#d-060--performancebaseline-en-budgetten-vastgelegd-hd-171)). Geen Home Assistant-write of deployment goedgekeurd.
- **Prioriteit:** P1
- **Omvang:** L
- **Eigenaar:** Performance, privacy & release-QA-agent
- **Afhankelijkheden:** featurefreeze; specialistset gereed of expliciet uitgesteld (voldaan: HD-200/203/205/207 afgerond; HD-131/141/152 blijven afzonderlijk Geblokkeerd op externe bronrepo's, wat al een expliciete deferral is)

**Resultaat**

Nieuwe meettooling (`scripts/check-performance-baseline.mjs`) en rapport (`docs/quality/performance-baseline.md`) leggen DOM-grootte, long tasks, koude/warme parse/eval en rerendercost (relevant/irrelevant) vast voor Home, Kamers, lichte/zware kamerdetail, Energie en een specialistview, met budgetten afgeleid van echte metingen. Eén reële bevinding (Home/Energie/pool herschrijven DOM onvoorwaardelijk bij irrelevante updates) is niet zelf gefixt maar vastgelegd als apart [HD-213](#hd-213--diff-voor-schrijven-toevoegen-aan-home-energie-en-pool-specialist-renderpaden). Geen wijziging aan `src/`; bundel bevestigd byte-identiek.

**Doel**

Meetbare productiecriteria vastleggen voor bundle, parse, DOM, long tasks, navigatie en rerenders.

**Scope**

Home, Kamers, lichte/zware kamer, Energie, Security en specialistviews; koude en warme cache; relevante en irrelevante stateupdates.

**Bekend aandachtspunt (28 september 2026):** het bundlebudget staat na de alpha.20 Control Deck-slice (incl. de awning-confirmationfix) op 244.397/245.000 bytes — 603 bytes marge. HD-131, HD-141, HD-152 en het resterende deel van HD-170 zullen dit hoogstwaarschijnlijk overschrijden; Kia's vergelijkbare specialistadapter kostte destijds al 8 kB (D-038). Wie een van die tickets oppakt, meet eerst de werkelijke bundlekost en legt daarna een eigen D-0xx-budgetverhoging vast — de grens wordt niet vooraf of onder tijdsdruk opgerekt.

**Acceptatiecriteria**

- Methode, hardware/browsercontext en telwijze zijn reproduceerbaar.
- Budgets zijn op metingen gebaseerd, niet verhoogd om failures te verbergen.
- Irrelevante stateupdates veroorzaken geen onverklaarde brede rerender.
- Afwijkingen hebben een concrete optimalisatie of expliciete acceptatie.

**Validatie**

Meetrapport, scripts en vaste fixtures zonder live/private data.

---

### HD-172 — Multi-dashboard resource-audit uitvoeren

- **Epic:** Performance en migratie
- **Status:** Klaar — read-only audit uitgevoerd op 5 oktober 2026 ([D-061](../design/decision-log.md#d-061--multi-dashboard-resource-audit-uitgevoerd-hd-172)). Geen Home Assistant-write; geen resource verwijderd of gewijzigd.
- **Prioriteit:** P1
- **Omvang:** L
- **Eigenaar:** Performance, privacy & release-QA-agent
- **Afhankelijkheden:** HD-171

**Resultaat**

Volledige consumentenmatrix voor alle 48 globale resources over alle zes dashboards op de instantie, in [docs/quality/resource-audit.md](../quality/resource-audit.md). 37 resources bevestigd in gebruik, 2 uitsluitend op de teststaging (robot, dynamic-energy), 8 zonder bevestigde consument — expliciet gemarkeerd als blokkerend voor verwijdering in plaats van aangenomen als veilig. `integration-strategy.md`'s verouderde "52 resources" gecorrigeerd naar 48.

**Doel**

Alle globale frontendresources en hun dashboardconsumenten inventariseren voordat verwijdering of opschoning wordt voorgesteld.

**Acceptatiecriteria**

- Iedere resource heeft consumers, versie, noodzaak en rollbackimpact.
- Geen resource wordt verwijderd tijdens de audit.
- Een eventueel verwijdermanifest is staged, reviewbaar en herstelbaar.
- Onbekende consumers blokkeren verwijdering.

**Validatie**

Read-only auditrapport, snapshotreferentie en multi-dashboardcontrole.

---

### HD-180 — HACS lifecycle en compatibiliteitsmatrix bijwerken

- **Epic:** Release engineering
- **Status:** Klaar — volledige HACS-lifecycle live getest op 6 oktober 2026 via de Home Assistant MCP-verbinding ([D-069](../design/decision-log.md#d-069--hacs-lifecycle-live-opnieuw-bewezen-voor-v0800-alpha28-hd-180)). Vooraf een volledige HA-snapshot genomen (`e8b31114`); geen andere wijziging aan de instantie.
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Foundation & HACS-agent + documentatiereviewer
- **Afhankelijkheden:** geen

**Doel**

Installatie, update, downgrade, verwijdering, herinstallatie en versiecompatibiliteit opnieuw bewijzen voor de actuele productvorm.

**Acceptatiecriteria**

- Compatibility noemt actuele dashboard-, HA-, HACS- en specialistversies.
- Release-assets, checksum en manifest horen bij exact dezelfde commit.
- Schone installatie en upgrade vanaf de laatste ondersteunde prerelease werken.
- Verwijderen wijzigt het default dashboard niet automatisch.
- Verouderde documentatieverwijzingen zijn gecorrigeerd.

**Validatie**

Schone HACS-testcyclus en gedownload-artifactvergelijking.

---

### HD-181 — Admin-dashboardgrens uitwerken

- **Epic:** Diagnostiek
- **Status:** Backlog — architectuurbeslissing genomen door de eigenaar op 6 oktober 2026: admin-oppervlak blijft binnen `home-dashboard` zelf (geen afzonderlijke repo/dashboard). Klaar om op te pakken.
- **Prioriteit:** P2
- **Omvang:** M
- **Eigenaar:** Lead / integrator
- **Afhankelijkheden:** geen

**Doel**

De vastgelegde `require_admin`-grens voor systeem, netwerk, updates, batterijen, automations en area-loze techniek uitvoerbaar maken zonder het gezinsdashboard opnieuw te belasten.

**Scope (besloten)**

- Admin-inhoud leeft als een eigen view/sectie binnen dit project, niet als afzonderlijk product of repo — bijvoorbeeld een extra `custom:home-dashboard-view`-pad (vergelijkbaar met de bestaande `more`-view) of een los Lovelace-dashboard dat `require_admin: true` gebruikt (native HA-dashboardvlag; zie `ha_config_set_dashboard`'s `require_admin`-parameter).
- `require_admin` is een echte autorisatiegrens (HA weigert de view/dashboard voor niet-admin-gebruikers), niet louter een verborgen navigatie-ingang — de bestaande regel "visibility wordt niet als security gebruikt" blijft onverkort gelden.
- Geen wijziging aan het bestaande gezinspad (Home/Kamers/Energie/Domeinen/Meer); dit is een toegevoegde, apart genavigeerde sectie.

**Acceptatiecriteria**

- Navigatie-ingang naar de admin-sectie is duidelijk gescheiden van het gezinspad (geen impliciete vermenging in bestaande views).
- `require_admin` is daadwerkelijk afgedwongen (geverifieerd: een niet-admin-gebruiker krijgt de sectie niet te zien), niet alleen visueel verborgen.
- Systeem, netwerk, updates, batterijen, automations en area-loze techniek zijn elk expliciet toegewezen aan deze sectie of bewust uitgesloten met reden.
- De scheiding tussen gezinspad en diagnose is gedocumenteerd in de designbaseline.

**Validatie**

`pnpm test`, `pnpm run test:browser`, `git diff --check`; live verificatie van de `require_admin`-afdwinging vereist een menselijke testsessie (los van deze implementatie, net als elke andere HA-gate in dit project).

---

### HD-192 — v1-documentatie en release readiness afronden

- **Epic:** Release engineering
- **Status:** Backlog
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Lead + documentatiereviewer
- **Afhankelijkheden:** alle voor v1 vereiste product-, QA-, runtime- en migratietickets

**Doel**

De gebruikers-, beheer-, compatibility-, upgrade- en troubleshootingdocumentatie laten overeenkomen met de werkelijk bewezen v1-scope.

**Acceptatiecriteria**

- README, GUI-reference, configuratiepagina's, compatibility en troubleshooting zijn actueel.
- Bekende beperkingen en uitgestelde specialisten zijn expliciet.
- Installatie, upgrade, backup en rollback zijn getest en beschreven.
- Release notes verwijzen naar tests en artifacts van exact dezelfde commit.
- `pnpm test` en alle releasechecks zijn groen.

**Validatie**

Documentreview, linkcheck, privacycheck, clean install/upgrade en release-assetverificatie.

---

### HD-200 — 3D-printerspecialist: contract, productiegate en documentatiereconciliatie

- **Epic:** Specialisten
- **Status:** Klaar — documentatiereconciliatie vastgelegd op 2 oktober 2026 ([D-056](../design/decision-log.md#d-056--3d-printerspecialist-retroactief-erkend-als-vijfde-eersteklas-specialist-hd-200)). Geen Home Assistant-write, geen release nodig (puur documentatie).
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Specialist-agent + Lead / integrator
- **Afhankelijkheden:** geen voor het documentatiedeel; productiegatebewijs kan toegang tot de printer-bronrepo vereisen

**Resultaat**

Printer erkend als vijfde eersteklas specialist in `requirements.md`, `delivery-roadmap.md`, `implementation-plan.md` en `integration-strategy.md`. Architecturaal verschil expliciet gedocumenteerd: geen externe bronrepo-kaart, volledig native geïmplementeerd. Vier van de vijf productiegates bevestigd of niet-van-toepassing (geen servicecalls, dus geen confirmation-/foutgate nodig); gate 1 (relevante-state gating) is een reëel gat, vastgelegd als afzonderlijk [HD-211](#hd-211--printersummary-relevante-state-gating-toevoegen) in plaats van stilzwijgend opgelost.

**Doel**

De al gemergede en uitgebrachte 3D-printerspecialist ([HD-008](#hd-008--zelfstandige-3d-printerspecialist), PR #39, `v0.8.0-alpha.11`/`v0.8.0-alpha.12`) retroactief door dezelfde scope-, contract- en documentatiediscipline halen als Kia, robot, tuin en zwembad, zodat de designbaseline de werkelijke v1-scope weerspiegelt.

**Achtergrond**

`requirements.md`, `delivery-roadmap.md`, `decision-log.md` en de Definition of Done in `implementation-plan.md` noemen uitsluitend Kia, robot, tuin en zwembad als eersteklas specialisten. `integration-strategy.md`'s specialistentabel en de vijf productiegates die HD-130 voor robot afdwingt, bevatten de printer evenmin. HD-160/HD-170 testen hem al mee in runtime- en visuele QA — maar zonder een formele beslislogregel of productiegate blijft de printer buiten de vastgelegde v1-scope staan, ook al draait hij al in `main`.

**Scope**

- Beslislogentry toevoegen die de printerspecialist als vijfde eersteklas specialist erkent, met reden, datum en verwijzing naar PR #39/de betrokken releases.
- `requirements.md` (doelenlijst en Home-opsomming), `delivery-roadmap.md` (PR-tabel en productvorm), `implementation-plan.md` (Definition of Done) en `integration-strategy.md` (specialistentabel en productiegates) bijwerken zodat ze de printerspecialist expliciet naast Kia, robot, tuin en zwembad noemen.
- De vijf productiegates uit `integration-strategy.md` retroactief tegen de printer-bronrepo en de centrale adapter bevestigen: relevante-state gating, zichtbare servicefouten, missing/unavailable-fallback, confirmations voor riskante acties en mobiel/toetsenbord/screenreadergedrag.
- Eventuele gevonden gaten worden als aparte, geïsoleerde subtickets vastgelegd, niet stilzwijgend opgelost binnen dit ticket.

**Acceptatiecriteria**

- Beslislog, requirements, roadmap, Definition of Done en integratiestrategie noemen de printerspecialist expliciet en consistent met de andere vier specialisten.
- Alle vijf productiegates zijn met concreet bewijs bevestigd, of hebben een eigen vervolgticket met duidelijke reden.
- Geen printerlogica wordt (opnieuw) centraal gekopieerd; bevindingen over de bronrepo blijven in die repo.
- HD-160 kan zonder documentatie-inconsistentie doorlopen.

**Validatie**

Documentreview, linkcheck, en waar nodig bronrepo-testbewijs en een browsercheck van de bestaande centrale adapter.

---

### HD-211 — Printersummary: relevante-state gating toevoegen

- **Epic:** Performance
- **Status:** Klaar — candidate, lokaal geverifieerd op 5 oktober 2026 ([D-063](../design/decision-log.md#d-063--printersummary-krijgt-relevante-state-gating-hd-211)). Geen Home Assistant-write of deployment goedgekeurd.
- **Prioriteit:** P2
- **Omvang:** S
- **Eigenaar:** Specialist-agent
- **Afhankelijkheden:** geen

**Resultaat**

Nieuwe, geëxporteerde `printerStateKey()` vergelijkt de zeven relevante entiteiten vóór elke her-render; `set hass` slaat `updateValues()` over bij een ongewijzigde sleutel. Getest als pure functie (geen DOM-mutatietelling mogelijk, Node-testsuite heeft geen echte DOM) — bewijst dat een irrelevante entity de sleutel niet raakt en elk van de zeven relevante entiteiten dat wel individueel doet.

**Doel**

`HomeDashboardPrinterSummary`'s `hass`-setter laat renderen op elke toewijzing, zonder te controleren of een van de vijf gemapte entiteiten (`status`, `progress`, `time_remaining`, `nozzle_temperature`, `bed_temperature`, plus `job_failed`/`insufficient_filament`) daadwerkelijk veranderde.

**Achtergrond**

Gevonden tijdens [HD-200](#hd-200--3d-printerspecialist-contract-productiegate-en-documentatiereconciliatie)'s retroactieve productiegate-beoordeling: `src/cards/home-dashboard-printer-integration.ts`'s `set hass(value)` roept onvoorwaardelijk `this.updateValues()` aan. Dit is dezelfde klasse bevinding als robots productiegate-eis 1 ("alleen op relevante entitywijzigingen renderen"), maar dan voor de printer. De bestaande 100-irrelevante-updates-perfgate (`scripts/render-room-controls.mjs`) dekt alleen de kamerdetail-DOM, niet deze summary-kaart, dus het gat bleef tot nu onopgemerkt.

**Scope**

- `set hass` vergelijkt de relevante entiteitstates (status/progress/tijd/temperaturen/foutsignalen) tegen de vorige waarden vóór een her-render; identieke states slaan `updateValues()` over.
- Een gerichte test/fixture die aantoont dat N irrelevante `hass`-toewijzingen (andere entiteiten wijzigen, printerentiteiten niet) geen DOM-update op de printersummary veroorzaken.

**Acceptatiecriteria**

- Printersummary rendert niet opnieuw bij een `hass`-toewijzing die geen van de gemapte entiteiten raakt.
- Bestaand gedrag (status/voortgang/temperaturen/foutweergave, aria-label) blijft ongewijzigd bij een relevante wijziging.
- Geen regressie op de bestaande printerfixtures (normal/warning/error/unavailable/mapping-incompleet).

**Validatie**

`pnpm test`, gerichte rerender-perftest naar het patroon van de kamerdetail-100-updates-gate, `git diff --check`.

---

### HD-201 — Volledige productaudit voor privacy en beveiliging

- **Epic:** Quality engineering
- **Status:** Klaar — audit uitgevoerd en het enige P0/P1 gevonden probleem gefixt op 5 oktober 2026 ([D-062](../design/decision-log.md#d-062--volledige-productaudit-privacybeveiliging-één-p1-gevonden-en-gefixt-hd-201)). Specialistset-gate behandeld als voldaan (HD-200 afgerond; HD-131/141/152 blijven afzonderlijk Geblokkeerd op externe bronrepo's, wat al een expliciete deferral is — zelfde redenering als D-060/HD-171). Geen Home Assistant-write of deployment goedgekeurd.
- **Prioriteit:** P0
- **Omvang:** L
- **Eigenaar:** Performance, privacy & release-QA-agent + Lead / integrator
- **Afhankelijkheden:** featurefreeze (definitieve specialistset: HD-131, HD-141, HD-152, HD-200 of expliciete deferrals) voor de finale ronde; een eerste read-only inventarisatie kan eerder starten

**Resultaat**

Volledig auditdocument in [docs/quality/privacy-security-audit.md](../quality/privacy-security-audit.md). Eén P1 gevonden en gefixt: de camerastrook (`getCameraPresentation()`) faalde open bij een privacy-entiteit in `unavailable`/`unknown`/ontbrekende toestand — toonde alsnog het live beeld in plaats van dicht te faalen. Gefixt met een nieuwe regressietest. Twee P2-bevindingen vastgelegd zonder te blokkeren: een ongebruikt `ActionConfig`/`privacy_action_key`-schemaoppervlak (apart ticket [HD-214](#hd-214--centrale-actionallowlist-actionconfigprivacy_action_key-is-gedefinieerd-maar-nergens-uitgevoerd), vereist een architectuurbeslissing) en de printerwebcam zonder privacy-gating (ingeschat als bewuste productkeuze, geen ticket). Overige onderzoeksgebieden (entity-ID's/secrets, personencardprecisie, GUI-export) schoon. [HD-190](#hd-190--testmigratie-en-rollback-bewijzen) mag nu starten wat deze gate betreft.

**Doel**

Het volledige samengevoegde product — alle hoofdviews, kamerdetails, Energie/Domeinen en alle specialistviews samen — in één keer op privacylekken en autorisatiegaten controleren, los van de eerdere per-PR/per-slice reviews (zoals HD-102, die alleen de room-cardslice dekte).

**Scope**

- Entity-/device-ID's, serienummers, MAC-adressen, interne hostnamen/URL's, coördinaten, tokens en secrets in tracked bron, docs, fixtures, renders en logs van het volledige gemergede product.
- Cameraprivacystanden en streamfallbacks end-to-end (Home-strook, kamerdetail, Security) op onbedoelde beeldlekken tijdens privacy-actief, over alle betrokken componenten heen.
- Personencardprecisie (uitsluitend thuis/benoemde zone/onderweg/onbekend, geen exacte locatie of coördinaten) na alle latere wijzigingen.
- De `require_admin`-grens (D-008/HD-181, indien besloten) en de centrale actionallowlist/confirmationcontracten nogmaals doorlichten nu alle specialisten en kameracties zijn toegevoegd.
- De GUI-exportfunctie en eventuele diagnose-export op onbedoeld gelekte installatiegegevens.

**Acceptatiecriteria**

- Geen open P0/P1-privacybevinding.
- Iedere bevinding heeft een eigenaar en een reproduceerbare fictieve regressietest of fixture.
- Resultaat is een geanonimiseerd auditdocument zonder echte identifiers.
- HD-190 start pas nadat deze audit groen is.

**Validatie**

Privacyguard over de volledige tracked bron, gerichte codereview per informatiestroom, en een geanonimiseerd auditrapport.

---

### HD-203 — LINAK-bureaucard: contract en documentatiereconciliatie

- **Epic:** Specialisten
- **Status:** Klaar — documentatiereconciliatie vastgelegd op 2 oktober 2026 ([D-057](../design/decision-log.md#d-057--linak-bureaucard-retroactief-erkend-als-transparante-passthrough-hd-203)). Geen Home Assistant-write, geen release nodig.
- **Prioriteit:** P2
- **Omvang:** S
- **Eigenaar:** Specialist-agent + Lead / integrator
- **Afhankelijkheden:** geen

**Resultaat**

Bureaucard erkend als specialistintegratie in een lichtere categorie (geen eigen route, geen productiepoort) in `requirements.md`, `delivery-roadmap.md` en `integration-strategy.md`. Resourcefallback bestaat al (gedeelde `mountCard()`-helper) maar is ongetest; vastgelegd als apart [HD-212](#hd-212--mountcard-resourcefallback-met-een-echte-test-bewijzen) in plaats van stilzwijgend "bevestigd" verklaard.

**Doel**

De al meegekomen, transparante LINAK-bureaucardintegratie (`room.desk`, `custom:linak-desk-card`) door dezelfde documentatie- en governancediscipline halen als Kia, robot, tuin, zwembad en de 3D-printer (HD-200), zodat ze niet ongeticket en ongedocumenteerd in `main` belandt.

**Achtergrond**

Gevonden tijdens de onafhankelijke herreview van de alpha.20 Control Deck-slice: `src/config/types.ts` (`RoomDeskConfig`), `src/config/migrate.ts` en `src/cards/home-dashboard-room-cards.ts` bevatten een volledig werkende, transparante passthrough naar de zelfstandig geïnstalleerde `custom:linak-desk-card` (vaste `card_type`, ondoorzichtige `card_config`, geen servicecall of domeinlogica centraal gekopieerd — hetzelfde patroon als de andere specialisten). Er bestaat geen ticket, geen beslislogregel en geen vermelding in `requirements.md`, `delivery-roadmap.md` of `integration-strategy.md`.

**Scope**

- Beslislogentry toevoegen die de LINAK-bureaucard als specialistintegratie erkent (reden, datum, betrokken commit/release).
- `requirements.md`, `delivery-roadmap.md` en `integration-strategy.md` bijwerken zodat ze de bureaucard naast de andere specialisten noemen, of expliciet motiveren waarom dit een lichtere categorie is (puur transparante passthrough zonder eigen productiepoort).
- Nagaan of hetzelfde risicoprofiel als Kia/printer/pool van toepassing is (missing resource, versiemismatch, stale) en of daar al een fallback voor bestaat in `home-dashboard-room-cards.ts`.

**Acceptatiecriteria**

- Beslislog, requirements en roadmap noemen de bureaucard expliciet.
- Resource-/versiemismatch-fallback is bevestigd of als apart gat vastgelegd.
- Geen bureaustuurlogica wordt centraal gekopieerd.

**Validatie**

Documentreview, linkcheck, en een gerichte browsercheck van de bestaande fallback (indien aanwezig).

---

### HD-212 — `mountCard()`-resourcefallback met een echte test bewijzen

- **Epic:** Quality engineering
- **Status:** Klaar — candidate, lokaal geverifieerd op 5 oktober 2026 ([D-064](../design/decision-log.md#d-064--mountcards-resourcefallback-bewezen-met-een-echte-test-hd-212)). Geen Home Assistant-write of deployment goedgekeurd.
- **Prioriteit:** P2
- **Omvang:** S
- **Eigenaar:** Rooms-agent
- **Afhankelijkheden:** geen

**Resultaat**

Twee nieuwe browserscenario's in `scripts/check-room-detail-browser.mjs` monteren de echte bureau-fixtuurkamer met `window.loadCardHelpers` tijdelijk overschreven, en bevestigen dat beide echte faalmodi (ontbrekende helpers, werpende `createCardElement`) de `"Kaart niet beschikbaar."`-fallback laten renderen. Geen `src/`-wijziging.

**Doel**

`src/cards/home-dashboard-room-cards.ts`'s gedeelde `mountCard()`-helper (gebruikt door zowel de LINAK-bureaucard als `history-graph`) vangt een ontbrekende resource of constructiefout op met `"Kaart niet beschikbaar."` in plaats van een crash — maar dit catch-pad wordt door geen enkele test daadwerkelijk uitgeoefend.

**Achtergrond**

Gevonden tijdens [HD-203](#hd-203--linak-bureaucard-contract-en-documentatiereconciliatie)'s resourcefallback-beoordeling: `tests/room-cards-source.test.mjs` controleert alleen dat `card_config` correct wordt doorgegeven aan `mountCard()` (een regex op de aanroep), niet wat er gebeurt wanneer `window.loadCardHelpers()` ontbreekt of `createCardElement()` faalt. Hetzelfde geldt voor `history-graph`, dat dezelfde helper gebruikt.

**Scope**

- Een browsertest (of een gerichte unit-achtige test met een gemockte/ontbrekende `loadCardHelpers`) die aantoont dat een niet-geïnstalleerde `custom:linak-desk-card` resulteert in zichtbare `"Kaart niet beschikbaar."`-tekst, niet in een crash of stille lege ruimte.
- Dezelfde assertie voor het `history-graph`-pad, als dat goedkoop meeligt.

**Acceptatiecriteria**

- Een test faalt wanneer `mountCard()`'s catch-pad per ongeluk verwijderd of stilzwijgend gewijzigd wordt.
- Geen regressie op de bestaande bureaucard-/history-graph-doorgavetest.

**Validatie**

`pnpm test`, `pnpm run test:browser`, `git diff --check`.

---

### HD-213 — Diff-voor-schrijven toevoegen aan Home, Energie en pool-specialist renderpaden

- **Epic:** Performance
- **Status:** Klaar — candidate, lokaal geverifieerd op 5 oktober 2026 ([D-065](../design/decision-log.md#d-065--diff-voor-schrijven-toegevoegd-aan-home-energie-en-pool-specialist-hd-213)). Geen Home Assistant-write of deployment goedgekeurd.
- **Prioriteit:** P2
- **Omvang:** S
- **Eigenaar:** Home & security-agent + Energy & domains-agent + Specialist-agent
- **Afhankelijkheden:** geen

**Resultaat**

Home 32.000→2.000 mutaties (64→4/update, -94%), Energie 6.000→0, pool-specialist 4.500→0, bij 500 irrelevante updates. Ook `updateWeather()`'s onvoorwaardelijke `replaceChildren()` gefixt (grootste afzonderlijke bijdrage aan Home's cijfer). Resterende 4/update op Home komt van `childCards`-doorgave (camerastrook, Home-quickcontrols) — buiten scope, bewust niet nagejaagd. Geen wijziging aan wélke waarden getoond worden; volledige bestaande fixture-matrix blijft groen.

**Doel**

`HomeDashboardHomeOverview.set hass` (`src/cards/home-dashboard-home-overview.ts:434-444`, via `updateLiveState()`), `HomeDashboardEnergyOverview.updateValues()` (`src/cards/home-dashboard-energy-domain-cards.ts`) en de pool-specialist herschrijven DOM-tekst/attributen onvoorwaardelijk op élke `hass`-toewijzing, ook wanneer de gewijzigde entity volledig irrelevant is voor wat die component toont.

**Achtergrond**

Gevonden tijdens [HD-171](#hd-171--performancebaseline-en-budgetten-vastleggen)'s performancebaseline: 500 volledig irrelevante stateupdates produceerden 32.000 DOM-mutaties voor Home (64/update, op een 513-node boom), 6.000 voor Energie (12/update, op een 37-node boom) en 4.500 voor de pool-specialist (9/update, op een 30-node boom). Geen van de drie vervangt de hoofd-DOM-subtree — dit is geen "brede rerender" in de zin van een volledige remount — maar het is onverklaarde, herhaalde schrijfactiviteit op elke tick, onafhankelijk van relevantie. Ter contrast diffen `home-dashboard-room-detail` en `home-dashboard-room-overview` al correct (0 en 6 mutaties over dezelfde 500 updates) — dit ticket brengt Home/Energie/pool naar hetzelfde niveau.

**Scope**

- `updateLiveState()`, `updateValues()` en het pool-specialistrenderpad krijgen elk een before-write gelijkheidscheck (bijv. `if (element.textContent !== nextValue) element.textContent = nextValue;`) vóór elke DOM-schrijfactie die ze nu onvoorwaardelijk uitvoeren.
- Geen wijziging aan wélke waarden getoond worden, alleen aan óf er geschreven wordt wanneer de waarde niet veranderde.

**Acceptatiecriteria**

- Dezelfde 500-irrelevante-updates-meting uit `scripts/check-performance-baseline.mjs` daalt voor alle drie views naar een klein, begrensd aantal mutaties (orde van grootte van `home-dashboard-room-detail`'s huidige 6, niet 0 per se — sommige componenten kunnen een onvermijdelijke klein-aantal state-sync hebben).
- Eén relevante update blijft het display correct bijwerken (geen regressie op de bestaande normal/warning/missing/unavailable-fixtures voor deze drie views).
- `scripts/check-performance-baseline.mjs`'s bestaande `FINDING:`-regels voor deze drie views verdwijnen of dalen significant; het script zelf hoeft niet aangepast te worden tenzij de drempel moet wijzigen.

**Validatie**

`pnpm test`, `pnpm run test:browser` (inclusief de performancebaseline-sectie als regressiebewijs), `git diff --check`.

---

### HD-214 — Centrale actionallowlist (`ActionConfig`/`privacy_action_key`) is gedefinieerd maar nergens uitgevoerd

- **Epic:** Quality engineering
- **Status:** Klaar — architectuurbeslissing (a) genomen en geïmplementeerd op 5 oktober 2026 ([D-066](../design/decision-log.md#d-066--actionconfigprivacy_action_key-daadwerkelijk-aangesloten-op-een-echte-bediening-hd-214)). PR volgt. Geen Home Assistant-write of release nog goedgekeurd.
- **Prioriteit:** P2
- **Omvang:** M
- **Eigenaar:** Lead / integrator (architectuurbeslissing nodig vóór implementatie)
- **Afhankelijkheden:** geen

**Doel**

`ActionConfig` (`src/config/types.ts:187-197`, met `risk`/`confirmation_text`/`hold_required`/`sequence`) en `CameraConfig.privacy_action_key`/`confirm_privacy_disable` (`src/config/types.ts:60,62`) zijn volledig gedefinieerd, GUI-editable (`src/editor/home-dashboard-editor.ts:133-135`) en schema-gevalideerd (`src/config/validate.ts:198-201`, met round-trip-tests in `tests/config.test.mjs:267-293` en `tests/editor-behavior.test.mjs:230-235`) — maar wordt door geen enkele kaart in `src/cards/` of `src/strategy/` ooit gelezen of uitgevoerd. `executeRoomControl` (`src/cards/home-dashboard-room-controls.ts:86-91`) implementeert het juiste `risk`-gestuurde confirmation-patroon correct en is zelfs los getest, maar wordt door geen enkele UI-klasse aangeroepen — de echte klikhandler (`perform()`, zelfde bestand, regel 137) herimplementeert een equivalente (en zelf ook correct afgeschermde) check inline in plaats van de geëxporteerde functie te gebruiken.

**Achtergrond**

Gevonden tijdens [HD-201](#hd-201--volledige-productaudit-voor-privacy-en-beveiliging)'s volledige productaudit. Dit faalt vandaag niet open — er is simpelweg geen pad waarlangs een eigenaar camera-privacy vanuit het dashboard kan omschakelen, dus `privacy_action_key` heeft geen enkel effect, veilig of onveilig. Het echte probleem is misleidend productoppervlak: de editor accepteert en bewaart een `privacy_action_key`/`confirm_privacy_disable`-configuratie alsof die een werkende actie beschrijft, terwijl er geen bijbehorende bediening bestaat.

**Scope (architectuurbeslissing eerst, dan pas code)**

- De eigenaar beslist: (a) `ActionConfig`/`privacy_action_key` daadwerkelijk aansluiten op een echte bediening (bv. een privacy-toggleknop in de camerastrook die `executeRoomControl`-stijl logica aanroept), of (b) het ongebruikte schemaoppervlak verwijderen tot er een concreet gebruik is.
- Bij keuze (a): `home-dashboard-camera-strip.ts` roept de bestaande, al-geteste `executeRoomControl`/allowlist-logica aan in plaats van een nieuw, parallel pad te bouwen; `perform()`'s inline herimplementatie in `home-dashboard-room-controls.ts` wordt vervangen door een aanroep van de geëxporteerde functie, zodat er weer één bron van waarheid is.
- Bij keuze (b): schema, editor-UI, validatie en tests voor het ongebruikte veld worden verwijderd, niet alleen gedocumenteerd als "nog niet geïmplementeerd".

**Acceptatiecriteria**

- Geen enkel GUI-configuratieveld impliceert een werkende actie die niet bestaat.
- Als (a) gekozen wordt: `perform()` en elke nieuwe privacy-actiebediening gebruiken dezelfde geëxporteerde allowlist-/confirmationfunctie, niet twee parallelle implementaties.
- Als (b) gekozen wordt: geen enkele test of fixture verwijst nog naar het verwijderde veld.

**Validatie**

`pnpm test`, `pnpm run test:browser`, `git diff --check`.

---

### HD-215 — GUI-configuratie-editor opsplitsen per sectie

- **Epic:** Quality engineering
- **Status:** Klaar — opgesplitst op 6 oktober 2026 ([D-067](../design/decision-log.md#d-067--gui-configuratie-editor-opgesplitst-per-sectie-hd-215)). PR volgt. Geen Home Assistant-write of release nog goedgekeurd.
- **Prioriteit:** P2
- **Omvang:** L
- **Eigenaar:** Lead / integrator
- **Afhankelijkheden:** geen

**Doel**

`src/editor/home-dashboard-editor.ts` (647 regels) opsplitsen in één module per sectie (Personen, Beveiliging/camera's, Kamers, Acties, Specialisten), zodat elke sectie afzonderlijk leesbaar, wijzigbaar en test baar is — zonder gedragswijziging.

**Achtergrond**

Het bestand bevat vandaag zes los-top-level render-functies (`renderPersons`, `renderCameras`, `renderRooms`, `renderActions`, `renderSpecialists`, `renderViewOrder`) plus één klasse (`HomeDashboardStrategyEditor`) die alle state (`_config`, `activeSection`, `expandedItems`) en alle event-delegation voor élke sectie in één `bindEvents()`-methode (~70 regels) en één `render()`-methode (die bij elke wijziging de volledige shadow-DOM herbouwt en herbindt) samenbrengt. Daarnaast bestaan drie verschillende CRUD-micropatronen naast elkaar voor conceptueel gelijkaardig werk: (a) generieke, padgeïndexeerde `updateCollection`/`addItem`/`removeItem`/`moveItem` voor platte collecties (personen, camera's, kamers, acties), (b) een losstaand, met de hand gedupliceerd drietal (`addRoomNestedItem`/`updateRoomNestedItem`/`removeRoomNestedItem`) voor de drie kamer-geneste collecties (`light_groups`/`cover_controls`/`smart_plugs`), en (c) een eigen, partiële-DOM-patch-mechanisme (`moveRoomControlDraft`/`bindControlOrderEvents`) uitsluitend voor de kamer-bedieningsvolgorde-lijst. Omdat alle secties door dezelfde gedeelde `bindEvents()`/`render()` lopen, kan een wijziging aan één sectie assertions van `tests/editor-behavior.test.mjs` of de browserharnas-scenario's van een andere sectie raken, en is een falende test lastig tot de juiste sectie te herleiden.

**Scope**

- Eén module per sectie onder `src/editor/sections/` (bv. `persons.ts`, `cameras.ts`, `rooms.ts`, `actions.ts`, `specialists.ts`), elk exporterend een `render<Sectie>()`-functie (verplaatsing van de bestaande render-functie) en een `bind<Sectie>Events()`-functie (het uit `bindEvents()` geëxtraheerde deel dat uitsluitend die sectie raakt).
- Gedeelde infrastructuur blijft in `home-dashboard-editor.ts` of een klein gedeeld bestand: `getPath`/`setPath`/`deletePath`, `escapeHtml`, `clone`, `getEditorItemToken`/`mergeEditorIssues`, de generieke `FIELD_DEFINITIONS`-gebaseerde rendering voor de sectieloze velden (Algemeen/Vandaag/Energie/Diagnostiek), en de klasse-schil zelf (`_config`, `activeSection`, commit/validate/export/import/reset, sectienavigatie), die nu per actieve sectie dispatcht naar `render<Sectie>()`/`bind<Sectie>Events()` in plaats van alles zelf te doen.
- Volgorde van extractie (klein naar groot, elke stap zelfstandig test baar en zonder gedragswijziging): Specialisten (geen geneste items) → Acties (platte collectie) → Personen (platte collectie) → Beveiliging/camera's (platte collectie, bestaand "Privacybediening is optioneel"-blok blijft in deze module) → Kamers (grootste, met de drie geneste collecties én de bedieningsvolgorde-lijst; als laatste omdat deze van niets eerder geëxtraheerds afhangt en bij overhaasten het meest kan breken).
- De drie afwijkende CRUD-patronen worden niet kunstmatig tot één patroon gedwongen als er een echte reden is om te verschillen — met name het partiële-DOM-patch-mechanisme van de bedieningsvolgorde-lijst bestaat bewust om niet de hele sectie te moeten herbouwen tijdens het herschikken. Documenteer die reden inline in de nieuwe module in plaats van hem stilzwijgend te laten verdwijnen.

**Acceptatiecriteria**

- Geen enkele gedragswijziging: alle bestaande tests in `tests/editor-behavior.test.mjs` en alle editor-gerelateerde browserscenario's slagen ongewijzigd (alleen importpadwijzigingen toegestaan, geen aanpassing van assertions).
- `home-dashboard-editor.ts` wordt een dunne schil die alleen gedeelde klassestate en dispatch naar sectiemodules bevat.
- Elke sectie's rendering en event-binding is in eigen module geïsoleerd en apart test baar van de andere secties.
- `pnpm test`, `pnpm run test:browser` en `git diff --check` slagen na élke afzonderlijke extractiestap, niet alleen aan het eind.
- Editorbundel blijft binnen het bestaande 160 kB-budget (D-055); een zuivere verplaatsing van code zou de totale bundlegrootte niet wezenlijk mogen veranderen (baseline vóór dit ticket: 93.887 bytes).

**Validatie**

`pnpm test`, `pnpm run test:browser`, `git diff --check`, bundle-sizecheck (`scripts/verify-dist.mjs`) na elke stap.

---

### HD-204 — Control Deck herstructureren naar de v3-rail

- **Epic:** Kamers
- **Status:** Backlog
- **Prioriteit:** P1
- **Omvang:** L
- **Eigenaar:** Rooms-agent
- **Afhankelijkheden:** geen nieuwe databronnen; herbouwt op de bestaande `light_groups`, `cover_controls`, `smart_plugs` en `room_energy`-velden

**Doel**

De op 24 september 2026 afgetikte v3-ontwerpstudie (`generated/room-dashboard-concepts/index.html`, gitignored) alsnog exact implementeren: de capabilityrail (Verlichting, Openingen, Comfort, Smart plugs, Verbruik) als primaire navigatie op paginaniveau, met een apart "Details, apparaten, energie en historie"-blok eronder met zijn eigen 3 tabs (Apparaten/Energie/Historie). Dit vervangt de 4-tabsindeling (Bediening/Apparaten/Energie/Historie) uit HD-202, die zonder gedocumenteerde reden van v3 afweek.

**Achtergrond**

Sessie-analyse op 28 september 2026 vond geen enkele decision-logregel, v4-mockup of designreview die de overstap van v3's rail-primaire structuur naar de gemergede 4-tabsindeling verklaart. `control-deck-room-dashboard.md` werd pas geschreven in dezelfde commit die de implementatie afrondde. De eigenaar heeft v3 bevestigd als het gewenste eindbeeld.

**Scope**

- IA: de rail wordt topniveau-navigatie (niet genest in een "Bediening"-tab); het Details-blok blijft apart eronder met zijn bestaande 3 tabs.
- Verlichting: lichtgroepkaarten met actief/gedeeltelijk/uit-status (kleur én tekst), individuele lampen elk met een dimslider (0-100%) naast de bestaande toggle.
- Openingen: samenvattingsstrip (aantal bedieningen, volledig open, gedeeltelijk, gesloten), positiebalk per opening, luifel-specifieke hulptekst ("Uit = uitschuiven · In = intrekken · beweging vraagt bevestiging").
- Comfort: temperatuur-, lucht-, veiligheids- en kamerfunctiekaarten zoals in v3.
- Smart plugs: samenvattingsstrip (huidig vermogen, actieve plugs, dag-/maandtotaal), plugkaart met dag/maand/jaar-kWh-grid en het bestaande twee-staps-bevestigingspatroon.
- Details/Apparaten: read-only inventarisoverzicht per capability, zoals v3's inventory grid.
- Geen nieuwe databronnen: alles hergebruikt bestaande configuratievelden. Verbruik (rail) en Historie (Details) behouden voorlopig hun bestaande native-fallbackgedrag; zie HD-205 voor de echte statistics-/logbookkoppeling.

**Acceptatiecriteria**

- Rail is de hoofdnavigatie; er is geen "Bediening"-tab meer.
- Het Details-blok met Apparaten/Energie/Historie-tabs blijft functioneel gescheiden eronder.
- Dimsliders, lichtgroep-, opening- en plugkaarten tonen dezelfde informatie en acties als vóór deze herbouw — expliciet inclusief de awning-confirmationfix uit `v0.8.0-alpha.21` (geen regressie).
- Normal/warning/missing/unknown/unavailable per capability blijven afgedekt in fixtures/tests.
- 390×844, tablet en 1440×900 blijven zonder overflow/clipping; 44×44 px-targets en toetsenbordvolgorde blijven behouden.

**Validatie**

`pnpm test`, `pnpm run test:browser`, `git diff --check`, onafhankelijke review, en een bundlebudget-check tegen het aandachtspunt uit HD-171.

---

### HD-205 — Verbruik en Historie op echte HA-statistics en logbook-data

- **Epic:** Kamers / Energie en domeinen
- **Status:** Klaar — candidate `v0.8.0-alpha.27`, lokaal geverifieerd op 2 oktober 2026 met adversariale review ([D-059](../design/decision-log.md#d-059--verbruik-en-historie-op-echte-ha-statistics-en-logbook-data-hd-205)). Geen Home Assistant-write of deployment goedgekeurd.
- **Prioriteit:** P2
- **Omvang:** XL
- **Eigenaar:** Rooms-agent + Energy & domains-agent
- **Afhankelijkheden:** HD-204 (gemerged)

**Resultaat**

Verbruik-tab krijgt een echt dagstaafdiagram per apparaat naast de bestaande periodekaarten; Historie-tab is herbouwd van een per-entiteit `history-graph`-dialoog naar een volwaardig tabblad met temperatuur-/luchtvochtigheidslijngrafiek en strikt gefilterd logboek (max 50, nooit woningbreed). Alle vijf D-058-punten nageleefd. Eén reële bug gevonden tijdens bouw (kamerentiteit-expansiemismatch tussen `render()` en de nieuwe WS-laders) en één tijdens onafhankelijke review (een server-geleverde ruwe entity_id in het logboek-`name`-veld) — beide gefixt met gerichte, niet-vacuüme tests. Hoofdbundelbudget 210 kB → 213 kB (D-059, eerste verhoging sinds D-055).

**Doel**

De v3-ontwerpstudie's "Verbruik"-dagstaafdiagram (per apparaat, 7 dagen/maand/jaar) en de "Historie"-tab (temperatuur-/luchtvochtigheidslijngrafiek plus gebeurtenissenlijst) met echte Home Assistant-data implementeren, in plaats van de huidige native `history-graph`-fallback.

**Achtergrond**

De huidige `v0.8.0-alpha.21`-implementatie koos bewust voor de native history-graph om geen gefabriceerde tijdreeksen te tonen (zie de "bekende en bewuste grenzen" in de testchecklists en het Control Deck-contract). Dat was een geldige, gedocumenteerde afweging — dit ticket doet de echte koppeling zorgvuldig en apart, niet als bijvangst van HD-204.

**Scope (na de eigenaarsgate van 2 oktober 2026, zie D-058)**

- `recorder/statistics_during_period` (WebSocket) voor per-dag/maand/jaar-verbruik per smart plug en kamerbron, met een periode-toggle (7 dagen/maand/jaar) zoals v3. Hergebruikt exact de bestaande Energie-periodesemantiek (D-021), geen nieuwe conventie.
- `history/history_during_period` voor het Historie-tab-lijngrafiek, **uitsluitend temperatuur-/luchtvochtigheidssensoren** (24u/7d/30d). Vermogen/energie wordt hier expliciet **niet** getoond — dat staat al op de Verbruik-tab en zou dubbel werk en een tweede, mogelijk inconsistente voorstelling van hetzelfde cijfer zijn.
- `logbook/get_events`, strikt gefilterd tot de expliciet gemapte entiteiten van de kamer (geen woningbrede logboekregels), met een vast maximum van **50** getoonde gebeurtenissen.
- Privacyscope: geen entity-ID's, automatiseringsinterne details of ongerelateerde huishoudactiviteit lekt in de getoonde gebeurtenissen; alleen al-gemapte entiteiten komen in aanmerking.
- Missing/unavailable/lege-statistics fallback: geen data betekent een duidelijke lege status, nooit een gefabriceerde nulwaarde.

**Acceptatiecriteria**

- Geen enkele getoonde grafiekwaarde of gebeurtenis is gefabriceerd; alles komt van een echte HA-call of toont expliciet "niet beschikbaar".
- Het logbookfilter toont uitsluitend entiteiten die al in de kamerconfiguratie zijn opgenomen, met een hard maximum van 50 gebeurtenissen.
- Het Historie-lijngrafiek toont uitsluitend temperatuur-/luchtvochtigheidssensoren; geen vermogens- of energiewaarde verschijnt hier.
- Periodewissel (7 dagen/maand/jaar, 24u/7d/30d) hergebruikt de bestaande datum-/periodesemantiek uit Energie (D-021).
- Normal/missing/unavailable/lege-periode fixtures en tests voor beide panelen.

**Validatie**

`pnpm test`, `pnpm run test:browser`, privacyguard, gerichte review van de logbookfilterlogica, en nieuwe fixtures zonder echte identifiers.

---

### HD-206 — Control Deck-omkadering aanvullen naar de v3-mockup

- **Epic:** Kamers
- **Status:** Backlog
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Rooms-agent
- **Afhankelijkheden:** HD-204 (gemerged, `v0.8.0-alpha.22`); geen nieuwe databronnen

**Doel**

De "chrome" rond de Control Deck-rail die in HD-204 werd overgeslagen alsnog toevoegen, zodat het kamerdetail visueel overeenkomt met de afgetikte v3-mockup, niet alleen qua navigatiestructuur.

**Achtergrond**

Live test door de eigenaar (`docs/screenshots/bureau_*.png`, 30 september 2026) tegen de gepubliceerde v3-mockup-artifact toonde aan dat vier omkaderende elementen uit de mockup nergens in de HD-204-implementatie voorkomen — dit was een omissie in de oorspronkelijke implementatie-opdracht, niet een configuratiegat (de eerder vermoede "smart plugs ontbreekt"-melding bleek wél een configuratiegat: de eigenaar had de nieuwe Smart Plugs-sectie nog niet ingevuld in de kamereditor).

**Scope**

- **Deck-head:** een sectiekop boven de capabilityrail met eyebrow "Control Deck", "{kamer} · individuele bediening" en een telling ("X lampen · Y openingen · Z plugs"), zoals `deck-head`/`deck-title`/`deck-count` in de mockup.
- **Stage-head:** bovenaan de inhoud van elke geselecteerde rail-functie een titel, korte omschrijving, een statusbadge ("Beschikbaar"/"Aandacht"/"Deels niet beschikbaar") en een verklarende notitie, zoals `stageHeader()` in de mockup. Hergebruik bestaande state-detectielogica (missing/unavailable/normal) waar die al bestaat.
- **Rail-iconen en samenvattingsregel:** elke rail-knop krijgt een icoontegel (passend bij dit project se bestaande icoonsysteem) en een tweede regel met een korte statussamenvatting onder het label (bv. "4 van 6 aan", "2 bedieningen"), zoals `cap-icon`/`cap-copy` in de mockup.
- **Hero:** vervang de ene generieke `hero-pill` door de drie aparte statuspillen uit de mockup waar de onderliggende data bestaat (temperatuur, vocht/luchtkwaliteit, aanwezigheid/bezet — alleen tonen wat werkelijk gemapt is, geen lege pillen fabriceren). Voeg een decoratieve kamerillustratie-fallback toe wanneer geen `image_entity` is geconfigureerd, met dezelfde privacyveilige bijschriftconventie als de mockup ("Fictieve privacyveilige kamerillustratie" → hier: een neutrale, niet-fictieve variant van dat bijschrift, aangezien dit geen fixture is).

**Acceptatiecriteria**

- Alle vier elementen zijn aanwezig en volgen de mockup's structuur en informatiehiërarchie.
- Niets hiervan vereist een nieuwe databron; alles hergebruikt reeds beschikbare state/mapping.
- Lege of niet-geconfigureerde categorieën (bv. geen `image_entity`, geen comfortbron) tonen geen lege kaart en fabriceren geen data.
- Normal/warning/missing/unavailable per stage blijven afgedekt in fixtures/tests.
- 390×844, tablet en 1440×900 blijven zonder overflow/clipping; 44×44 px-targets en toetsenbordvolgorde blijven behouden.
- Geen regressie op de al bestaande awning-confirmation-, plug-tweestaps- of dimslider-logica.

**Validatie**

`pnpm test`, `pnpm run test:browser`, `git diff --check`, onafhankelijke review, bundlebudget-check tegen de D-052-grens (254 kB).

---

### HD-207 — Control Deck-omkadering: drie resterende hiaten

- **Epic:** Kamers
- **Status:** Backlog
- **Prioriteit:** P2
- **Omvang:** S
- **Eigenaar:** Rooms-agent
- **Afhankelijkheden:** HD-206 (gemerged)

**Doel**

Drie kleine, niet-blokkerende hiaten oplossen die de finale verificatie van HD-206 vond, buiten de scope van de vier gefixte bevindingen.

**Scope**

- `capabilityEntityRoles()`'s "plugs"-tak controleert alleen `switch_entity`/`power_entity`, niet `energy_day_entity`/`energy_month_entity`/`energy_year_entity` — dezelfde soort vals-"Beschikbaar"-risico als eerder gefixt voor de energie-tak, nu voor de plugs-stage zelf: een plug met gezonde schakel-/vermogensbron maar een unavailable dag-energiesensor toont toch "Beschikbaar" terwijl de metrics "—" tonen.
- De deck-head-telling (`countParts`) toont een lege `<span>` voor een kamer die alleen comfort of energie heeft geconfigureerd (geen lampen/openingen/plugs) — de bestaande `configuredCapabilities.length > 0`-guard dekt dit niet, want die telt capabilities, niet telbare items.
- In `scripts/check-room-detail-browser.mjs` overschrijft de nieuwe `plugs_only_energy`-fixture per ongeluk de betekenis van de `unavailable/1440`-screenshot (`generated/room-detail/unavailable-1440.png` toont nu de plugs-only-kamer in plaats van de hoofdfixture se unavailable-coverstate) — screenshot-volgorde moet aangepast of een aparte capture toegevoegd.

**Acceptatiecriteria**

- Plugs-stagebadge reflecteert ook een unavailable energiesensor van een geconfigureerde plug.
- Deck-head toont geen lege telling; ofwel de header verschijnt niet, ofwel de tellingslogica dekt ook comfort-/energie-only kamers correct af (zonder een fantasietelling te verzinnen).
- De bestaande `unavailable-1440.png`-evidence documenteert weer wat de rest van de matrix documenteert; de plugs-only-assertie krijgt zijn eigen, apart benoemd bewijsstuk indien een screenshot nuttig is.

**Validatie**

`pnpm test`, `pnpm run test:browser`, `git diff --check`.

---

### HD-208 — Control Deck visueel afbakenen, zinloze tekst schrappen en Kamerverbruik echt combineren

- **Epic:** Kamers
- **Status:** Backlog
- **Prioriteit:** P0
- **Omvang:** L
- **Eigenaar:** Rooms-agent + GUI-configagent
- **Afhankelijkheden:** HD-206 (gemerged, `v0.8.0-alpha.23`); geen nieuwe databronnen

**Doel**

Vier rechtstreekse bevindingen van de eigenaar op een geannoteerde screenshot van de live `v0.8.0-alpha.23`-installatie oplossen: betekenisloze tekst in de HD-206-omkadering, een niet-afgebakende Control Deck-weergave, een Kamerverbruik-cijfer dat niet alle apparaten combineert, en een onduidelijke kamerconfiguratie in de editor.

**Achtergrond**

De eigenaar annoteerde `/tmp/agent-dashboard/screenshot-home-dashboard-claude-1790776578570.png` met "ZINLOOS" bij zowel de hero-ondertitel als de stage-head-titel/omschrijving. Onderzoek bevestigde: `stageHead()` herhaalt de kamernaam als `<h3>` en toont een statische, niet-kamerspecifieke omschrijving per functie; de hero-ondertitel "Status en bediening per functie" bestond al vóór HD-206 en voegt evenmin iets toe. De `.control-deck`-CSS heeft geen rand/schaduw/achtergrond die rail+inhoud als kaart omkadert zoals in de v3-mockup. Kamerverbruik telt alleen `smart_plugs`- en `room_energy`-bronnen; de oudere generieke `power_entities`-lijst (waarin bv. een airco-vermogensensor terechtkomt) wordt wel getoond maar nooit meegeteld, en de editor legt de relatie tussen beide paden nergens uit.

**Scope**

- `stageHead()`: de redundante `<h3>${room.name}</h3>` en de statische `stageDescription()`-zin verwijderen; alleen behouden wat echte informatie toevoegt (de statusbadge/-notitie). Hero-ondertitel "Status en bediening per functie" vervangen door iets met echte inhoud of schrappen.
- `.control-deck` (en de bijbehorende rail/stage-structuur) krijgt een echte kaartbehandeling (rand, radius, schaduw, achtergrond) die rail + actieve stage samen omkadert als één herkenbare sectie, zoals `.deck.card` in de mockup — losstaand van kleurkeuze/thema.
- Een bredere stylingpas tegen de mockup (spacing, kaartvorm, railknopstijl) voor zover die niet van het HA-thema/kleurenpalet afhangt.
- **Kamerverbruik combineert voortaan alle geconfigureerde verbruikers:**
  - Huidig vermogen ("nu"): wanneer `room_energy.power_entity` geconfigureerd is, blijft die gezaghebbend (een kamer-/circuitmeter kan de plugs en de airco al omvatten; er wordt niets bovenop opgeteld, zoals dag/maand/jaar dat al deden). Alleen wanneer er géén kamerbrede meter is, worden `smart_plugs[].power_entity` en elke generieke `power_entities`-entiteit met een numerieke W/kW-waarde samen opgeteld — met deduplicatie per entity-ID zodat niets dubbel telt.
  - Dag-/maand-/jaartotalen: blijven beperkt tot bronnen die daadwerkelijk een periode-entiteit hebben (`room_energy`/`smart_plugs`'s `energy_day/month/year_entity`); een generieke `power_entities`-bron zonder periode-entiteit draagt bewust niet bij aan een dag-/maand-/jaarcijfer — geen fictieve periodewaarde fabriceren uit een kale huidige-vermogenlezing.
  - Een niet-numerieke of unavailable `power_entities`-waarde wordt overgeslagen, niet als 0 geteld.
- **Editor-duidelijkheid:** korte hulptekst bij "Overige apparaten" (power_entities) die uitlegt dat dit meetelt in het huidige vermogen maar geen dag-/maand-/jaaroverzicht geeft tenzij via Smart plugs gemapt; de Smart-plugs-sectie's 13 losse velden krijgen een duidelijkere visuele groepering (bv. basisvelden vs. energieperiodevelden) zodat niet alles als één ononderscheiden blok oogt.

**Acceptatiecriteria**

- Geen enkele tekst in hero/stage-head herhaalt informatie die al zichtbaar is of is louter generiek zonder kamerspecifieke betekenis.
- Control Deck oogt als één afgebakende kaart, niet als losse rail- en stage-elementen op de paginaondergrond.
- Kamerverbruik "nu" combineert `room_energy`, `smart_plugs` én `power_entities` zonder dubbeltelling; dag-/maand-/jaar blijven eerlijk beperkt tot bronnen met een echte periode-entiteit.
- Geen regressie op awning-confirmation, plug-tweestapsbevestiging, roving-tabindex of de HD-206-statusbadgelogica.
- Editor maakt het onderscheid tussen "Overige apparaten" en "Smart plugs" voor een nieuwe gebruiker begrijpelijk zonder de broncode te lezen.
- Normal/warning/missing/unavailable blijven afgedekt in fixtures/tests; 390×844/tablet/1440 zonder overflow; 44×44 px-targets behouden.

**Validatie**

`pnpm test`, `pnpm run test:browser`, `git diff --check`, onafhankelijke review, bundlebudget-check tegen de D-053-grens (258 kB).

---

### HD-209 — Kamerafbeelding rechtstreeks kunnen uploaden

- **Epic:** Kamers
- **Status:** Backlog
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** GUI-configagent + Rooms-agent
- **Afhankelijkheden:** geen; onafhankelijk van HD-208 (aparte worktree, zelfde bestanden mogelijk geraakt, sequentieel mergen)

**Doel**

Een kamerafbeelding kunnen uploaden vanuit de kamereditor zelf, in plaats van verplicht eerst zelf een `image.*`-entiteit te moeten aanmaken via HA Instellingen → Hulpmiddelen.

**Achtergrond**

Vandaag biedt `renderRoomControlDeck()` alleen een entity-picker gefilterd op domein `image` (`room.image_entity`) — de gebruiker moet dus eerst buiten het dashboard om een Image-hulpmiddel aanmaken. Home Assistant heeft sinds frontend 20251029.0 (HA 2025.11, dus al ruim binnen de minimale ondersteunde versie 2026.8.2) een natieve `media`-selector met `image_upload: true` die een upload-widget toont zonder eigen backend-code; de waarde is een `{media_content_id, media_content_type}`-paar dat via de bestaande `media_source`-resolutie naar een weergeefbare URL wordt omgezet.

**Scope**

- Nieuw optioneel configveld (bv. `room.image_upload: { media_content_id, media_content_type }`) naast het bestaande `image_entity` — geen vervanging, twee geldige paden naast elkaar.
- Editor: een `<ha-selector>` met `{ media: { accept: ["image/*"], image_upload: true } }` toevoegen naast de bestaande entity-picker, met duidelijke hulptekst over het verschil (upload = eigen foto zonder HA-hulpmiddel; entity-picker = koppelen aan een al bestaande `image`-entiteit).
- Rendering: bij het tonen van de kamerfoto eerst de upload-referentie proberen op te lossen (via de bestaande `media_source`-resolutiemethode die Home Assistant al aanbiedt), anders terugvallen op `image_entity`, anders de bestaande placeholder-illustratie uit HD-206.
- Schema-/migratiecompatibiliteit: bestaande configuraties met alleen `image_entity` blijven ongewijzigd werken.

**Acceptatiecriteria**

- Een gebruiker kan een foto uploaden zonder het dashboard te verlaten of een HA-hulpmiddel aan te maken.
- Bestaande `image_entity`-mappings blijven werken; geen enkele bestaande kamer verliest zijn foto.
- Ontbrekende/falende resolutie van een upload-referentie toont de bestaande placeholder, nooit een kapotte afbeelding of fout zonder uitleg.
- Normal/missing/unavailable blijven afgedekt in fixtures/tests.

**Validatie**

`pnpm test`, `pnpm run test:browser`, `git diff --check`, onafhankelijke review, bundlebudget-check.

---

### HD-210 — Bundlebudget structureel oplossen: editor lazy laden

- **Epic:** Performance
- **Status:** Klaar — PR #59 gemerged en `v0.8.0-alpha.26` getagd en gereleased op 2 oktober 2026 (release-PR #60). Geen Home Assistant-write of deployment goedgekeurd.
- **Prioriteit:** P0
- **Omvang:** L
- **Eigenaar:** Performance, privacy & release-QA-agent + Foundation & HACS-agent
- **Afhankelijkheden:** geen featurefreeze nodig voor dit specifieke, afgebakende deel van HD-171 (bouwtooling-wijziging, geen productfunctionaliteit); HD-171 zelf dekt de bredere parse/DOM/rerender-meting en blijft wel op featurefreeze wachten

**Resultaat (zie [D-055](../design/decision-log.md#d-055--bundlebudget-structureel-opgelost-editor-lazy-geladen-hd-210))**

Twee kandidaten gemeten vóór de keuze: esbuild `splitting: true` gaf een kleinere hoofdbundel (165 kB) maar met een gedeelde chunk (39,5 kB) die de hoofdbundel nog altijd eager importeert — effectief vrijwel dezelfde downloadkost (204,8 kB) als twee volledig zelfstandige bundles, met een slechter faalgedrag (een stale gedeelde chunk breekt het hele dashboard, niet enkel de editor). Gekozen: twee zelfstandige esbuild-bundles (`dist/home-dashboard.js` 204.856 bytes, `dist/home-dashboard-editor.js` 93.887 bytes, elk zonder statische afhankelijkheid van elkaar). Hoofdbundelbudget 260 kB → 210 kB; editor krijgt een eigen 160 kB-budget. HACS' `gather_files_to_download()`-brongedrag rechtstreeks nagelezen (downloadt alle release-assets voor een pinned plugin-repo, niet enkel het `hacs.json`-bestand) — release-workflow aangepast om de editor-chunk mee te geven. Geen regressie op awning-confirmation, plug-tweestaps, HD-206/208-statuslogica of de HD-209-fotoflow (`git diff --stat` tegen alpha.25 toont geen wijzigingen in die bestanden). `pnpm test` 118/118, volledige `pnpm run test:browser`-matrix en `git diff --check` groen, onafhankelijk herverifieerd.

**Doel**

De herhaalde bundlebudget-verhogingen (245 kB → 254 kB → 258 kB → 260 kB over vier Control Deck-tickets) structureel oplossen in plaats van telkens opnieuw de grens op te trekken: de grafische configuratie-editor (`src/editor/home-dashboard-editor.ts` + `fields.ts`, samen ca. 75 kB bron) wordt uit de altijd-geladen runtimebundel gehaald en pas on-demand geladen wanneer de gebruiker de dashboardconfiguratie daadwerkelijk opent — exact het patroon dat Home Assistants eigen ingebouwde kaarteditors al gebruiken ("built-in editors are lazy loaded") en dat de deliveryroadmap destijds al aankondigde ("lazy first-loadwinst wordt pas na een echte frontendmeting geclaimd").

**Achtergrond (onderzocht en bevestigd vóór implementatie)**

- HACS downloadt en serveert **elk bestand** in `dist/` (niet uitsluitend het in `hacs.json` genoemde bestand), dus meerdere JS-bestanden naast elkaar in `dist/` is een door HACS ondersteund, standaard patroon voor plugin-repositories.
- `getConfigElement()` mag in Home Assistants customstrategy-/customcard-contract een Promise retourneren; asynchroon laden van de editor is het gedocumenteerde, courante patroon bij bestaande custom cards én bij HA's eigen ingebouwde editors.
- De huidige build (`scripts/build.mjs`) gebruikt `esbuild` met `outfile` (één bestand, geen `splitting`). `src/index.ts` importeert en registreert de editor **eager** en onvoorwaardelijk, en re-exporteert editor-symbolen (`HomeDashboardStrategyEditor`, `EDITOR_COVERAGE`, `EDITOR_SECTION_KEYS`, `getEditorItemToken`, `getEditorSectionForKey`, `mergeEditorIssues`) — dat houdt de editor in de hoofdbundel ook als enkel de `customElements.define`-aanroep lazy zou worden.
- `tests/editor-behavior.test.mjs` importeert deze symbolen vandaag rechtstreeks via `dynamic import("../dist/home-dashboard.js?...")` en destructureert ze — dit moet mee-veranderen naar een import van het nieuwe, apart gebouwde editor-chunkbestand.

**Scope**

- `scripts/build.mjs`: `esbuild` naar `splitting: true` + `outdir` (i.p.v. `outfile`), met gecontroleerde `entryNames`/chunkbenaming zodat het hoofdbestand exact `home-dashboard.js` blijft heten (ongewijzigd voor `hacs.json`/HA-resourceregistratie) en de editor-chunk een voorspelbare, stabiele bestandsnaam krijgt.
- `src/strategy/home-dashboard-strategy.ts`: `getConfigElement()` wordt `async`, doet een dynamische `import("../editor/home-dashboard-editor")` (die de `customElements.define`-registratie als sideeffect uitvoert) en retourneert dan pas het element.
- `src/index.ts`: de eager `import`/`registerHomeDashboardEditor()`-aanroep en de editor-symboolre-exports verwijderen uit het altijd-geladen pad.
- `tests/editor-behavior.test.mjs` (en eventuele andere tests die editor-symbolen via de hoofdbundel importeren): aanpassen naar een import van het nieuwe editor-chunkbestand.
- `tests/foundation.test.mjs`'s "dist bevat precies één HACS JavaScript-runtime-artefact"-test: bijwerken naar de nieuwe, bewust meerdere-bestanden-verwachting (hoofdbundel + editor-chunk), met een expliciete reden in de test zelf.
- `scripts/verify-dist.mjs` en `scripts/create-release-assets.mjs`: nagaan of checksums/validatie op het juiste bestand (de hoofdbundel) blijven werken en of de editor-chunk ook een checksum verdient voor integriteit.
- Budget: na de split een **nieuwe, lagere** harde grens voor de hoofdbundel meten en vastleggen (naast een afzonderlijke, ruimere grens voor de editor-chunk, die niet elke keer op dezelfde manier onder druk staat omdat hij niet in elke paginaweergave meetelt).

**Acceptatiecriteria**

- De hoofdbundel (altijd geladen, elke dashboardweergave) krimpt meetbaar doordat de editor er niet langer in zit; het exacte bytenaantal vóór/na wordt gerapporteerd.
- De editor werkt functioneel ongewijzigd: openen van de dashboardconfiguratie laadt de editor on-demand, zonder waarneembare vertraging die de bestaande toegankelijkheids-/UX-eisen schendt.
- Alle bestaande tests (inclusief `editor-behavior.test.mjs`) slagen tegen de nieuwe build-output, aangepast waar nodig zonder functionele dekking te verliezen.
- `pnpm run test:browser` blijft volledig groen, inclusief het native editor-menu/GUI-configuratiepad.
- Geen regressie op awning-confirmation, plug-tweestapsbevestiging, de HD-206/HD-208-statuslogica, of de HD-209-fotoflow.
- Dit ticket verhoogt het bundelbudget niet verder — het verlaagt de hoofdbundel en legt een apart, eigen budget voor de editor-chunk vast.

**Validatie**

`pnpm test`, `pnpm run test:browser`, `git diff --check`, onafhankelijke review, en een expliciete vergelijking van het gemeten hoofdbundel-bytenaantal vóór en na de split.

---

### HD-202 — Control Deck-kamerdashboard implementeren

- **Epic:** Kamers
- **Status:** Review/validatie
- **Prioriteit:** P1
- **Omvang:** L
- **Eigenaar:** Rooms-agent + Accessibility & visual-QA-agent
- **Afhankelijkheden:** goedgekeurde Control Deck-v3-ontwerprichting; implementatie start op een verse `codex/`-branch vanaf actuele `origin/main`; impact op de open HD-170-baselines wordt expliciet afgestemd

**Doel**

De op 24 september 2026 goedgekeurde Control Deck-richting omzetten in één herbruikbaar, capability-gedreven kamerdashboard voor lichte en zware kamers, zonder kamerspecifieke hardcoding en zonder de bestaande actionscope, confirmation-, privacy- of runtimegates te verzwakken.

**Scope**

- De goedgekeurde lokale ontwerpstudie vertalen naar een tracked ontwerpcontract. Verse privacyveilige browserrenders blijven gitignored verificatie-output; definitieve tracked visuele baselines en hun inhoudelijke goedkeuring blijven bij HD-170.
- Een compacte kamerheader met kernstatus en een optionele privacyveilige kamerafbeelding of decoratieve fallback. Een afbeelding blijft contextueel en bevat geen bediening of live camerabeeld.
- Een vaste capabilityrail met directe toegang tot verlichting, rolluiken/openingen, comfort, smart plugs en kamerverbruik; alleen werkelijk gemapte capabilities verschijnen.
- Meerdere lichtgroepen en individuele lampen, inclusief uit/aan/gedeeltelijk-aan, dimniveau, kleurtoon, unavailable en expliciete groepsscope.
- Meerdere rolluiken, screens en luifels met individuele positie, Open/Stop/Dicht of Uit/Stop/In, featuregating, bewegingsstatus en bestaande confirmationregels.
- Meerdere smart plugs en apparaten met actuele W, dag-/maand-/jaarverbruik, beveiligde apparaten, bevestigde schakeling en zichtbare servicefouten.
- Kamerenergie met expliciete bron- en periodecontext, dag-/maand-/jaarselectie, apparaatvergelijking, toegankelijke grafieken en regels tegen dubbeltelling of gefabriceerde historie.
- Secundaire tabs voor Apparaten, Energie en Historie, inclusief normal, warning, missing, unknown, unavailable en lege toestanden.
- Schema-, defaults-, migratie- en GUI-uitbreidingen die groepen, apparaten, energiebronnen, historie en de optionele kamerafbeelding volledig configureerbaar maken via logical keys en Home Assistant-selectors.
- Responsive gedrag voor mobiel, wandtablet en desktop met dezelfde functionele capabilitydekking en operationele waarschuwingen boven diagnostiek.

**Acceptatiecriteria**

- Geen kamernaam, apparaataantal, groep, energiewaarde of layoutvariant is hardcoded als productievoorwaarde; Keuken, Slaapkamer, Bureau en Tuin zijn uitsluitend fictieve fixtures van hetzelfde model.
- Groepsstatus onderscheidt uit, alles aan en gedeeltelijk aan via tekst en semantiek, niet uitsluitend via kleur; groepsacties benoemen hun volledige scope.
- Iedere servicecall blijft beperkt tot een expliciet gemapt doel, gebruikt de bestaande allowlist/backendautorisatie en toont pending, succes of fout zonder optimistische apparaatstate.
- Luifels en andere riskante of kostbare acties behouden confirmation; Stop blijft tijdens beweging direct bereikbaar waar de capability dit ondersteunt.
- Beveiligde smart plugs zijn niet rechtstreeks schakelbaar en verklaren waarom; andere plugs vragen de vastgelegde bevestiging.
- Energiecijfers noemen bron, eenheid, periode, lopende versus voltooide periode en updatecontext. Apparaattotalen zijn reconcilieerbaar; officiële Energy-totalen blijven leidend waar dezelfde stroom elders wordt getoond.
- Grafieken hebben schaal, tijd-/periodemarkeringen, eenheden, tekstalternatief en een kleur-onafhankelijke interpretatieroute. Vermogen en temperatuur gebruiken geen misleidende gedeelde schaal.
- De kamerafbeelding is optioneel, privacyveilig, lazy waar zinvol en heeft een bruikbare fallback; tracked fixtures/renders bevatten geen echte woningbeelden, interne URL's of installatie-identifiers.
- Onbeschikbare functies blijven zichtbaar wanneer ze operationeel relevant zijn, zijn niet bedienbaar en leggen hun toestand uit. Niet-geconfigureerde secties verdwijnen zonder lege kaartresten.
- 390×844, representatieve wandtablet en 1440×900 hebben geen horizontale overflow, clipping of onbereikbare bediening; actieve touchdoelen zijn minimaal 44×44 px en keyboard-/screenreadergebruik is gelijkwaardig.
- Bestaande navigatiegeometrie, palettekeuze, kioskherstel, native editoringang en `hass-more-info`-fallback blijven intact.
- Normal, warning, missing, unknown en unavailable zijn per relevante capability in fixtures, unit-/contracttests en browserchecks afgedekt.

**Validatie**

- Schema/defaults/editorcoverage en migratieroundtrip.
- Gerichte unittests voor groepsstatus, actionscope, confirmation, energieperioden, totalen en fallbacksemantiek.
- Voor de alpha.20-validatiekandidaat: één representatieve fictieve kamer door de volledige state-/viewportmatrix, plus contractfixtures die aantonen dat Keuken, Slaapkamer, Bureau en Tuin hetzelfde capabilitymodel gebruiken. De vierkamer-visuele matrix en tracked baselines sluiten later via HD-170.
- Keyboard-, screenreaderlabel-, 200%-zoom-, reduced-motion-, contrast-, touch- en visuele review.
- `pnpm test`, `pnpm run test:browser`, `git diff --check` en een byte-identieke clean-patch rebuild vóór overdracht.

**Lokaal resultaat 25 september 2026**

- Schema v1, migratie en validator ondersteunen expliciete lichtgroepen, getypeerde openingen, beschermde plugs en afzonderlijke dag-/maand-/jaarbronnen zonder bestaande mappings automatisch te activeren.
- De GUI beheert de geneste kamercollecties met Home Assistant-selectors; runtime gebruikt één capability-gedreven Control Deck met vier tabs en verwijdert de dubbele strategy-historiegrafiek.
- De fictieve representatieve room-detailmatrix is groen voor normal, warning, missing, unknown en unavailable op 390×844, 1024×900 en 1440×900; live Home Assistant-acceptatie en de vierkamer-baselinereview blijven afzonderlijk geblokkeerd onder HD-170.
- De lokale kandidaat is `v0.8.0-alpha.20`; de eerste onafhankelijke reviewbevindingen zijn opgelost en finale herreview, PR/CI en prerelease zijn nog open gates.

**Buiten scope**

- Geen Home Assistant-write, deployment, productiecutover of wijziging van default `lovelace` zonder de bestaande afzonderlijke menselijke gates.
- Geen irrigatie-, tuin-, klimaat- of energiesemantiek in de frontend afleiden wanneer daarvoor geen expliciete bronmapping bestaat.
- Geen specialistische bronlogica uit externe kaarten naar de centrale dashboardbundle kopiëren.

---

## Review/validatie

### HD-170 — Volledige responsive, accessibility en visual QA

- **Epic:** Quality engineering
- **Status:** Review/validatie
- **Prioriteit:** P1
- **Omvang:** L
- **Eigenaar:** Accessibility & visual-QA-agent
- **Afhankelijkheden:** HD-101; definitieve baselines pas na HD-102

**Doel**

De volledige dashboardoppervlakte toetsen aan de vastgelegde WCAG-, responsive- en visuele gates.

**Scope**

- 390×844, representatieve tabletlandscape en 1440×900.
- 200% zoom, reduced motion, keyboard, focus, dialogs en screenreaderlabels.
- 44×44 targets, contrast en status niet uitsluitend via kleur.
- Hoofdviews, editor, lichte/zware kamer en alle beschikbare specialistviews.

**Acceptatiecriteria**

- Geen overflow, clipping of onbereikbare bediening.
- WCAG 2.2 AA binnen scope; afwijkingen hebben een eigenaar en ticket.
- Baselinewijzigingen zijn inhoudelijk gereviewd.
- Mobiel behoudt dezelfde functionele capabilitydekking als desktop.

**Validatie**

Geautomatiseerde browserchecks plus handmatige keyboard-, zoom- en screenreaderreview.

**Lokaal resultaat 23 september 2026**

- Hoofdviews, kamers en alle beschikbare specialistviews inclusief 3D-printer zijn geautomatiseerd afgedekt op 390×844, 1024×900 en 1440×900.
- Camera-, kamer- en editorbediening voldoen in het harnas aan 44×44 px; cameraknoppen behouden minimaal 8 px tussenruimte.
- Reduced-motiongedrag, keyboardfocus, dialogs, focusherstel, light/dark en statevarianten zijn regressiegates.
- De resterende 200%-zoom-, screenreader-, echte themacontrast- en visuele baselinebeoordeling staat in `docs/quality/responsive-accessibility-qa.md` en hoort bij de nieuwe alpha-test.
- Het ticket sluit pas na die menselijke test; een bevinding krijgt een eigen regressieticket.

---

## Klaar

### HD-001 — Repositoryfundering, HACS, tooling en privacyguards

- **Epic:** Foundation & HACS
- **Status:** Klaar
- **Afgerond via:** `v0.1.0-alpha.1`

TypeScript/buildbasis, `dist/home-dashboard.js`, `hacs.json`, CI en releaseworkflow. Doorliep de volledige HACS-lifecycle (install/update/verwijderen/herinstallatie); resultaat vastgelegd in `docs/releases/results-v0.1.0-alpha.1.md`.

### HD-002 — Entitymapping, room-/capabilitymodel en volledige GUI-configuratie

- **Epic:** GUI-config
- **Status:** Klaar
- **Afgerond via:** `v0.2.0-alpha.1`

Versioned JSON Schema, defaults, grafische strategy-editor met native selectors, migratieharnas en minimale Community-dashboardregistratie.

### HD-003 — Custom dashboard strategy, tokens, HA-shellgrens en navigatie

- **Epic:** Shell & navigatie
- **Status:** Klaar
- **Afgerond via:** `v0.3.0-alpha.1`

`custom:home-dashboard` strategy, vijf native Sections-views (Home, Kamers, Energie, Domeinen, Meer), routes en theme tokens binnen de gewone HA-sidebar.

### HD-004 — Home, person cards en contextuele waarschuwingen

- **Epic:** Home & security
- **Status:** Klaar
- **Afgerond via:** `v0.4.0-alpha.1` → `v0.8.0-alpha.13` (iteratief verfijnd)

Aandacht, Vandaag, privacyveilige person cards en een camerastrook met privacystand en alarmstatus; later verfijnd met vaste kamerbediening, gedeelde navigatie en de gekleurde Home-header (D-018, D-019, D-041–D-049).

### HD-005 — Volledig Kamers-overzicht, kamermodel en kamerpagina's

- **Epic:** Kamers
- **Status:** Klaar
- **Afgerond via:** `v0.5.0-alpha.1` → `v0.8.0-alpha.9`

Floor-gegroepeerd overzicht en room-detailsubviews; later uitgebreid met vaste, opt-in directe kamerbediening met confirmations en capabilitygating (D-028, D-039, D-040, D-043, D-044).

### HD-006 — Volledige Energie-hoofdview en woningbrede domeinpagina's

- **Epic:** Energie en domeinen
- **Status:** Klaar
- **Afgerond via:** `v0.6.0-alpha.1`

Standaard HA Energy-pariteit plus lokale piek/EV/UPS/fase-uitbreiding en gecureerde domeinpagina's.

### HD-007 — Kia-integratie

- **Epic:** Specialisten
- **Status:** Klaar
- **Afgerond via:** `v0.7.0-alpha.1`

Native Kia-summary, resourcecheck en de volledige bestaande Kia-card op `specialist-kia`.

### HD-008 — Zelfstandige 3D-printerspecialist

- **Epic:** Specialisten
- **Status:** Klaar
- **Afgerond via:** PR #39 · `v0.8.0-alpha.11` / `v0.8.0-alpha.12`

Samenvatting, detailpagina en foutstatus voor de 3D-printer — buiten de oorspronkelijke roadmap (Kia/robot/tuin/zwembad) om toegevoegd. [HD-200](#hd-200--3d-printerspecialist-contract-productiegate-en-documentatiereconciliatie) legt de ontbrekende decision-log-/roadmapreconciliatie en productiegate alsnog vast.

### HD-009 — Read-only zwembadsamenvatting

- **Epic:** Specialisten
- **Status:** Klaar
- **Afgerond via:** PR #41 · `v0.8.0-alpha.11`

Eerste, read-only zwembadsamenvatting. De volledige specialistische kaart volgt via [HD-151](#hd-151--zelfstandige-pool-dashboard-card-bouwen)/[HD-152](#hd-152--volledige-zwembadkaart-centraal-integreren).

### HD-010 — Consistente navigatie, lokale kiosk en gekleurde Home-header

- **Epic:** Shell & navigatie
- **Status:** Klaar
- **Afgerond via:** PR #40 · `v0.8.0-alpha.9` / `.10` / `.13`

Eén gedeeld navigatieframe op alle hoofdviews, een lokale kiosk-adapter zonder globale resourcewijziging, native configuratie-ingang en de gekleurde Home-header met statuschips (D-046–D-049).

### HD-101 — Room-card overhaul afronden

- **Epic:** Kamers
- **Status:** Klaar
- **Prioriteit:** P0
- **Omvang:** M
- **Eigenaar:** Rooms-agent
- **Afhankelijkheden:** geen; actieve branch `codex/room-card-overhaul`

**Doel**

De lokale room-cardwijzigingen afronden zonder de bestaande actiescope, confirmations, navigatiegeometrie of mobiele dekking te beschadigen.

**Scope**

- Capabilitykaarten, directe bediening en statuspresentatie in het kamerdetail.
- Expliciete verlichtingsswitches naast lichtentiteiten.
- Browsercheck voor desktopkolommen, mobiele leesvolgorde, missing en unavailable.
- Reproduceerbare bundle bijwerken.

**Acceptatiecriteria**

- Directe controls sturen uitsluitend expliciet gekozen kamerdoelen.
- Smart plugs, covers en luifels behouden hun bestaande veiligheidsfrictie.
- Normal, warning, missing en unavailable zijn in fixtures/tests afgedekt.
- Navigatieframe en buttonposities blijven invariant.
- Gegenereerde renders zijn visueel beoordeeld op clipping, focus, leesvolgorde en contrast.

**Validatie**

- `pnpm test` en `git diff --check`.
- `scripts/check-room-detail-browser.mjs`.
- `scripts/check-navigation-browser.mjs`.
- `scripts/render-room-controls.mjs` naar een gitignored verificatiemap.

**Resultaat 22 september 2026**

- 83 tests, reproduceerbare bundle en repositorychecks groen.
- Room-detailbrowsermatrix groen voor normal, dark, warning, missing en unavailable op 1440, 1024 en 390 px.
- Navigatiegeometrie invariant over zeven routes en drie breedtes.
- Dertien verificatierenders visueel beoordeeld; de tabletindeling is aangepast zodat capabilities de volle breedte gebruiken en secundaire kolommen gebalanceerd blijven.
- Geen commit, push, PR, release of live Home Assistant-write uitgevoerd.

**Buiten scope**

Geen commit, push, PR, release of live Home Assistant-test zonder aparte toestemming.

---

### HD-102 — Room-card slice reviewen en releaseklaar maken

- **Epic:** Kamers
- **Status:** Klaar
- **Prioriteit:** P0
- **Omvang:** S
- **Eigenaar:** Lead / integrator
- **Afhankelijkheden:** HD-101

**Doel**

De afgeronde room-carddiff onafhankelijk reviewen en gereedmaken voor een expliciet releasebesluit.

**Scope**

- Security-, actionscope-, autorisatie-, accessibility- en regressiereview.
- Controle op onbedoelde schema- of migratiewijzigingen.
- Releasechecklist, changelog en eventuele versie-impact bepalen.
- Volledigheid van tracked en untracked bestanden controleren.

**Acceptatiecriteria**

- Geen open P0/P1-reviewbevinding.
- De volledige patch bouwt schoon vanaf een verse `origin/main`-basis.
- Dist komt byte-voor-byte overeen met de schone build.
- Release- en rollbackscope zijn expliciet beschreven.
- De gebruiker kan afzonderlijk beslissen over commit, PR en prerelease.

**Validatie**

Volledige suite, `git diff --check`, onafhankelijke review en clean-patch rebuild.

**Resultaat 23 september 2026**

- Onafhankelijke review sloot alle eerdere P1-bevindingen en vond geen nieuwe P0/P1-blocker.
- De suite, typecheck, build, privacy-/repositorychecks en browsermatrices zijn groen; 85/85 tests slagen.
- De volledige binary patch bouwt op een verse `origin/main`-archive en levert byte-voor-byte dezelfde bundle van 213.998 bytes.
- Releasechecklist en changelog beschrijven de 215 kB-grens, lokale bewijslast, afzonderlijke live gate en rollbackscope.
- Geen commit, push, PR, prerelease, deployment of live Home Assistant-write uitgevoerd.

---

### HD-110 — Browserregressiematrix consolideren

- **Epic:** Quality engineering
- **Status:** Klaar
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Accessibility & visual-QA-agent
- **Afhankelijkheden:** HD-102

**Doel**

De losse browserchecks samenbrengen tot één gedocumenteerde matrix voor hoofdviews, kamerdetails, editor, navigatie en specialistviews.

**Scope**

- Desktop, tablet en 390×844.
- Light, dark en system; integrated, kiosk en native waar relevant.
- Normal, warning, missing en unavailable.
- Keyboard, focus, overflow, routeherstel en editorroundtrip.

**Acceptatiecriteria**

- Eén reproduceerbaar commando of een korte vaste commandoreeks voert de matrix uit.
- Iedere test noemt fixture, viewport en verwachte gate.
- Baselines worden niet blind vernieuwd.
- Een failure verwijst naar de betrokken view en statevariant.

**Validatie**

Matrix lokaal uitvoeren, resultaten samenvatten en bestaande browserchecks groen houden.

**Resultaat 23 september 2026**

- `pnpm run test:browser` voert de vijf bestaande browserflows serieel uit tegen één door de runner beheerde prototypeserver.
- Hoofd-, detail- en specialistroutes zijn groen op mobiel, tablet en desktop; light, dark, system, integrated, kiosk, native, normal, warning, missing en unavailable zijn volgens de gedocumenteerde matrix afgedekt.
- Failurecontext bevat de betrokken check, fixture/modus en viewport; gegenereerde screenshots blijven gitignored verificatiebewijs en worden niet als baseline goedgekeurd.
- De volledige suite blijft groen; na toevoeging van de release- en touchkwaliteitsgates slagen 88/88 tests en `git diff --check`.
- Geen live Home Assistant-test, deployment, commit, push, PR of prerelease uitgevoerd.

---

### HD-120 — Energy-paritymanifest actualiseren

- **Epic:** Energie en domeinen
- **Status:** Klaar
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Energy & domains-agent
- **Afhankelijkheden:** geen live write; read-only inventaris volstaat

**Doel**

De huidige Energie- en Domeinenimplementatie vergelijken met het vastgelegde standaard-HA-plus-lokaal paritycontract.

**Scope**

- Datum/vergelijking, usage, solar/forecast, kosten, gauges en Energy Sankey.
- Actuele Power Sankey, batterij, EV, UPS, fasewaarden, gas/water en apparaten.
- Configuratie-ingang en fallback naar het ingebouwde Energy-panel.
- Normal, missing, unavailable en stale per broncategorie.

**Acceptatiecriteria**

- Iedere vereiste categorie staat als gedekt, gedeeltelijk, geblokkeerd of niet van toepassing gemarkeerd.
- Geen live identifier komt in het manifest.
- Voor ieder gat bestaat een concrete vervolgactie of expliciete deferral.
- Dubbeltelling en upstream-apparaathiërarchie zijn beoordeeld.

**Validatie**

Fixturetests, configcoverage en documentreview tegen requirements en informatiearchitectuur.

**Resultaat 23 september 2026**

- `docs/quality/energy-parity-manifest.md` markeert iedere categorie als gedekt, gedeeltelijk of geblokkeerd/uitgesteld.
- De alpha-scope blijft read-only: actuele expliciete mappings, officiële Energy-cards en `/energy`-fallback zijn aanwezig.
- Actuele Power Sankey, stale-semantiek, upstreamhiërarchie en volledige kosten-/vergoedingpariteit zijn expliciet uitgesteld en worden niet geclaimd.
- Officiële Energy-totalen blijven leidend; lokale tiles worden niet tot een eigen totaal opgeteld.
- HD-121 bevat de afzonderlijke live paritygate.

---

### HD-150 — Zwembadstatusrandgevallen tegen de bron bevestigen

- **Epic:** Specialisten
- **Status:** Klaar
- **Prioriteit:** P1
- **Omvang:** S
- **Eigenaar:** Pool-bronagent
- **Afhankelijkheden:** alleen read-only brononderzoek

**Doel**

De eerder gevonden zwembadstatusrandgevallen vergelijken met de actuele integratiebron voordat een detailcardcontract wordt vastgezet.

**Scope**

Vrije tekststatus, heater uit, warmtepompfout, zoutsysteemfout, proxy offline, stale en gedeeltelijk unavailable.

**Acceptatiecriteria**

- Iedere toestand heeft een eenduidige bron, semantiek en prioriteit.
- Tegenstrijdige signalen krijgen een gedocumenteerde precedence-regel.
- Geen merkspecifieke aanname wordt zonder bronbewijs in het publieke contract geplaatst.
- Benodigde fixturegevallen voor HD-151 zijn vastgelegd.

**Validatie**

Bronverwijzingen en fictieve statevoorbeelden in een privacyveilig contractdocument.

**Resultaat 23 september 2026**

- Het contract is bevestigd tegen de zelfstandig geteste `pool`-bronkaart op commit `f622c19` en vastgelegd in `docs/quality/pool-status-contract.md`.
- Vrije tekst bepaalt geen centrale ernst; heater-off is normaal, required unavailable wint van foutsignalen en leesbare deelwaarden blijven zichtbaar.
- Zoutsysteemfout gebruikt een numerieke powermeting plus aan/uit-bron en drempel in plaats van een gefabriceerde binaire foutvlag.
- Stale, proxybetekenis en tijdvenster-gebaseerde zoutfout blijven expliciet geblokkeerd zonder nieuw broncontract.
- De centrale read-only samenvatting is aan dit contract aangepast; HD-151 blijft een afzonderlijke bronrepo-/releasegate.

---

## Geblokkeerd

### HD-111 — Live acceptatie van de actuele alpha

- **Epic:** Runtimeacceptatie
- **Status:** Geblokkeerd
- **Prioriteit:** P0
- **Omvang:** M
- **Eigenaar:** Lead + menselijke tester
- **Afhankelijkheden:** HD-102, expliciet goedgekeurd testdashboard, verse export/snapshot en targetallowlist

**Doel**

De actuele alpha op een afzonderlijk testdashboard valideren zonder het default `lovelace`-dashboard te wijzigen.

**Scope**

- Installatie/update, dashboardeditor, vijf routes en subviews.
- Room-cardgedrag, navigation/kioskherstel, Home-header en specialistische routes.
- Alleen vooraf goedgekeurde veilige testacties.
- Default-dashboardhash vóór en na vergelijken.

**Acceptatiecriteria**

- Alle checkliststappen hebben resultaat en bewijs zonder private identifiers of beelden.
- Default `lovelace` is aantoonbaar ongewijzigd.
- Servicefouten, unavailable en resourcefallbacks blijven herstelbaar.
- Iedere blocker krijgt een ticket onder HD-112.

**Validatie**

Ingevulde runtimechecklist, snapshotreferentie en geanonimiseerd resultaatdocument.

---

### HD-121 — Live Energie- en domeinpariteit valideren

- **Epic:** Energie en domeinen
- **Status:** Geblokkeerd
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Energy & domains-agent + menselijke tester
- **Afhankelijkheden:** HD-120 en menselijke runtimegate

**Doel**

Bewijzen dat de Energie-view voor de goedgekeurde testconfig niet informatiearmer is dan het ingebouwde Energy-dashboard en dat domeinroutes bruikbaar blijven.

**Acceptatiecriteria**

- Iedere geconfigureerde paritycategorie is zichtbaar, correct of bewust als fallback gemarkeerd.
- Datum-/collectionsemantiek en kosten-/vergoedingpresentatie kloppen.
- Mobiel en desktop hebben gelijke functionele dekking.
- Geen ongeautoriseerde of impliciete servicecall.

**Validatie**

Geanonimiseerd parityresultaat en runtimechecklist op het goedgekeurde testdashboard.

---

### HD-130 — Robot-bronrepo door de productiepoort brengen

- **Epic:** Specialisten
- **Status:** Geblokkeerd
- **Prioriteit:** P1
- **Omvang:** L
- **Eigenaar:** Robot-bronagent
- **Afhankelijkheden:** afzonderlijke scope in de robotrepository

**Doel**

De robotcard veilig en efficiënt genoeg maken voor volledige integratie.

**Scope**

- Relevante-state gating en cleanup.
- Zichtbare servicefouten en herstelpad.
- Missing map/camera en unsupported zones.
- Confirmations, mobiel, focus, toetsenbord en screenreaderlabels.

**Acceptatiecriteria**

Alle vijf productiegates uit de integratiestrategie zijn met bronrepo-tests bewezen en er is een geteste releaseversie.

**Validatie**

Bronrepo-suite, mobiele browserchecks en releasebewijs. Productcode blijft in de bronrepo.

---

### HD-131 — Robot centraal integreren

- **Epic:** Specialisten
- **Status:** Geblokkeerd
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Specialist-agent
- **Afhankelijkheden:** HD-130

**Doel**

Een native robotsamenvatting, stabiele detailroute en veilige resourcefallback aan `home-dashboard` toevoegen.

**Acceptatiecriteria**

- Home/Domeinen tonen uitsluitend compacte status en navigatie.
- `specialist-robot` rendert de externe card full-width.
- Missing resource, stale, unavailable, mapfout en servicefout blokkeren andere routes niet.
- Geen robotlogica wordt naar de centrale bundle gekopieerd.

**Validatie**

Schema/editorcoverage, strategytests, browsermatrix en compatibilitydocumentatie.

---

### HD-140 — Tuincard-contract en bronrepo valideren

- **Epic:** Specialisten
- **Status:** Geblokkeerd
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Garden-integratieagent
- **Afhankelijkheden:** read-only audit kan starten; bronfixes vereisen afzonderlijke repo-scope

**Doel**

Vaststellen of de actuele tuincard voldoet aan mapping-, fout-, confirmation-, focus- en relevante-statecontracten.

**Acceptatiecriteria**

- Normal, droge zones, actieve irrigatie, fout en unavailable zijn aantoonbaar afgedekt.
- Een aggregaatbron wordt niet in de frontend berekend.
- Irrigatie blijft detail-only en bevestigd.
- Eventuele bronrepo-gaten zijn als afzonderlijke tickets beschreven.

**Validatie**

Bronreview, bestaande tests en een geanonimiseerd compatibilityrapport.

---

### HD-141 — Tuin centraal integreren

- **Epic:** Specialisten
- **Status:** Geblokkeerd
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Specialist-agent
- **Afhankelijkheden:** HD-140

**Doel**

De tuinsummary, `specialist-garden` en veilige resourcefallback implementeren.

**Acceptatiecriteria**

- Summary toont hoogstens droge-zonecount, actieve irrigatie, fout en relevante batterijstatus.
- De volledige externe card staat alleen op de detailroute.
- Geen veiligheidsdrempel of irrigatielogica wordt centraal gedupliceerd.
- Missing/unavailable en unsupported acties hebben duidelijke fallbacks.

**Validatie**

Config-, strategy-, browser- en integrationtests plus compatibilityupdate.

---

### HD-151 — Zelfstandige pool-dashboard-card bouwen

- **Epic:** Specialisten
- **Status:** Geblokkeerd
- **Prioriteit:** P1
- **Omvang:** XL
- **Eigenaar:** Pool-bronagent
- **Afhankelijkheden:** HD-150 en goedgekeurde nieuwe bronrepo-/releasegrens

**Doel**

Een onafhankelijk geversioneerde `custom:pool-dashboard-card` maken voor waterkwaliteit, installatiebediening, energie, historie en diagnostics.

**Acceptatiecriteria**

- Normal, warning, critical, missing, unavailable en stale zijn afgedekt.
- Riskante of kostbare acties hebben confirmation, vaste scope en foutfeedback.
- Relevante-state gating, cleanup, `getGridOptions()` en responsive light/dark zijn aanwezig.
- Focus, toetsenbord, screenreader en 390×844 zijn gevalideerd.
- De card heeft een eigen configuratiecontract, tests en HACS-release.

**Validatie**

Volledige bronrepo-suite, browsermatrix en gepubliceerde compatibilitygegevens.

---

### HD-152 — Volledige zwembadkaart centraal integreren

- **Epic:** Specialisten
- **Status:** Geblokkeerd
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Specialist-agent
- **Afhankelijkheden:** HD-151

**Doel**

De huidige read-only zwembadsamenvatting laten doorlinken naar de onafhankelijke volledige kaart met versie- en resourcefallback.

**Acceptatiecriteria**

- `specialist-pool` rendert de externe card full-width.
- De bestaande summary en configuratie migreren zonder dataverlies.
- Versiemismatch, ontbrekende resource en incomplete mapping tonen een veilige fallback.
- Geen zwembadserviceflow wordt centraal gekopieerd.

**Validatie**

Migratie-, schema-, strategy-, browser- en integrationtests.

---

### HD-160 — Specialistische runtimeacceptatie uitvoeren

- **Epic:** Specialisten
- **Status:** Geblokkeerd
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Specialist-agent + menselijke tester
- **Afhankelijkheden:** HD-131, HD-141, HD-152 of expliciet goedgekeurde deferrals; menselijke runtimegate

**Doel**

Kia, 3D-printer, robot, tuin en zwembad in de echte testomgeving valideren tegen hun compatibilitycontract.

**Acceptatiecriteria**

- Summary en detail spreken elkaar niet tegen.
- Resource-, mapping-, stale- en unavailable-fallbacks werken per specialist.
- Externe acties blijven eigendom van de broncard en volgen haar veiligheidscontract.
- Mobiel, wandtablet, desktop, light en dark zijn beoordeeld.

**Validatie**

Geanonimiseerde specialistische runtimechecklist zonder private mappings, locaties of beelden.

---

### HD-190 — Testmigratie en rollback bewijzen

- **Epic:** Migratie
- **Status:** Geblokkeerd
- **Prioriteit:** P0
- **Omvang:** L
- **Eigenaar:** Lead + migratieagent
- **Afhankelijkheden:** QA, performance, resource-audit en relevante runtimegates groen; HD-201 groen; expliciete menselijke toestemming

**Doel**

De releasecandidate veilig op een nieuw testdashboard plaatsen en herstel uit een verse snapshot aantonen.

**Acceptatiecriteria**

- Exact dashboardtarget en allowlist zijn vooraf goedgekeurd.
- Default-hash is vóór en na identiek.
- Alle routes, fallbacks en goedgekeurde testacties zijn gesmoked.
- Rollback is daadwerkelijk geoefend en gedocumenteerd.
- Geen globale resource wordt verwijderd.

**Validatie**

Stagingrunbook, smokebewijs, hashvergelijking en rollbackresultaat.

---

### HD-191 — Gezinsacceptatie en productiecutover

- **Epic:** Migratie
- **Status:** Geblokkeerd
- **Prioriteit:** P0
- **Omvang:** L
- **Eigenaar:** Lead + eigenaar/gezin
- **Afhankelijkheden:** HD-190 en aparte productiegoedkeuring

**Doel**

Een gecontroleerde productiecutover uitvoeren nadat dagelijks gebruik, accessibility, performance en herstel zijn geaccepteerd.

**Acceptatiecriteria**

- Gezinsacceptatie dekt primaire dagelijkse taken op telefoon en wanddisplay.
- Cutovervenster, verantwoordelijke en rollbacktrigger zijn vooraf bepaald.
- Productieconfig en artifacts komen uit de goedgekeurde commit/release.
- Default- en legacyresources worden niet buiten het goedgekeurde plan gewijzigd.
- Na cutover zijn rooktest en rollbackbesluit vastgelegd.

**Validatie**

Ondertekende go/no-go, productiesmoke en post-cutoverstatus. Uitvoering vereist altijd een nieuwe expliciete toestemming.
