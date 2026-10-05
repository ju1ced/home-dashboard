# Multi-dashboard resource-audit (HD-172)

Peildatum: 5 oktober 2026. Dit is een **read-only** inventaris van alle globale Lovelace-frontendresources en hun dashboardconsumenten, uitgevoerd rechtstreeks tegen de live Home Assistant-instantie via de read-only MCP-tools. Geen enkele resource is verwijderd, gewijzigd of aangeraakt tijdens deze audit — exact zoals HD-172's acceptatiecriteria vereisen.

## Methode

- `ha_config_list_dashboard_resources` voor de volledige, huidige globale resourcelijst.
- `ha_config_get_dashboard(list_only=true)` voor de volledige dashboardlijst.
- Per dashboard: de volledige configuratie opgehaald en **lokaal met `jq` gefilterd tot uitsluitend de unieke `type`-waarden** (bv. `custom:mushroom-light-card`) — nooit de volledige, ruwe configuratie in een rapport of commit beland. Dit is bewust zo gedaan: de volledige configs bevatten echte entity-ID's, GPS-coördinaten en persoonsnamen, wat direct in strijd zou zijn met de privacyregels in `AGENTS.md` ("Geen entity-/device-ID's... coördinaten... in code, docs, logs"). Alleen de kaarttype-identifiers (softwarenamen, geen persoonlijke data) worden hieronder vermeld.
- Alle zes dashboards op de instantie zijn gecontroleerd: `lovelace` (standaard/Overview), `home-dashboard` (dit project), `dashboard-test` (admin-only staging), `casa-dashboard-community`, `map` (ingebouwde kaartstrategie) en `kia-ev6` (YAML-modus).

## Dashboardoverzicht

| Dashboard | Modus | Rol | Bevinding |
|---|---|---|---|
| `lovelace` (standaard) | storage | Het echte, dagelijkse gezinsdashboard — veruit de grootste resourceconsument (25+ views) | Blijft, zoals altijd, strikt read-only tijdens dit onderzoek |
| `home-dashboard` | storage (strategy) | Dit project | Gebruikt alleen zijn eigen resource plus `linak-desk-card`, `kia-dashboard-card`, `garden-dashboard-card`, en de eigen printer-/poolsummary's (geen externe resource daarvoor nodig, native) |
| `dashboard-test` | storage | Admin-only staging-omgeving voor nieuwe specialistkaarten | Enige plek waar `robot-vacuum-dashboard-card` en `dynamic-energy-shadow-card` momenteel al geconfigureerd staan — nog niet op `lovelace` of `home-dashboard` |
| `casa-dashboard-community` | storage | Leeg (`views: []`) | Geen consumer van iets |
| `map` | storage (strategy) | Ingebouwde HA-kaartstrategie | Geen custom resources |
| `kia-ev6` ("Nebula") | YAML | Zelfstandig Kia-specifiek dashboard | Gebruikt alleen `button-card`, `decluttering-card` en `layout-card` — niet `kia-dashboard-card` zelf |

## Resource-consumentenmatrix

48 geregistreerde globale resources (was 52 volgens de verouderde vermelding in `integration-strategy.md` — dat getal is dus zelf al achterhaald en wordt hieronder gecorrigeerd).

### Bevestigd in gebruik (consument ≥ 1 dashboard)

| Resource | Kaarttype(n) | Consument(en) |
|---|---|---|
| lovelace-mushroom | `custom:mushroom-*` (9 varianten) | `lovelace` (zeer uitgebreid, tientallen views) |
| decluttering-card | `custom:decluttering-card` | `lovelace`, `kia-ev6` |
| button-card | `custom:button-card` | `lovelace`, `kia-ev6` |
| lovelace-expander-card | `custom:expander-card` | `lovelace` |
| stack-in-card | `custom:stack-in-card` | `lovelace` |
| lovelace-paper-buttons-row | `custom:paper-buttons-row` | `lovelace` |
| kiosk-mode | dashboardniveau-config (`kiosk_mode`), geen kaarttype | `lovelace` |
| lovelace-battery-entity-row | `custom:battery-entity-row` | `lovelace` |
| lovelace-fold-entity-row | `custom:fold-entity-row` | `lovelace` |
| apexcharts-card | `custom:apexcharts-card` | `lovelace` |
| advanced-camera-card | `custom:frigate-card` (legacy tagnaam, zelfde package) | `lovelace` |
| mini-graph-card | `custom:mini-graph-card` | `lovelace` |
| canvas-gauge-card | `custom:canvas-gauge-card` | `lovelace` |
| lovelace-auto-entities | `custom:auto-entities` | `lovelace` |
| restriction-card | `custom:restriction-card` + de inline CSS-resource (globale restriction-card-stijl) | `lovelace` |
| mini-media-player | `custom:mini-media-player` | `lovelace` |
| bar-card | `custom:bar-card` | `lovelace` |
| power-flow-card-plus | `custom:power-flow-card-plus` | `lovelace`, `dashboard-test` |
| power-distribution-card | `custom:power-distribution-card` | `lovelace` |
| linak-desk-card | `custom:linak-desk-card` | `lovelace`, `home-dashboard` (optioneel bureau-capability) |
| rain-gauge-card | `custom:rain-gauge-card` | `lovelace` |
| lovelace-windrose-card | `custom:windrose-card` | `lovelace` |
| lovelace-state-switch | `custom:state-switch` | `lovelace` |
| battery-state-card | `custom:battery-state-card` | `lovelace` |
| lovelace-template-entity-row | `custom:template-entity-row` | `lovelace` |
| lovelace-multiple-entity-row | `custom:multiple-entity-row` | `lovelace` |
| vertical-stack-in-card | `custom:vertical-stack-in-card` | `lovelace` |
| flex-horseshoe-card | `custom:flex-horseshoe-card` | `lovelace` |
| hass-anycubic_card | `custom:anycubic-card` | `lovelace` |
| sensor-monitor-card | `custom:sensor-monitor-card` | `lovelace` |
| simple-thermostat | `custom:simple-thermostat` | `lovelace` |
| lovelace-layout-card | `custom:layout-card` | `kia-ev6` |
| ha-kia-connect-dashboard | `custom:kia-dashboard-card` (vermoedelijke tagnaam-match, niet 1-op-1 met de packagenaam) | `lovelace`, `dashboard-test` |
| garden-dashboard | `custom:garden-dashboard-card` | `lovelace`, `dashboard-test` |
| pool-dashboard | `custom:pool-dashboard-card` | `lovelace` |
| home-dashboard | `custom:home-dashboard` (strategy) | `home-dashboard` (dit project, triviaal eigen gebruik) |
| hass-bha-icons | icoonpack (bv. `bha:heat-pump`), geen kaarttype | `dashboard-test` (bevestigd via icoonverwijzing) |

### Bevestigd in gebruik, maar uitsluitend op de staging-omgeving (nog niet op `lovelace` of `home-dashboard`)

| Resource | Kaarttype | Consument |
|---|---|---|
| robot-vacuum-dashboard | `custom:robot-vacuum-dashboard-card` | alleen `dashboard-test` |
| dynamic-energy-dashboard | `custom:dynamic-energy-shadow-card` | alleen `dashboard-test` |

Dit is een nuttige, structurele bevestiging: deze twee specialisten zitten exact waar het [implementatieplan](../design/integration-strategy.md) ze verwacht — HD-130/131 (robot) en de bredere dynamic-energy-integratie staan allebei als **Geblokkeerd** in `kanban.md` in afwachting van afzonderlijke bronrepo-/integratiewerk, en worden voorlopig alleen op de admin-only teststaging gebruikt, niet op een echt gezinsdashboard.

### Niet bevestigd via deze methode — **blokkeert verwijdering** (acceptatiecriterium: onbekende consumers blokkeren verwijdering)

| Resource | Waarom niet bevestigd | Vervolgstap |
|---|---|---|
| custom-brand-icons | Icoonpack; icoonverwijzingen (`icon: "custom:xyz"`) zijn niet gevangen door een kaarttype-gebaseerde zoekmethode | Vereist een aparte, gerichte icoonverwijzingscan vóór verwijdering overwogen wordt |
| hass-hue-icons | Zelfde reden als hierboven | Idem |
| ha-knx-uf-iconset | Zelfde reden als hierboven | Idem |
| browser_mod | Werkt via servicecalls/popups (`browser_mod.*`), niet via een kaart-`type`; `automatically-added` in de resourcenaam wijst op een integratie-geregistreerde resource, niet een losstaand toe te voegen/verwijderen kaart | Niet verwijderen zonder te controleren of automatiseringen/scripts `browser_mod`-services aanroepen |
| Bubble-Card | Geen `custom:bubble-card`-voorkomen gevonden op enig van de zes gecontroleerde dashboards | Kandidaat voor nader onderzoek — mogelijk recent toegevoegd en nog niet in gebruik, of alleen gebruikt binnen een niet-doorzoekbare structuur (bv. `picture-elements`) |
| vehicle-status-card | Geen voorkomen gevonden; `kia-ev6` gebruikt in plaats daarvan generieke `button-card`/`decluttering-card`-opbouw | Mogelijk een eerder geëvalueerd alternatief voor de Kia-kaart dat nooit in gebruik kwam |
| dual_gauge | Geen voorkomen gevonden op enig gecontroleerd dashboard | Sterkste kandidaat voor een werkelijk ongebruikte/vergeten resource — alleen te bevestigen na expliciete controle door de eigenaar |
| juiced-dashboard | Geen voorkomen gevonden; de naam suggereert een eerdere/voorloper-iteratie van dit project (`home-dashboard`) onder een andere naam | Waarschijnlijk legacy en veilig te verwijderen, maar dit vereist expliciete bevestiging door de eigenaar vóór verwijdering — niet aangenomen binnen deze audit |

### Buiten scope van de kaarttype-gebaseerde methode (geen bevinding, geen actie)

- **card-mod** (geïmpliceerd door `custom:mod-card` in `lovelace`'s configuratie) heeft **geen** overeenkomstige entry in de globale resourcelijst. Dit is verwacht gedrag, geen bevinding: `card-mod` registreert zich doorgaans via de eigen HACS-integratie (`frontend_extra_module_url`), niet via een los toe te voegen Lovelace-resource. Niets om hier op te volgen.

## Correctie op bestaande documentatie

`docs/design/integration-strategy.md` vermeldt nog "de huidige 52 resources" (vastgelegd 28 september 2026 of eerder). De werkelijke, op 5 oktober 2026 gemeten telling is **48**. Dit getal zelf bewijst waarom deze audit nodig was — de documentatie was al drie resources uit lijn met de werkelijkheid vóór er ook maar iets verwijderd werd.

## Acceptatiecriteria — status

- **Iedere resource heeft consumers, versie, noodzaak en rollbackimpact:** consumers zijn hierboven vastgelegd voor alle 48; versie-/noodzaak-/rollbackbeoordeling per resource is uitdrukkelijk **niet** onderdeel van deze eerste inventarisatieronde (dat is stap 2-3 uit `integration-strategy.md`'s Resource-audit-sectie, voor een vervolgticket zodra verwijdering van een specifieke resource ooit concreet voorgesteld wordt).
- **Geen resource verwijderd tijdens de audit:** bevestigd — uitsluitend read-only MCP-tools gebruikt, geen enkele schrijfactie.
- **Een eventueel verwijdermanifest is staged, reviewbaar en herstelbaar:** niet van toepassing — geen verwijdering wordt in dit document voorgesteld.
- **Onbekende consumers blokkeren verwijdering:** toegepast — de zes resources in de "niet bevestigd"-tabel zijn expliciet gemarkeerd als blokkerend voor verwijdering, in plaats van aangenomen als veilig.

## Volgende stappen (niet in deze ticket)

- Een gerichte icoonverwijzingscan voor de drie icoonpack-resources, als iemand ooit verwijdering daarvan overweegt.
- Expliciete bevestiging door de eigenaar voor `juiced-dashboard` (vermoedelijk legacy) en `dual_gauge` (vermoedelijk ongebruikt) vóór een eventueel verwijdermanifest opgesteld wordt.
- `integration-strategy.md`'s "52 resources"-vermelding bijwerken naar 48, met verwijzing naar dit document.
