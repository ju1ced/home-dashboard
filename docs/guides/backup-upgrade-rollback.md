# Backup, upgrade en rollback

## Privé-back-up

1. Open de grafische editor.
2. Kies **Exporteer privé-back-up**.
3. Bevestig de privacywaarschuwing.
4. Bewaar `home-dashboard.local.json` buiten Git en buiten publieke supportkanalen.

Een export kan echte entity-, area-, floor- en actionreferenties bevatten.

## Upgrade

1. Maak eerst een privé-back-up.
2. Lees de releasechecklist en bekende beperkingen.
3. Werk de HACS-repository bij.
4. Voer een volledige browserrefresh uit.
5. Open de editor; controleer schema- en resourcewaarschuwingen.
6. Sla pas op nadat de editor een geldige configuratie meldt.

## Rollback

1. Selecteer in HACS de vorige werkende prerelease.
2. Voer een volledige browserrefresh uit.
3. Importeer alleen een back-up met een schema dat die release ondersteunt.
4. Herstel bij twijfel de vorige dashboardconfiguratie via Home Assistant's eigen backup/exportproces.

Een HACS-rollback wijzigt het default dashboard niet. Verwijder nooit globale resources zonder multi-dashboardaudit en afzonderlijke goedkeuring.
