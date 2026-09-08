# Poetry Middag Roosendaal

Statische onepager voor zondag 18 oktober 2026.

## Inschrijfformulier

Het formulier verstuurt de gegevens via een JSON `POST`. Kopieer `config.example.js` naar `config.js` en vul `window.POETRY_FORM_WEBHOOK_URL` in. De webhook moet CORS-verzoeken vanaf het siteadres accepteren. Bij geautomatiseerde deployment kan `config.js` vanuit de geheime variabele `FORM_WEBHOOK_URL` worden gegenereerd. `FORM_SUCCESS_REDIRECT` is optioneel gereserveerd voor een externe bedankpagina; standaard toont de pagina zelf de bevestiging.
