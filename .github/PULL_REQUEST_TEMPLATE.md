## Samenvatting

<!-- Wat verandert en waarom? -->

## Scope en ownership

- Primaire eigenaar:
- Exclusieve bestandenset:
- Afhankelijk van PR:

## Validatie

- [ ] `pnpm test`
- [ ] `git diff --check`
- [ ] normal, warning, missing en unavailable waar relevant
- [ ] mobiel, tablet en desktop waar relevant
- [ ] accessibility, privacy, actionscope en fallback beoordeeld
- [ ] committed `dist/home-dashboard.js` is reproduceerbaar

## Documentatie en release

- [ ] Gebruikers- en configuratiedocumentatie bijgewerkt
- [ ] Changelog bijgewerkt
- [ ] Release vereist
- Geplande versie of `geen`:
- Testchecklist:

## Home Assistant-veiligheid

- [ ] Geen write naar default `lovelace`
- [ ] Geen echte identifiers, secrets of privébeelden in bron, logs of artifacts
- [ ] Eventuele testwrite heeft targetallowlist, verse snapshot en menselijke gate
