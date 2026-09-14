# 3D-printerspecialist — samenvattingskaart

Render van de zelfstandige `custom:home-dashboard-printer-summary`-kaart (zie [Specialistische kaarten](../../configuration/specialists.md#3d-printer)), rechtstreeks uit de gebouwde `dist/home-dashboard.js` geladen in een lokale headless-Chromium-harness — geen nagebouwde mockup, wel dezelfde gecompileerde kaartcode als in de PR.

| Toestand | Inhoud |
|---|---|
| Bezig met printen | volledige mapping, normale toon, alle metrics gevuld |
| Printfout | `job_failed` is `on` → rode **Printfout**-status |
| Onvolledige mapping | geen `entities` geconfigureerd → oranje **Printerstatus onvolledig** |

- [Samenvattingskaart, drie toestanden](summary-card-states.png)

Fictieve data; geen live Home Assistant-verbinding. De harness stubt alleen de HA-kleurtokens die het dashboard zelf niet via het paletsysteem zet (`--warning-color`, `--error-color`, `--disabled-text-color`); `ha-icon` toont daardoor geen pictogram buiten de echte HA-frontend en de kaart mist een deel van HA's eigen chrome (schaduw/achtergrondafstemming). De detailpagina (`specialist-printer`) bouwt op native Lovelace-kaarttypes (`tile`, `picture-entity`, `heading`, `grid`) die alleen binnen een echte Home Assistant-frontend renderen en kon hierdoor niet los gerenderd worden.
