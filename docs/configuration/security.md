# Security en camerastrook

Security ondersteunt ieder positief aantal geconfigureerde camera's. De GUI bewaart per camera een naam, camera-entity, optionele privacystatus, optionele vooraf aangemaakte privacyactie en fallback.

## Weergave in v0.4.0-alpha.1

- De beveiligingssectie beslaat de volledige beschikbare Home-breedte.
- Camera's staan in configuratievolgorde in één horizontaal scrollbare strook.
- Touch, trackpad, muiswiel en de vorige/volgende-knoppen werken naast de toetsen Arrow Left/Right, Home en End.
- Een actieve privacystatus toont een duidelijke placeholder en start geen betekenisloze zwarte preview.
- `fallback: hidden` verbergt een onbeschikbare/onbekende camera; `placeholder` en `last_image` laten de native camerakaart haar huidige fallback tonen.
- Een privacystatus zonder privacyactie blijft geldige status-only configuratie.

## Veiligheidsgrens

Camera openen, privacy wijzigen en alarm bedienen zijn in deze prerelease uitgeschakeld. De card genereert geen servicecall en gebruikt voor picture-, privacy- en alarmkaarten `tap`, `hold` en `double_tap` op `none`. Een latere bedieningsrelease moet actionallowlist, target, bevestiging, autorisatie en resultaatcontrole samen bewijzen.
