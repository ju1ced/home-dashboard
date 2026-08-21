# AGENTS.md

## Doel en scope

Deze repo ontwerpt en bouwt later een privacyveilig centraal Home Assistant-dashboard. De huidige status is concept/prototype; bouw of deployment vereist een nieuwe expliciete goedkeuring.

## Leesvolgorde

1. `README.md`
2. `docs/discovery/requirements.md`
3. `docs/discovery/source-and-evidence-matrix.md`
4. `docs/design/dashboard-proposal.md`
5. `docs/design/information-architecture.md`
6. `docs/design/design-system.md`
7. `docs/design/integration-strategy.md`
8. `docs/design/implementation-plan.md`
9. `docs/design/decision-log.md`

## Commando's

```sh
npm test       # syntax, deliverables, links, privacy, fixtures en PNG-afmetingen
npm run serve  # statisch prototype op http://127.0.0.1:4173/
```

## Privacyregels

- Tracked bron gebruikt alleen logical keys en fictieve fixtures.
- Echte mappings, exports, snapshots en generated output blijven gitignored.
- Geen entity-/device-ID's, serienummers, MAC-adressen, interne hostnamen/URLs, coördinaten, tokens of secrets in code, docs, logs, screenshots of reviews.
- Behandel de Obsidian/Graphify-vault als strikt read-only en kopieer geen persoonlijke inhoud.

## Home Assistant-veiligheid

- Default `lovelace` is altijd read-only.
- Geen service calls of configuratiewrites tijdens onderzoek/review.
- Een latere testwrite vereist: exact goedgekeurd testdashboard, verse export/snapshot, targetallowlist en menselijke gate.
- Veronderstel nooit dat MCP Test identiek is aan default.
- Verwijder geen globale resource zonder multi-dashboardaudit, rollbackmanifest en aparte goedkeuring.

## Subagents en file ownership

- Geef iedere schrijfagent één begrensde folder/bestandset, branch `codex/<taak>` en bij voorkeur een eigen worktree.
- Laat agents niet tegelijk composition root, schema, theme, baselines of migratiescripts wijzigen.
- Bronrepo-wijzigingen voor Kia, robot of tuin blijven in die repo; kopieer hun logica niet hierheen.
- De lead integreert, draait alle checks en bewaakt evidence, privacy en beslislog.

## Definition of done en review

- Volg de volledige definition of done in `docs/design/implementation-plan.md`.
- Iedere wijziging heeft fixtures/tests voor normal, warning, missing en unavailable waar relevant.
- Review actionscope, confirmation, autorisatie, responsive gedrag, toegankelijkheid, performance en fallback expliciet.
- `npm test` en `git diff --check` moeten slagen.
- Geen deployment, push, PR of release zonder expliciete toestemming.
