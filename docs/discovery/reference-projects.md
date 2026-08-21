# Referentieprojecten

## Samenvatting

| Project | Sterkte | Belangrijkste grens | Gebruik in centraal ontwerp |
|---|---|---|---|
| Kia Connect Dashboard | volwassen mapping, veilige acties, stale/unavailable, interne detailnavigatie, NL/EN | relatief grote module; eigen volledige UX | compacte summary + volledige HACS-card op voertuigsubview |
| Robot Vacuum Dashboard | compacte zelfstandige card, kaart- en zonefuncties, confirmations | brede rerender bij iedere HA-update; beperkte foutfeedback/tests | compacte status/veilige actie + volledige card op robotsubview |
| Garden Dashboard | lijstgestuurde zones, relevante-state gating, confirmations, goede fallbacks | editor/lokalisatie minder volledig | waarschuwing/actieve irrigatie + volledige card op tuinsubview |
| Casa Dashboard | app-shell, dynamische kamers, disclosure, verbergen lege inhoud | tweede frontendruntime, eigen router/API, mappingmagie en versiedrift | alleen IA- en onboardingpatronen; geen panel/code/visuals |

## Gemeenschappelijk integratiecontract

1. De specialistische broncode blijft in de eigen repositories en wordt onafhankelijk via HACS geversioneerd.
2. `home-dashboard` beheert shell, navigatie, logische mappings, native summaries en thema-contracten.
3. Summaries lezen alleen de kleinste benodigde set reeds gemapte states; ze kopiëren geen berekeningen, herkenning, kaarten of serviceflows.
4. Elke volledige kaart krijgt een eigen full-width subview met stabiel pad en `back_path`.
5. Shadow DOM wordt gerespecteerd. Visuele aansluiting loopt via ondersteunde HA-themevariabelen en een gedeeld semantisch statuscontract, niet via fragiele selectors.
6. Als een native summary onvoldoende is, wordt een optionele backwards-compatible `display_mode: summary` in de bronrepo ontworpen, niet in het centrale project geforkt.
7. Status gebruikt altijd tekst/icoon naast kleur: `normal`, `active`, `warning`, `critical`, `unavailable`.

## Concrete details

### Kia

- Home of Mobiliteit: acculading, bereik, laadstatus, dataversheid en beveiligingswaarschuwing.
- Detail: bestaande `custom:kia-dashboard-card`; instellingen en riskante acties blijven daar.
- Behoud mapping health, request-token/cachinggedrag, NL/EN-formattering en verificatie na lockacties.
- Gebruik niet de oudere dependency-zware YAML-referentie als productiepad.

### Robotstofzuiger

- Home of Schoonmaak: status, batterij, taak/fout en onderhoudssignaal; hoogstens één veilige contextuele actie.
- Detail: bestaande `custom:robot-vacuum-dashboard-card`, inclusief kaart, kamer-/zonereiniging en onderhoud.
- Maak reverse-engineered zonefuncties opt-in en modelgebonden.
- Voeg vóór brede inzet relevante-entity gating, zichtbare servicefouten en browser-/interactietests toe in de robotrepo.

### Tuin

- Home of Buiten: droge-zonecount, actieve irrigatie, storing en relevante lage batterij.
- Detail: bestaande `custom:garden-dashboard-card` met zones, irrigatie en diagnostiek.
- Behoud action validation, domeinafleiding, bevestiging en expliciete missing/unavailable-states.

## Casa: overnemen en afwijzen

Overnemen als patroon:

- Overview → Rooms → Specialist domains.
- Lijstgestuurde kamers met stabiele key, gelokaliseerd label, icoon, volgorde en capabilities.
- Expliciete mapping als waarheid; herkenning alleen als gecontroleerde onboarding-suggestie.
- Niet-geconfigureerde secties verbergen.
- Actieve of afwijkende informatie prioriteren.

Niet overnemen:

- Een volledig custom panel of monolithische frontend.
- Brede runtimeherkenning op friendly names.
- Parallel onderhouden van oude en nieuwe architecturen.
- Publieke configuratie onder `/www`.
- Casa-branding, assets, code of visuele identiteit.

## Architectuurkeuze

Een hybride oplossing is de beste balans. Een puur native dashboard zou specialistische functies verliezen of dupliceren. Een volledig custom panel creëert een tweede platform en kan de bestaande Lovelace-cards niet vanzelfsprekend hergebruiken. Een native Sections-shell met drie zelfstandig geversioneerde detailcards houdt dagelijkse paden snel en onderhoudbaar, terwijl de volledige domeinervaring behouden blijft.
