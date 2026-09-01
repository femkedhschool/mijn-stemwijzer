// We laden alle gegevens uit stemmingen.csv
fetch("stemmingen.csv")
    .then(function(response) {
        return response.text();
    })
    .then(function(csv) {

        // Alle regels uit de CSV ophalen
        const regels = csv.trim().split("\n");

        // De eerste regel bevat de kolomnamen
        const koppen = parseCSV(regels[0]);

        // Alle stellingen verzamelen
        const stellingen = [];

        for (let i = 1; i < regels.length; i++) {

            const gegevens = parseCSV(regels[i]);

            const partijen = [];

            // De eerste zes kolommen zijn algemene informatie.
            // Alles daarna zijn partijen.
            for (let j = 6; j < koppen.length; j++) {

                partijen.push({
                    naam: koppen[j],
                    stem: gegevens[j]
                });
            }

            stellingen.push({
                id: gegevens[0],
                datum: gegevens[1],
                onderwerp: gegevens[2],
                tekst: gegevens[3],
                motie: gegevens[4],
                bron: gegevens[5],
                partijen: partijen
            });
        }

        // Hier bewaren we de totaalscores van alle partijen.
        const totaalscores = {};

        stellingen[0].partijen.forEach(function(partij) {
            totaalscores[partij.naam] = 0;
        });

        // We houden bij bij welke stelling we zijn.
        let huidigeStelling = 0;

        // We tonen de eerste stelling
        toonStelling();

        function toonStelling() {

            const stelling = stellingen[huidigeStelling];

            // Oude inhoud verwijderen
            const oudeBelangrijkheid =
                document.getElementById("belangrijkheid");

            if (oudeBelangrijkheid) {
                oudeBelangrijkheid.remove();
            }

            const oudeResultaten =
                document.getElementById("partijresultaten");

            if (oudeResultaten) {
                oudeResultaten.remove();
            }

            // De tekst van de huidige stelling aanpassen
            const titel =
                document.querySelector("h2");

            const tekst =
                  document.getElementById("stellingtekst");

            titel.textContent =
                stelling.onderwerp;

            tekst.textContent =
                stelling.tekst;

            // De antwoordknoppen opnieuw zoeken
            const antwoordKnoppen =
                document.querySelectorAll("body > button");

            antwoordKnoppen.forEach(function(knop) {

                knop.onclick = function() {

                    const antwoord =
                        knop.textContent;

                    // Weet niet = 0 punten
                    if (antwoord === "Weet niet / geen mening") {

                        volgendeStelling();
                        return;
                    }

                    // Belangrijkheid vragen
                    const belangrijkheidsVraag =
                        document.createElement("div");

                    belangrijkheidsVraag.id =
                        "belangrijkheid";

                    belangrijkheidsVraag.innerHTML = `
                        <h3>Hoe belangrijk is dit onderwerp voor jou?</h3>

                        <button data-belang="1">Niet belangrijk</button>
                        <button data-belang="2">Belangrijk</button>
                        <button data-belang="3">Heel belangrijk</button>
                    `;

                    document.body.appendChild(
                        belangrijkheidsVraag
                    );

                    const belangrijkheidsKnoppen =
                        belangrijkheidsVraag.querySelectorAll("button");

                    belangrijkheidsKnoppen.forEach(function(belangKnop) {

                        belangKnop.onclick = function() {

                            const belangrijkheid =
                                Number(
                                    belangKnop.dataset.belang
                                );

                            // De score voor iedere partij berekenen
                            stelling.partijen.forEach(function(partij) {

                                let score = 0;

                                if (partij.stem === "afwezig") {
                                    score = 0;
                                }

                                else if (antwoord === "Eens") {

                                    if (partij.stem === "voor") {
                                        score = belangrijkheid;
                                    }

                                    else if (partij.stem === "tegen") {
                                        score = -belangrijkheid;
                                    }
                                }

                                else if (antwoord === "Oneens") {

                                    if (partij.stem === "voor") {
                                        score = -belangrijkheid;
                                    }

                                    else if (partij.stem === "tegen") {
                                        score = belangrijkheid;
                                    }
                                }

                                // Score bij de totaalscore optellen
                                totaalscores[partij.naam] += score;
                            });

                            volgendeStelling();
                        };
                    });
                };
            });
        }

        function volgendeStelling() {

            // Belangrijkheidsvraag verwijderen
            const belangrijkheid =
                document.getElementById("belangrijkheid");

            if (belangrijkheid) {
                belangrijkheid.remove();
            }

            huidigeStelling++;

            // Zijn we klaar?
            if (huidigeStelling >= stellingen.length) {

                toonEindresultaat();

            }
            else {

                toonStelling();
            }
        }

        function toonEindresultaat() {

            // Antwoordknoppen verwijderen
            const antwoordKnoppen =
                document.querySelectorAll("body > button");

            antwoordKnoppen.forEach(function(knop) {
                knop.remove();
            });

            // Oude tekst verwijderen
            const oudeTekst =
                document.querySelector("body > p");

            if (oudeTekst) {
                oudeTekst.remove();
            }

            const oudeTitel =
                document.querySelector("h2");

            if (oudeTitel) {
                oudeTitel.remove();
            }

            // Resultaten sorteren
            const resultaten =
                Object.entries(totaalscores);

            resultaten.sort(function(a, b) {
                return b[1] - a[1];
            });

            // Eindtitel
            const titel =
                document.createElement("h2");

            titel.textContent =
                "Jouw voorlopige uitslag";

            document.body.appendChild(titel);

            const uitleg =
                document.createElement("p");

            uitleg.textContent =
                "Hoe hoger de score, hoe meer jouw antwoorden overeenkomen met het stemgedrag van de partij.";

            document.body.appendChild(uitleg);

            // Ranglijst maken
            resultaten.forEach(function(resultaat, index) {

                const regel =
                    document.createElement("p");

                regel.textContent =
                    (index + 1) +
                    ". " +
                    resultaat[0] +
                    ": " +
                    (resultaat[1] > 0 ? "+" : "") +
                    resultaat[1] +
                    " punten";

                document.body.appendChild(regel);
            });
        }
    })
    .catch(function(error) {
        console.error(
            "Er ging iets mis:",
            error
        );
    });


// Deze functie leest CSV-regels correct,
// ook wanneer tekst komma's bevat.
function parseCSV(regel) {

    const waarden = [];
    let huidigeWaarde = "";
    let tussenAanhalingstekens = false;

    for (let i = 0; i < regel.length; i++) {

        const teken = regel[i];

        if (teken === '"') {
            tussenAanhalingstekens =
                !tussenAanhalingstekens;
        }

        else if (
            teken === "," &&
            !tussenAanhalingstekens
        ) {
            waarden.push(
                huidigeWaarde.trim()
            );

            huidigeWaarde = "";
        }

        else {
            huidigeWaarde += teken;
        }
    }

    waarden.push(
        huidigeWaarde.trim()
    );

    return waarden;
}
