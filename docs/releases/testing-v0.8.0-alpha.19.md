# Testchecklist v0.8.0-alpha.19

## Scope

Deze kandidaat bundelt de lokaal afgeronde room-cardoverhaul met de geconsolideerde browsermatrix en de eerste releasegerichte kwaliteitscorrecties:

- camera-, kamer- en editorbediening voldoet in de synthetische harnassen aan minimaal 44×44 px;
- reduced motion schakelt niet-essentiële kamertransitie uit en voorkomt geforceerde smooth camerascroll;
- de browsermatrix bevat ook de 3D-printerspecialist en gebruikt 390×844, 1024×900 en 1440×900 voor de echte kamercomponenten;
- de zwembadsamenvatting volgt het bevestigde broncontract: vrije tekst bepaalt geen ernst, required unavailable wint, heater-off is normaal en zoutfout gebruikt een powermeting plus drempel;
- het Energy-paritymanifest legt vast wat deze alpha wel en niet claimt.

Er zijn geen nieuwe Home Assistant-serviceflows, automatische mappings of configuratiewrites toegevoegd.

## Bekende en bewuste grenzen

- Actuele Power Sankey, Energy-stale-detectie, upstream-apparaathiërarchie en volledige kosten-/vergoedingpariteit zijn uitgesteld naar een later product- of runtimebesluit.
- Zwembad-stale, proxybetekenis en tijdvenster-gebaseerde zoutfout blijven eigendom van een toekomstig broncontract.
- Robot-, tuin- en volledige zwembadintegratie blijven achter hun afzonderlijke bronrepo-gates.
- HD-170 sluit pas na 200%-zoom-, screenreader-, echt themacontrast- en visuele review op deze kandidaat.

## Lokale releasegate

- `pnpm test`.
- `pnpm run test:browser`.
- `git diff --check`.
- `pnpm run release:assets` na de definitieve releasecommit, met `GITHUB_SHA` van exact die commit.
- Onafhankelijke diffreview zonder open P0/P1.

## Testdashboardgate — vóór iedere Home Assistant-write invullen

- Exact testdashboard: **nog goed te keuren**.
- Verse dashboardexport/snapshot: **vereist**.
- Default `lovelace`-hash vóór test: **vereist**.
- Targetallowlist voor veilige acties: **vereist**.
- Goedgekeurde resourceversie en rollbackversie: **vereist**.

Zonder alle vijf waarden wordt de live test niet gestart.

## Nieuwe runtime- en accessibilitytest

### Installatie en basis

- Installeer of upgrade uitsluitend het goedgekeurde testdashboard naar `v0.8.0-alpha.19`.
- Open en herlaad alle vijf hoofdviews plus kamer-, Kia-, printer- en zwembadroute.
- Controleer dat het default dashboard vóór en na dezelfde hash houdt.

### Responsive en bediening

- Controleer telefoon, wandtablet en desktop in light en dark.
- Bevestig 200% zoom zonder horizontale scroll, clipping of onbereikbare bediening.
- Controleer camera-, editor- en kamerdoelen op minimaal 44×44 px.
- Activeer reduced motion en bevestig dat camerabeweging en kamerchevron niet onnodig animeren.
- Test keyboardvolgorde, zichtbare focus, Escape, dialogfocus en focusherstel.

### Screenreader en contrast

- Gebruik NVDA of VoiceOver voor headings, landmarks, knoppenamen, pressed/expanded states, statusmeldingen en dialognaam.
- Controleer tekst-, status- en focuscontrast in de werkelijk actieve Home Assistant-thema's.
- Leg afwijkingen vast zonder private namen, identifiers of screenshots met woninginformatie.

### Energie

- Vergelijk dezelfde periode met het ingebouwde Energy-dashboard.
- Controleer uitsluitend geconfigureerde import/export, solar, batterij, gas, water en apparaten.
- Controleer dat lokale tiles context zijn en niet opnieuw tot een totaal worden opgeteld.
- Markeer actuele Power Sankey en stale expliciet als uitgesteld; interpreteer het ontwerp-prototype niet als productbewijs.

### Zwembad

- Controleer normal idle, actief zonder heater, warmtepompfout, heater unavailable en partiële uitval.
- Vrije statustekst mag de ernst niet wijzigen.
- Leesbare temperaturen blijven zichtbaar wanneer één andere vereiste bron unavailable is.
- Voer geen zwembadactie uit; deze centrale samenvatting is read-only.

## Rollbackscope

- Voor commit of PR: verwerp uitsluitend de lokale diff; er is geen externe toestand gewijzigd.
- Na merge maar vóór testdeployment: revert de alpha.19-commit en bouw de vorige goedgekeurde bundle opnieuw.
- Na een goedgekeurde testdeployment: herstel alleen het testdashboard uit de verse snapshot en zet de eerder goedgekeurde resourceversie terug.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.

## Resultaat

Lokaal resultaat op 23 september 2026:

- `pnpm test`: 88/88 tests geslaagd, inclusief typecheck, build, dist-, link-, privacy- en releaseflowchecks.
- `pnpm run test:browser`: alle vijf browserflows en de geconsolideerde matrix geslaagd.
- Editor-native invoer en zichtbare editorbediening zijn op het correct ingestelde desktopviewport gemeten; de 44×44-gate is groen.
- Bundle: 214.874 bytes; SHA-256 `e154191bb3f7710898575f0f379edbff9afc478a8d10e5a7562c27f7bd31f545`.
- `git diff --check`: geslaagd.
- Eerste onafhankelijke review vond geen correctness-, security-, actionscope- of privacy-P0/P1. De gevonden release- en accessibility-P1's zijn vóór deze eindronde opgelost: workflow-browsergate, touchmeting, viewportlabeling en te brede kwaliteitsclaims.
- De volledige patch, inclusief alle zeven nieuwe releasebestanden, is op een verse `origin/main`-archive toegepast. `pnpm test` en de browsermatrix slagen daar eveneens; de opnieuw gebouwde bundle is byte-voor-byte gelijk en heeft dezelfde SHA-256.
- De gerichte onafhankelijke rereview bevestigt dat alle gemelde P1's gesloten zijn en geen concrete P0/P1-releaseblocker resteert.
- De lokaal gegenereerde assets hebben nog `commit: local` en zijn daarom alleen verificatiebewijs. Definitieve assets worden uitsluitend na een goedgekeurde commit opnieuw met exact `GITHUB_SHA` gegenereerd.

Alle lokale gates zijn afgerond. Commit, PR, prerelease en de nieuwe live/accessibilitytest blijven afzonderlijke menselijke besluiten; live resultaten volgen uitsluitend na de ingevulde testdashboardgate.
