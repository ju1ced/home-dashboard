# Zwembadspecialist — renders

## Samenvattingskaart

Render van de zelfstandige `custom:home-dashboard-pool-summary`-kaart (zie [Specialistische kaarten](../../configuration/specialists.md#zwembad)), rechtstreeks uit de gebouwde `dist/home-dashboard.js` geladen in een lokale headless-Chromium-harness — geen nagebouwde mockup, wel dezelfde gecompileerde kaartcode als in de PR.

| Toestand | Inhoud |
|---|---|
| Warmtepomp actief (heat) | volledige mapping, normale toon, alle metrics gevuld |
| Warmtepompfout | `has_error` is `on` → rode **Warmtepompfout**-status |
| Onvolledige mapping | geen `entities` geconfigureerd → oranje **Zwembadstatus onvolledig** |

- [Samenvattingskaart, drie toestanden](summary-card-states.png)

Fictieve data; geen live Home Assistant-verbinding. De harness stubt alleen de HA-kleurtokens die het dashboard zelf niet via het paletsysteem zet (`--warning-color`, `--error-color`, `--disabled-text-color`); `ha-icon` toont daardoor geen pictogram buiten de echte HA-frontend en de kaart mist een deel van HA's eigen chrome (schaduw/achtergrondafstemming).

## Detailpagina

De detailpagina (`specialist-pool`) is teruggebracht tot uitsluitend de samenvattingskaart plus route — zie hierboven. `detail-page-approximation.png` in deze map is een render van een eerdere versie die ook losse warmtepomp-/systemen-tegels toonde; dat is uit deze PR geschrapt (zie review-item 1: geen zelfstandig geteste HACS-kaart, dus geen volledige native detailweergave). Het bestand staat nog in de map maar is niet langer representatief; een nieuwe render volgt zodra een echte detailkaart er is.
