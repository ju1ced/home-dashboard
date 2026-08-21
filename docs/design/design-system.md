# Designsysteem — Juiced Horizon Calm

## Principes

- Rustige neutrale oppervlakken; kleur wordt voor betekenis gereserveerd.
- Vaste visuele volgorde en royale maar efficiënte spacing.
- Toestand staat vóór bediening.
- Status heeft altijd tekst en/of icoon naast kleur.
- Native Home Assistant-componenten blijven herkenbaar; het thema verandert geen interactiepatronen.
- Shadow DOM-cards sluiten aan via ondersteunde themevariabelen, niet via centrale selectors.

## Tokens

### Kleur — light

| Token | Waarde | Gebruik |
|---|---|---|
| `--hd-bg` | `#F3F6F4` | pagina-achtergrond |
| `--hd-surface` | `#FFFFFF` | kaarten |
| `--hd-surface-raised` | `#F9FBFA` | verhoogde controls |
| `--hd-surface-muted` | `#E8EEEA` | rustige statusvlakken |
| `--hd-text` | `#18231F` | primaire tekst |
| `--hd-text-muted` | `#66736D` | secundaire tekst |
| `--hd-border` | `#D8E1DC` | randen en dividers |
| `--hd-brand` | `#276B5B` | primaire navigatie/actie |
| `--hd-brand-soft` | `#DCEFE8` | geselecteerde achtergrond |
| `--hd-active` | `#1F6F8B` | actieve maar normale toestand |
| `--hd-active-soft` | `#DDEFF6` | actieve achtergrond |
| `--hd-warning` | `#995400` | waarschuwingstekst/icoon |
| `--hd-warning-soft` | `#FFF0D6` | waarschuwingachtergrond |
| `--hd-critical` | `#B3261E` | kritieke toestand |
| `--hd-critical-soft` | `#FCE8E6` | kritieke achtergrond |
| `--hd-unavailable` | `#686D78` | offline/onbekend |
| `--hd-unavailable-soft` | `#ECEEF2` | offline achtergrond |

### Kleur — dark

| Token | Waarde |
|---|---|
| `--hd-bg` | `#101713` |
| `--hd-surface` | `#18211D` |
| `--hd-surface-raised` | `#202B26` |
| `--hd-surface-muted` | `#26332D` |
| `--hd-text` | `#EDF4F0` |
| `--hd-text-muted` | `#A8B7AF` |
| `--hd-border` | `#34433C` |
| `--hd-brand` | `#72C9AF` |
| `--hd-brand-soft` | `#173C32` |
| `--hd-active` | `#7BC6E1` |
| `--hd-active-soft` | `#183B48` |
| `--hd-warning` | `#FFC56E` |
| `--hd-warning-soft` | `#4A3216` |
| `--hd-critical` | `#FFB4AB` |
| `--hd-critical-soft` | `#4E2523` |
| `--hd-unavailable` | `#C4C6CF` |
| `--hd-unavailable-soft` | `#30323A` |

### Oppervlak en effect

- Border: 1 px; scheid eerst met oppervlak, pas daarna met lijn.
- Shadow small: `0 1px 2px rgb(20 35 28 / 0.06)`.
- Shadow raised: `0 10px 30px rgb(20 35 28 / 0.10)`; alleen dialogs of echte overlays.
- Geen decoratieve gradients als statusdrager.

### Spacing

Schaal: 4, 8, 12, 16, 24, 32 en 48 px.

- Compacte interne gap: 8 px.
- Card padding: 16 px mobiel, 18–20 px tablet/desktop.
- Section gap: 24 px mobiel, 28–32 px desktop.
- Paginamarge: 16 px mobiel, 24 px tablet, 32 px desktop.

### Radius

- `--hd-radius-sm: 10px` — chips en kleine controls.
- `--hd-radius-md: 16px` — Tiles en compacte cards.
- `--hd-radius-lg: 22px` — summaries en grote sectieblokken.
- `--hd-radius-pill: 999px` — badges; nooit voor onduidelijke icon-only actions.

### Typografie

Gebruik de systeem-/HA-fontstack. Geen externe fontdependency.

| Rol | Grootte/regel | Gewicht |
|---|---|---:|
| Display | 32/38 desktop, 27/33 mobiel | 700 |
| Paginaheading | 24/30 | 700 |
| Sectieheading | 17/22 | 700 |
| Cardtitel | 15/20 | 650 |
| Body | 14/20 | 450–500 |
| Statuswaarde | 18/22 | 700 |
| Meta/label | 12/16 | 550 |

Numerieke waarden gebruiken tabular numbers waar vergelijking nuttig is.

## Semantische toestanden

| Status | Betekenis | Visuele behandeling | Voorbeeldtekst |
|---|---|---|---|
| normaal | geen aandacht nodig | neutraal oppervlak, rustig icoon | `Alles in orde` |
| actief | normale lopende activiteit | active-kleur + werkwoord | `Bezig met schoonmaken` |
| waarschuwing | actie binnenkort of beperkte werking | warning-oppervlak + uitleg | `2 zones zijn droog` |
| kritiek | direct beoordelen | critical-oppervlak + expliciete bestemming | `Water gedetecteerd` |
| unavailable | betrouwbare toestand ontbreekt | dashed/neutral grens + offline-icoon | `Status niet beschikbaar` |

`unknown` is geen zesde universele alarmstatus. De capability bepaalt of het normaal, verborgen of unavailable is.

## Componentpatronen

### Aandachtskaart

- Volledige begrijpelijke zin, locatie, ernsticoon en tijdcontext.
- Hele kaart navigeert naar context; riskante actie staat niet inline.
- Kritiek wordt nooit achter een teller verborgen.

### Quick action

- 44×44 px minimum; label beschrijft scope, bijvoorbeeld `Avondscene`.
- Huidige relevante toestand zichtbaar waar die de keuze beïnvloedt.
- Confirmation voor kostbare/riskante actie; standaard v1 alleen omkeerbare scripts.

### Room summary

- Kamernaam, maximaal twee contextwaarden, actieve/afwijkende capability en chevron.
- Geen miniatuur van alle entities.
- Tap navigeert; eventuele control is afzonderlijk.

### Specialist summary

- Native compositie met titel, primaire status, maximaal twee secundaire waarden en dataversheid/fout.
- Geen kaart, grafiek, trip, locatiebeeld, zonekeuze of complexe serviceactie.
- Kia, robot, tuin en zwembad krijgen dezelfde statusgrammatica. Zwembad staat normaal onder Domeinen en gebruikt dezelfde specialistische detailshell.

### Camera en privacystand

- Home toont exact drie eigenaar-gekozen camera's in een horizontaal scrollbare strook; iedere kaart heeft preview of zelfstandige fallback, naam, status en privacystand.
- De privacycontrol staat los van het previewvlak. `Privacy aan` is positief en ondubbelzinnig zichtbaar; privacy uitschakelen gebruikt confirmation en backendautorisatie.
- Tracked fixtures en renders gebruiken uitsluitend fictieve, getekende scènes. Live beelden, namen, adressen en bronidentifiers worden nooit in repository-artifacts vastgelegd.

### Navigatieshell

- De linker sidebar in desktoprenders stelt de bestaande Home Assistant-sidebar voor en is geen component van `home-dashboard`.
- Home, Kamers, Energie, Domeinen en Meer gebruiken native HA-viewnavigatie binnen het dashboard.
- Op mobiel mag de native viewnavigatie horizontaal scrollen; een custom bottom dock is geen v1-dependency.

### Navigatiekaart

- Icoon, heldere bestemming en korte beschrijving.
- Geen statuskleur wanneer de kaart alleen navigeert.

## Toegankelijkheid

- WCAG 2.2 AA contrast voor tekst en betekenisvolle UI.
- Minimaal 44×44 px tapdoel en minimaal 8 px tussen aangrenzende targets.
- Zichtbare focusring van minimaal 2 px met voldoende contrast.
- Logische bron-/tabvolgorde; dense placement uit.
- Semantische buttons/links, unieke screenreadernaam en actuele state via begrijpelijke tekst.
- Geen hover-only, swipe-only, hold-only of color-only informatie.
- Respecteer tekstvergroting, reduced motion en light/dark voorkeur.
- Dialogs houden focus vast en brengen focus terug naar de trigger.

## Aansluiting op bestaande kaarten

- Map de tokens waar mogelijk naar ondersteunde HA-variabelen zoals primaire tekst, secondary text, card background, divider, primary/accent en statekleuren.
- Accepteer dat elke Shadow DOM-card een eigen interne ritmiek houdt.
- Shell bezit paginaheader, achtergrond, buitenmarge en terugnavigatie.
- Een `hide_header`-optie wordt alleen upstream toegevoegd als browser-QA echte dubbele hiërarchie aantoont.
- Pixelgelijkheid is geen doel; gedeelde semantiek, contrast en navigatie wel.
