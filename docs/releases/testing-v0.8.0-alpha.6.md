# Testrelease v0.8.0-alpha.6 — configureerbare kleurpaletten

Deze candidate maakt het kleurpalet instelbaar onder **Dashboard bewerken → Algemeen → Kleurpalet**. Beschikbaar zijn Huidig blauw, Warm zand, Rustig salie, Zacht leisteen en Gedempt petrol. Iedere keuze ondersteunt system-, light- en dark mode.

## Te controleren

- De gekozen waarde blijft na opslaan en herladen behouden.
- Home, Kamers, kamerdetails, Energie en de Kia-samenvatting gebruiken hetzelfde merkvlak en dezelfde rustige oppervlakken.
- System mode behoudt de oppervlakken en tekstkleuren van het actieve Home Assistant-thema; het gekozen palet bepaalt merk- en statusaccenten.
- Light en dark mode gebruiken de volledige bijbehorende tokenreeks en behouden leesbare tekst en duidelijke actieve quick actions.
- Meerdere actieve lichten, covers, media en klimaatbronnen blijven onder ieder palet van elkaar te onderscheiden.
- Oudere configuraties zonder `general.palette` migreren naar Huidig blauw.

## Lokaal bewijs en grenzen

Zesenzestig geautomatiseerde tests en twaalf browserrenders slagen. De vier alternatieven zijn met dezelfde fictieve dashboardstate vastgelegd in de [paletvergelijking](../renders/palette-options/README.md). De minified bundle meet 186.277 bytes en blijft onder de harde grens van 190 kB. Fixtures maken geen verbinding met Home Assistant.

Rollback: selecteer via HACS `v0.8.0-alpha.5` en herlaad de frontend.
