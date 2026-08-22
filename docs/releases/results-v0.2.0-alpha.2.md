# Testresultaat v0.2.0-alpha.2

Datum: 2026-08-22

Scope: compacte grafische configuratie-editor

## Geslaagd

- De compacte configuratiemethode werkt goed in de Home Assistant-editor.
- Kamers kunnen vlot via de grafische configuratie worden ingesteld.
- De eerdere lange, verticale configuratielijst is geen blocker meer.

## Verbeterpunten

- Security mocht niet aan exact drie camera's gebonden zijn. Installaties kunnen één, twee, drie, zes of een ander positief aantal camera's hebben.
- Het was onvoldoende duidelijk dat een privacyactie eerst in het onderdeel **Acties** wordt aangemaakt en daarna bij een camera wordt geselecteerd.

Beide punten worden opgelost in `v0.2.0-alpha.3` met een configureerbare cameralijst en een directe route van Security naar Acties.

## Privacy en actionscope

Dit resultaat bevat geen screenshots, exports, echte IDs, interne URL of andere installatiegegevens. Tijdens de test is geen dashboardactie of Home Assistant-servicecall vanuit de prerelease uitgevoerd.
