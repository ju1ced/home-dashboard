# Testchecklist v0.1.0-alpha.1 — HACS foundation

Deze geplande prerelease test uitsluitend verpakking en distributie. Zij bevat nog geen dashboard strategy of grafische configuratie-editor.

## Voorwaarden

- Home Assistant 2026.8.2 of nieuwer;
- HACS beschikbaar;
- afzonderlijke testomgeving of expliciet testdashboard;
- browserconsole beschikbaar voor controle.

## Installatie

- [ ] Custom repository kan als categorie Dashboard worden toegevoegd.
- [ ] HACS toont de repositorynaam, versie en minimum-HA-versie.
- [ ] `v0.1.0-alpha.1` kan worden gedownload.
- [ ] `home-dashboard.js` wordt als module-resource geladen.
- [ ] Browserconsole toont eenmaal `HOME DASHBOARD` met de juiste versie.
- [ ] Er zijn geen JavaScript-fouten of netwerkfouten door de bundle.

## Lifecycle

- [ ] Dezelfde versie kan opnieuw worden gedownload.
- [ ] Downgrade-/versiekeuze wordt door HACS aangeboden zodra meerdere releases bestaan.
- [ ] Verwijderen wist de HACS-resource zonder het default dashboard te wijzigen.
- [ ] Een herinstallatie werkt na volledige browserrefresh.

## Artifactcontrole

- [ ] SHA-256-bestand hoort bij `home-dashboard.js`.
- [ ] `release-manifest.json` noemt tag, commit, Node-versie en Home Assistant 2026.8.2.
- [ ] Release-assets bevatten geen sourcemap, identifiers, secrets of lokale paden.

## Resultaat

Noteer Home Assistant-versie, HACS-versie, browser, resultaat en eventuele issue-URL. Een blocker verhindert PR 2 en krijgt een volgende `v0.1.0-alpha.N`.
