# Changelog

## 0.8.0-alpha.30 — 2026-10-07

Documentatie-only release: geen functionele wijziging aan de dashboardstrategy of de editor.

- HD-111's live acceptatieronde vastgelegd: een echte apparaatbediening (kamer "Bureau") geslaagd, de volledige live 19-kamer-configuratie zonder schema- of semantische fouten gevalideerd, default `lovelace` bevestigd ongewijzigd. Zie het [resultaatdocument](docs/releases/results-hd111-live-acceptance.md).
- HD-218 geopend: HACS volgde voor de tweede keer `main` in plaats van een gepinde releasetag (zelfde regressieklasse als D-069/HD-180). Deze release pint de installatie opnieuw correct en brengt `main` en de getagde release weer in lijn, zodat HACS niet langer een update toont die er eigenlijk geen is.

## 0.8.0-alpha.29 — 2026-10-07

Eén ticket (HD-216), gevonden tijdens een live configuratiesessie met 20 echte kamers.

- **Performance: de GUI-editor's Kamers-sectie mountte voorheen de volledige veldenset van élke kamer bij elke render, open of dicht (HD-216, D-071).** Bij 20 kamers betekende dit honderden gelijktijdig gemonteerde `ha-selector`-instanties, ervaren als onbruikbaar traag. Een gesloten kamer rendert nu alleen haar titel; volledige velden worden pas gemount wanneer die kamer daadwerkelijk open staat.
- **Nieuw: zoekveld boven de kamerlijst.** Filtert kamers op naam, sleutel of area zonder zelf te her-renderen — direct een specifieke kamer terugvinden tussen 20 stuks.
- **Nieuw: smart-plug-koppelhulp.** Herkent een schakelaar + zijn vermoedelijke vermogens-/energie-/spanningssensor binnen een kamer's eigen "Apparaten en power"-lijst (naamstam-gelijkenis) en biedt een knop om ze met één klik te koppelen tot een smart-plug-kaart — geen dubbel handwerk meer om beide entiteit-ID's apart in te typen. De knop benoemt altijd expliciet wat hij verplaatst.
- Editorbundel 95 kB → 97 kB, ruim binnen het bestaande budget van 160 kB (D-055). Hoofdbundel ongewijzigd.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.29.md). Live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate; deze release wijzigt alleen de lokale GUI-editor, geen enkele runtime-kaart of service-aanroep.

## 0.8.0-alpha.28 — 2026-10-05

Bundelt vier afgeronde tickets sinds alpha.27 in één release, alle vier gevonden tijdens alpha.27's eigen HD-171/HD-201-rondes.

- **Nieuw: privacy-actieknop op de camerastrook (HD-214).** `ActionConfig`/`CameraConfig.privacy_action_key` waren volledig gedefinieerd, GUI-editable en schema-gevalideerd, maar werden door geen enkele kaart ooit gelezen of uitgevoerd — een geconfigureerde privacyactie had geen enkel effect. De camerastrook's privacystatuschip wordt nu een echte knop wanneer privacy actief is en een geldige gekoppelde actie bestaat; bevestiging is vereist zodra de camera dat vraagt of de actie risicovol is. **Voert bij bevestiging een echte Home Assistant-service-aanroep uit — vereist live verificatie, zie onder.**
- **Performance: Home/Energie/pool-specialist schrijven niet langer onvoorwaardelijk naar de DOM bij elke irrelevante update (HD-213).** Elke schrijfactie wordt nu eerst tegen de huidige weergegeven waarde vergeleken. Gemeten op 500 irrelevante updates: Home 32.000 → 2.000 mutaties (-94%), Energie en de poolspecialist 100% naar nul. Geen wijziging aan wélke waarden getoond worden.
- **Performance: printersamenvatting rendert niet langer onvoorwaardelijk bij elke `hass`-toewijzing (HD-211).** Een nieuwe stabiele sleutel over de zeven relevante entiteiten bepaalt of een her-render nodig is.
- **Kwaliteit: `mountCard()`'s resourcefallback nu daadwerkelijk door een test afgedekt (HD-212).** Het bestaande `"Kaart niet beschikbaar."`-catchpad (gedeeld door de LINAK-bureaucard en history-graph) werd nooit uitgeoefend door een test; twee nieuwe browserscenario's bewijzen nu beide faalmodi.
- **Interne opschoning:** `perform()`'s inline bevestigingscontrole in de kamerbediening is gededupliceerd naar de al-geteste `executeEntityControl()` — geen gedragswijziging, wel één bron van waarheid minder om uit elkaar te laten lopen.
- Hoofdbundelbudget 213 kB → 215 kB (gemeten 214.427 bytes) voor de echte uitvoering van HD-214.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.28.md). Live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate — deze release voegt voor het eerst een knop toe die zelf een service-aanroep uitvoert buiten de al bestaande kamerbediening om.

## 0.8.0-alpha.27 — 2026-10-05

Bundelt zeven afgeronde tickets sinds alpha.26 in één release.

- **Beveiligingsfix (HD-201):** de camerastrook toonde alsnog het live beeld wanneer een privacy-entiteit naar `unavailable`/`unknown` viel (bv. tijdens een Zigbee-/Z-Wave-uitval of HA-herstart) — exact hetzelfde resultaat als een bevestigde "privacy uit". Dit is nu gefixt: een geconfigureerde privacy-entiteit die niet bevestigd `off`/`false` is, faalt dicht (toont de privacy-placeholder) in plaats van open. Eerste volledige productaudit over privacy en beveiliging uitgevoerd over het hele samengevoegde product (alle hoofdviews, kamerdetails, Energie/Domeinen, alle specialistviews); verder geen open P0/P1-bevindingen. Twee kleinere, niet-blokkerende bevindingen apart vastgelegd (HD-214; printerwebcam-gating beoordeeld als bewuste productkeuze). Zie `docs/quality/privacy-security-audit.md`.
- **Nieuw: echte HA-statistics/history/logbook-data (HD-205).** De Verbruik-tab krijgt een echt dagstaafdiagram per apparaat (`recorder/statistics_during_period`). De Historie-tab is herbouwd van een per-entiteit dialoog naar een volwaardig tabblad met een temperatuur-/luchtvochtigheidslijngrafiek en een strikt tot de kamer beperkt gebeurtenissenlogboek (max 50 events, nooit woningbreed). Hoofdbundelbudget 210 kB → 213 kB.
- **Nieuw: performancebaseline en budgetten (HD-171).** Eerste echte meting van DOM-grootte, long tasks, koude/warme parse/eval en rerendercost over Home/Kamers/kamerdetail/Energie/specialistviews, met budgetten afgeleid van echte metingen. Eén bevinding (Home/Energie/pool herschrijven DOM onvoorwaardelijk bij irrelevante updates) apart vastgelegd als HD-213, niet in deze release gefixt.
- **Nieuw: multi-dashboard resource-audit (HD-172).** Alle 48 globale Lovelace-resources geïnventariseerd over alle zes dashboards op de instantie; 8 resources zonder bevestigde consument expliciet gemarkeerd als blokkerend voor verwijdering. `integration-strategy.md`'s verouderde "52 resources" gecorrigeerd.
- **Documentatie ingehaald:** de 3D-printerspecialist (HD-200) en de LINAK-bureaucard (HD-203) waren allebei al geleverd zonder decision-logregel of vermelding in de designbaseline — nu retroactief vastgelegd als eersteklas- resp. lichtere-categorie-specialisten.
- **Drie kleine Control Deck-fixes (HD-207):** de Smart-plugs-stagebadge degradeerde niet wanneer alleen een plug's energiesensor unavailable was; een comfort-/energie-only kamer toonde een lege, hangende tellinglabel in de deck-head; een screenshot-evidencebestand werd per ongeluk overschreven door een latere testfixture.
- Vier kleine vervolgtickets gevonden tijdens deze ronde (HD-211/212/213/214), geen van alle blokkerend, apart vastgelegd voor later.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.27.md). Live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate.

## 0.8.0-alpha.26 — 2026-10-02

- Het herhaaldelijk opgetrokken bundlebudget (245 kB → 254 kB → 258 kB → 260 kB over vier Control Deck-tickets) is structureel opgelost in plaats van opnieuw verhoogd: de configuratie-editor (`src/editor/home-dashboard-editor.ts` + `fields.ts`) is uitgesplitst naar een eigen, zelfstandige bundle (`dist/home-dashboard-editor.js`), die pas on-demand geladen wordt wanneer iemand de dashboardconfiguratie daadwerkelijk opent. `HomeDashboardStrategy.getConfigElement()` is nu asynchroon en haalt de editor dan pas op via een dynamische import — Home Assistants eigen `hui-element-editor.ts` await't dit al voor elke strategy-editor, dus dit is bevestigd bestaand HA-gedrag, geen aanname.
- Twee ontwerpen gemeten vóór de keuze: esbuild `splitting: true` gaf een kleinere hoofdbundel (165 kB) maar met een gedeelde chunk (39,5 kB) die de hoofdbundel nog altijd eager importeert — vrijwel dezelfde downloadkost (204,8 kB) als twee volledig zelfstandige bundles, met een slechter faalgedrag. Gekozen: twee zelfstandige bundles, zodat een verouderd of ontbrekend editorbestand na een upgrade hoogstens de editor breekt, nooit het volledige dashboard.
- De hoofdbundel-grens daalt van 260 kB naar **210 kB** (uitgebrachte kandidaat: 204.856 bytes). De editor krijgt een eigen, ruimer budget van 160 kB (uitgebrachte kandidaat: 93.887 bytes).
- HACS' downloadbronlogica rechtstreeks nagelezen: voor deze plugin-repo (vastgezet op een releasetag) haalt HACS alle release-assets op, niet enkel het `hacs.json`-bestand — de releaseworkflow geeft de nieuwe editor-bundle en checksum daarom mee in de asset-lijst.
- Geen regressie op awning-confirmation, plug-tweestapsbevestiging, de HD-206/208-statuslogica of de HD-209-fotoflow (geverifieerd: geen wijzigingen in die bestanden t.o.v. alpha.25).
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.26.md). Live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate.

## 0.8.0-alpha.25 — 2026-10-01

- Een kamerfoto kan nu rechtstreeks geüpload worden vanuit de kamereditor, via Home Assistants native media-selector (`image_upload`) — geen HA-hulpmiddel meer nodig vooraf. De bestaande `image_entity`-koppeling blijft gewoon werken; is beide geconfigureerd, dan krijgt de upload voorrang, met terugval naar `image_entity` en daarna de bestaande placeholder.
- Drie bugs gevonden en opgelost tijdens adversariale review: de foto laadde nooit echt in een live sessie (Lovelace's `setConfig`-vóór-`hass`-volgorde werd verward met "definitief niet beschikbaar"), een opgeloste foto bleef onzichtbaar voor schermlezers (`aria-hidden` niet opgeruimd), en een eerste validatorfix was te breed (verzwakte verplichte-veldcontrole voor élk schemaveld) — opgelost bij de bron door het nieuwe veld een écht afwezige sleutel te laten zijn.
- Een nieuwe, echte browsertest bewijst de volledige levenscyclus: monteren zonder `hass`, daarna toewijzen en oplossen, plus een reconnect-scenario dat bevestigt dat een eerdere afwijzing een latere nieuwe poging niet blokkeert.
- De minified bundel blijft binnen een nieuw opgetrokken grens van 260 kB (D-054, de vierde verhoging in deze tickets-familie); de uitgebrachte kandidaat gebruikt 259.642 bytes.
- De exacte vorm van de onderliggende `media_source/resolve_media`-respons kon niet tegen een echte Home Assistant-instantie geverifieerd worden; dit blijft een openstaand aandachtspunt voor de live testdashboardgate.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.25.md). Live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate.

## 0.8.0-alpha.24 — 2026-10-01

- Verwijdert betekenisloze tekst die de eigenaar op een live screenshot aanwees: de stage-header herhaalde de kamernaam en toonde een statische, niet-informatieve omschrijving per functie; de hero-ondertitel voegde evenmin iets toe. Beide zijn weg — alleen de echte statusbadge/-notitie blijven.
- Control Deck krijgt een echte kaartomkadering (rand, radius, schaduw, achtergrond) zodat rail en actieve functie-inhoud als één kaart ogen, zoals in de v3-mockup.
- Kamerverbruik combineert voortaan daadwerkelijk alle geconfigureerde verbruikers: smart plugs én de generieke apparatenlijst (bv. een airco) tellen samen op wanneer er geen kamerbrede meter is, met deduplicatie en een strikte W/kW-check. Is er wel een kamermeter geconfigureerd, dan blijft die gezaghebbend zonder dubbeltelling — hetzelfde cijfer staat nu overal (rail, Smart-plugs-tab, Energie-tab).
- Editor: duidelijke hulptekst over het verschil tussen de generieke apparatenlijst en Smart plugs, en de plugvelden gegroepeerd onder "Basis"/"Energieperiodes" in plaats van één lange lijst.
- Twee reviewrondes losten op: een stilzwijgend wegvallend verbruikscijfer op de Energie-tab bij een combinatie van smart plugs en een generiek apparaat. Awning-confirmation, plug-tweestapsbevestiging en toetsenbordnavigatie zijn ongewijzigd.
- De minified bundel blijft binnen de bestaande 258 kB-grens (D-053); de uitgebrachte kandidaat gebruikt 257.796 bytes (204 bytes marge — zeer krap).
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.24.md). Live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate.

## 0.8.0-alpha.23 — 2026-09-30

- Voegt de omkadering rond de Control Deck-rail toe die alpha.22 oversloeg: een deck-head boven de rail (kamernaam + telling van werkelijk geconfigureerde lampen/openingen/plugs), een gedeelde stage-head bovenaan elke functie (titel, omschrijving, statusbadge), iconen en een statusregel per rail-knop, en een rijkere hero met meerdere statuspillen plus een neutrale placeholder-illustratie zonder kamerfoto.
- De statusbadge heeft drie tonen — Beschikbaar, Aandacht (hergebruikt de bestaande waarschuwingslogica) en Deels niet beschikbaar — en verdwijnt volledig in plaats van een verzonnen "Beschikbaar" te tonen wanneer een functie wel geconfigureerd is maar niets controleerbaars heeft.
- Twee reviewrondes losten op: een vals-positieve badge bij een energiebron buiten de gecontroleerde lijst, de ontbrekende Aandacht-toon, een stilzwijgend wisselend cijfer in de energie-rail-samenvatting bij een unavailable bron, en rail-tellingen die unavailable apparaten als "uit" telden. Awning-confirmation, plug-tweestapsbevestiging en toetsenbordnavigatie zijn ongewijzigd (byte-identiek aan alpha.22).
- De minified bundlegrens stijgt van 254 kB naar 258 kB (D-053); de uitgebrachte kandidaat gebruikt 256.821 bytes. Drie kleine, niet-blokkerende hiaten (plugs-energiebadge, lege deck-head-telling bij comfort/energie-only kamers, screenshot-volgorde) staan als HD-207 in de backlog.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.23.md). Live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate.

## 0.8.0-alpha.22 — 2026-09-29

- Herstructureert het Control Deck-kamerdetail naar de op 24 september 2026 afgetikte v3-ontwerpstudie: de capabilityrail (Verlichting, Rolluiken/Luifel & screens, Comfort, Smart plugs, Verbruik) is nu de hoofdnavigatie en toont telkens één geïsoleerde stage. De "Bediening"-tab uit alpha.21 verdwijnt; het Details-blok (Apparaten/Energie/Historie) blijft eronder.
- Individuele lampen krijgen een dimslider (bevestigd op `change`, niet bij elke sleepbeweging); lichtgroepen tonen visueel onderscheid tussen actief/gedeeltelijk/uit.
- Openingen krijgen een samenvattingsstrip en een positiebalk per item; smart plugs krijgen een samenvattingsstrip en een dag/maand/jaar-metricsgrid. De awning-confirmation- en plug-tweestapsbevestigingslogica zijn ongewijzigd (byte-identiek aan alpha.21).
- Comfort consolideert klimaat, media, veiligheid, camera's en de bureaukaart in één stage, zonder capabiliteitsverlies. Verbruik hergebruikt de bestaande energieweergave in plaats van een nieuwe, dubbele samenvatting; Historie behoudt voorlopig de native `history-graph`-fallback.
- De minified bundlegrens stijgt van 245 kB naar 254 kB (D-052); de uitgebrachte kandidaat gebruikt 251.696 bytes.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.22.md). Live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate.

## 0.8.0-alpha.21 — 2026-09-28

- Introduceert het capability-gedreven Control Deck voor kamerdetails: vaste functierail, Bediening/Apparaten/Energie/Historie-tabs en één eigenaar voor historie.
- Voegt expliciete lichtgroepen, getypeerde rolluiken/screens/luifels, beschermde smart plugs en dag-/maand-/jaarenergie toe zonder area-expansie of impliciete actiedoelen.
- Breidt schema v1, migratie, semantische validatie en de grafische kamereditor compatibel uit; bestaande mappings blijven opt-in en verliesvrij.
- Fix: een luifel (`kind: "awning"`) kon met `confirmation: "none"` zonder bevestiging openen/sluiten. Bevestiging is nu afgedwongen voor elke luifel, zowel bij het renderen als bij het opslaan van de configuratie (`awning_confirmation_required`). Gevonden tijdens de onafhankelijke pre-mergereview; dit was de reden om alpha.20 niet zelf te taggen en direct door te schuiven naar deze release.
- De fictieve browsermatrix dekt normal, warning, missing, unknown en unavailable op mobiel, tablet en desktop. De minified bundlegrens stijgt gemeten van 215 kB naar 245 kB; de uitgebrachte kandidaat gebruikt 244.397 bytes (603 bytes marge — zie HD-171 voor het aandachtspunt richting de volgende specialistintegraties).
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.21.md). Live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate.

## 0.8.0-alpha.19 — 2026-09-24

- Publiceert de via PR #47 gevalideerde room-detailkandidaat met de compacte brede layout, expliciete verlichtingsswitches en de bijbehorende browser- en releasegates.
- Behoudt de alpha.18-actionscope en runtimeveiligheid; live Home Assistant-acceptatie bleef een afzonderlijke menselijke gate.

## 0.8.0-alpha.18 — 2026-09-17

- Kamerdetail gebruikt op brede schermen opnieuw een compacte driekolomscompositie: bediening/safety/camera's, comfort/historie en energie/smart plugs/bureau. Tablet geeft de capabilities eerst de volle breedte; mobiel stapelt dezelfde groepen zonder een tweede bedieningspad.
- Kamerverlichting accepteert nu optionele, expliciete `light_switch_entities`, zodat bijvoorbeeld een DreamView-switch naast lampen rechtstreeks bedienbaar is. Bestaande configuraties zonder die mapping blijven compatibel.
- De bewaakte bundlegrens stijgt beperkt van 212 kB naar 215 kB: `origin/main` bouwt reproduceerbaar tot 211.963 bytes; de extra ruimte is uitsluitend voor fail-closed serviceplanning, herhaalde confirmations, stale-callafhandeling en focusherstel.
- [Vorige testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.18.md). Live Home Assistant-acceptatie bleef een afzonderlijke gate; die kandidaat is opgevolgd door alpha.19.

## 0.8.0-alpha.17 — 2026-09-17

- Kamerdetail: bedienbare, expliciet gemapte verlichting, media, klimaat en covers staan rechtstreeks op de pagina. Coverbewegingen vereisen een inline tweede bevestiging; Stop blijft onmiddellijk beschikbaar.
- Smart plugs tonen status en gemapte energiebronnen; aan- of uitschakelen vereist ontgrendelen en vervolgens een expliciete bevestiging. De detailpagina gebruikt daarvoor beperkte Home Assistant-servicecalls voor het exact gemapte doel.
- Kamerdetails behouden comfort, veiligheid, camera's en bestaande energiebronnen als read-only statusblokken. Historie opent een native `history-graph`-dialoog; optionele kamerfoto's en een bestaande `custom:linak-desk-card` kunnen per kamer worden gemapt.
- De LINAK-kaartresource wordt niet meegeleverd of automatisch toegevoegd; de gebruiker beheert deze externe resource zelf.

## 0.8.0-alpha.16 — 2026-09-15

- Kamers: iedere detailpagina begint met een compact, capability-gedreven operationeel overzicht voor comfort, verlichting, openingen, media, sensoren en veiligheid. Alleen geconfigureerde bronnen worden getoond; warning, missing en unavailable blijven expliciet herkenbaar.
- Kamerdetail groepeert vervolginformatie in duidelijke domeinblokken en gebruikt op brede schermen een gebalanceerde hoofd-/zijkolom. Op mobiel blijft het overzicht compact en stapelen de blokken zonder clipping of overlap.
- De bediening blijft beperkt tot standaard Home Assistant-detailvensters; deze release voegt geen servicecalls, configuratiewrites, dependencies of autorisatiepaden toe.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.16.md). Live Home Assistant-acceptatie blijft een afzonderlijke gate; deze release voert geen deployment uit.

## 0.8.0-alpha.15 — 2026-09-14

- Home: navigatie, datum/begroeting en statuschips vormen op voldoende brede kaarten één horizontale, gekleurde header. Op kleinere kaartbreedtes blijft dezelfde header overzichtelijk onder elkaar staan.
- De Home-view levert één samengestelde section; hierdoor bestaat er geen Lovelace-section-gap meer tussen navigatie en context. Native modus behoudt de zelfstandige Home-header.
- Browserregressie controleert brede uitlijning, mobiel stapelen, overflow en collisions voor geïntegreerde en kioskmodus. Geen configuratievelden, dependencies, acties of autorisatiepaden gewijzigd.

## 0.8.0-alpha.14 — 2026-09-14

- Home: compactere aansluiting tussen navigatie en begroeting (8 px bovenruimte, 16 px onderruimte); omgebroken statuschips duwen de begroeting niet meer omlaag. Native modus behoudt de zelfstandige header.
- Herstelt een ontbrekend sluithaakje in de mobiele Home-CSS waardoor volgende responsive regels werden genegeerd. Het browserharnas gebruikt nu dezelfde sectieafstand als de alpha.13-aansluiting.

## 0.8.0-alpha.13 — 2026-09-14

- Fix: op Home bleef een zichtbare lijn staan tussen de navigatiebalk en de gekleurde header eronder. Oorzaak: de "join"-CSS trok de header met een vast getal (-16px) omhoog om de ruimte tussen de twee Lovelace-sections te overbruggen, maar live Home Assistant gebruikt daarvoor `--ha-view-sections-row-gap` (standaard 24px), niet 16px. De header verwijst nu naar die daadwerkelijke HA-variabele (`margin-top:calc(-1 * var(--ha-view-sections-row-gap,24px))`), inclusief eventuele thema-aanpassingen daarvan.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.13.md). Live Home Assistant-acceptatie blijft een afzonderlijke gate; deze release voert geen deployment uit.

## 0.8.0-alpha.12 — 2026-09-14

- Fix: de 3D-printerspecialist toonde per abuis haar volledige samenvattingskaart rechtstreeks op Home (eigen sectie) en op Domeinen (in de "Systeem"-sectie), in plaats van via een klein navigatieknopje zoals Kia, robot, tuin en zwembad. Printer krijgt nu dezelfde behandeling: een navigatietegel (met live status op Domeinen) die doorverwijst naar de bestaande `specialist-printer`-detailpagina.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.12.md). Live Home Assistant-acceptatie blijft een afzonderlijke gate; deze release voert geen deployment uit.

## 0.8.0-alpha.11 — 2026-09-14

- Nieuwe 3D-printerspecialist: read-only samenvatting (status, voortgang, resterende tijd, nozzle-/bedtemperatuur, optionele filamentwaarschuwing) op Home en Domeinen, met een volledige `specialist-printer`-detailpagina (printtaaknaam, laagteller, doeltemperaturen, laatste fout(code), multi-slot filamentstatus, camera en printtaak-preview). Zonder externe HACS-kaartafhankelijkheid — dit dashboardpakket registreert de samenvattingskaart zelf. Niet standaard ingeschakeld.
- Nieuwe zwembadspecialist: read-only samenvatting (status, water-/doel-/buitentemperatuur, optionele warmtepomp-/zoutsysteemfout) op Home en Domeinen, met een `specialist-pool`-route. Zonder externe HACS-kaartafhankelijkheid — dit dashboardpakket registreert de samenvattingskaart zelf; een uitgebreidere detailpagina met losse entiteitstegels volgt later via een eigen kaart. Niet standaard ingeschakeld.
- Verhoogt het bewaakte minified bundlebudget van 198 kB naar 212 kB om beide nieuwe specialisten samen te dragen; geen van beide heeft een externe HACS-kaart om renderlogica naar uit te besteden. Reproduceerbaar gemeten en expliciet goedgekeurd — zie `scripts/verify-dist.mjs`.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.11.md). Live Home Assistant-acceptatie blijft een afzonderlijke gate; deze release voert geen deployment uit.

## 0.8.0-alpha.10 — 2026-09-14

- Herstelt de gekleurde Home-header onder de vaste navigatie. Datum en begroeting staan op brede schermen gecentreerd; de drie statuschips blijven rechts in dezelfde header en stapelen op mobiel.
- Behoudt de gedeelde navigatiegeometrie, kioskadapter, native configuratie-ingang en bestaande actiongates uit alpha.9.
- Breidt de fictieve browsermatrix uit met contrast-, uitlijnings- en containmentchecks voor de Home-header in normal, warning, missing, unavailable, light, dark, kiosk en native modus.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.10.md). Live Home Assistant-acceptatie blijft een afzonderlijke gate; deze release voert geen deployment uit.

## 0.8.0-alpha.9 — 2026-09-11

- Eén gedeelde navigatiebalk met vaste maat en knopposities op alle hoofdviews, kamerdetails en Kia; Home-context staat onder de balk.
- Kiosk verbergt de Home Assistant-header met een begrensde, opruimbare shelladapter, zonder extra kioskresource. Herstel via de navigatie of `?disable_km` blijft beschikbaar.
- Een beheerdersstandwiel opent de native dashboardeditor; onbekende editormarkup krijgt een zichtbare HA-balk en dashboardbeheerlink als fallback.
- De adapterbron, browserregressiecheck en volledige testscope worden samen geleverd. Schema v1 en bestaande actiegates blijven ongewijzigd.
- [Testchecklist en rollback](docs/releases/testing-v0.8.0-alpha.9.md). Live Home Assistant-acceptatie blijft een afzonderlijke gate; deze release voert geen deployment uit.


## 0.8.0-alpha.3 — 2026-09-08

- Vandaag en de compacte camerakaart delen op desktop dezelfde boven- en onderlijn.
- Kamerchips en bronkeuzes krijgen meer visuele hiërarchie; per kamer blijft maximaal één bron-/actiestrook open.
- Kamerdetails gebruiken de beschikbare dashboardbreedte en bieden naast de terugpijl naar Kamers een expliciete Home-knop.

## 0.8.0-alpha.2 — 2026-09-07

- Home gebruikt de beschikbare breedte, zonder interne limiet van 1180 px.
- Kamerkoppen klappen een paneel open met chips; Volledige kamer blijft een aparte link.
- Airco/verwarming is bereikbaar via de bestaande klimaatbron. Oudere licht-/media-/covermappings krijgen veilige detailchips zonder nieuwe directe actiedoelen.
- Uitgeklapte toestand blijft behouden bij Home-updates; toetsenbord- en browserchecks uitgebreid.

## 0.8.0-alpha.1 — 2026-09-07

- Vaste favoriete kamers met maximaal vier expliciete capabilitydoelen en opt-in voor directe bediening.
- Rolluik-/luifelstrook met ondersteunde richtingen, stop tijdens wachtend verzoek en luifelbevestiging; radio pauze/hervatten met detailfallback voor bronkeuze.
- Geen generieke stale-presentatie op Home; echte uitval blijft herkenbaar. Afvalophaling, forecast, camera's en specialistische routes behouden.
- Fictieve runtime-renders, tests voor acties/fouten/focus en een releasechecklist. Geen automatische activatie bij migratie.


Alle betekenisvolle wijzigingen worden hier bijgehouden. Het project gebruikt Semantic Versioning met prereleases tijdens de testfasen.

## 0.7.0-alpha.2 — 2026-09-04

### Fixed

- Migreert de historische Kia-resource-identiteit `custom:ha-kia-connect-dashboard` automatisch naar het geregistreerde Lovelace-kaarttype `custom:kia-dashboard-card`, zonder de private Kia-cardconfiguratie te wijzigen.

## 0.7.0-alpha.1 — 2026-09-04

### Added

- Voegt een read-only Kia-summary en stabiele `specialist-kia`-subview toe, met acculading, bereik, laadstatus, dataversheid en een veilige route naar de bestaande HACS Kia-card.
- Geeft de private Kia-cardconfiguratie transparant door, zonder voertuiglogica, acties, confirmations of mappingdiagnostiek in deze repository te kopiëren.

### Changed

- Corrigeert het vaste Kia-cardcontract naar `custom:kia-dashboard-card` en bewaakt voor de nieuwe integratielaag een harde minified bundlelimiet van 168 kB.

### Safety and validation

- Toont een native fallback bij ontbrekende resource, onvolledige mapping of stale/unavailable voertuigdata; er zijn geen Home Assistant-writes of servicecalls toegevoegd.

## 0.6.0-alpha.1 — 2026-08-24

### Added

- Voegt op Home geprioriteerde aandacht, actuele activiteit en afwijkende kamers toe binnen vaste contentbudgetten.
- Toont op het kameroverzicht concrete apparaatchips met semantische status en groepeert kamerdetails per verlichting, covers, klimaat, media, safety, camera, power en historie.
- Bouwt een afzonderlijke read-only Energie-view met actuele KPI's, historie, bronsecties en de officiële Home Assistant Energy-kaarten.
- Vervangt de platte domeininventaris door gecureerde woningfuncties voor klimaat, verlichting, veiligheid, water, media, energie, mobiliteit/buiten en systeem.

### Changed

- Verhoogt het bewaakte minified bundlebudget naar 160 kB voor de nieuwe semantische views; de releasebundel blijft onder die harde grens.
- Verrijkt personen uitsluitend met privacyveilige zone-, versheids- en lage-batterijcontext.

### Safety and validation

- Alle nieuwe interacties openen uitsluitend Home Assistants standaard detaildialoog of navigeren naar een view; er zijn geen servicecalls of configuratiewrites toegevoegd.
- Dekt normal, warning, missing en unavailable states af met 48 geautomatiseerde tests, plus repository-, privacy-, TypeScript- en distributiechecks.

## 0.5.0-alpha.9 — 2026-08-24

### Changed

- Vormt weer, energiecontext en afvalophaling om tot één samengestelde Vandaag-kaart met één buitenrand en subtiele interne scheidingslijnen.
- Plaatst maximaal vier afvalfracties op desktop in één rij en houdt ze op smalle schermen in een compacte tweekolomsindeling.
- Behoudt security als afzonderlijke rechterkolom en de bestaande lineaire responsive volgorde.

### Validation

- Vergrendelt de samengestelde Vandaag-container, enkelvoudige desktop-afvalrij en tweekoloms mobiele afvalweergave in de distributietests.

## 0.5.0-alpha.8 — 2026-08-24

### Changed

- Laat de compacte weerkaart op desktop over de twee linker Vandaag-kolommen lopen.
- Verplaatst de energie-rail en afvalophaling naar de rij onder het weer, terwijl security rechts beide rijen blijft begeleiden.
- Behoudt op tablet en mobiel de bestaande lineaire stapelvolgorde zonder horizontale overflow.

### Validation

- Vergrendelt de nieuwe gridposities en responsive reset in de distributietests.

## 0.5.0-alpha.7 — 2026-08-24

### Changed

- Vervangt de te hoge native weather-card op Home door een begrensde eigen weerpresentatie met actuele conditie, temperatuur en maximaal drie dagelijkse voorspellingen.
- Laat die voorspelling via Home Assistants read-only `weather/subscribe_forecast`-contract binnenkomen en bewaart een veilige huidige-statusfallback wanneer forecastdata nog laadt.
- Brengt Home visueel dichter bij **Juiced Horizon Calm** met warmere surfaces, subtiele schaduwen, groene accenten, een aaneengesloten energie-rail en verfijnde afval-, person-, navigatie- en securitykaarten.
- Verhoogt het gecontroleerde minified bundlebudget van 120 kB naar 128 kB voor de compacte forecastpresentatie; de bundel blijft zonder service- of configuratiewrites.

### Validation

- Vergelijkt de Home-compositie lokaal met de goedgekeurde render op desktop, 390 px en donkere tokens.
- Bewaakt in de bundel de forecastsubscription, compacte weerstructuur, themetokens en afwezigheid van `callService` en `callWS`.

## 0.5.0-alpha.6 — 2026-08-24

### Changed

- Brengt de driedelige Vandaag-layout in lijn met de goedgekeurde render: compacter weer, iconische energiestatussen en security zonder dubbele sectietitel.
- Laat `system`, `light` en `dark` uit de grafische configuratie doorwerken op de Home-compositie en haar childcards via ondersteunde Home Assistant-themetokens.
- Herkent GFT, papier/karton, PMD, groenafval, glas en restafval semantisch en toont per ophaling een fractie-icoon, korte naam, datum en relatieve termijn.

### Validation

- Test afvalherkenning met ISO- en lokale datumnotatie en bewaakt de afwezigheid van de verwijderde securitykop.
- Controleert de runtimecompositie lokaal op 1440 px, 390 px en met donkere HA-themetokens; er zijn geen Home Assistant-writes of servicecalls uitgevoerd.

## 0.5.0-alpha.5 — 2026-08-24

### Changed

- Splitst het gecombineerde batterijvermogen onder **Vandaag** in afzonderlijke sensoren en vaste labels voor **Batterij laden** en **Batterij ontladen**.
- Plaatst security op brede schermen als compacte derde kolom naast het weer en de Vandaag-sensoren; tablet en mobiel blijven responsief stapelen.
- Geeft afval een eigen herkenbare groep **Afvalophaling**, een afvalicoon en duidelijke friendly-name plus ophaalstatus per bron.

### Fixed

- Werkt realtime statewaarden in-place bij, zodat snel veranderende vermogenssensoren niet langer de volledige Home-compositie, weerkaart en camerastrook voortdurend opnieuw opbouwen.
- Bewaart een oude gecombineerde batterijvermogensmapping verliesvrij als extra energiecontext en vraagt daarna om de twee nieuwe bronnen afzonderlijk te kiezen.

### Validation

- Voegt een regressietest toe die bewijst dat vermogensupdates geen structurele rerender veroorzaken, terwijl een echt veiligheidsincident de Home-structuur wel bijwerkt.
- Controleert de driedelige desktopcompositie in een lokale runtime met fictieve waarden en zonder Home Assistant-verbinding.

## 0.5.0-alpha.4 — 2026-08-24

### Fixed

- Voorkomt dat enkelvoudige Home Assistant-entityselectors hun net gekozen waarde onmiddellijk opnieuw leegmaken doordat zowel `value-changed` als het daaropvolgende native `change`-event werden verwerkt.
- Herstelt daarmee de vijf entityselectors onder **Vandaag** en dezelfde selectorroute voor onder meer het securityalarm en Energie.
- Markeert deze optionele entityvelden expliciet als niet-verplicht voor de Home Assistant-selectorcomponent.

### Validation

- Simuleert in de regressietests de echte Home Assistant-eventvolgorde voor zowel een Vandaag-KPI als het alarm en controleert dat selectie, opslag en rerender dezelfde waarde behouden.

## 0.5.0-alpha.3 — 2026-08-24

### Added

- Voegt onder **Vandaag** vijf afzonderlijke entityselectors toe voor thuisbatterij-SoC, batterij laad-/ontlaadvermogen, zonnepanelenopbrengst, huisverbruik zonder batterijladen en de maandelijkse vermogenspiek.
- Toont deze bronnen op Home met vaste betekenisvolle labels, onafhankelijk van de technische entitynaam of friendly name.
- Behoudt de bestaande algemene energiecontext als optionele aanvullende KPI-bronnen.

### Compatibility and validation

- Migreert bestaande schema-v1-configuraties verliesvrij door de nieuwe velden leeg aan te vullen.
- Voegt schema-, editor-, migratie- en strategyregressies toe voor alle vijf benoemde KPI's.

## 0.5.0-alpha.2 — 2026-08-24

### Changed

- Herbouwt Home als één begrensde, responsive compositie met begroeting, aandacht, weer, energiecontext, afval, gezin, directe routes en security.
- Verkleint de cameraviewport tot maximaal circa 520 px en de privacyrail tot compacte statussen naast het beeld.
- Vervangt generieke capabilitylabels op kamerkaarten door state-aware chips voor werkelijk gemapte lichten, covers, klimaat, media, veiligheid en energie.
- Herbouwt kamerdetails als één samenhangend dashboard met hero, primaire statussen, apparaatgroepen, klimaatcontext, media, veiligheid, energie en afzonderlijke historie.
- Apparaatkaarten en chips openen uitsluitend het standaard Home Assistant-detailvenster; de bundle voert nog steeds geen servicecall uit.

### Performance and validation

- Verhoogt het expliciete bundlebudget van 100 kB naar 120 kB voor de twee begrensde visuele compositiecards; de gemeten minified bundle blijft onder dit plafond.
- Voegt regressietests toe voor informatieoverdracht, compacte camera-afmetingen, room-detailcompositie en de afwezigheid van `callService`/`callWS`.

## 0.5.0-alpha.1 — 2026-08-24

### Added

- Vervangt de vlakke Kamers-entiteitenlijst door een herkenbaar overzicht met hero, verdiepingsgroepen en compacte kamerkaarten.
- Genereert voor iedere geconfigureerde kamer een stabiele semantische subview `room-<key>` met terugpad naar Kamers.
- Groepeert kamerdetails in ruimtestatus, licht/covers/openingen, comfort/klimaat, media, veiligheid/camera's, apparaten/energie en 72-uurs historie.
- Verbergt lege kamersecties en behoudt normale, gedeeltelijk onbeschikbare en lege kamers als geldige layouts.

### Safety and validation

- Kamerstatus en detailkaarten blijven read-only; servicecalls, actionsequences en quick actions worden nog niet gegenereerd.
- Test stabiele paths, subviews, informatiedekking, kamerstatussemantiek, responsive componentregistratie en veilige entityacties.

## 0.4.0-alpha.2 — 2026-08-24

### Fixed

- Toont in de cameracarrousel exact één camerakaart per viewport in plaats van een rij miniaturen.
- Laat camera's met actieve privacymodus volledig uit de beeldcarrousel weg.
- Verplaatst alle privacystatussen naar een compacte zijrail die op mobiel horizontaal onder het beeld staat.
- Beperkt de camerabreedte op grote schermen en houdt pijltjes-, touch- en toetsenbordnavigatie beschikbaar.

### Safety

- De compacte privacystatus is informatief en voert geen actie uit; camera-, alarm- en privacybediening blijven read-only.

## 0.4.0-alpha.1 — 2026-08-24

### Added

- Bouwt Home opnieuw op met compacte Vandaag-, Gezin- en navigatiegroepen en een beveiligingssectie over de volledige beschikbare breedte.
- Voegt een horizontaal en met toetsenbord bedienbare camerastrook toe voor ieder geconfigureerd aantal camera's.
- Toont bij actieve privacy een expliciete privacyplaceholder in plaats van een betekenisloos zwart cameravlak.
- Toont operationele `unknown`/`unavailable`-status uitsluitend voor de expliciete diagnostiek-allowlist.

### Safety and validation

- Camera-, privacy-, alarm- en personweergave blijven read-only; de release genereert geen servicecall of Home Assistant-write.
- Cameravolgorde, privacyfallback, verborgen fallback, volledige sectiebreedte, compacte personenweergave en custom-cardregistratie zijn regressiegetest.
- De in Home Assistant waargenomen layoutproblemen zijn alleen geanonimiseerd vastgelegd; screenshots en installatie-identifiers zijn niet aan de repository toegevoegd.

## 0.3.0-alpha.3 — 2026-08-22

### Fixed

- Accepteert een gekoppelde privacyactie met iedere geldige risicoklasse, inclusief `safe`.
- Laat de actie zelf bepalen of bevestiging vereist is; de cameracheckbox blijft een onafhankelijke, optionele extra bevestiging.
- Verwijdert de onterechte Security-blokkade voor een bestaande, volledig gescopete en verifieerbare actie.
- Herstelt daardoor ook het opslaan van een gekozen alarmentiteit wanneer deze fout de enige resterende blokkade was.
- Verduidelijkt het onderscheid tussen status-only, actierisico en de extra camerabevestiging in de editor.

## 0.3.0-alpha.2 — 2026-08-22

### Fixed

- Maakt een gekozen privacyinstelling met **Privacyactie = Geen** geldig voor status-only gebruik.
- Houdt de extra bevestigingskeuze per camera optioneel en gebruikt ze niet langer als opslagblokkade.
- Controleert targetscope en resultaatcontrole alleen wanneer een privacyactie daadwerkelijk is gekoppeld; `v0.3.0-alpha.3` maakt de risicoklasse daarbij vrij.
- Vervangt generieke configuratievariantmeldingen door de precieze fout bij de betrokken camera of actie.
- Toont de risicoklasse in de privacyactiekeuze en verduidelijkt in Security dat bediening optioneel is.

## 0.3.0-alpha.1 — 2026-08-22

### Added

- Vervangt de configuratiepreview door vijf echte native Sections-views: Home, Kamers, Energie, Domeinen en Meer.
- Registreert een afzonderlijke view strategy en genereert de gekozen startview als eerste stabiele view.
- Toont lokaal geselecteerde Vandaag-, person-, camera-, privacy-, kamer-, energie- en domeinbronnen.
- Ondersteunt alle geconfigureerde camera's in bronvolgorde en houdt verborgen personlocaties ook visueel verborgen.
- Biedt veilige navigatie naar Kamers, Meer en het standaard Home Assistant Energie-dashboard.

### Safety and validation

- Alle entitykaarten zijn in deze alpha read-only; tap, hold en double-tap voeren geen actie uit.
- Alleen expliciete `navigate`-acties zijn toegestaan; er wordt geen service, target of actionsequence gegenereerd.
- Test vijf stabiele views, Sections-output, zes camera's, startviewvolgorde, privacy, fixtures, registratie, serialisatie en determinisme.

## 0.2.0-alpha.3 — 2026-08-22

### Changed

- Laat Security met ieder geconfigureerd aantal camera's werken; bij ingeschakelde Security is alleen minstens één camera vereist.
- Verwijdert de eerdere vaste limiet van drie camera's uit schema, runtimevalidatie en grafische editor.
- Legt bij privacybediening expliciet uit dat de gekoppelde privacyactie eerst onder **Acties** wordt aangemaakt.
- Voegt in Security een directe knop toe die naar de sectie **Acties** navigeert en die sectie focust.

### Validation

- Legt vast dat de compacte configuratiemethode en kamerconfiguratie in `v0.2.0-alpha.2` praktisch goedgekeurd zijn.
- Test configuraties met één, twee, drie en zes camera's en de navigatie van Security naar Acties.

## 0.2.0-alpha.2 — 2026-08-22

### Changed

- Vervangt de lange editorlijst door vaste sectienavigatie met één zichtbaar onderdeel, voortgang en vorige/volgende-bediening.
- Gebruikt op desktop een compacte linkernavigatie en op mobiel een horizontaal scrollbare sectiebalk.
- Toont validatiebadges per onderdeel en alleen de relevante foutdetails in het actieve onderdeel.
- Maakt personen, camera's, kamers en acties afzonderlijk inklapbaar; open items blijven open na een wijziging.
- Voegt volledige toetsenbordnavigatie voor de sectietabs toe.

### Validation

- Legt de geslaagde preview-, import/export- en mobiele editortest van `v0.2.0-alpha.1` geanonimiseerd vast.

## 0.2.0-alpha.1 — 2026-08-22

### Added

- Versioned configuratieschema v1 met defaults, validatie, migratie en privacyveilig compilermanifest.
- Volledige grafische strategy-editor voor algemeen, Vandaag, personen, camera's/privacy, kamers, Energie, acties, specialisten, layout en diagnostiek.
- Minimale Community dashboard-registratie met verplichte editor en read-only configuratiepreview.
- Native Home Assistant-selectors voor entities, areas, floors, icons en actions.
- Lokale JSON-import/export met privacywaarschuwing en geblokkeerde ongeldige tussenstanden.
- Normal-, warning-, missing- en unavailable-fixtures plus schema/editorcoverage en round-triptests.
- GUI-, schema-, compatibility-, troubleshooting-, backup/rollback- en prereleasetestdocumentatie.

### Known limitations

- De vijf productviews volgen in `v0.3.0-alpha.1`; deze release genereert alleen een read-only configuratiepreview.
- Resource- en specialistversies worden opgeslagen en gevalideerd, maar pas door de shell zichtbaar gecontroleerd.

## 0.1.0-alpha.1 — 2026-08-21

### Added

- HACS Dashboard-pluginmanifest met Home Assistant 2026.8.2 als minimum.
- Reproduceerbare TypeScript/esbuild-bundle in `dist/home-dashboard.js`.
- CI-, HACS-validatie- en taggestuurde releaseworkflows.
- Releasechecksums, buildmanifest en installatietestchecklist.
- Eerste HACS-installatie-, update-, remove- en resource-loadtest.
