# Testchecklist v0.8.0-alpha.20

## Scope

Deze kandidaat levert HD-202 als capability-gedreven Control Deck voor kamerdetails:

- vaste functierail en vier tabs voor Bediening, Apparaten, Energie en Historie;
- expliciete lichtgroepen met uit/aan/gedeeltelijk/unknown/unavailable en afzonderlijke leden;
- getypeerde rolluiken, screens en luifels met featuregating en confirmationbeleid;
- meerdere smart plugs, inclusief beveiligde niet-schakelbare apparaten;
- expliciete dag-, maand- en jaarbronnen voor kamer- en apparaatenergie;
- compatibele schema-v1-, migratie-, validator- en GUI-uitbreidingen;
- één historie-eigenaar in de room-detailcard in plaats van een dubbele strategygrafiek.

## Bekende en bewuste grenzen

- Historie gebruikt Home Assistants native 24-uurs `history-graph`; energieperioden gebruiken daarnaast een toegankelijke brongebonden apparaatvergelijking zonder gefabriceerde tijdreeks.
- Servicecalls tonen pending-, succes- en foutfeedback en blokkeren dubbele activatie van hetzelfde doel; live backendautorisatie is niet lokaal bewezen.
- Live kamerbeelden, camera-entiteiten en installatiegegevens zijn niet onderdeel van fixtures of renders.
- De minified bundle is na de gereviewde schema/GUI/runtime-slice 244.187 bytes; de bewaakte grens is 245 kB.
- 200% zoom, echte screenreaderuitvoer en contrast in geïnstalleerde thema's blijven menselijke runtimegates.

## Lokale releasegate

- `pnpm test`.
- `pnpm run test:browser`.
- `git diff --check`.
- Onafhankelijke diffreview zonder open P0/P1.
- Volledige patch toepassen op een verse `origin/main`-archive, dependencies uit lockfile installeren en alle checks opnieuw uitvoeren.
- Bytegelijkheid en SHA-256 van de opnieuw gebouwde `dist/home-dashboard.js` bevestigen.
- `pnpm run release:assets` pas na de definitieve releasecommit, met `GITHUB_SHA` van exact die commit.

## Testdashboardgate — vóór iedere Home Assistant-write invullen

- Exact testdashboard: **nog goed te keuren**.
- Verse dashboardexport/snapshot: **vereist**.
- Default `lovelace`-hash vóór test: **vereist**.
- Targetallowlist voor veilige acties: **vereist**.
- Goedgekeurde resourceversie en rollbackversie: **vereist**.

Zonder alle vijf waarden wordt de live test niet gestart.

## Runtimevalidatie

### Configuratie en migratie

- Open de grafische kamereditor en controleer add/update/remove voor lichtgroepen, openingen en smart plugs.
- Importeer een alpha.19-configuratie en bevestig dat geen bediening automatisch wordt geactiveerd.
- Exporteer en importeer de alpha.20-configuratie verliesvrij.
- Controleer dat dubbele logical keys, verkeerde domeinen en onvolledige groepmappings worden geblokkeerd.

### Bediening

- Test een lichtgroep volledig uit, volledig aan, gedeeltelijk aan, unknown en unavailable.
- Controleer dat groepsbediening alleen het groepsdoel aanroept en individuele lampen hun eigen doel behouden.
- Test rolluik Open/Stop/Dicht en screen/luifel Uit/Stop/In; bevestig dat Stop bereikbaar blijft.
- Bevestig dat een beveiligde plug disabled blijft en een gewone plug twee stappen vereist.
- Controleer servicefout, stale completion, configwissel en focusherstel zonder optimistische state.

### Energie en historie

- Wissel Vandaag, Maand en Jaar en vergelijk iedere waarde met de exact gemapte bron.
- Controleer dat een ontbrekende periode niet als nul verschijnt.
- Vergelijk kamertotalen met het officiële Energy-dashboard zonder de waarden opnieuw tot een woningtotaal op te tellen.
- Open historie, wijzig een relevante state en sluit de dialoog; focus moet terugkeren naar dezelfde bron.

### Responsive en accessibility

- Test 390×844, representatieve wandtablet en 1440×900 in light en dark.
- Test 200% zoom zonder horizontale overflow, clipping of onbereikbare bediening.
- Controleer alle zichtbare acties op minimaal 44×44 px.
- Doorloop capabilityrail, tabs, confirmations en dialoog volledig met toetsenbord.
- Gebruik NVDA of VoiceOver voor tabnamen, groepsstatus, beschermingsreden, energietijdvak en dialognaam.

## Rollbackscope

- Voor commit of PR: verwerp uitsluitend de lokale diff; er is geen externe toestand gewijzigd.
- Na merge maar vóór testdeployment: revert de alpha.20-mergecommit en bouw alpha.19 opnieuw.
- Na een goedgekeurde testdeployment: herstel uitsluitend het testdashboard uit de verse snapshot en zet de eerder goedgekeurde resourceversie terug.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.

## Lokaal resultaat

Stand op 25 september 2026:

- Gerichte TypeScript-, build-, contract- en room-detailbrowserchecks zijn groen.
- De volledige browsermatrix is groen voor hoofdviews, navigatie, editor en Control Deck op mobiel, tablet en desktop.
- `pnpm test` is groen met 100/100 tests; `pnpm run test:browser` en `git diff --check` slagen.
- De volledige patch is op een verse `origin/main`-archive opgebouwd en getest; de gereproduceerde bundle was byte-identiek aan de worktreebuild.
- Twee onafhankelijke reviewrondes vonden contractproblemen in compatibiliteit, actionscope, capabilitynavigatie, servicefeedback en energiecontext; deze zijn met regressietests hersteld. Een finale herreview blijft vereist vóór commit.
- PR/CI en prerelease blijven open gates.
- Live Home Assistant-acceptatie blijft geblokkeerd tot de testdashboardgate volledig is ingevuld.
