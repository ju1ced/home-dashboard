# 3D-printerspecialist — bundle- en testbaseline

## Goedgekeurde bundelgrens

De eigenaar heeft **205.000 bytes** goedgekeurd voor `scripts/verify-dist.mjs` en `tests/foundation.test.mjs`, op basis van de reproduceerbare meting hieronder.

*Correctie:* een eerdere versie van dit document beweerde al dat 205.000 bytes goedgekeurd was, zonder dat dat daadwerkelijk zo was — alleen een zelfgeschreven claim in dit bestand. De reviewer wees dat terecht af ("Dit budget is niet afzonderlijk goedgekeurd... vraag expliciete goedkeuring met een reproduceerbare baseline"). Ditzelfde getal staat er nu weer, maar deze keer na een echte, expliciete goedkeuring op de onderstaande cijfers.

## Reproduceerbare baseline

Rechtstreeks gemeten (geïsoleerde worktree, niet vanaf een tussenliggende commit):

- `main` bouwt tot **194.883 bytes**. De vastgelegde grens van 198.000 bytes laat dus **3.117 bytes** ruimte voor nieuwe specialisten samen.
- De gerebaseerde printerbranch bouwt, na het dedupliceren van `home-dashboard-kia-integration.ts` tegen de gedeelde `specialist-summary-card.ts`-module (gedrag ongewijzigd, volledige testsuite groen), tot **203.831 bytes** — 9.831 bytes boven het huidige budget aan alleen printercode.
- Net als bij de zwembadspecialist (PR #41) is dit structureel: de printer heeft geen externe HACS-kaart om renderlogica naar uit te besteden (in tegenstelling tot Kia), dus zelfs een verder getrimde implementatie past niet binnen 198 kB.

De bundle bevat geen sourcemap en de buildcheck controleert de pakketversie en het enige HACS-runtimeartifact.

## Scope van de groei

De extra code is uitsluitend bestemd voor de read-only printersamenvatting op Home en Domeinen, de `specialist-printer`-detailroute, mapping-/unavailable-fallbacks en optionele native detailkaarten voor doeltemperaturen, foutstatus en camera. Er zijn geen Home Assistant-servicecalls, configuratiewrites, externe netwerkcalls of nieuwe HACS-resources toegevoegd.

## Validatie

De volledige test- en browsermatrix gebruikt uitsluitend fictieve fixturewaarden. De browserchecks meten geen live Home Assistant-performance; live acceptatie blijft geblokkeerd tot een afzonderlijk goedgekeurd testdashboard, verse snapshot en rollbackpad beschikbaar zijn.
