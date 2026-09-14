# Testrelease v0.8.0-alpha.12 — printer consistent met de andere specialisten

## Testscope

- Fix, gemeld na live-test van v0.8.0-alpha.11: de 3D-printerspecialist toonde haar volledige samenvattingskaart rechtstreeks op Home (in een eigen sectie) en op Domeinen (foutief in de "Systeem"-sectie), in plaats van zich — net als Kia, robot, tuin en zwembad — te beperken tot een klein navigatieknopje dat naar de bestaande detailpagina doorverwijst.
- Home toont nu voor printer, net als voor de andere ingeschakelde specialisten, alleen een compacte navigatietegel ("Printer" / "Werkplaats") in het specialistenraster. Er verschijnt geen aparte, brede sectie meer.
- Domeinen toont printer nu in de sectie "Mobiliteit & buiten", als een navigeerbare tegel gebonden aan de statusentiteit (live status, native HA-rendering) — zelfde patroon als het zwembad, in plaats van de losse "Systeem"-sectie.
- De `specialist-printer`-detailpagina zelf (samenvattingskaart, printtaakdetails, filamentslots, camera) is ongewijzigd.

## Geautomatiseerd bewijs en open acceptatie

De fictieve suite bevestigt dat Domeinen niet langer de volledige `custom:home-dashboard-printer-summary`-kaart embedt, en dat de printerstatus wel als navigeerbare tegel aanwezig is. Een bundelcontrole bevestigt dat het "Werkplaats"-label (printer's navigatietegel) aanwezig blijft in de gebouwde bundel.

Dit is geen live Home Assistant-acceptatie. Voor een runtime-test is afzonderlijk vereist: een exact goedgekeurd testdashboard, een verse snapshot met rollbackpad en een menselijke gate.

## Upgrade en rollback

- Selecteer na publicatie in HACS v0.8.0-alpha.12 en herlaad uitsluitend de frontend van het goedgekeurde testdashboard.
- Controleer dat Home voor de printerspecialist alleen een klein navigatieknopje toont (geen brede sectie meer), en dat Domeinen de printer als tegel toont in "Mobiliteit & buiten" in plaats van in "Systeem".
- Rollback: selecteer v0.8.0-alpha.11 in HACS en herlaad de frontend. Geen configuratiemigratie nodig.
