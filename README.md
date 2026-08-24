# Home Dashboard — ontwerpvoorstel

Deze repository bouwt een HACS-installeerbare community dashboard strategy voor een centraal Home Assistant-dashboard. De HACS-foundation en grafische configuratie zijn in Home Assistant gevalideerd; `v0.4.0-alpha.1` levert een compacte, read-only Home-view met person cards en een brede camerastrook. Home Assistant is niet door deze repository gewijzigd.

## Aanbevolen richting

**Huis in beeld** gebruikt een app-like informatiehiërarchie op een native Home Assistant Sections-shell. De gewone Home Assistant-sidebar blijft de buitenste applicatieshell; binnen het dashboard staan vijf native views: Home, Kamers, Energie, Domeinen en Meer. Home toont aandacht, person cards en een scrollbare beveiligingsstrook met alle geconfigureerde camera's en hun privacystand. Kamers biedt het volledige overzicht met veilige quick actions. Kia, robotstofzuiger en tuin openen hun volledige bestaande HACS-card; voor zwembad wordt een vierde specialistische card in dezelfde familie gepland.

V1 bevat geen custom panel en geen extra summary-component. De minimale ondersteunde versie is Home Assistant 2026.8.2. Diagnostiek verhuist bij voorkeur naar een apart admin-dashboard. Het default dashboard blijft read-only; een latere bouwfase werkt eerst op een vers, expliciet goedgekeurd testdashboard met snapshot en rollback.

## Begin hier

- [Finaal voorstel en startbasis](docs/design/final-proposal.md)
- [Dashboardvoorstel](docs/design/dashboard-proposal.md)
- [Conceptscorecard](docs/design/concept-scorecard.md)
- [Informatiearchitectuur](docs/design/information-architecture.md)
- [Designsysteem](docs/design/design-system.md)
- [Integratiestrategie](docs/design/integration-strategy.md)
- [Multi-agent implementatieplan](docs/design/implementation-plan.md)
- [Deliveryroadmap: agents, PR's, GUI, HACS en releases](docs/design/delivery-roadmap.md)
- [Grafische configuratie](docs/configuration/gui-overview.md)
- [Gegenereerde views en read-only contract](docs/configuration/generated-views.md)
- [Home-configuratie](docs/configuration/home.md)
- [Security en camerastrook](docs/configuration/security.md)
- [Configuratieschema v1](docs/reference/config-schema.md)
- [Compatibility](docs/reference/compatibility.md)
- [Requirements en evidence](docs/discovery/requirements.md)
- [Informatiepariteit huidige dashboard](docs/discovery/current-dashboard-information-parity.md)

## Prototype

Het prototype is statische HTML/CSS/JavaScript met fictieve data en geen externe dependencies.

```sh
pnpm run serve
```

Open daarna `http://127.0.0.1:4173/`. De fixtureselector wisselt tussen normaal, waarschuwing en unavailable; de modusknop wisselt light/dark. De volledige [rendermatrix](docs/renders/README.md) bevat reproduceerbare URLs en afmetingen.

![Home desktop](docs/renders/home-desktop.png)

![Kamers desktop](docs/renders/rooms-desktop.png)

![Energie desktop](docs/renders/energy-desktop.png)

## HACS-installatie

[`v0.1.0-alpha.1`](https://github.com/ju1ced/home-dashboard/releases/tag/v0.1.0-alpha.1) heeft de volledige HACS-lifecycle doorlopen: installatie, update, verwijdering en herinstallatie. Zie [het geanonimiseerde resultaat](docs/releases/results-v0.1.0-alpha.1.md). De `v0.2`-reeks valideerde de GUI en flexibele camera-instelling; de `v0.3`-reeks bracht de eerste echte views en corrigeerde de privacyconfiguratie. `v0.4.0-alpha.1` is de eerste gerichte Home/security-layoutrelease.

## Checks

Node.js 20 of nieuwer en pnpm 11:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

De check valideert TypeScript, de reproduceerbare HACS-bundle, JavaScript-syntax, vereiste deliverables, lokale Markdown-links, privacygevoelige patronen, fixtures en exacte PNG-afmetingen.

## Repository-indeling

```text
docs/discovery/   actuele toestand, evidence, referenties en requirements
docs/design/      concepten, selectie, voorstel, IA, systeem en bouwplan
docs/installation HACS-installatie en lifecycle
docs/releases/    testchecklists per prerelease
docs/renders/     gecontroleerde PNG-renders en rendermatrix
src/              TypeScript-bron voor de HACS-resource
dist/             getrackte reproduceerbare HACS-bundle
tests/            foundation- en later producttests
prototype/        interactieve high-fidelity prototype en fictief editorharnas
schemas/          versioned publieke JSON Schema's
config/examples/  privacyveilige normal/warning/missing/unavailable-fixtures
scripts/          lokale preview en repositorychecks
.github/          CI, HACS-validatie, releaseflow en templates
```

## Privacy en veiligheid

- Tracked bestanden bevatten alleen logische keys en fictieve waarden.
- Echte mappings, exports, snapshots en gegenereerde dashboardconfig blijven gitignored.
- Publiceer nooit entity-/device-ID's, serienummers, MAC-adressen, interne URLs, coördinaten, tokens of secrets.
- Het default dashboard `lovelace` is altijd read-only.
- Geen push, PR, release, deployment of HA-write zonder expliciete toestemming.

## Status

De ontwerpbaseline, deliveryroadmap en HACS-fundering zijn gepubliceerd; installatie, configuratie en de compacte editor zijn praktisch gevalideerd. `v0.4.0-alpha.1` is de actuele runtimegate voor Home, personen en de camerastrook. Kamers, Energie/Domeinen en specialisten blijven afzonderlijke roadmapstappen. Home Assistant-writes en servicecalls starten niet automatisch en behouden hun afzonderlijke menselijke gates.
