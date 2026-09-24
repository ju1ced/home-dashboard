# Ticketregister

Dit register bevat Jira-achtige tickets voor het resterende Home Dashboard-werk per 23 september 2026. Het [Kanbanbord](kanban.md) is de statusweergave; dit bestand is de detailbron voor scope, afhankelijkheden en acceptatie.

## Ticketvelden

- **Epic:** functionele werkstroom.
- **Status:** Backlog, Gereed, In uitvoering, Review/validatie, Geblokkeerd of Klaar.
- **Prioriteit:** P0, P1 of P2.
- **Omvang:** S, M, L of XL; relatieve planningseenheid, geen tijdsbelofte.
- **Eigenaar:** voorgestelde rol uit de deliveryroadmap.
- **Afhankelijkheden:** tickets of menselijke gates die eerst moeten sluiten.

---

## HD-101 — Room-card overhaul afronden

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

## HD-102 — Room-card slice reviewen en releaseklaar maken

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

## HD-110 — Browserregressiematrix consolideren

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

## HD-111 — Live acceptatie van de actuele alpha

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

## HD-112 — Runtimebevindingen oplossen

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

## HD-120 — Energy-paritymanifest actualiseren

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

## HD-121 — Live Energie- en domeinpariteit valideren

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

## HD-130 — Robot-bronrepo door de productiepoort brengen

- **Epic:** Specialisten — robot
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

## HD-131 — Robot centraal integreren

- **Epic:** Specialisten — robot
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

## HD-140 — Tuincard-contract en bronrepo valideren

- **Epic:** Specialisten — tuin
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

## HD-141 — Tuin centraal integreren

- **Epic:** Specialisten — tuin
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

## HD-150 — Zwembadstatusrandgevallen tegen de bron bevestigen

- **Epic:** Specialisten — zwembad
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

## HD-151 — Zelfstandige pool-dashboard-card bouwen

- **Epic:** Specialisten — zwembad
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

## HD-152 — Volledige zwembadkaart centraal integreren

- **Epic:** Specialisten — zwembad
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

## HD-160 — Specialistische runtimeacceptatie uitvoeren

- **Epic:** Specialisten — runtime
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

## HD-170 — Volledige responsive, accessibility en visual QA

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

## HD-171 — Performancebaseline en budgetten vastleggen

- **Epic:** Performance
- **Status:** Backlog
- **Prioriteit:** P1
- **Omvang:** L
- **Eigenaar:** Performance, privacy & release-QA-agent
- **Afhankelijkheden:** featurefreeze; specialistset gereed of expliciet uitgesteld

**Doel**

Meetbare productiecriteria vastleggen voor bundle, parse, DOM, long tasks, navigatie en rerenders.

**Scope**

Home, Kamers, lichte/zware kamer, Energie, Security en specialistviews; koude en warme cache; relevante en irrelevante stateupdates.

**Acceptatiecriteria**

- Methode, hardware/browsercontext en telwijze zijn reproduceerbaar.
- Budgets zijn op metingen gebaseerd, niet verhoogd om failures te verbergen.
- Irrelevante stateupdates veroorzaken geen onverklaarde brede rerender.
- Afwijkingen hebben een concrete optimalisatie of expliciete acceptatie.

**Validatie**

Meetrapport, scripts en vaste fixtures zonder live/private data.

---

## HD-172 — Multi-dashboard resource-audit uitvoeren

- **Epic:** Performance en migratie
- **Status:** Backlog
- **Prioriteit:** P1
- **Omvang:** L
- **Eigenaar:** Performance, privacy & release-QA-agent
- **Afhankelijkheden:** HD-171

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

## HD-180 — HACS lifecycle en compatibiliteitsmatrix bijwerken

- **Epic:** Release engineering
- **Status:** Backlog
- **Prioriteit:** P1
- **Omvang:** M
- **Eigenaar:** Foundation & HACS-agent + documentatiereviewer
- **Afhankelijkheden:** definitieve specialistset en actuele releasecandidate

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

## HD-181 — Admin-dashboardgrens uitwerken

- **Epic:** Diagnostiek
- **Status:** Backlog
- **Prioriteit:** P2
- **Omvang:** M
- **Eigenaar:** Lead / integrator
- **Afhankelijkheden:** eigenaarsbesluit over afzonderlijke repo of dashboard

**Doel**

De vastgelegde `require_admin`-grens voor systeem, netwerk, updates, batterijen, automations en area-loze techniek uitvoerbaar maken zonder het gezinsdashboard opnieuw te belasten.

**Acceptatiecriteria**

- Scope, autorisatiegrens, navigatie-ingang en ownership zijn besloten.
- Visibility wordt niet als security gebruikt.
- De scheiding tussen gezinspad en diagnose is gedocumenteerd.
- Eventuele bouwtickets staan in de juiste repo en zijn geen impliciete uitbreiding van `home-dashboard`.

**Validatie**

Beslislogupdate en goedgekeurde architectuurscope; implementatie volgt alleen na aparte toestemming.

---

## HD-190 — Testmigratie en rollback bewijzen

- **Epic:** Migratie
- **Status:** Geblokkeerd
- **Prioriteit:** P0
- **Omvang:** L
- **Eigenaar:** Lead + migratieagent
- **Afhankelijkheden:** QA, performance, resource-audit en relevante runtimegates groen; expliciete menselijke toestemming

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

## HD-191 — Gezinsacceptatie en productiecutover

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

---

## HD-192 — v1-documentatie en release readiness afronden

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
