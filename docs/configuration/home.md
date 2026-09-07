# Home

Werkversie v0.8.0-alpha.2: Home benut de beschikbare dashboardbreedte. De kamerkop opent een paneel met chips; alleen de afzonderlijke link Volledige kamer navigeert. Airco / verwarming opent het native klimaatvenster op Home. Zie de [nieuwe renders](../renders/expandable-rooms/README.md).

Vanaf v0.8.0-alpha.1 combineert Home rustige context met vaste favoriete kamerbediening.

1. **Aandacht nodig** behoudt operationele uitval en expliciet gemapte safety, ook buiten favoriete kamers. Kritieke states krijgen voorrang; de knoppen openen details.
2. **Vandaag** behoudt één samengestelde kaart met weer, maximaal drie voorspeldagen, zes benoemde energievelden en **Afvalophaling**. Afval toont fractie, datum en relatieve termijn, maximaal vier naast elkaar en twee op mobiel. Security blijft zelfstandig rechts of stapelt op smallere schermen.
3. **Gezin** toont aanwezigheid en relevante batterijwaarschuwingen, zonder generieke dataversheidstekst. Toegestane zones blijven privacybewust; geen adres of coördinaten.
4. **Nu actief** toont conditioneel overige woningactiviteit. Een bron die al in een favoriete kamerknop staat wordt niet gedupliceerd. Andere activiteit, bijvoorbeeld HVAC in diezelfde kamer, blijft zichtbaar.
5. **Kamers & bediening** toont maximaal vier expliciet gekozen favorieten in configuratievolgorde, ook wanneer alles uitstaat. Zonder favorieten verschijnt een instelhint. Alle kamers blijft altijd bereikbaar.
6. **Snel naar** bevat ingeschakelde specialistische ingangen, zonder dubbele kamerlinks.

Kies favorieten en actiedoelen via Dashboard bewerken → Kamers. [Kamerbediening](rooms.md) beschrijft de afzonderlijke doelen en opt-in voor directe acties. De native kamerdetails blijven behouden.

Home erft de actieve HA-themetokens; expliciet licht/donker blijft ondersteund. Nieuwe kamerkaarten behouden neutrale surfaces, afgeronde randen, duidelijke labels en zachtblauwe activiteit. Mobiel heeft één kolom kamers en waar nodig twee kolommen knoppen, met minimaal 44×44 px doelen.

## Datakwaliteit en updates

Een generieke ouderdomsdrempel geeft op Home geen Niet recent-label, ouderdomstekst of waarschuwingkleur. Dit geldt ook voor energie en personen. Een onveranderde state is geen bewijs van uitval. Instellingen voor diagnostische bronouderdom blijven voor compatibiliteit bewaard.

Missing, unknown en unavailable houden hun eigen fallback; er wordt geen nulwaarde of afvaldatum verzonnen. Operationele uitval en safety blijven zichtbaar. Private camera's blijven zonder preview.

Gewone waarde-updates werken teksten en kamercontrols bij zonder de hele Home-compositie te vervangen. Camerachildcards, een open coverstrook en toetsenbordfocus blijven bij zulke updates behouden. Structurele wijzigingen in aandacht of overige activiteit kunnen de compositie wel opnieuw opbouwen.

## Veiligheid en teststatus

Alleen expliciet toegestane kameracties gebruiken de begrensde service-allowlist. Weer, energie, personen, aandacht en camerabeelden behouden hun bestaande read-only interactie. De kaart vervangt geen backendrechten of integratiebeveiliging.

Zie de [testchecklist](../releases/testing-v0.8.0-alpha.1.md) en [fictieve runtime-renders](../renders/room-controls/README.md). Publicatie van de bundle wijzigt geen Home Assistant-configuratie.
