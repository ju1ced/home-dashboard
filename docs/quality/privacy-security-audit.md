# Volledige productaudit voor privacy en beveiliging (HD-201)

Peildatum: 5 oktober 2026, tegen `origin/main` commit `b60d796`. Dit is de eerste audit over het **volledige samengevoegde product** — alle hoofdviews, kamerdetails, Energie/Domeinen en alle specialistviews samen — in tegenstelling tot eerdere per-PR/per-slice reviews (zoals HD-102, die alleen de room-cardslice dekte).

## Methode

Onafhankelijke adversariale review tegen een `git archive`-kopie van `origin/main` (geen wijziging aan git-state of de primaire working tree tijdens het onderzoek), gevolgd door eigen verificatie van elke bevinding rechtstreeks tegen de bron vóór een fix geschreven werd. Scope exact volgens de vijf punten uit het ticket.

## 1. Entity-ID's / serienummers / MAC-adressen / interne hostnames/URL's / coördinaten / secrets

**Gecontroleerd, geen bevinding.**

- `node scripts/check-repo.mjs` (bevat de automatische `findPrivacyMatches`-privacyscan) over de volledige boom: schoon.
- Aanvullend: `findPrivacyMatches` rechtstreeks over alle 235 tracked bestanden gedraaid, inclusief extensieloze bestanden (`LICENSE`, `.github/CODEOWNERS`, `.gitignore`) — alleen de bewust-negatieve testfixtures in `tests/privacy-patterns.test.mjs` zelf matchten, en die staan al op de bestaande uitsluitingslijst in `scripts/check-repo.mjs`.
- Handmatige steekproeven voor patronen die regex kan missen: lat/long-vormige float-paren (geen), "serienummer"-vermeldingen (alleen in documentatie die de regel zelf beschrijft), losse IPv4-adressen (alleen lokale `127.0.0.1`-devserververwijzingen), en elke hostnaam in `.ts`/`.mjs`/`.md`/`.json`-bestanden (uitsluitend publieke domeinen: github.com, home-assistant.io, hacs.xyz, json-schema.org, of localhost — geen interne hostnamen of privé-IP-ranges).
- Fixtures gebruiken uitsluitend `SELECT_IN_GUI`/`CONFIGURE_IN_GUI`-placeholders, geen realistisch ogende verzonnen serienummers.

## 2. Cameraprivacystanden en streamfallbacks end-to-end

**Eén P1-bevinding, gefixt in dit ticket.**

Gecontroleerd: `home-dashboard-camera-strip.ts` (Home-strook + Security/Domeinen, die dezelfde component gebruiken), kamerdetail's `camera_entities` (alleen tekststatus, geen live beeld — bevestigd veilig, geen `<img>`/picture-entity-pad bestaat daar), en de printerspecialist's webcam (zie onder).

**P1 — fail-open bij een unavailable/unknown privacy-sensor (`src/cards/home-dashboard-camera-strip.ts`):**

`isPrivacyActive()` herkende alleen `"on"`/`"active"`/`"true"` als actieve privacy. Elke andere toestand — inclusief `"unavailable"`, `"unknown"`, of de entiteit volledig ontbrekend uit `hass.states` — viel door naar de standaard `"camera"`-tak, exact zoals een expliciete `"off"`. Rechtstreeks bevestigd tegen de uitgebrachte bundel vóór de fix:

```
getCameraPresentation("idle", "unavailable", "placeholder") // "camera" (fout)
getCameraPresentation("idle", "unknown", "placeholder")     // "camera" (fout)
getCameraPresentation("idle", undefined, "placeholder")     // "camera" (fout)
```

**Scenario:** een privacy-toggle-entiteit (bv. een `input_boolean` of een fysieke schakelaar als `privacy_entity`) valt tijdens een Zigbee-/Z-Wave-uitval of HA-herstart naar `unavailable`. Niets in het dashboard onderscheidde "privacy bevestigd uit" van "privacystatus onbekend" — de camerastrook toonde alsnog gewoon het live beeld, zonder enige waarschuwing dat de privacybescherming mogelijk is weggevallen. Exact het "onbedoelde beeldlek tijdens privacy-actief"-scenario uit het ticket, veroorzaakt door sensoruitval in plaats van een logicafout in de toggle zelf.

**Fix:** `getCameraPresentation()` krijgt een vierde, optionele parameter `hasPrivacyEntity` (default `false`, zodat bestaande aanroepen zonder geconfigureerde privacy-entiteit ongewijzigd gedrag houden). Wanneer een privacy-entiteit wél geconfigureerd is maar de toestand niet bevestigd `"off"`/`"false"` is, faalt de functie nu dicht (`"privacy"`) in plaats van open. Nieuwe regressietest in `tests/strategy.test.mjs` pint exact dit gedrag (unavailable/unknown/undefined → `"privacy"`; bevestigd `"off"` → nog steeds `"camera"`; geen privacy-entiteit geconfigureerd → ongewijzigd `"camera"`).

**P2 — printerwebcam heeft geen privacy-gating (`src/cards/home-dashboard-printer-integration.ts`):** de printercamera gebruikt een losse `EntityReference`, niet `CameraConfig`, en heeft dus geen `privacy_entity`/fallback-concept. Waarschijnlijk een bewuste productkeuze (een webcam op een filamentspoel is geen veiligheidscamera) en buiten de met naam genoemde scope van dit ticket (Home-strook/kamerdetail/Security). Vastgelegd voor de volledigheid, geen fix of vervolgticket — dit is geen privacylek, het is een ontwerpkeuze die nooit anders bedoeld was.

## 3. Personencardprecisie

**Gecontroleerd, geen bevinding.**

`personLocation()` (`src/cards/home-dashboard-home-overview.ts`) retourneert uitsluitend "Thuis" (home), de eigen zonenaam (benoemde zone), "Andere locatie" (onderweg) of de ruwe status (onbekend/unavailable) — nooit ruwe GPS-coördinaten. Beide renderplekken (Home-strook, twee aanroepsites) gebruiken exact dezelfde `personContext()`-logica; geen tweede codepad omzeilt dit.

**Aangrenzende noot, geen defect in dit project:** het tikken op een persoonskaart opent HA's eigen native `more-info-person`-dialoog, die wél een kaart met exacte coördinaten toont als de gebruiker entitytoegang heeft. Dit is standaard HA-gedrag, al expliciet vastgelegd in `docs/design/decision-log.md` ("Kamerchips en detailcards openen uitsluitend het standaard `hass-more-info`-venster"), identiek aan elke andere entitytik in het dashboard. Geen nieuwe bevinding, puur ter vervollediging van het permanente auditrecord.

## 4. `require_admin`-grens en centrale actionallowlist/confirmationcontracten

**Eén P2-bevinding, vastgelegd als apart ticket (niet zelf opgelost — vereist een architectuurbeslissing van de eigenaar).**

- `require_admin` begrenst vandaag uitsluitend de "Dashboard instellen"-knop (`src/cards/home-dashboard-navigation.ts`) — consistent met HA's eigen editortoegangsconventie. HD-181 (apart admin-/diagnosedashboard) staat nog op Backlog; niets om daar te auditten, die oppervlakte bestaat nog niet.
- Werkelijke apparaatbediening wordt correct en consistent begrensd door twee onderling consistente allowlists (`planAction` in kamerdetail, `planEntityControl`/`planRoomControl` in de Home-strooksnelbediening) — roomscoped mapping, domeinprefix, `controls_enabled`, en `smart_plugs[].protected` worden stuk voor stuk gecontroleerd vóór een servicecallplan ooit geconstrueerd wordt. Luifelbevestiging en het tweetaps-"arm"-patroon voor covers werken zoals gedocumenteerd. Foutmeldingen worden bewust opgeschoond vóór ze de UI bereiken.
- **Gevonden tijdens deze audit, vastgelegd als [HD-214](#hd-214--centrale-actionallowlist-actionconfigprivacy_action_key-is-gedefinieerd-maar-nergens-uitgevoerd):** het volledig gedefinieerde, GUI-editable en schema-gevalideerde `ActionConfig`/`privacy_action_key`-contract wordt door geen enkele kaart ooit gelezen of uitgevoerd. Faalt vandaag niet open (er is geen enkel pad om het te triggeren), maar is misleidend productoppervlak: de editor accepteert en bewaart een configuratie die een werkende actie impliceert die niet bestaat. Vereist een architectuurbeslissing (aansluiten of verwijderen) vóór implementatie — daarom een apart ticket, niet binnen HD-201 zelf opgelost.

## 5. GUI-exportfunctie en diagnose-export

**Gecontroleerd, geen bevinding.**

De enige exportfunctie in de hele `src/`-boom is `exportConfig()` (`src/editor/home-dashboard-editor.ts`): een expliciete `window.confirm()`-waarschuwing die letterlijk benoemt dat de export installatiegegevens en entity-ID's kan bevatten, "bewaar hem privé en commit hem niet naar Git", vóór enige download. De download is uitsluitend client-side (`Blob`/`createObjectURL`, geen netwerkcall), bevat geen telemetrie of extra velden (`serializeConfig()` doet niets meer dan `JSON.stringify`), en de bestandsnaam `home-dashboard.local.json` matcht `.gitignore`'s `*.local.json`-patroon — een per ongeluk in de werkdirectory beland exportbestand zou dus nooit gestaged worden. Geen andere export-/diagnosefunctie bestaat vandaag.

## Samenvatting en status tegen de acceptatiecriteria

- **Geen open P0/P1-privacybevinding:** bevestigd ná de fix in dit ticket (het enige P1 is hierboven opgelost, met test). Vóór de fix was dit niet waar — de fix was dus een harde voorwaarde om dit ticket te kunnen afsluiten.
- **Iedere bevinding heeft een eigenaar en een reproduceerbare fictieve regressietest of fixture:** de P1 heeft nu beide (zie `tests/strategy.test.mjs`). De P2-bevindingen (printerwebcam, HD-214) zijn vastgelegd met duidelijke eigenaar/vervolgstap, niet stilzwijgend genegeerd.
- **Resultaat is een geanonimiseerd auditdocument zonder echte identifiers:** dit document bevat uitsluitend logische beschrijvingen, bestandsverwijzingen en code-identifiers — geen enkele echte entity-ID, coördinaat of persoonsnaam.
- **HD-190 start pas nadat deze audit groen is:** audit is nu groen (geen open P0/P1).

## Wat niet in deze ronde is gedaan

- HD-214's architectuurbeslissing (aansluiten vs. verwijderen van `ActionConfig`/`privacy_action_key`) blijft een apart ticket.
- De printerwebcam-privacygatingvraag is bewust niet als ticket vastgelegd — ingeschat als een geldige, bestaande productkeuze, niet een gat.
- Live Home Assistant-acceptatie van de fix blijft, zoals altijd, een afzonderlijke menselijke gate.
