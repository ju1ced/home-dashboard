# Installatie via HACS

## Ondersteuning

- Home Assistant 2026.8.2 of nieuwer;
- HACS met ondersteuning voor Dashboard-/pluginrepositories;
- een moderne browser met JavaScript modules.

De alpha-installatie gebruikt voorlopig een HACS custom repository. Aanvraag voor de standaard HACS-catalogus gebeurt pas na `v1.0.0` en stabiele gebruikerstests.

## Installeren

1. Open HACS in Home Assistant.
2. Open het menu en kies **Custom repositories**.
3. Voeg `https://github.com/ju1ced/home-dashboard` toe met categorie **Dashboard**.
4. Zoek **Home Dashboard** en kies de gewenste prerelease.
5. Download de release en vernieuw de browsercache wanneer HACS daarom vraagt.
6. Open **Instellingen → Dashboards → Dashboard toevoegen**.
7. Kies **Home Dashboard** onder Community dashboards.

Vanaf de strategy-release opent Home Assistant vóór het aanmaken de grafische configuratie-editor. De foundationrelease valideert uitsluitend installatie, resource loading en upgrades; zij maakt nog geen bruikbaar dashboard.

## Veiligheid

- Installatie verandert het default dashboard niet.
- Maak tijdens alpha-tests altijd een nieuw testdashboard.
- Voeg geen echte configuratie-export toe aan GitHub issues; die kan entity- en locatiegegevens bevatten.
- Verwijderen via HACS verwijdert de resource, maar niet automatisch een eerder aangemaakt dashboard.

## Updaten of terugrollen

Open de repository in HACS en kies **Redownload**. Onder **Need a different version?** kan een eerdere prerelease worden gekozen. Herlaad daarna de browser volledig. Volg voor iedere versie de gekoppelde testchecklist en bekende beperkingen.
