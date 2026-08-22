# Troubleshooting

## De editor verschijnt niet

- controleer in HACS of de gewenste prerelease geïnstalleerd is;
- controleer of `home-dashboard.js` als JavaScript-module is geregistreerd;
- voer een volledige browserrefresh uit;
- controleer de browserconsole op één `HOME DASHBOARD`-regel en JavaScript-fouten.

## Een wijziging wordt niet opgeslagen

De editor bewaart een ongeldige tussenstand lokaal en verstuurt dan geen `config-changed`. Los alle rode fouten bovenaan op. Veelvoorkomend:

- security is ingeschakeld zonder camera;
- een gekoppelde privacyactie bestaat niet meer of mist een expliciete target/resultaatcontrole; iedere geldige risicoklasse is toegestaan en voor status-only mag **Privacyactie** op **Geen** blijven staan;
- een logical key ontbreekt, is ongeldig of komt dubbel voor;
- een room verwijst naar een onbekende quick action;
- een privacy-, kostelijke of destructieve actie mist bevestigingstekst;
- een geselecteerde area ontbreekt.

## Unavailable geeft te veel ruis

Laat `unavailable_policy` op `operational_only` staan en kies alleen dagelijks kritieke entities in de operationele allowlist. `unknown` is niet automatisch een storing; buttons, events en sommige helpers hebben normaal geen persistente state.

## Import wordt geweigerd

Controleer of het bestand geldige JSON is en geen toekomstig `schema_version` bevat. Deel de export niet publiek: maak voor support een handmatige, geanonimiseerde kopie zonder installatiegegevens.
