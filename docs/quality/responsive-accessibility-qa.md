# Responsive- en accessibility-QA

Peildatum: 23 september 2026. Dit rapport beschrijft de lokale HD-170-gate voor de volgende alpha. Synthetische browserchecks zijn geen vervanging voor live Home Assistant-, screenreader- of menselijke visuele acceptatie.

## Geautomatiseerd afgerond

- Hoofdviews, kamer, Kia, robot, tuin, 3D-printer en zwembad renderen op 390×844, 1024×900 en 1440×900 zonder horizontale overflow.
- Kamerdetail en Home-/kamercomponenten draaien op dezelfde drie doelviewports.
- Zichtbare kamer-, camera- en editorbediening voldoet aan minimaal 44×44 px; cameraknoppen hebben minimaal 8 px tussenruimte.
- Reduced motion schakelt de kamerchevrontransitie uit en camerascroll gebruikt geen geforceerde smooth motion.
- De expliciet gescripte Escape-, dialognaam-, dialogcleanup- en focusherstelpaden zijn regressiegates; een volledige tabvolgorde per route en thema blijft handmatig.
- Light/dark, normal, warning, missing en unavailable zijn in de geselecteerde combinaties uit de browsermatrix afgedekt; dit is geen volledige cartesiaanse matrix.
- Statussen gebruiken naast kleur ook tekst en waar relevant iconografie.

## Nog handmatig te valideren in de nieuwe alpha-test

1. 200% browserzoom/reflow voor alle vijf hoofdviews, editor, lichte en zware kamer en iedere beschikbare specialist.
2. Volledige toetsenbord- en screenreaderreview met NVDA of VoiceOver: tabvolgorde per route/thema, zichtbare focus, headings, landmarks, namen, states, dialogfocus en foutmeldingen.
3. Contrastreview in de echte actieve Home Assistant-thema's, inclusief focusringen en statuskleuren.
4. Visuele beoordeling van de gegenereerde screenshots; geen baseline automatisch vernieuwen.
5. Runtimecontrole dat dezelfde capabilities op mobiel en desktop bereikbaar blijven.

## Gate

HD-170 blijft **Review/validatie** totdat bovenstaande handmatige punten op de gepubliceerde testcandidate zijn ingevuld. Een bevinding krijgt een afzonderlijk regressieticket; de baseline wordt nooit aangepast om een productfout te maskeren.
