// We zoeken de drie knoppen op onze pagina
const antwoordKnoppen = document.querySelectorAll("body > button");

// We reageren wanneer iemand op een antwoord klikt
antwoordKnoppen.forEach(function(knop) {
    knop.addEventListener("click", function() {

        const antwoord = knop.textContent;

        // Eerst kijken we of er al een belangrijkheidsvraag bestaat
        const oudeVraag = document.getElementById("belangrijkheid");

        if (oudeVraag) {
            oudeVraag.remove();
        }

        // Bij "Weet niet / geen mening" is de score meteen 0
        if (antwoord === "Weet niet / geen mening") {

            const melding = document.createElement("p");
            melding.id = "belangrijkheid";
            melding.textContent = "Deze vraag telt niet mee voor je uitslag.";
            
            document.body.appendChild(melding);

            return;
        }

        // Bij Eens of Oneens vragen we hoe belangrijk het onderwerp is
        const belangrijkheidsVraag = document.createElement("div");
        belangrijkheidsVraag.id = "belangrijkheid";

        belangrijkheidsVraag.innerHTML = `
            <h3>Hoe belangrijk is dit onderwerp voor jou?</h3>

            <button data-belang="1">Niet belangrijk</button>
            <button data-belang="2">Belangrijk</button>
            <button data-belang="3">Heel belangrijk</button>
        `;

        document.body.appendChild(belangrijkheidsVraag);

        // We geven de drie belangrijkheidsknoppen een functie
        const belangrijkheidsKnoppen =
            belangrijkheidsVraag.querySelectorAll("button");

        belangrijkheidsKnoppen.forEach(function(belangKnop) {

            belangKnop.addEventListener("click", function() {

                const belangrijkheid = Number(belangKnop.dataset.belang);

                let score;

                if (antwoord === "Eens") {
                    score = belangrijkheid;
                } else {
                    score = -belangrijkheid;
                }

                const resultaat = document.createElement("p");
                resultaat.id = "score";
                resultaat.textContent =
                    "Je antwoord is: " + antwoord +
                    " — belangrijkheid: " + belangrijkheid +
                    " — score: " + score;

                const oudeScore = document.getElementById("score");

                if (oudeScore) {
                    oudeScore.remove();
                }

                document.body.appendChild(resultaat);
            });
        });
    });
});
