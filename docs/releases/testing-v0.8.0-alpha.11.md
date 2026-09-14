# Testrelease v0.8.0-alpha.11 — 3D-printer- en zwembadspecialist

## Testscope

- Twee nieuwe, standaard **uitgeschakelde** specialisten, elk volgens hetzelfde `SpecialistConfig`-patroon als Kia: activeer ze onder **Dashboard bewerken → Kia, 3D-printer, robot, tuin en zwembad**.
- **3D-printer**: read-only samenvatting (status, voortgang, resterende tijd, nozzle-/bedtemperatuur, optionele filamentwaarschuwing) op Home en Domeinen, plus een volledige `specialist-printer`-detailpagina (printtaaknaam, laagteller, doeltemperaturen, laatste fout(code), multi-slot filamentstatus, camerabeeld en printtaak-preview). Geen externe HACS-kaartafhankelijkheid — dit dashboardpakket registreert zowel de samenvattings- als de detailkaart zelf.
- **Zwembad**: read-only samenvatting (status, water-/doel-/buitentemperatuur, optionele warmtepomp-/zoutsysteemfout) op Home en Domeinen, met een `specialist-pool`-route. Geen externe HACS-kaartafhankelijkheid — dit dashboardpakket registreert de samenvattingskaart zelf; de detailpagina beperkt zich vooralsnog tot diezelfde samenvattingskaart. Een uitgebreidere detailweergave met losse entiteitstegels volgt later via een eigen, onafhankelijk geteste kaart.
- Beide specialisten blijven, wanneer uitgeschakeld, volledig onzichtbaar: bestaande views (Home, Kamers, Energie, Domeinen, Meer, Kia) veranderen niet.
- Navigatie: `specialist-printer` en `specialist-pool` normaliseren correct naar **Domeinen** als actieve hoofdroute in geïntegreerde en kiosknavigatie (`aria-current="page"`).
- Bundelbudget verhoogd van 198 kB naar 212 kB om beide specialisten samen te dragen — zie `scripts/verify-dist.mjs` voor de reproduceerbare meting en goedkeuring.

## Geautomatiseerd bewijs en open acceptatie

De fictieve suite dekt voor beide specialisten normal, warning, missing en unavailable presentatiestaten af, plus de configcontract-, migratie- en schemavalidatie. Voor de printerspecialist zijn ook de detailtegels (printtaakdetails, filamentslots) en de camera-/preview-`picture-entity`-kaarten gedekt; voor de zwembadspecialist is expliciet getest dat de detailpagina zich beperkt tot de samenvattingskaart zonder losse entiteitstegels. Zie ook de afzonderlijke renders in [`docs/renders/pool-specialist/`](../renders/pool-specialist/README.md) en de printer-renders in de PR-geschiedenis.

Dit is geen live Home Assistant-acceptatie. Voor een runtime-test is afzonderlijk vereist: een exact goedgekeurd testdashboard, een verse snapshot met rollbackpad en een menselijke gate. Default `lovelace` blijft read-only; beide specialisten zijn read-only (geen `tap_action`/`hold_action`/`double_tap_action` die een servicecall uitvoert).

## Upgrade en rollback

- Selecteer na publicatie in HACS v0.8.0-alpha.11 en herlaad uitsluitend de frontend van het goedgekeurde testdashboard.
- Beide specialisten staan standaard uit; schakel ze afzonderlijk in via **Dashboard bewerken → Kia, 3D-printer, robot, tuin en zwembad** en vul de geavanceerde cardconfiguratie met de eigen entiteitmappings (zie [Specialistische kaarten](../configuration/specialists.md)).
- Controleer de samenvattingskaarten op Home en Domeinen, en de detailroutes `specialist-printer` en `specialist-pool` (inclusief `aria-current` in de navigatie), in normal-, warning-, missing- en unavailable-toestand.
- Rollback: selecteer v0.8.0-alpha.10 in HACS en herlaad de frontend. Beide specialisten waren daarvóór niet aanwezig; er is geen configuratiemigratie nodig om terug te rollen (schakel ze desgewenst zelf uit vóór de rollback). Herstel zo nodig de vooraf gemaakte privéconfiguratiebackup.
- Verwijder geen globale resource; deze release voegt geen nieuwe HACS-afhankelijkheden toe.
