# Specialistische kaarten

## Kia in v0.7

De Kia-ingang is een kleine read-only samenvatting met acculading, bereik, laadstatus en dataversheid. Hij opent de stabiele subview `specialist-kia`, waar de bestaande HACS-kaart `custom:kia-dashboard-card` full-width wordt gerenderd. De centrale strategy kopieert geen voertuigberekeningen, kaarten, acties, confirmations of mappingdiagnostiek.

Activeer Kia onder **Dashboard bewerken → Kia, robot, tuin en zwembad**. Geef daar de geteste minimumversie op en plaats de volledige, private configuratie van de Kia-card als een geavanceerd JSON-object. Die configuratie gaat ongewijzigd naar de onafhankelijke kaart. Bijvoorbeeld, uitsluitend met fictieve sleutels:

```json
{
  "title": "Auto",
  "entities": {
    "battery_level": "kia_battery_primary",
    "battery_range": "kia_range_primary",
    "charging_state": "kia_charging_primary",
    "last_updated": "kia_updated_primary",
    "door_lock": "kia_lock_primary"
  }
}
```

Voor de samenvatting zijn de eerste vier mappings vereist. `door_lock` is optioneel; een bekende ontgrendelde status wordt als waarschuwing getoond. Gebruik de GUI-export uitsluitend als privé-back-up: echte entityreferenties horen nooit in Git, screenshots of supportlogs.

## Fallbacks

- Ontbrekende HACS-resource: een native uitlegblok vermeldt het verwachte cardtype en de opgegeven minimumversie; de rest van het dashboard blijft bruikbaar.
- Onvolledige mapping: de samenvatting meldt **Voertuigstatus onvolledig**; de Kia-card behoudt haar eigen mappingdiagnose.
- `unknown`, `unavailable` of een te oude `last_updated`: waarden worden niet als actueel gepresenteerd en de samenvatting vermeldt de toestand expliciet.
- Versiecontrole: de browser kan alleen zien dat de resource geladen is. Vergelijk de geïnstalleerde kaartversie zelf met de in de configuratie vastgelegde minimumversie vóór een runtime-test.

De detailkaart blijft eigenaar van lockcontrols en alle andere voertuigacties. Test die alleen volgens de veiligheids- en confirmationcontracten van de Kia-repository, op een afzonderlijk goedgekeurd testdashboard.

## 3D-printer

Anders dan Kia bestaat er (nog) geen onafhankelijk geteste HACS-kaart voor deze printerintegratie. De printeringang is daarom volledig zelfstandig: zowel de kleine read-only samenvatting als de volledige detailweergave worden native door dit dashboardpakket geregistreerd (`custom:home-dashboard-printer-summary`), met bestaande `tile`- en `picture-entity`-kaarttypes voor de detailweergave. Er is dus geen aparte HACS-installatie of geteste minimumversie van een externe kaart nodig.

Activeer 3D-printer onder **Dashboard bewerken → Kia, 3D-printer, robot, tuin en zwembad**. Plaats de entiteitmapping als een geavanceerd JSON-object. Bijvoorbeeld, uitsluitend met fictieve sleutels:

```json
{
  "title": "Werkplaatsprinter",
  "entities": {
    "status": "printer_status_primary",
    "progress": "printer_progress_primary",
    "time_remaining": "printer_time_remaining_primary",
    "nozzle_temperature": "printer_nozzle_primary",
    "bed_temperature": "printer_bed_primary",
    "nozzle_target": "printer_nozzle_target_primary",
    "bed_target": "printer_bed_target_primary",
    "job_name": "printer_job_name_primary",
    "current_layer": "printer_current_layer_primary",
    "total_layers": "printer_total_layers_primary",
    "last_error": "printer_last_error_primary",
    "last_error_code": "printer_last_error_code_primary",
    "job_failed": "printer_job_failed_primary",
    "insufficient_filament": "printer_insufficient_filament_primary",
    "loaded_filament_slot": "printer_loaded_slot_primary",
    "filament_slot_1": "printer_filament_slot_1_primary",
    "filament_slot_2": "printer_filament_slot_2_primary",
    "filament_slot_3": "printer_filament_slot_3_primary",
    "filament_slot_4": "printer_filament_slot_4_primary",
    "camera_entity": "printer_camera_primary",
    "job_preview_entity": "printer_job_preview_primary"
  }
}
```

Voor de samenvatting zijn de eerste vijf mappings (`status`, `progress`, `time_remaining`, `nozzle_temperature`, `bed_temperature`) vereist. `job_failed` en `insufficient_filament` zijn optionele binaire foutsignaal-entiteiten; wanneer één van beide `on` is, toont de samenvatting respectievelijk **Printfout** of **Filament bijna op**. Alle overige sleutels zijn optioneel en verschijnen alleen op de detailpagina wanneer ze zijn ingevuld:

- `nozzle_target`, `bed_target` — doeltemperaturen naast de actuele waarden.
- `job_name`, `current_layer`, `total_layers` — welk bestand print en hoe ver de laagopbouw staat.
- `last_error`, `last_error_code` — laatste foutmelding en -code.
- `loaded_filament_slot`, `filament_slot_1`…`filament_slot_4` — voor printers met een multi-slot filamentsysteem (bv. Anycubic ACE Pro, Bambu AMS); toont per slot het geladen materiaal en welk slot actief is.
- `camera_entity` — een `camera`-entiteit, getoond als `picture-entity`.
- `job_preview_entity` — een `image`-entiteit met de sliced-previewthumbnail van de huidige printtaak, eveneens als `picture-entity`.

### Welke integratie?

Dit contract is bewust integratieneutraal: elke Home Assistant-integratie die vergelijkbare entiteiten blootstelt (bijvoorbeeld een cloud-, Moonraker/Klipper- of OctoPrint-gebaseerde printerintegratie) kan hier gekoppeld worden door de bijpassende `entity_id`'s in te vullen. Er wordt geen specifiek merk of model verondersteld.

### Fallbacks

- Onvolledige mapping: de samenvatting meldt **Printerstatus onvolledig**.
- `unknown`, `unavailable` of ontbrekende waarden: de samenvatting en detailtiles tonen expliciet **Niet beschikbaar** in plaats van een verouderde waarde.
- Ontbrekende samenvattingsresource: dit zou enkel bij een gebroken build mogen voorkomen; een native uitlegblok verwijst dan naar het herladen van de browser.

## Zwembad

Anders dan Kia bestaat er geen onafhankelijk geteste HACS-kaart voor deze zwembadintegratie (een op maat gebouwde ESPHome-warmtepompproxy plus een Shelly-relais voor het zoutsysteem). De zwembadingang registreert daarom native alleen de kleine read-only samenvattingskaart (`custom:home-dashboard-pool-summary`) en de bijbehorende route; er is geen aparte HACS-installatie of geteste minimumversie van een externe kaart nodig. De detailpagina toont momenteel enkel die samenvattingskaart — een uitgebreidere detailweergave met losse entiteitstegels is bewust nog niet gebouwd (zie de PR-geschiedenis) en volgt pas via een eigen, onafhankelijk geteste kaart.

Activeer Zwembad onder **Dashboard bewerken → Kia, robot, tuin en zwembad**. Plaats de entiteitmapping als een geavanceerd JSON-object. Bijvoorbeeld, uitsluitend met fictieve sleutels:

```json
{
  "title": "Zwembad",
  "entities": {
    "status": "pool_status_primary",
    "water_temperature": "pool_water_temperature_primary",
    "target_temperature": "pool_target_temperature_primary",
    "ambient_temperature": "pool_ambient_temperature_primary",
    "heater_power": "pool_heater_power_primary",
    "has_error": "pool_has_error_primary",
    "salt_system_fault": "pool_salt_fault_primary",
    "error_description": "pool_error_description_primary",
    "compressor": "pool_compressor_primary",
    "circulate_pump": "pool_circulate_pump_primary",
    "coil_temperature": "pool_coil_temperature_primary",
    "exhaust_temperature": "pool_exhaust_temperature_primary",
    "filter_pump_state": "pool_filter_pump_primary",
    "proxy_online": "pool_proxy_online_primary"
  }
}
```

Voor de samenvatting zijn de eerste vijf mappings (`status`, `water_temperature`, `target_temperature`, `ambient_temperature`, `heater_power`) vereist. `has_error` en `salt_system_fault` zijn optionele binaire foutsignaal-entiteiten; wanneer één van beide `on` is, toont de samenvatting respectievelijk **Warmtepompfout** of **Zoutsysteemfout**. De overige sleutels (`error_description`, `compressor`, `circulate_pump`, `coil_temperature`, `exhaust_temperature`, `filter_pump_state`, `proxy_online`) zijn gereserveerd voor een toekomstige uitgebreidere detailweergave; het contract accepteert ze nu al zodat bestaande configuraties niet later hoeven te migreren, maar er wordt momenteel nog niets mee gerenderd.

### Welke integratie?

Dit contract is bewust integratieneutraal: elke Home Assistant-integratie die vergelijkbare entiteiten blootstelt (een warmtepomp-, chlorinator- of zoutsysteembrug, ongeacht merk) kan hier gekoppeld worden door de bijpassende `entity_id`'s in te vullen. Er wordt geen specifiek merk of model verondersteld.

### Fallbacks

- Onvolledige mapping: de samenvatting meldt **Zwembadstatus onvolledig**.
- `unknown`, `unavailable` of ontbrekende waarden: de samenvatting en detailtiles tonen expliciet **Niet beschikbaar** in plaats van een verouderde waarde.
- Warmtepomp uitgeschakeld (`heater_power` is `off`): de samenvatting meldt **Warmtepomp uit** in plaats van de vrije-tekst statuswaarde.
- Ontbrekende samenvattingsresource: dit zou enkel bij een gebroken build mogen voorkomen; een native uitlegblok verwijst dan naar het herladen van de browser.
