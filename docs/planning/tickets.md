# Ticketregister

De tickets staan sinds 3 november 2026 in [GitHub Issues](https://github.com/ju1ced/home-dashboard/issues); dit bestand is alleen nog een index van ticketnummer naar issue. De volledige ticketinhoud (doel, scope, acceptatiecriteria, validatie, resultaat) staat in de issuebeschrijving; de kanbaninformatie van vóór de migratie (volgorde, toelichting, afgerond via) staat als eerste reactie op elk issue. Het bord staat in [kanban.md](kanban.md).

## Conventies

- **Titel:** `HD-xxx — <titel>`; nieuwe tickets nemen het volgende vrije HD-nummer.
- **Milestone:** de epic (functionele werkstroom).
- **Labels:** prioriteit `P0`/`P1`/`P2`, omvang `size:XS` t/m `size:XL` en, zolang het issue open is, precies één status: `status:backlog`, `status:in-progress`, `status:review` of `status:blocked`.
- **Klaar:** issue gesloten als *completed*.
- **Afhankelijkheden:** in de issuebeschrijving, met `#nummer`-verwijzingen.

## Index

De status hieronder is een momentopname bij de migratie; het issue is leidend.

| Ticket | Issue | Titel | Milestone | Status bij migratie |
|---|---|---|---|---|
| HD-001 | [#150](https://github.com/ju1ced/home-dashboard/issues/150) | Repositoryfundering, HACS, tooling en privacyguards | Foundation & HACS | Klaar |
| HD-002 | [#151](https://github.com/ju1ced/home-dashboard/issues/151) | Entitymapping, room-/capabilitymodel en volledige GUI-configuratie | GUI-config & editor | Klaar |
| HD-003 | [#152](https://github.com/ju1ced/home-dashboard/issues/152) | Custom dashboard strategy, tokens, HA-shellgrens en navigatie | Shell & navigatie | Klaar |
| HD-004 | [#153](https://github.com/ju1ced/home-dashboard/issues/153) | Home, person cards en contextuele waarschuwingen | Home & security | Klaar |
| HD-005 | [#154](https://github.com/ju1ced/home-dashboard/issues/154) | Volledig Kamers-overzicht, kamermodel en kamerpagina's | Kamers | Klaar |
| HD-006 | [#155](https://github.com/ju1ced/home-dashboard/issues/155) | Volledige Energie-hoofdview en woningbrede domeinpagina's | Energie en domeinen | Klaar |
| HD-007 | [#156](https://github.com/ju1ced/home-dashboard/issues/156) | Kia-integratie | Specialisten | Klaar |
| HD-008 | [#157](https://github.com/ju1ced/home-dashboard/issues/157) | Zelfstandige 3D-printerspecialist | Specialisten | Klaar |
| HD-009 | [#158](https://github.com/ju1ced/home-dashboard/issues/158) | Read-only zwembadsamenvatting | Specialisten | Klaar |
| HD-010 | [#159](https://github.com/ju1ced/home-dashboard/issues/159) | Consistente navigatie, lokale kiosk en gekleurde Home-header | Shell & navigatie | Klaar |
| HD-101 | [#160](https://github.com/ju1ced/home-dashboard/issues/160) | Room-card overhaul afronden | Kamers | Klaar |
| HD-102 | [#161](https://github.com/ju1ced/home-dashboard/issues/161) | Room-card slice reviewen en releaseklaar maken | Kamers | Klaar |
| HD-110 | [#162](https://github.com/ju1ced/home-dashboard/issues/162) | Browserregressiematrix consolideren | Quality engineering | Klaar |
| HD-111 | [#165](https://github.com/ju1ced/home-dashboard/issues/165) | Live acceptatie van de actuele alpha | Runtimeacceptatie | Review/validatie |
| HD-112 | [#126](https://github.com/ju1ced/home-dashboard/issues/126) | Runtimebevindingen oplossen | Runtimeacceptatie | Backlog |
| HD-120 | [#163](https://github.com/ju1ced/home-dashboard/issues/163) | Energy-paritymanifest actualiseren | Energie en domeinen | Klaar |
| HD-121 | [#166](https://github.com/ju1ced/home-dashboard/issues/166) | Live Energie- en domeinpariteit valideren | Energie en domeinen | Geblokkeerd |
| HD-130 | [#167](https://github.com/ju1ced/home-dashboard/issues/167) | Robot-bronrepo door de productiepoort brengen | Specialisten | Geblokkeerd |
| HD-131 | [#168](https://github.com/ju1ced/home-dashboard/issues/168) | Robot centraal integreren | Specialisten | Geblokkeerd |
| HD-140 | [#169](https://github.com/ju1ced/home-dashboard/issues/169) | Tuincard-contract en bronrepo valideren | Specialisten | Geblokkeerd |
| HD-141 | [#170](https://github.com/ju1ced/home-dashboard/issues/170) | Tuin centraal integreren | Specialisten | Geblokkeerd |
| HD-150 | [#164](https://github.com/ju1ced/home-dashboard/issues/164) | Zwembadstatusrandgevallen tegen de bron bevestigen | Specialisten | Klaar |
| HD-151 | [#171](https://github.com/ju1ced/home-dashboard/issues/171) | Zelfstandige pool-dashboard-card bouwen | Specialisten | Geblokkeerd |
| HD-152 | [#172](https://github.com/ju1ced/home-dashboard/issues/172) | Volledige zwembadkaart centraal integreren | Specialisten | Geblokkeerd |
| HD-160 | [#173](https://github.com/ju1ced/home-dashboard/issues/173) | Specialistische runtimeacceptatie uitvoeren | Specialisten | Geblokkeerd |
| HD-170 | [#149](https://github.com/ju1ced/home-dashboard/issues/149) | Volledige responsive, accessibility en visual QA | Quality engineering | Review/validatie |
| HD-171 | [#127](https://github.com/ju1ced/home-dashboard/issues/127) | Performancebaseline en budgetten vastleggen | Performance | Klaar |
| HD-172 | [#128](https://github.com/ju1ced/home-dashboard/issues/128) | Multi-dashboard resource-audit uitvoeren | Performance | Klaar |
| HD-180 | [#129](https://github.com/ju1ced/home-dashboard/issues/129) | HACS lifecycle en compatibiliteitsmatrix bijwerken | Release engineering | Klaar |
| HD-181 | [#130](https://github.com/ju1ced/home-dashboard/issues/130) | Admin-dashboardgrens uitwerken | Diagnostiek | Klaar |
| HD-190 | [#174](https://github.com/ju1ced/home-dashboard/issues/174) | Testmigratie en rollback bewijzen | Migratie | Geblokkeerd |
| HD-191 | [#175](https://github.com/ju1ced/home-dashboard/issues/175) | Gezinsacceptatie en productiecutover | Migratie | Geblokkeerd |
| HD-192 | [#131](https://github.com/ju1ced/home-dashboard/issues/131) | v1-documentatie en release readiness afronden | Release engineering | Backlog |
| HD-200 | [#132](https://github.com/ju1ced/home-dashboard/issues/132) | 3D-printerspecialist: contract, productiegate en documentatiereconciliatie | Specialisten | Klaar |
| HD-201 | [#134](https://github.com/ju1ced/home-dashboard/issues/134) | Volledige productaudit voor privacy en beveiliging | Quality engineering | Klaar |
| HD-202 | [#148](https://github.com/ju1ced/home-dashboard/issues/148) | Control Deck-kamerdashboard implementeren | Kamers | Klaar |
| HD-203 | [#135](https://github.com/ju1ced/home-dashboard/issues/135) | LINAK-bureaucard: contract en documentatiereconciliatie | Specialisten | Klaar |
| HD-204 | [#141](https://github.com/ju1ced/home-dashboard/issues/141) | Control Deck herstructureren naar de v3-rail | Kamers | Klaar |
| HD-205 | [#142](https://github.com/ju1ced/home-dashboard/issues/142) | Verbruik en Historie op echte HA-statistics en logbook-data | Kamers | Klaar |
| HD-206 | [#143](https://github.com/ju1ced/home-dashboard/issues/143) | Control Deck-omkadering aanvullen naar de v3-mockup | Kamers | Klaar |
| HD-207 | [#144](https://github.com/ju1ced/home-dashboard/issues/144) | Control Deck-omkadering: drie resterende hiaten | Kamers | Klaar |
| HD-208 | [#145](https://github.com/ju1ced/home-dashboard/issues/145) | Control Deck visueel afbakenen, zinloze tekst schrappen en Kamerverbruik echt combineren | Kamers | Klaar |
| HD-209 | [#146](https://github.com/ju1ced/home-dashboard/issues/146) | Kamerafbeelding rechtstreeks kunnen uploaden | Kamers | Klaar |
| HD-210 | [#147](https://github.com/ju1ced/home-dashboard/issues/147) | Bundlebudget structureel oplossen: editor lazy laden | Performance | Klaar |
| HD-211 | [#133](https://github.com/ju1ced/home-dashboard/issues/133) | Printersummary: relevante-state gating toevoegen | Performance | Klaar |
| HD-212 | [#136](https://github.com/ju1ced/home-dashboard/issues/136) | `mountCard()`-resourcefallback met een echte test bewijzen | Quality engineering | Klaar |
| HD-213 | [#137](https://github.com/ju1ced/home-dashboard/issues/137) | Diff-voor-schrijven toevoegen aan Home, Energie en pool-specialist renderpaden | Performance | Klaar |
| HD-214 | [#138](https://github.com/ju1ced/home-dashboard/issues/138) | Centrale actionallowlist (`ActionConfig`/`privacy_action_key`) is gedefinieerd maar nergens uitgevoerd | Quality engineering | Klaar |
| HD-215 | [#139](https://github.com/ju1ced/home-dashboard/issues/139) | GUI-configuratie-editor opsplitsen per sectie | Quality engineering | Klaar |
| HD-216 | [#140](https://github.com/ju1ced/home-dashboard/issues/140) | Kameneditor: lazy-mount, zoeken/filteren en smart-plug-koppelhulp | Quality engineering | Klaar |
| HD-217 | [#177](https://github.com/ju1ced/home-dashboard/issues/177) | Kamereditor: dag/maand/jaar-periodesensoren automatisch opzoeken bij een smart plug | Quality engineering | Geblokkeerd |
| HD-218 | [#176](https://github.com/ju1ced/home-dashboard/issues/176) | HACS-pin voor home-dashboard valt herhaaldelijk terug op main-tracking | Runtimeacceptatie | Klaar |
| HD-219 | [#180](https://github.com/ju1ced/home-dashboard/issues/180) | Verbruik-tab: één gecombineerde dag-/maand-/jaargrafiek en een "Grootste verbruikers"-ranglijst | Kamers | Klaar |
| HD-220 | [#181](https://github.com/ju1ced/home-dashboard/issues/181) | Live verbruikspagina-bevindingen: cumulatieve-som-bug, lege labels, dubbele vergelijking, nutteloze sectie | Kamers | Klaar |
| HD-221 | [#182](https://github.com/ju1ced/home-dashboard/issues/182) | Nog meer live verbruikspagina-bevindingen: enkele-bucket-jaar, rollend dagvenster, Kamerenergie-tegels | Kamers | Klaar |
| HD-222 | [#183](https://github.com/ju1ced/home-dashboard/issues/183) | "Verbruik per dag" moet altijd de volledige kalenderweek tonen | Kamers | Klaar |
| HD-223 | [#184](https://github.com/ju1ced/home-dashboard/issues/184) | "Verbruik per dag"/"per maand" moeten een rollend venster tonen met vandaag/deze maand als laatste kolom | Kamers | Klaar |
| HD-224 | [#185](https://github.com/ju1ced/home-dashboard/issues/185) | Home: kamerchips vervangen het uitklappen van grote actieknoppen | Kamers | Klaar |
| HD-225 | [#186](https://github.com/ju1ced/home-dashboard/issues/186) | Geen gecombineerde chips meer; chiprij naast de kamernaam, zo compact mogelijk | Kamers | Klaar |
| HD-226 | [#187](https://github.com/ju1ced/home-dashboard/issues/187) | "Aandacht nodig" wordt een oproepbare chip, geen permanente waarschuwingstekst | Kamers | Klaar |
| HD-227 | [#188](https://github.com/ju1ced/home-dashboard/issues/188) | Geen harde limiet meer op het aantal favoriete kamers op Home | Kamers | Klaar |
| HD-228 | [#189](https://github.com/ju1ced/home-dashboard/issues/189) | Home: kamerraster toont 3 kolommen i.p.v. 2 | Kamers | Klaar |
| HD-229 | [#190](https://github.com/ju1ced/home-dashboard/issues/190) | Kamerchips gebruiken Home Assistant se eigen entiteitsicoon i.p.v. één vast icoon per type | Kamers | Klaar |
| HD-230 | [#191](https://github.com/ju1ced/home-dashboard/issues/191) | Aandachtbanner op Home wordt oproepbaar via de kopbalk-pil, geen permanente gele balk meer | Kamers | Klaar |
| HD-231 | [#192](https://github.com/ju1ced/home-dashboard/issues/192) | Cover-/luifelchips volgen de live staat zoals het oude dashboard | Kamers | Klaar |
| HD-232 | [#193](https://github.com/ju1ced/home-dashboard/issues/193) | Aandachtchip toont het icoon van de sensor zelf, niet langer een generiek uitroepteken | Kamers | Klaar |
| HD-233 | [#194](https://github.com/ju1ced/home-dashboard/issues/194) | v0.8.12-regressie: icoon-badge-styling kapot sinds HD-229, plus stale-icoon-bug gefixt | Kamers | Klaar |
| HD-234 | [#195](https://github.com/ju1ced/home-dashboard/issues/195) | Editor-shell-polish: redundante chrome weg, iconen en één statuspil toegevoegd | GUI-config & editor | Klaar |
| HD-235 | [#178](https://github.com/ju1ced/home-dashboard/issues/178) | Kamereditor: bruikbaarheid en duidelijkheid herzien | GUI-config & editor | In uitvoering |
| HD-236 | [#179](https://github.com/ju1ced/home-dashboard/issues/179) | Instellingenpopup: overige secties herzien (zelfde schaalprobleem als Kamers, plus dubbele-invoer-fixes tussen secties) | GUI-config & editor | Backlog |
