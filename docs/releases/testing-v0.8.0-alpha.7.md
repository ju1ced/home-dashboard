# Testrelease v0.8.0-alpha.7 — brede layout en kiosknavigatie

Deze candidate gebruikt standaard vier Sections-kolommen op brede schermen, verwijdert **Nu actief** en plaatst **Snel naar** onder de afvalophaling. De quick-actionvolgorde verandert lokaal met pijlen en wordt met één druk op **Volgorde toepassen** opgeslagen.

## Te controleren

- **Dashboard bewerken → Layout → Dashboardbreedte** biedt Volledige breedte en Standaard.
- Vandaag en camera gebruiken de extra breedte zonder ongelijke boven- of onderlijn.
- Snel naar staat binnen de Vandaag-kaart onder de afvalophaling.
- Er staat geen afzonderlijke sectie Nu actief meer op Home; actieve toestanden blijven duidelijk in de kamerknoppen.
- Meerdere pijlenklikken bij het ordenen reageren direct en veroorzaken pas na Volgorde toepassen één dashboardherbouw.
- Navigatie biedt Home Assistant-balk, In dashboard en Kiosk.
- In dashboard toont de interne hoofdnavigatie terwijl de gewone HA-balk behouden blijft.
- Kiosk toont dezelfde interne navigatie en verbergt de HA-bovenbalk wanneer de optionele `kiosk-mode` frontendresource aanwezig is. Dit is geen autorisatiegrens.
- Mobiel blijft horizontaal vrij van overflow en toont compacte navigatie-iconen.

## Lokaal bewijs en grenzen

Negenenzestig geautomatiseerde tests en dertien browserrenders slagen. De [kioskrender](../renders/expandable-rooms/kiosk-navigation.png) gebruikt uitsluitend fictieve data. De minified bundle blijft onder de harde grens van 195 kB. Fixtures maken geen verbinding met Home Assistant.

Rollback: selecteer via HACS `v0.8.0-alpha.6` en herlaad de frontend.
