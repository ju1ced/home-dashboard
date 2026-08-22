# Informatiearchitectuur

## Navigatiemodel

De gewone Home Assistant-sidebar blijft buiten het dashboard. Binnen `home-dashboard` zijn er vijf vaste native hoofdviews. Alle detailpagina's zijn subviews met enkelvoudige, stabiele paths en een expliciet `back_path`.

```text
home
├─ waarschuwingen → passend kamer- of domeindetail
├─ Vandaag → weer, afval en compacte energie-/laadcontext
├─ persoon → domain-presence
├─ camerastrook → domain-security of passende kamer
├─ actieve ruimte → room-<key>
├─ Kia → specialist-kia
├─ robot → specialist-robot
└─ tuin → specialist-garden

rooms
└─ room-<key> voor iedere bevestigde woon-/buitenarea

energy
├─ Nu → actuele Power Sankey, balans, batterij en EV
├─ Historie → datum/vergelijking, usage, solar en Energy Sankey
├─ Inzicht → bronnen/kosten, grid, solar, carbon en zelfvoorziening
├─ Apparaten → totaal- en detailverbruik
└─ Water/gas → conditioneel plus lokale piek-, fase- en UPS-context

domains
├─ domain-security
├─ domain-climate
├─ domain-water
├─ domain-pool
├─ domain-mobility
├─ domain-cleaning
└─ domain-outdoor

more
├─ domain-weather-waste
├─ domain-presence
├─ domain-technical
└─ link naar afzonderlijk admin-dashboard

admin-dashboard (aanbevolen require_admin)
├─ diagnostics-system
├─ diagnostics-network
├─ diagnostics-batteries
├─ diagnostics-updates
├─ diagnostics-automations
└─ diagnostics-unassigned

domain-pool
└─ specialist-pool → volledige zwembadcard
```

`specialist-kia`, `specialist-robot` en `specialist-garden` zijn functioneel detail onder respectievelijk Mobiliteit, Schoonmaak en Buiten. In URL- en viewconfig worden geen numerieke indexen of onbewezen geneste slashpaths gebruikt.

## Hoofdviews versus subviews

| Type | Zichtbaar in primaire navigatie | Doel | Terugpad |
|---|---|---|---|
| Home | ja | operationele start | n.v.t. |
| Kamers | ja | alle bevestigde kamers per verdieping, met passende quick actions | n.v.t. |
| Energie | ja | volledige energiebalans, historie en relevante controls | n.v.t. |
| Domeinen | ja | woningbrede functies | n.v.t. |
| Meer | ja | secundaire functies en admin-ingang | n.v.t. |
| Kamer | nee | relevante status/bediening per ruimte | `rooms` |
| Domeindetail | nee | woningbrede status, actie, historie | `domains` of `more` |
| Specialist | nee | volledige bestaande custom card | passend domein of `home` |
| Diagnostiek | apart dashboard | beheer en bronkwaliteit | adminnavigatie |

## Inhoudshiërarchie per paginatype

### Home

1. Kritiek en relevante warnings.
2. Vandaag: weer, afval en compacte energie-/laadcontext.
3. Woningcontext en privacyveilige person cards: thuis, benoemde zone, onderweg of onbekend.
4. Horizontaal scrollbare beveiligingsstrook: alle gekozen camera's, streamfallback, expliciete privacystand en alarmstatus.
5. Actieve uitzonderingen.
6. Twee initiële quick actions: `Avondscene` en expliciet gemapt `Lichten beneden uit`.
7. Maximaal vier actieve ruimtes.
8. Vier vaste specialistische summaries.
9. Maximaal vijf primaire domeinlinks.

### Kamers-overzicht

1. Floorheading: Gelijkvloers, Boven en Buiten.
2. Alle bevestigde kamers; geen voorraad-/beheergroepen.
3. Per kamer primaire toestand en maximaal twee capability-afhankelijke quick actions.
4. Afzonderlijke detailingang naar `room-<key>`.
5. Geen lege controls; riskante, brede of privacygevoelige acties blijven detail-only.

### Energie

1. `Nu`: actuele Power Sankey, net-/productie-/verbruiksbalans, batterij/SoC en EV-laden.
2. `Historie`: gedeelde datumselectie en vergelijking, usage per bron/teruglevering, solar/forecast, powerhistorie en Energy Sankey.
3. `Inzicht`: sources/cost table, grid neutrality/balance, solar consumed, koolstofarm aandeel en self-sufficiency.
4. `Apparaten`: energy total/detail, floor-/area-groepering en relevante upstreamhiërarchie.
5. `Water/gas`: conditioneel de officiële kaarten en downstreamflow.
6. `Lokaal`: capaciteitspiek, fase-onbalans, EV-sessie/planning, UPS-/bronkwaliteit en configuratie/fallbackroute naar het ingebouwde Energy-panel.

### Kamer

1. Context en operationele warning.
2. Primaire capabilities: licht, cover, klimaat.
3. Media en scènes.
4. Volledige ondersteunde HVAC: setpoint, mode, preset, fan, swing, boost/afwezig en werkingsstatus.
5. Comfort/aanwezigheid: temperatuur, vocht, CO₂/luchtkwaliteit, lux, geluid en druk waar relevant.
6. Safety: openingen, beweging, rook/water, camera-ingang.
7. Apparaten: veilige control/lock, actueel vermogen, dagenergie en optionele spanning.
8. Secundair: comfort- en energiehistorie, batterijen en diagnose.

### Domein

1. Actuele toestand en uitzondering.
2. Veilige, expliciete actie.
3. Korte historie indien beslisrelevant.
4. Bronnen, mapping health en diagnostiek.
5. Gerelateerde subview of specialistische card.

### Diagnostiek

1. Kritieke systeemprestaties en uitval.
2. Integratie-/bronkwaliteit.
3. Updates en batterijen.
4. Automations/scripts/scenes beheerstatus.
5. Area-loze apparatuur, netwerk, 3D-printing en inventaris.

## Kandidaten voor kamernavigatie

De live inventaris bevat 26 geregistreerde areas. Zes lijken voorraad- of beheergroepen. Onderstaande twintig woon-/buitenkandidaten volgen uit de gesaniteerde inventaris en moeten vóór bouw door de eigenaar worden bevestigd; niets wordt op aantallen hardgecodeerd.

| Floor/groep | Kandidaatlabel | Path | Primaire capabilities |
|---|---|---|---|
| Gelijkvloers | Keuken | `room-keuken` | licht, cover, media, appliance/energie, robotcontext |
| Gelijkvloers | Bureau | `room-bureau` | licht, cover, klimaat, media, security |
| Gelijkvloers | Woonkamer | `room-woonkamer` | licht, media, cover, comfort |
| Gelijkvloers | Garage | `room-garage` | licht, opening/security, energie/EV, water |
| Gelijkvloers | Bijkeuken | `room-bijkeuken` | appliance, energie, water/lek |
| Gelijkvloers | Toilet | `room-toilet` | licht, beweging |
| Gelijkvloers | Serverruimte | `room-serverruimte` | safety en primaire techniek; diepe diagnose apart |
| Gelijkvloers | Inkomhal | `room-inkomhal` | licht, security, camera-ingang |
| Gelijkvloers | Eetkamer | `room-eetkamer` | licht, cover |
| Gelijkvloers | Berging | `room-berging` | licht, basisstatus |
| Boven | Badkamer | `room-badkamer` | licht, cover, klimaat, vocht, media |
| Boven | Slaapkamer | `room-slaapkamer` | licht, cover, klimaat, media, scènes |
| Boven | Kinderkamer | `room-kinderkamer` | licht, cover, klimaat, camera, scènes |
| Boven | Logeerkamer | `room-logeerkamer` | licht, cover, klimaat |
| Boven | Hal boven | `room-hal-boven` | licht, scènes |
| Buiten | Oprit | `room-oprit` | mobiliteit/EV, opening/lock, camera, licht |
| Buiten | Tuin en terras | `room-tuin-terras` | licht, covers, weer, vocht, irrigatie, camera |
| Buiten | Zwembad | `room-zwembad` | waterkwaliteit, filter, verwarming, energie |
| Buiten | Buitenkeuken | `room-buitenkeuken` | licht, power, outdoor status |
| Buiten | Tuinhuis | `room-tuinhuis` | licht, security, power, camera |

## Current-to-target dekkingsmatrix

| Huidige functionele dekking | Nieuwe dagelijkse locatie | Volledige locatie | Niet op Home |
|---|---|---|---|
| verlichting | actieve ruimte of bewezen quick action | kamer | alle lampen/entities |
| covers/rolluiken/luifels | alleen relevante open/actieve uitzondering | kamer + klimaat/buiten | globale technische controls |
| klimaat/HVAC | actieve vraag of comfortwarning | kamer + `domain-climate` | alle setpoints en historie |
| media/multiroom | alleen actieve relevante kamer | kamer | volledige spelerinventaris |
| alarm en lock | kritieke/waarschuwingsstatus | `domain-security` | onduidelijke one-tapbediening |
| openingen, beweging, rook en water | allowlisted warning | kamer + `domain-security` | alle binary sensors |
| camera's | alle eigenaar-gekozen previews met privacystatus; fallback per stream | `domain-security` + passende kamer | historie en camerabeheer |
| aanwezigheid/person cards | individuele kaart met fictieve/gelokaliseerde naam, thuis/zone/onderweg/onbekend en dataversheid | `domain-presence` | adres, coördinaten en trackerhistorie |
| weer | compacte context of echte warning | `domain-weather-waste` | volledige sensorlijst |
| afval | tijdige uitzondering | `domain-weather-waste` | permanente kalenderkaart |
| net, solar, batterij en piek | uitzonderlijke toestand en compacte status | hoofdview `energy` | geen diagnosegrafieken op Home |
| EV-laden | actieve/kostbare uitzondering | `energy` + `domain-mobility` | ongecontroleerde laadactie |
| water, warm water en lek | lek kritiek; uitzonderlijk gebruik | `domain-water` | tarieven/historie |
| UPS | alleen operationeel kritisch | `energy` + admin | detailtelemetrie |
| Kia | native summary | `specialist-kia` | trips, locatie, locks, instellingen |
| robotstofzuiger | native summary wanneer actief/fout | `specialist-robot` | kaart, zones, alle data |
| tuin/irrigatie/plant | warning of actieve irrigatie | `specialist-garden` + buitenkamer | alle vochtmetingen en drempels |
| zwembad | echte afwijking of actieve kostbare modus | `domain-pool` → `specialist-pool` met volledige zwembadcard | ongecontextualiseerde kostbare acties |
| scènes en scripts | maximaal twee eigenaar-gekozen acties | passende kamer/domein | generieke servicelijsten |
| automations | alleen operationele storing | admin diagnostics | volledige beheerstatus |
| updates en batterijen | alleen kritieke operationele uitzondering | admin diagnostics | generieke aantallen |
| netwerk en systeem | alleen ernstige woningimpact | admin diagnostics | dashboards vol technische KPI's |
| 3D-printing en filament | alleen veiligheid of actieve uitzondering indien gewenst | `domain-technical`/admin | grote inventaris/diagnose |
| voorraad-/beheergroepen | geen | admin/techniek indien nodig | kamernavigatie |
| area-loze apparatuur | operationele allowlist | passend domein of `diagnostics-unassigned` | generieke `unavailable`-ruis |

## Dekkingsbewijs in de bouwfase

De tabel hierboven is domeindekking, nog geen entity-paritybewijs. De bouwfase maakt een lokale current-to-target matrix met iedere relevante logische capability, bronview, nieuwe route, statussemantiek, actioncontract en testfixture. De echte identifiers blijven uitsluitend in de gitignored mapping.
