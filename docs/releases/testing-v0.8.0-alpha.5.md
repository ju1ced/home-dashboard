# Testrelease v0.8.0-alpha.5 — visuele kameracties

Deze candidate maakt actieve kamerfuncties duidelijk zichtbaar, gebruikt waar mogelijk de Home Assistant-iconen van de gekozen entiteiten en verkort dubbele kamernamen. De editor verplaatst iedere quick action rechtstreeks naar een gekozen positie. Home krijgt een blauwe welkomstbalk en een koeler blauwgrijs basispalet.

## Instellen

1. Bewaar de huidige dashboardconfiguratie en noteer `v0.8.0-alpha.4` als rollbackversie.
2. Installeer de prerelease pas na publicatie via HACS en herlaad de frontend volledig.
3. Configureer uitsluitend het goedgekeurde testdashboard; default `lovelace` blijft read-only.
4. Kies onder Dashboard bewerken → Kamers → Knoppen op Home de gewenste entiteiten. Kies bij ieder item direct de gewenste positie.

## Te controleren

- Een verplaatsing van bijvoorbeeld positie zes naar positie één gebeurt met één selectie en blijft na opslaan behouden.
- Dubbele namen zoals `Licht Bureau Licht Bureau` worden verkort zonder betekenisvolle apparaatnaam te verliezen.
- Een ingesteld entiteitsicoon verschijnt op de chip; zonder icoon blijft het passende functie-icoon zichtbaar.
- Een brandend licht, spelende radio, open of bewegende cover en actief verwarmende of koelende klimaatbron zijn duidelijker dan de inactieve chips. Ieder type houdt ook expliciete statustekst.
- Het blauwe welkomsvlak blijft in light en dark mode leesbaar. Vandaag, camera, afvalophaling en de brede kamerdetailpagina blijven intact.
- Meerdere entiteiten van hetzelfde type en een lege quick-actionlijst blijven ondersteund.

## Lokaal bewijs en grenzen

Vijfenzestig geautomatiseerde tests slagen. De browsercheck maakt elf fictieve renders en valideert directe herordening, korte namen, entiteitsiconen, exacte servicecalls, lege lijsten, responsive bediening en `back_path: home`. De minified bundle blijft onder de harde grens van 184 kB.

De fixtures maken geen verbinding met Home Assistant. Test echte bediening alleen met de bestaande targetallowlist, verse snapshot en menselijke gate.

Rollback: selecteer via HACS `v0.8.0-alpha.4`, herlaad de frontend en herstel zo nodig de bewaarde configuratie.
