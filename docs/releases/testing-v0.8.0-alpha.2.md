# Testrelease v0.8.0-alpha.2 — uitklapbare kamerpanelen

Home gebruikt de beschikbare dashboardbreedte. Een favoriete kamerkop klapt bediening op dezelfde pagina open; alleen **Volledige kamer** navigeert naar de kamerdetailpagina. De afvalophaling blijft onderdeel van Vandaag.

## Instellen

1. Installeer deze prerelease via HACS en herlaad de frontend. Bewaar vooraf de huidige configuratie en noteer de vorige release voor rollback.
2. Gebruik de bestaande instellingen onder Dashboard bewerken → Kamers voor favorieten, directe bediening en de expliciete actiedoelen.
3. De chip Airco / verwarming gebruikt de bestaande klimaatbron. Bestaande licht-, media- en coverbronnen zonder actiedoel openen alleen details; zij worden niet automatisch directe bediening.

## Te controleren op het goedgekeurde testdashboard

- Controleer dat Home op desktop merkbaar breder kan worden en op 390 px zonder horizontale overflow blijft werken.
- Klap iedere favoriete kamer open via de kamerkop. De vijf chipsoorten verschijnen alleen wanneer er een bron voor is ingesteld.
- Controleer dat openen en sluiten niet navigeert. **Volledige kamer** opent wel de juiste kamerdetailpagina.
- Controleer verlichting en radio met zowel één als meerdere bronnen. Een meervoudige chip toont het aantal actieve en onbekende apparaten; individuele bronnen openen via de keuzelijst.
- Controleer Open/Stop/Dicht voor rolluiken en Uit/Stop/In met bevestiging voor de luifel. Bestaande feature-, domein- en autorisatiecontroles blijven gelden.
- Controleer dat Airco / verwarming het native HA-detailvenster opent en geen servicecall vanaf de chip uitvoert.
- Controleer dat afvalophaling, weer, energie, personen, camera's, aandacht en specialistische routes zichtbaar en bruikbaar blijven.
- Controleer licht en donker thema, mobiel, tablet, desktop, toetsenbordbediening, Escape-focusherstel en touchdoelen.

## Lokaal bewijs en grenzen

Op 7 september 2026 slagen `pnpm test` met 62 tests, `git diff --check` en zeven browser-renders voor desktop, tablet, mobiel, donker, warning, missing en unavailable. De reproduceerbare bundle blijft onder de grens van 180 kB. De fixtures zijn fictief en maken geen verbinding met Home Assistant.

De publicatie wijzigt geen Home Assistant-dashboard. Live servicecalls en integratiegedrag worden uitsluitend getest op het expliciet goedgekeurde testdashboard met de bestaande snapshot-, target- en rollbackgate. Default `lovelace` blijft read-only.

Rollback: selecteer via HACS `v0.8.0-alpha.1` en herlaad de frontend. De configuratievelden zijn compatibel met die versie.
