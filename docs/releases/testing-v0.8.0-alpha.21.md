# Testchecklist v0.8.0-alpha.21

## Verhouding tot alpha.20

Deze release vervangt de nooit-getagde lokale `v0.8.0-alpha.20`-kandidaat. Volledige scope, bekende grenzen en de runtimevalidatiestappen (configuratie/migratie, bediening, energie/historie, responsive/accessibility) staan in de [alpha.20-testchecklist](testing-v0.8.0-alpha.20.md) en blijven ongewijzigd van toepassing. Dit document beschrijft alleen wat sindsdien is toegevoegd.

## Wat is toegevoegd sinds alpha.20

- **Fix:** `coverCard()` vereiste bevestiging uitsluitend wanneer de geconfigureerde `confirmation` op `"movement"` stond, niet op basis van `kind`. Een luifel met `confirmation: "none"` kon daardoor met één tik openen/sluiten zonder bevestiging — in strijd met het Control Deck-contract. Bevestiging is nu afgedwongen zodra `kind === "awning"`, ongeacht de geconfigureerde waarde, zowel in de render als in de validator (nieuwe issuecode `awning_confirmation_required`).
- Een gerichte regressietest in `tests/config.test.mjs` en een aangescherpte assertie in `tests/room-cards-source.test.mjs` dekken deze combinatie voortaan.
- Beslislog en requirements zijn aangevuld met D-051 (Control Deck) zodat de designbaseline de gemergede scope weerspiegelt.
- Twee vervolgpunten zijn als apart ticket vastgelegd, niet in deze release: HD-203 (LINAK-bureaucard-documentatiereconciliatie) en een bundlebudget-aandachtspunt in HD-171.

## Extra releasegate (aanvullend op alpha.20)

- Onafhankelijke pre-mergereview uitgevoerd; enige P0-bevinding (bovenstaande fix) opgelost en herbevestigd met `pnpm test` (101/101) en de volledige `pnpm run test:browser`-matrix.
- `git diff --check` schoon op de uiteindelijke mergecommit.
- Bundle: 244.397 / 245.000 bytes (603 bytes marge — zie HD-171 voor het vervolg bij de volgende specialistintegraties).
- PR #48 gemerged naar `main`; deze release wordt getagd vanaf die mergecommit.

## Testdashboardgate — ongewijzigd, vóór iedere Home Assistant-write invullen

- Exact testdashboard: **nog goed te keuren**.
- Verse dashboardexport/snapshot: **vereist**.
- Default `lovelace`-hash vóór test: **vereist**.
- Targetallowlist voor veilige acties: **vereist**.
- Goedgekeurde resourceversie en rollbackversie: **vereist**.

Zonder alle vijf waarden wordt de live test niet gestart.

## Rollbackscope

- Vóór deze release: geen wijziging, `main` stond op `v0.8.0-alpha.13`.
- Na deze release maar vóór testdeployment: verwijder de `v0.8.0-alpha.21`-release/tag en herstel de HACS-resource naar `v0.8.0-alpha.13`.
- Na een goedgekeurde testdeployment: herstel uitsluitend het testdashboard uit de verse snapshot en zet de eerder goedgekeurde resourceversie terug.
- Verwijder of wijzig geen globale resource zonder multi-dashboardaudit en aparte toestemming.
