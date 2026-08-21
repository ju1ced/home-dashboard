# Conceptscorecard

## Methode en gewichten

De scores zijn door een onafhankelijke reviewer opnieuw bepaald; conceptscores zijn niet blind overgenomen. Schaal 1–10, hoger is beter. Voor migratierisico betekent een hoge score een laag en beheerst risico.

De gewichten leggen nadruk op dagelijks gebruik en een duurzaam technische basis. Privacy, veilige acties en autorisatie blijven harde gates, ook waar hun numerieke gewicht kleiner is.

| Criterium | Gewicht | Native-first | App-like | Hybrid |
|---|---:|---:|---:|---:|
| Dagelijks gebruiksgemak voor het gezin | 18% | 8 | 9 | 8 |
| Snelheid en waargenomen performance | 12% | 8 | 8 | 7 |
| Functionele volledigheid | 11% | 8 | 8 | 9 |
| Mobiele en tabletbruikbaarheid | 10% | 8 | 9 | 8 |
| Visuele rust en duidelijke hiërarchie | 9% | 8 | 9 | 9 |
| Onderhoudbaarheid en uitbreidbaarheid | 11% | 8 | 8 | 7 |
| Betrouwbaarheid bij `unknown`, `unavailable` of ontbrekende entities | 8% | 7 | 7 | 7 |
| Toegankelijkheid | 7% | 8 | 8 | 7 |
| Privacy en configureerbaarheid | 5% | 9 | 9 | 9 |
| Integratie Kia, robotstofzuiger en tuin | 5% | 8 | 8 | 9 |
| Migratierisico | 4% | 7 | 7 | 6 |
| **Gewogen totaal** | **100%** | **7,93** | **8,30** | **7,84** |

## Selectie

**App-like wint als gebruikersconcept met 8,30**, maar wordt uitgevoerd op de Native-first techniek. Deze combinatie houdt de vaste, herkenbare informatielagen en rustige visuele regie zonder een tweede frontendplatform of extra summaryruntime te introduceren.

Hybrid scoort functioneel goed, maar zijn lokale component voegt lifecycle-, accessibility-, localization- en versiecomplexiteit toe voordat native beperkingen zijn bewezen. Native-first is de beste technische baseline, maar werkt minder overtuigend uit hoe een niet-technisch gezin de woning scant.

## Onzekerheidsmarge

De scores zijn conceptueel, niet empirisch. Ze worden in de bouwfase opnieuw beoordeeld na:

- een echte HA-render op telefoon, wandtablet en desktop;
- gezinsvalidatie van navigatie en quick actions;
- payload-, parse-, DOM-, long-task- en rerendermetingen;
- WCAG-, toetsenbord- en screenreadertests;
- volledige current-to-target mapping en een groene robotintegratiegate.

## Voorwaardelijke summary-experiment

Een eigen summary-component krijgt alleen groen licht als hij tegenover native Tiles tegelijk:

1. meetbaar sneller te begrijpen of bedienen is in de eerste mobiele viewport;
2. geen relevante payload-, render- of rerenderregressie veroorzaakt;
3. WCAG 2.2 AA, toetsenbord en screenreader haalt;
4. uitsluitend presenteert en navigeert, zonder domeinberekening of servicecall;
5. een volledig native fallback houdt.

## Eigenaarsbesluiten na de score

De score vergelijkt de oorspronkelijke concepten en wordt niet achteraf herschreven. Na selectie heeft de eigenaar de richting bindend aangescherpt: Home Assistant 2026.8.2 is de minimumversie; Energie is een hoofdview; Kamers krijgt een volledig overzicht; Home behoudt person cards en drie scrollbare camerakaarten met privacycontrols; Kia, robot en tuin openen hun volledige bestaande cards; zwembad krijgt een vierde specialistische card. Deze punten gelden als requirements en bouwgates, ook waar de oorspronkelijke concepttekst iets anders aannam.
