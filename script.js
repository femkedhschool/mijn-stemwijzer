// We laden de gegevens uit stemmingen.csv
fetch("stemmingen.csv")
    .then(function(response) {
        return response.text();
    })
    .then(function(csv) {

        // De eerste regel bevat de namen van de kolommen
        const regels = csv.trim().split("\n");
        const koppen = parseCSV(regels[0]);

        // De tweede regel bevat onze eerste motie
        const gegevens = parseCSV(regels[1]);

        // De eerste zes kolommen zijn algemene informatie.
        // Alles daarna zijn partijen.
        const partijStart = 6;

        const partijen = [];

        for (let i = partijStart; i < koppen.length; i++) {
            partijen.push({
                naam: koppen[i],
                stem: gegevens[i]
            });
        }

        // De quizknoppen
        const antwoordKnoppen = document.querySelectorAll("body > button");

        antwoordKnoppen.forEach(function(knop) {

            knop.addEventListener("click", function() {

                const antwoord = knop.textContent;

                // Oude resultaten verwijderen
                const oudeVraag = document.getElementById("belangrijkheid");
                if (oudeVraag) {
                    oudeVraag.remove();
                }

                const oudeResultaten = document.getElementById("partijresultaten");
                if (oudeResultaten) {
                    oudeResultaten.remove();
                }

                // Weet niet = 0 punten voor iedereen
                if (antwoord === "Weet niet / geen mening") {

                    const melding = document.createElement("p");
                    melding.id = "belangrijkheid";
                    melding.textContent =
                        "Deze vraag telt niet mee voor je uitslag (0 punten voor alle partijen).";

                    document.body.appendChild(melding);

                    return;
                }

                // Als iemand Eens of Oneens kiest,
                // vragen we hoe belangrijk het onderwerp is.
                const belangrijkheidsVraag = document.createElement("div");
                belangrijkheidsVraag.id = "belangrijkheid";

                belangrijkheidsVraag.innerHTML = `
                    <h3>Hoe belangrijk is dit onderwerp voor jou?</h3>

                    <button data-belang="1">Niet belangrijk</button>
                    <button data-belang="2">Belangrijk</button>
                    <button data-belang="3">Heel belangrijk</button>
                `;

                document.body.appendChild(belangrijkheidsVraag);

                const belangrijkheidsKnoppen =
                    belangrijkheidsVraag.querySelectorAll("button");

                belangrijkheidsKnoppen.forEach(function(belangKnop) {

                    belangKnop.addEventListener("click", function() {

                        const belangrijkheid =
                            Number(belangKnop.dataset.belang);

                        // Bereken de scores voor alle partijen
                        const resultaten = [];

                        partijen.forEach(function(partij) {

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

                            resultaten.push({
                                naam: partij.naam,
                                score: score,
                                stem: partij.stem
                            });
                        });

                        // Toon de resultaten op de website
                        const resultaatDiv =
                            document.createElement("div");

                        resultaatDiv.id = "partijresultaten";

                        const titel =
                            document.createElement("h3");

                        titel.textContent =
                            "Scores bij deze stelling:";

                        resultaatDiv.appendChild(titel);

                        resultaten.forEach(function(resultaat) {

                            const regel =
                                document.createElement("p");

                            regel.textContent =
                                resultaat.naam +
                                ": " +
                                (resultaat.score > 0 ? "+" : "") +
                                resultaat.score +
                                " (stem: " +
                                resultaat.stem +
                                ")";

                            resultaatDiv.appendChild(regel);
                        });

                        document.body.appendChild(resultaatDiv);
                    });
                });
            });
        });
    })
    .catch(function(error) {
        console.error("Er ging iets mis:", error);
    });


// Deze functie zorgt ervoor dat we CSV-regels goed kunnen lezen,
// ook wanneer tekst komma's bevat.
function parseCSV(regel) {

    const waarden = [];
    let huidigeWaarde = "";
    let tussenAanhalingstekens = false;

    for (let i = 0; i < regel.length; i++) {

        const teken = regel[i];

        if (teken === '"') {
            tussenAanhalingstekens = !tussenAanhalingstekens;
        }
        else if (teken === "," && !tussenAanhalingstekens) {
            waarden.push(huidigeWaarde.trim());
            huidigeWaarde = "";
        }
        else {
            huidigeWaarde += teken;
        }
    }

    waarden.push(huidigeWaarde.trim());

    return waarden;
}
