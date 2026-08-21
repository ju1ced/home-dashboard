# Ontwerpconcepten

Drie onafhankelijke concepten zijn op dezelfde discoverybasis uitgewerkt. De volledige voorstellen staan in:

- [Native-first](concepts/native-first.md)
- [App-like](concepts/app-like.md)
- [Hybrid](concepts/hybrid.md)
- [Onafhankelijke kritische review](concept-review.md)

## Vergelijking in één oogopslag

| Concept | Kern | Sterkste punt | Belangrijkste risico |
|---|---|---|---|
| Native-first | Alleen native shell en summaries; drie custom cards uitsluitend op detail | kleinste dependency- en onderhoudsoppervlak | kan generiek of te lang worden wanneer aggregaten ontbreken |
| App-like | Sterk gecureerde hiërarchie boven een native Sections-shell | beste mentale model voor het gezin | kan meer visuele vrijheid beloven dan native Lovelace levert |
| Hybrid | Native shell plus één eigen summary-component en drie detailcards | meest expliciete specialistische presentatie | vierde frontendresource zonder bewezen UX-winst |

## Gekozen combinatie

Het gekozen concept gebruikt de App-like hiërarchie **Aandacht → Nu → Acties → Actieve ruimtes → Specialistische ingangen → Domeinen**, uitgevoerd op de Native-first dependencygrens. Uit Hybrid worden de integratie-, lifecycle- en fallbackcontracten overgenomen, maar niet de lokale summary-component.

Na eigenaarreview is dit aangescherpt: de gewone HA-sidebar blijft buiten het dashboard; de native hoofdviews zijn Home, Kamers, Energie, Domeinen en Meer. Kamers wordt een volledig overzicht met quick actions, Home behoudt person cards plus een scrollbare strook met drie camera's en afzonderlijke privacycontrols, en zwembad krijgt een vierde specialistische card.

De specialistische summaries in v1 zijn native Heading/Tile/Badge-composities. Alleen als een getest native prototype aantoonbaar faalt op compactheid of begrijpelijkheid, mag een kleine presentational summary-component als afzonderlijk experiment terugkomen.

## Bewuste niet-keuzes

- Geen volledig custom panel, eigen router of Python-integratie.
- Geen runtimeherkenning op friendly names.
- Geen Casa-code, -assets, -branding of visuele kopie.
- Geen brede quick actions of riskante acties op Home.
- Geen tweede, concurrerende energienavigatie naast de door de eigenaar gekozen Energie-hoofdview.
- Geen diagnostiek als gewone gezinsview.
