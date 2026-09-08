# Poetry Middag Roosendaal

Statische onepager voor zondag 18 oktober 2026.

## Inschrijfformulier

Het formulier verstuurt de gegevens via een JSON `POST`. De statische site leest de Catch Hook uit `config.js` als `window.POETRY_FORM_WEBHOOK_URL`. Bij statische hosting is deze formulierendpoint technisch zichtbaar voor bezoekers; Zapier-validatie en spamfilters blijven daarom belangrijk. `FORM_SUCCESS_REDIRECT` is optioneel gereserveerd voor een externe bedankpagina; standaard toont de pagina zelf de bevestiging.
