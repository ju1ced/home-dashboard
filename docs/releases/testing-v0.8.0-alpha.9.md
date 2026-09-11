# Testrelease v0.8.0-alpha.9 — vaste navigatie, kiosk en configuratie

## Testscope

- Dezelfde volle-breedte navigatiebalk en knopposities op alle vijf hoofdviews, kamerdetails en Kia, op mobiel, tablet en desktop.
- Kiosk verbergt de native HA-header zonder extra frontendresource; de interne navigatie blijft beschikbaar.
- Het beheerdersstandwiel **Dashboard instellen** opent de native strategy-editor. Onbekende frontendmarkup geeft een zichtbare HA-balk met een beheerlink als fallback.
- **Home Assistant-balk tonen** en **Kiosk hervatten** werken per card/view; `?disable_km` blijft via de interne links behouden.
- Home-begroeting, weer, afval, energiecontext, personen, camera's en kamerbediening blijven behouden. Schema v1 en bestaande actiebeveiliging veranderen niet.

## Bewijs en open acceptatie

De [volledige navigatiechecklist](testing-navigation-consistency.md) bevat de reproduceerbare tests, veiligheidsreview, compatibiliteitsgrenzen en nog af te tekenen HA-runtimechecks. De geautomatiseerde suite en fictieve browserharnassen zijn geen bewijs van live Home Assistant-acceptatie. De frontendadapter blijft versiegevoelig; controleer kiosk, editor en herstel op de geïnstalleerde HA-versie vóór dagelijks gebruik.

De alpha-release autoriseert geen automatische installatie, HA-write of productiecutover. Een live test vereist het exact goedgekeurde testdashboard, een verse snapshot en de bestaande menselijke gate. Het default dashboard blijft read-only.

## Upgrade en rollback

- Selecteer na publicatie in HACS v0.8.0-alpha.9 en herlaad de frontend, uitsluitend binnen de goedgekeurde testscope.
- Voeg bij problemen met kiosk `?disable_km` toe aan de dashboard-URL. Dit herstelt frontendtoegang zonder configuratiewrite.
- Rollback: selecteer de vorige prerelease v0.8.0-alpha.8 in HACS en herlaad de frontend. Herstel zo nodig de vooraf gemaakte privéconfiguratiebackup.
- Verwijder geen globale resource; externe kioskconfiguratie wordt door deze release niet gewijzigd.
