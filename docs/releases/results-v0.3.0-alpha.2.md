# Testresultaat v0.3.0-alpha.2

## Bevestigd

- **Privacyactie = Geen** is geldig met een gekozen privacystatus en zonder extra camerabevestiging.
- De generieke configuratievariantmeldingen zijn verdwenen; de editor toont nog uitsluitend de precieze betrokken camera en actie.
- De risicoklasse is zichtbaar naast het actielabel.

## Gevonden blocker

Een bewust gekoppelde, geldige actie met risicoklasse `safe` werd nog door Security geblokkeerd. Dat was een te strenge contextregel: de actieconfiguratie bepaalt zelf haar risicoklasse en bijbehorend bevestigingscontract. De optionele camerabevestiging hoort daar geen tweede verplichte classificatie bovenop te leggen.

Omdat de editor bij iedere blokkerende configuratiefout terecht geen `config-changed` verstuurt, kon een daarna gekozen alarmentiteit evenmin duurzaam worden opgeslagen. De alarmselector zelf is correct; het verwijderen van de onterechte privacyfout herstelt ook die configuratieroute.

## Vervolg

`v0.3.0-alpha.3` verwijdert uitsluitend deze extra blokkade. Targetscope, resultaatcontrole, bestaand actiereferentieel en de algemene regels per gekozen risicoklasse blijven gevalideerd. Er zijn geen Home Assistant-servicecalls of dashboardwrites uitgevoerd.
