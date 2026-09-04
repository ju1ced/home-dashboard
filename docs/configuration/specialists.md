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
