# Configuratieschema v1

De canonieke machineleesbare bron is [`schemas/config.schema.json`](../../schemas/config.schema.json). `schema_version` is verplicht en heeft in deze release waarde `1`.

## Hoofdstructuur

| Sleutel | Betekenis |
|---|---|
| `general` | globale presentatie en stabiele startview |
| `today` | weer, afval en energiecontext |
| `persons` | lokale person- en batterijreferenties |
| `security` | alarm en een vrij aantal camera's/privacycontrols; bij ingeschakelde Security minimaal één camera |
| `rooms` | area/floor mapping, capabilities en quick actions |
| `energy` | standaard Energy-bronnen plus lokale KPI's |
| `actions` | expliciete actionallowlist en veiligheidsbeleid |
| `specialists` | adapters voor Kia, robot, tuin en zwembad |
| `layout` | zichtbaarheid, disclosure en vaste viewpaths |
| `diagnostics` | freshness en operationele unavailable-allowlist |

Alle stabiele objecten weigeren onbekende properties. Collecties hebben een `key` volgens `^[a-z][a-z0-9_]*$`. Deze logical keys zijn installatieonafhankelijk; echte entity-, floor- en area-ID's worden uitsluitend via de lokale GUI geselecteerd.

[`config/mapping.example.json`](../../config/mapping.example.json) documenteert de logical-keyconventie voor engineering en support. Kopieer echte mappings alleen naar een gitignored `*.local.json`-bestand; de normale gebruiker configureert dezelfde relaties via de GUI.

## Migratiecontract

- ontbrekende v1-velden krijgen gedocumenteerde defaults;
- configuratie zonder `schema_version` wordt als gedeeltelijke v1 geïnterpreteerd met een waarschuwing;
- een toekomstige schema-versie wordt nooit stil teruggeschreven;
- import/export heeft een verliesvrije v1-roundtrip;
- iedere latere release moet migratietests voor alle eerder gepubliceerde schema's behouden.

De browserbundle voert het canonieke JSON Schema zelf uit bij import en compilatie. Integer-, uniqueness-, required-, enum-, pattern-, `additionalProperties`- en area-of-devicevoorwaarden zijn dus geen documentatie-only regels.

### Kia-cardconfiguratie

`specialists.kia.card_config` is een expliciet geavanceerd object. Het bewaart de publieke configuratie van `custom:kia-dashboard-card` zonder die voertuiglogica naar deze repository te verplaatsen. Het object wordt bij migratie en export verliesvrij bewaard en altijd met het vaste cardtype `custom:kia-dashboard-card` gerenderd. Zie [Specialistische kaarten](../configuration/specialists.md) voor de minimale summarymappings en fallbacks.

## Coverage

De test vergelijkt alle editorvelden en complexe GUI-collecties met het JSON Schema. Defaults, normal/warning/missing/unavailable-fixtures, validator, migratie en compiler worden uit dezelfde gebundelde release getest.
