# Testchecklist v0.8.0-alpha.22

## Verhouding tot alpha.21

Deze release herstructureert het Control Deck-kamerdetail dat in `v0.8.0-alpha.21` werd uitgebracht. De onderliggende capabiliteiten (lichtgroepen, getypeerde openingen, beschermde smart plugs, dag-/maand-/jaarenergie, schema v1/migratie/GUI) zijn ongewijzigd — zie de [alpha.21-testchecklist](testing-v0.8.0-alpha.21.md) voor die scope. Dit document beschrijft alleen wat sindsdien is toegevoegd of veranderd.

## Wat is toegevoegd of veranderd sinds alpha.21

- **IA-herstructurering (HD-204):** de capabilityrail (Verlichting, Rolluiken/Luifel & screens, Comfort, Smart plugs, Verbruik) is nu de hoofdnavigatie op paginaniveau en toont telkens één geïsoleerde stage. De "Bediening"-tab bestaat niet meer; het Details-blok (Apparaten/Energie/Historie) blijft daaronder met zijn eigen 3 tabs. Dit is de exacte implementatie van de op 24 september 2026 afgetikte v3-ontwerpstudie, die tijdens de bouw van HD-202 zonder gedocumenteerde reden was losgelaten.
- **Dimsliders:** individuele lampen hebben nu een helderheidsslider naast de bestaande aan/uit-schakelaar. De slider commit alleen op `change` (loslaten), niet bij elke sleepbeweging — dit voorkomt een spervuur aan servicecalls. Uitgeschakeld voor missing/unavailable lampen en voor switch-gestuurde verlichting (geen dim-ondersteuning).
- **Lichtgroepen:** visueel onderscheid tussen volledig aan, gedeeltelijk aan en uit (niet alleen via kleur).
- **Openingen:** een samenvattingsstrip (aantal bedieningen, volledig open, gedeeltelijk, gesloten) en een positiebalk per opening. De awning-confirmationlogica (verplichte bevestiging bij een luifel, ongeacht de geconfigureerde waarde) is **ongewijzigd** — geverifieerd byte-identiek aan alpha.21.
- **Smart plugs:** een samenvattingsstrip (huidig vermogen, actieve plugs, dag-/maandtotaal) en een dag/maand/jaar-metricsgrid per plug. Het twee-staps-bevestigingspatroon en de beveiligde-pluglogica zijn **ongewijzigd**.
- **Comfort:** consolideert klimaat, media, veiligheid, camera's en de LINAK-bureaukaart in één stage, zonder capabiliteitsverlies (elke categorie rendert exact één keer, met haar bestaande actie-/bevestigingscontract).
- **Verbruik:** hergebruikt de bestaande energieweergave (periodeselector, apparaatvergelijking, bron-/versheidscontext) in plaats van een nieuwe, aparte samenvatting. **Historie** behoudt voorlopig de native `history-graph`-fallback; een echte statistics-/logbookkoppeling is apart uitgesteld naar HD-205.
- **Bundlebudget:** de harde grens groeit van 245 kB naar 254 kB (**D-052**). Gemeten kandidaat: 251.696 bytes (± 2,3 kB marge — bewust iets ruimer dan voorheen, zie HD-171).

## Extra releasegate (aanvullend op alpha.21)

- Onafhankelijke pre-mergereview uitgevoerd; twee bevindingen opgelost vóór commit: een scope-afwijking (Verbruik-stage bouwde een derde, parallelle totalenberekening op i.p.v. bestaande logica te hergebruiken) en een labelmismatch tegenover de mockup ("Openingen" i.p.v. "Rolluiken"). De drie veiligheidskritische paden (dimslider-scoping, awning-confirmation, plug-tweestapsbevestiging) zijn expliciet geverifieerd zonder regressie.
- `pnpm test`: 104/104 groen. `pnpm run test:browser`: volledige matrix groen, inclusief nieuwe dimslider- en stage-isolatie-assertions.
- `git diff --check`: schoon.
- Eén CI-run op de PR faalde eenmalig op een editor-paletassertie (`editor/rooms/normal/1440x1100`), losstaand van deze wijziging (raakt de room-editor, niet room-detail); slaagde bij een onmiddellijke rerun. Vermoedelijk een bestaande CI-timingflake, geen regressie van deze release — wordt gevolgd als het zich herhaalt.

## Testdashboardgate — ongewijzigd, vóór iedere Home Assistant-write invullen

- Exact testdashboard: **nog goed te keuren**.
- Verse dashboardexport/snapshot: **vereist**.
- Default `lovelace`-hash vóór test: **vereist**.
- Targetallowlist voor veilige acties: **vereist**.
- Goedgekeurde resourceversie en rollbackversie: **vereist**.

Zonder alle vijf waarden wordt de live test niet gestart.

## Rollbackscope

- Vóór deze release: geen wijziging, `main` stond op `v0.8.0-alpha.21`.
- Na deze release maar vóór testdeployment: verwijder de `v0.8.0-alpha.22`-release/tag en herstel de HACS-resource naar `v0.8.0-alpha.21`.
- Na een goedgekeurde testdeployment: herstel uitsluitend het testdashboard uit de verse snapshot en zet de eerder goedgekeurde resourceversie terug.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.
