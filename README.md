# Home Dashboard — ontwerpvoorstel

Deze repository bevat de afgeronde onderzoeks-, concept- en planningsfase voor een nieuw centraal Home Assistant-dashboard. Er is **nog geen productiedashboard gebouwd** en Home Assistant is niet gewijzigd.

## Aanbevolen richting

**Huis in beeld** gebruikt een app-like informatiehiërarchie op een native Home Assistant Sections-shell. De gewone Home Assistant-sidebar blijft de buitenste applicatieshell; binnen het dashboard staan vijf native views: Home, Kamers, Energie, Domeinen en Meer. Home toont aandacht, person cards en een scrollbare beveiligingsstrook met drie camera's en hun privacystand. Kamers biedt het volledige overzicht met veilige quick actions. Kia, robotstofzuiger en tuin openen hun volledige bestaande HACS-card; voor zwembad wordt een vierde specialistische card in dezelfde familie gepland.

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
- [Requirements en evidence](docs/discovery/requirements.md)
- [Informatiepariteit huidige dashboard](docs/discovery/current-dashboard-information-parity.md)

## Prototype

Het prototype is statische HTML/CSS/JavaScript met fictieve data en geen externe dependencies.

```sh
npm run serve
```

Open daarna `http://127.0.0.1:4173/`. De fixtureselector wisselt tussen normaal, waarschuwing en unavailable; de modusknop wisselt light/dark. De volledige [rendermatrix](docs/renders/README.md) bevat reproduceerbare URLs en afmetingen.

![Home desktop](docs/renders/home-desktop.png)

![Kamers desktop](docs/renders/rooms-desktop.png)

![Energie desktop](docs/renders/energy-desktop.png)

## Checks

Node.js 20 of nieuwer:

```sh
npm test
```

De check valideert JavaScript-syntax, vereiste deliverables, lokale Markdown-links, privacygevoelige patronen, prototypefixtures en de exacte PNG-afmetingen.

## Repository-indeling

```text
docs/discovery/   actuele toestand, evidence, referenties en requirements
docs/design/      concepten, selectie, voorstel, IA, systeem en bouwplan
docs/renders/     gecontroleerde PNG-renders en rendermatrix
prototype/        interactieve statische high-fidelity prototype
scripts/          lokale preview en repositorychecks
```

## Privacy en veiligheid

- Tracked bestanden bevatten alleen logische keys en fictieve waarden.
- Echte mappings, exports, snapshots en gegenereerde dashboardconfig blijven gitignored.
- Publiceer nooit entity-/device-ID's, serienummers, MAC-adressen, interne URLs, coördinaten, tokens of secrets.
- Het default dashboard `lovelace` is altijd read-only.
- Geen push, PR, release, deployment of HA-write zonder expliciete toestemming.

## Status

De ontwerpbaseline is goedgekeurd. De volgende stap is PR 1 uit de [deliveryroadmap](docs/design/delivery-roadmap.md): HACS-, build- en CI-fundering voor de custom dashboard strategy. Home Assistant-writes en deployment starten niet automatisch en behouden hun afzonderlijke menselijke gates.
