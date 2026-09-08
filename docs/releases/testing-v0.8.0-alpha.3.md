# Testrelease v0.8.0-alpha.3 — layout en kamernavigatie

Deze prerelease verfijnt de visuele uitlijning van Home en de bediening en navigatie van kamers. De bestaande actiedoelen en veiligheidsregels uit `v0.8.0-alpha.2` blijven gelden.

## Instellen

1. Installeer deze prerelease via HACS en herlaad de frontend volledig.
2. Bewaar vooraf de huidige dashboardconfiguratie en noteer `v0.8.0-alpha.2` als rollbackversie.
3. Gebruik uitsluitend het expliciet goedgekeurde testdashboard; default `lovelace` blijft read-only.

## Te controleren

- Vandaag en camera beginnen en eindigen op desktop op dezelfde horizontale lijn. Op tablet en mobiel stapelen ze zonder horizontale overflow.
- Afvalophaling, weersverwachting, energiestatus, personen en camera-privacy blijven zichtbaar.
- De kamerchips hebben een duidelijke actieve toestand. Bij het openen van een tweede bron- of actiestrook sluit de eerste.
- Meerdere licht- of mediabronnen tonen een rustige keuzestrook met individuele status; er ontstaat geen impliciet direct actiedoel.
- De kamerdetailpagina gebruikt de beschikbare dashboardbreedte en blijft bruikbaar op mobiel.
- De native terugpijl opent Kamers. De extra Home-knop in de kamerheader opent Home.
- Controleer licht en donker thema, toetsenbordfocus, Escape, 44 px touchdoelen en de bestaande rolluik-/luifelbevestigingen.

## Lokaal bewijs en grenzen

Op 8 september 2026 slagen `pnpm test` met 62 tests, `git diff --check` en negen fictieve browserrenders. De browsercheck meet gelijke kaartlijnen, een kamerdetailbreedte boven 1300 px, de Home-route en het sub-accordiongedrag. De bundle is 175.435 bytes en blijft onder de grens van 180 kB.

De fixtures maken geen verbinding met Home Assistant en voeren geen live servicecall uit. Test echte bediening alleen met de bestaande targetallowlist, verse snapshot en menselijke gate.

Rollback: selecteer via HACS `v0.8.0-alpha.2`, herlaad de frontend en herstel zo nodig de bewaarde configuratie.
