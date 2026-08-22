# Rendermatrix

De PNG's zijn op 2026-08-21 gemaakt met de lokale browserprototype-fixtures. De viewport override is gekalibreerd zodat de uiteindelijke bestanden exact de vereiste pixelafmetingen hebben.

| Bestand | Prototype-URL | Fixture | Modus | Afmeting |
|---|---|---|---|---:|
| `home-desktop.png` | `?view=home&state=warning&theme=light&clean=1` | warning | light | 1440×900 |
| `home-mobile.png` | `?view=home&state=warning&theme=light&clean=1` | warning | light | 390×844 |
| `rooms-desktop.png` | `?view=rooms&state=warning&theme=light&clean=1` | warning | light | 1440×900 |
| `rooms-mobile.png` | `?view=rooms&state=warning&theme=light&clean=1` | warning | light | 390×844 |
| `room-desktop.png` | `?view=room&state=warning&theme=light&clean=1` | warning | light | 1440×900 |
| `room-mobile.png` | `?view=room&state=warning&theme=light&clean=1` | warning | light | 390×844 |
| `energy-desktop.png` | `?view=energy&state=warning&theme=light&clean=1` | warning | light | 1440×900 |
| `energy-mobile.png` | `?view=energy&state=warning&theme=light&clean=1` | warning | light | 390×844 |
| `integrations-desktop.png` | `?view=integrations&state=warning&theme=light&clean=1` | warning | light | 1440×900 |
| `pool-desktop.png` | `?view=pool&state=warning&theme=light&clean=1` | warning | light | 1440×900 |
| `home-desktop-dark.png` | `?view=home&state=warning&theme=dark&clean=1` | warning | dark | 1440×900 |

Start lokaal met `npm run serve` en open `http://127.0.0.1:4173/` met de query uit de tabel. De interactieve prototypecontrols zijn zichtbaar zonder `clean=1`. De fixtureselector bevat ook de normale toestand.

Visuele QA controleerde iedere PNG op horizontale overflow, elementgrenzen, afgesneden labels, stacking, contrastindruk en touch targets. De Home-baseline gebruikt drie fictieve camerakaarten om horizontale camerascroll en afzonderlijke privacycontrols te controleren; de runtime accepteert ieder geconfigureerd positief aantal. De kamerdetailrender bevat de rijke comfort-, klimaat-, historie- en apparaatinformatie; Energie heeft afzonderlijke desktop- en mobiele baselines. Browserconsole: geen fouten of waarschuwingen. De repositorycheck valideert bestandsafmetingen en aanwezigheid.
