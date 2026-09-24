# Zwembadstatuscontract

Peildatum: 23 september 2026. Dit document sluit HD-150 af tegen de zelfstandig geteste bronkaart `pool` op commit `f622c19`. Alleen privacyveilige keys en fictieve voorbeelden worden gebruikt.

## Configuratiegrens

De compacte centrale samenvatting vereist:

- `water_temperature`;
- `target_temperature`;
- `ambient_temperature`;
- `heater_power`.

`status` is optioneel. Ontbreekt een vereiste mapping, dan is de uitkomst **Zwembadstatus onvolledig**. De centrale repository kopieert geen merkspecifieke codes, automatiseringsvensters of serviceflows uit de bronkaart.

## Runtimeprecedence

Na geldige configuratie geldt:

1. **Unavailable** — een vereiste bron, of de optioneel geconfigureerde statusbron, is missing, unknown of unavailable.
2. **Critical: warmtepompfout** — de expliciete `has_error`-bron is actief.
3. **Critical: zoutsysteemfout** — het zoutsysteem staat aan en de gemeten power ligt onder de expliciete `fault_below_watts`; standaard 15 W.
4. **Warning** — handmatige overrides blijven eigendom van de zelfstandige bronkaart en worden centraal niet opnieuw afgeleid.
5. **Active** — heater, compressor, circulatiepomp, filterpomp of het zoutsysteem is actief.
6. **Normal** — geen actieve installatie en geen hogere toestand.

Unavailable wint bewust van critical: bij onleesbare vereiste brondata is de aggregate toestand niet betrouwbaar genoeg voor een stellige foutclassificatie.

## Randgevallen

| Geval | Contract |
|---|---|
| Vrije tekststatus | Alleen beschikbaarheidscontrole; tekst bepaalt label of ernst niet |
| Heater uit | Geen fout; normal tenzij een ander installatieonderdeel actief is |
| Heater unavailable | Aggregate unavailable; nooit behandelen als uit |
| Warmtepompfout | Alleen de expliciete foutvlag maakt de toestand critical |
| Zoutsysteemfout | Numerieke powermeting plus aan/uit-bron en drempel; geen binaire interpretatie van de powermeting |
| Proxy offline | Alleen diagnostiek in de bronkaart; geen centrale warning/critical zonder nieuw broncontract |
| Stale | Niet geïmplementeerd in de bronstatus en daarom uitgesteld |
| Partieel unavailable | Aggregate unavailable, maar iedere nog leesbare temperatuur blijft afzonderlijk zichtbaar |
| Conflicterende critical-signalen | Warmtepompfout wint door de vaste evaluatievolgorde |

## Fictieve regressiegevallen voor een latere volledige zwembadcard

Normal idle, active zonder heater, neutrale vrije tekst, verdachte vrije tekst zonder foutvlag, required unavailable plus foutvlag, heater unavailable, warmtepompfout, dubbele critical, zout onder drempel terwijl aan, zout onder drempel terwijl uit, zoutmeting unavailable, proxy off, proxy unavailable, partiële required uitval, optionele diagnostiek unavailable en een expliciet pending stale-geval.

## Uitgestelde bronvragen

- Er bestaat geen publiek freshnesscontract voor stale.
- De autoritatieve tijdvenster-gebaseerde zoutfout blijft backendautomatisering en wordt niet centraal gekopieerd.
- Merkspecifieke status- en proxycodes worden niet geïnterpreteerd zonder een nieuw getest broncontract.

De huidige alpha bevat uitsluitend de compacte read-only samenvatting. HD-151 blijft een afzonderlijke bronrepo-/releasebeslissing.
