import { apiUrl } from './config.js';

document.getElementById("hiveForm").addEventListener("submit", function (event) {
    event.preventDefault();


    let hive_year = document.getElementById("hive_year").value;
    let hive_name = document.getElementById("hive_name").value;
    let hive_location_id = document.getElementById("hive_location_id").value;

    fetch(`${apiUrl}/hives`, {
        credentials: 'include',
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            hive_year: hive_year,
            hive_name: hive_name,
            hive_location_id: hive_location_id
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Vymazání formuláře po odeslání
            document.getElementById("hiveForm").reset();
            loadHives();
        })
        .catch(error => console.error("Error:", error));
});

function loadHives() {
    fetch(`${apiUrl}/hives`, {credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';

            data.forEach(record => {
                const recordDiv = document.createElement('div');
                recordDiv.textContent = `Hive ID: ${record.hive_id}, Year: ${record.hive_year}, Name: ${record.hive_name}, Location id: ${record.hive_location_id}`;

                recordDiv.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    const confirmDelete = confirm(`Opravdu chcete smazat úl s ID ${record.hive_id}?`);
                    if (confirmDelete) {
                        deleteHive(record.hive_id);
                    }
                });

                resultsDiv.appendChild(recordDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching hives:', error);
        });
}

// Funkce pro načtení locations z API a jejich přidání do select boxu
function loadLocationsForForm(locationId) {
    fetch(`${apiUrl}/locations`, {credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            const locationSelect = document.getElementById("hive_location_id");

            // Pro každé location_id přidáme možnost do <select>
            data.forEach(location => {
                const option = document.createElement("option");
                option.value = location.location_id;
                option.text = `${location.location_name} (ID: ${location.location_id})`;
                locationSelect.appendChild(option);
            });

            // Předvyplnění hodnoty, pokud existuje odpovídající možnost
            if (locationId) {
                const optionExists = [...locationSelect.options].some(option => option.value === locationId);

                if (optionExists) {
                    locationSelect.value = locationId; // Nastavení hodnoty select boxu
                } else {
                    console.error('Location ID z URL neodpovídá žádné možnosti v selectu.');
                }
            }
        })
        .catch(error => console.error("Error loading hives:", error));
}

function deleteHive(hive_id) {
    fetch(`${apiUrl}/hives/${hive_id}`, {
        credentials: 'include',
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                alert(`Úl s ID ${hive_id} byl úspěšně smazán.`);
                loadHives();
            } else {
                alert('Došlo k chybě při mazání úlu.');
            }
        })
        .catch(error => {
            console.error('Error deleting hive:', error);
        });
}

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const locationId = urlParams.get('location_id'); // Získání location_id z URL

    // Zavolání funkce s parametrem locationId
    loadLocationsForForm(locationId);

    // Odstranění parametru z URL, aniž by došlo k reloadu stránky
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({ locationId }, '', cleanUrl); // Uloží locationId do historie

};