# Browserregressiematrix

Peildatum: 23 september 2026. Deze matrix consolideert de bestaande synthetische browserchecks voor HD-110. Zij gebruikt alleen fictieve fixtures en schrijft bewijs naar `generated/browser-matrix/`. Live Home Assistant-acceptatie blijft een afzonderlijke menselijke gate.

## Uitvoeren

Start vanuit de repositoryroot:

    pnpm install --frozen-lockfile
    pnpm run browser:install
    pnpm run test:browser

Playwright 1.63.0 staat exact vast in de lockfile; `browser:install` installeert de bijbehorende Chromium-binary. De runner kiest een eigen lokale poort, start altijd de prototypeserver uit de huidige checkout, verifieert die via een eenmalige identiteitstoken, voert alle checks serieel uit en wacht op servercleanup. `HD_BROWSER_CHANNEL` kan desgewenst een ander lokaal beschikbaar Chromium-kanaal kiezen.

## Matrix

| Gate | Fixture/modus | Viewport | Controle | Script |
|---|---|---|---|---|
| Hoofdviews | warning, light | 390×844, 1024×900, 1440×900 | Home, Kamers, Energie, Domeinen en Meer renderen zonder horizontale overflow; actieve route klopt | `check-prototype-browser.mjs` |
| Details en specialisten | warning, light | 390×844, 1024×900, 1440×900 | kamer, Kia, robot, tuin, 3D-printer en zwembad renderen; specialist-route blijft onder Domeinen | `check-prototype-browser.mjs` |
| Thema | warning, dark | 1440×900 | iedere hoofd-, detail- en specialist-route rendert in dark mode | `check-prototype-browser.mjs` |
| Rust en uitval | normal, unavailable | 390×844 | alle vijf hoofdviews behouden route en overflowcontract | `check-prototype-browser.mjs` |
| Home-header | system, integrated en kiosk | 390×1000, 1920×1000 | vaste navigatierij, mobiele stapeling, geen overlap | `check-home-header-row.mjs` |
| Navigatie | light, integrated/kiosk/native | 390×900, 1024×900, 1440×900 | identieke geometrie, 44 px, editoringang, admin-gate, routeherstel en cleanup | `check-navigation-browser.mjs` |
| Kamerdetail | normal, warning, missing, unavailable, dark | 390×844, 1024×900, 1440×900 | layout, touch, directe actionscope, confirmations, dialog lifecycle, stale calls en focus | `check-room-detail-browser.mjs` |
| Home en kamercontrols | normal: mobiel/tablet/desktop; warning/dark/kiosk: desktop; missing/unavailable: mobiel | 390×844, 1024×900, 1440×900 volgens de genoemde selectie | controls, foutpad, ordering, afval, camera-uitlijning en renderbewijs | `render-room-controls.mjs` |
| Editor en interactie | normal desktop; reduced motion mobiel; native desktop | 390×844 en 1440×1100 | editorroundtrip, native invoer en bediening ≥44 px, specifieke Escape-/focusherstelpaden en reduced motion | `render-room-controls.mjs` |

De statische prototypefixture kent geen afzonderlijke `missing`-dataset. `missing` wordt daarom door de echte gebundelde componenten in de room-detail- en Home-harnassen getest, niet nagebootst in het ontwerp-prototype.

## Failurecontract

- Iedere prototypeassertie noemt view, fixture, thema en viewport, bijvoorbeeld `energy/warning/light/1024x900`.
- Routechecks eisen zowel de juiste actieve navigatie als route-specifieke inhoud. Daardoor kan bijvoorbeeld een robotspecialist niet ongemerkt de Kia-inhoud renderen.
- De runner voegt bij iedere onderliggende failure de betrokken views, fixtures/modi en viewports toe. Gerichte assertions voegen waar beschikbaar de exacte statevariant en viewport toe.
- De runner stopt bij de eerste falende check en behoudt reeds geschreven bewijs in `generated/browser-matrix/`.
- Screenshots zijn verificatie-output, geen automatisch goedgekeurde baselines. Een baselinewijziging vereist inhoudelijke review; de runner overschrijft geen getrackte render in `docs/renders/`.
- Een groene synthetische matrix bewijst geen live Home Assistant-compatibiliteit, backendautorisatie of veilige deployment.

## Lokaal resultaat — 23 september 2026

- `pnpm run test:browser` is groen voor alle vijf onderliggende browserflows.
- Hoofd-, detail- en specialistroutes renderen zonder horizontale overflow op de vastgelegde mobiele, tablet- en desktopviewports.
- Navigatie, editorroundtrip, de expliciet geteste keyboard-/focuspaden, directe kamerbediening, dialog lifecycle en de gedocumenteerde geselecteerde state-/viewportcombinaties zijn groen.
- De 3D-printerroute, camera-/editortouchdoelen en reduced-motiongedrag zijn onderdeel van de vaste runner.
- De aansluitende volledige suite is groen met 88/88 tests; `git diff --check` slaagt.
- Bewijs staat lokaal in `generated/browser-matrix/`; er is geen live Home Assistant-omgeving benaderd of gewijzigd.
