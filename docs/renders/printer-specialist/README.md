# 3D-printerspecialist — renders

## Samenvattingskaart

Render van de zelfstandige `custom:home-dashboard-printer-summary`-kaart (zie [Specialistische kaarten](../../configuration/specialists.md#3d-printer)), rechtstreeks uit de gebouwde `dist/home-dashboard.js` geladen in een lokale headless-Chromium-harness — geen nagebouwde mockup, wel dezelfde gecompileerde kaartcode als in de PR.

| Toestand | Inhoud |
|---|---|
| Bezig met printen | volledige mapping, normale toon, alle metrics gevuld |
| Printfout | `job_failed` is `on` → rode **Printfout**-status |
| Onvolledige mapping | geen `entities` geconfigureerd → oranje **Printerstatus onvolledig** |

- [Samenvattingskaart, drie toestanden](summary-card-states.png)

Fictieve data; geen live Home Assistant-verbinding. De harness stubt alleen de HA-kleurtokens die het dashboard zelf niet via het paletsysteem zet (`--warning-color`, `--error-color`, `--disabled-text-color`); `ha-icon` toont daardoor geen pictogram buiten de echte HA-frontend en de kaart mist een deel van HA's eigen chrome (schaduw/achtergrondafstemming).

## Detailpagina (benadering)

- [Detailpagina, benaderende render](detail-page-approximation.png)

De detailpagina (`specialist-printer`) bouwt op native Lovelace-kaarttypes (`tile`, `picture-entity`, `heading`, `grid`) die alleen binnen een echte Home Assistant-frontend renderen. Deze render roept de echte, gecompileerde `buildView()` (en daarmee `buildPrinterDetailSections()`) aan voor sectiestructuur, entity-ID's en waarden — dat deel is dus authentiek — maar de kaarttypes zelf zijn met eigen CSS nagebouwd omdat de native HA-kaartrenderer hier niet beschikbaar is. Geen exacte HA-styling (ronde tile-iconen, kleur per `device_class`, echte cameraframes); de samenvattingskaart bovenaan in die render is wél de echte, ingebouwde component.
