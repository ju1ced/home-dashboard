# 3D-printerspecialist — bundle- en testbaseline

## Goedgekeurde bundelgrens

De 3D-printerspecialist mag de minified `dist/home-dashboard.js` tot maximaal 205.000 bytes laten groeien. Deze expliciete grens vervangt voor deze wijziging de eerdere 198.000-byte grens. `scripts/verify-dist.mjs` en `tests/foundation.test.mjs` bewaken dezelfde harde limiet.

## Reproduceerbare baseline

Op de gerebaseerde printerbranch bouwt `node scripts/build.mjs` een bundle van 204.617 bytes. De marge tot de harde grens is 383 bytes. De bundle bevat geen sourcemap en de buildcheck controleert de pakketversie en het enige HACS-runtimeartifact.

## Scope van de groei

De extra code is uitsluitend bestemd voor de read-only printersamenvatting op Home en Domeinen, de `specialist-printer`-detailroute, mapping-/unavailable-fallbacks en optionele native detailkaarten voor doeltemperaturen, foutstatus en camera. Er zijn geen Home Assistant-servicecalls, configuratiewrites, externe netwerkcalls of nieuwe HACS-resources toegevoegd.

## Validatie

De volledige test- en browsermatrix gebruikt uitsluitend fictieve fixturewaarden. De browserchecks meten geen live Home Assistant-performance; live acceptatie blijft geblokkeerd tot een afzonderlijk goedgekeurd testdashboard, verse snapshot en rollbackpad beschikbaar zijn.
