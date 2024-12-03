import { apiUrl } from './config.js';

document.getElementById("boxForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let box_type = document.getElementById("box_type").value;
    let box_year = document.getElementById("box_year").value;
    let box_notes = document.getElementById("box_notes").value;
    let box_hive_id = document.getElementById("box_hive_id").value;

    const urlParams = new URLSearchParams(window.location.search);
    const boxId = urlParams.get('box_id'); // Získání ID boxu z URL

    // Pokud není box_hive_id vyplněno (např. je null), přeskoč kontrolu počtu boxů
    if (!box_hive_id) {
        submitForm(boxId, box_type, box_year, box_notes, box_hive_id);
    } else {
        // Před odesláním formuláře zkontrolujeme počet boxů pro vybraný úl
        checkBoxCount(box_hive_id).then(canProceed => {
            if (canProceed) {
                submitForm(boxId, box_type, box_year, box_notes, box_hive_id);
            }
        }).catch(error => console.error("Error checking box count:", error));
    }
});

const parsedParams = {}; // Globální objekt pro ukládání hodnot z URL

function parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Načteme box_id a hive_id z URL a uložíme je
    parsedParams.boxId = urlParams.get('box_id');
    parsedParams.hiveId = urlParams.get('hive_id');
    console.log(parsedParams.hiveId);

    // Vyčištění URL
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', cleanUrl);

    console.log("Parsed URL parameters:", parsedParams);
}

// Funkce pro kontrolu počtu přiřazených boxů pro vybraný úl
function checkBoxCount(selectedHive) {
    return fetch(`${apiUrl}/hiveBoxCount/${selectedHive}`, {credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            const currentBoxCount = parseInt(data.box_count);

            // Kontrola, zda nebude překročen limit 5 boxů
            if (currentBoxCount >= 5) {
                alert("This hive cannot have more than 5 boxes.");
                return false;  // Nepovolit přidání nového boxu
            }

            return true;  // Povolit přidání nového boxu
        })
        .catch(error => {
            console.error("Error fetching hive box count:", error);
            return false;  // Přerušit operaci při chybě
        });
}

// Funkce pro odeslání formuláře (POST nebo PUT)
function submitForm(boxId, box_type, box_year, box_notes, box_hive_id) {
    // Použijeme uložené hodnoty z parsedParams, pokud nebyly předány jako argumenty
    boxId = boxId || parsedParams.boxId;
    box_hive_id = box_hive_id || parsedParams.hiveId;

    // Konstrukce URL a metody
    const url = boxId ? `${apiUrl}/boxes/${boxId}` : `${apiUrl}/boxes`;
    const method = boxId ? "PUT" : "POST";

    fetch(url, {
        method: method,
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            box_type: box_type,
            box_year: box_year,
            box_notes: box_notes,
            box_hive_id: box_hive_id
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Box ${boxId ? "updated" : "created"} successfully:`, data);
            loadRecords(); // Aktualizace seznamu záznamů
        })
        .catch(error => console.error("Error:", error));
}

async function loadHivesForForm(selectedHiveId = null) {
    try {
        const response = await fetch(`${apiUrl}/hives`, { credentials: 'include' });
        const data = await response.json();

        const hiveSelect = document.querySelector('#box_hive_id');
        hiveSelect.innerHTML = ''; // Vyčistíme obsah

        data.forEach(hive => {
            const option = document.createElement('option');
            option.value = hive.hive_id;
            option.textContent = `Hive ${hive.hive_name}`;

            if (selectedHiveId && hive.hive_id === parseInt(selectedHiveId)) {
                option.selected = true; // Nastavíme výchozí hodnotu
            }
            hiveSelect.appendChild(option);
        });

        // Pokud je `hive_id` přítomen, zakážeme změnu
        if (selectedHiveId) {
            hiveSelect.disabled = true;
        }
    } catch (error) {
        console.error("Error loading hives:", error);
    }
}

window.onload = function () {
    parseUrlParams(); // Načteme parametry z URL

    // Inicializace dat ve formuláři
    if (parsedParams.boxId) {
        loadBoxData(parsedParams.boxId);
    }
    loadHivesForForm(parsedParams.hiveId);
};

function loadRecords() {
    // Fetch all records from the server
    fetch(`${apiUrl}/boxes`, {credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            // Clear previous results
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';

            // Display all records
            data.forEach(record => {
                // Create a div for each record
                const recordDiv = document.createElement('div');
                recordDiv.textContent = `Box ID: ${record.box_id}, Type: ${record.box_type}, Year: ${record.box_year}, Notes: ${record.box_notes}, Hive: ${record.box_hive_id}`;

                // Add event listener for right-click (context menu)
                recordDiv.addEventListener('contextmenu', (event) => {
                    event.preventDefault(); // Prevent default context menu
                    const confirmDelete = confirm(`Opravdu chcete smazat záznam s ID ${record.box_id}?`);
                    if (confirmDelete) {
                        deleteRecord(record.box_id); // Call the delete function
                    }
                });

                // Append record to the results div
                resultsDiv.appendChild(recordDiv);
            });

        })
        .catch(error => {
            console.error('Error fetching records:', error);
        });
}

// Function to delete a record
function deleteRecord(box_id) {
    // Call the API to delete the record
    fetch(`${apiUrl}/boxes/${box_id}`, {
        credentials: 'include',
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                alert(`Záznam s ID ${box_id} byl úspěšně smazán.`);
                loadRecords(); // Reload records after deletion
            } else {
                alert('Došlo k chybě při mazání záznamu.');
            }
        })
        .catch(error => {
            console.error('Error deleting record:', error);
        });
}

function loadBoxData(boxId) {
    fetch(`${apiUrl}/boxes/${boxId}`, { credentials: 'include' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Loaded box data:", data);

            // Vyplnění formuláře
            document.querySelector('#box_type').value = data.box_type || '';
            document.querySelector('#box_year').value = data.box_year || '';
            document.querySelector('#box_notes').value = data.box_notes || '';
            document.querySelector('#box_hive_id').value = data.box_hive_id || '';
        })
        .catch(error => console.error("Error loading box data:", error));
}