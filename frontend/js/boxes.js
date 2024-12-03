import { apiUrl } from './config.js';

document.getElementById("boxForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let box_type = document.getElementById("box_type").value;
    let box_year = document.getElementById("box_year").value;
    let box_notes = document.getElementById("box_notes").value;
    let box_hive_id = document.getElementById("box_hive_id").value;

    fetch(`${apiUrl}/boxes`, {
        credentials: 'include',
        method: "POST",
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
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Vymazání formuláře po odeslání
            document.getElementById("boxForm").reset();
            loadRecords();
        })
        .catch(error => console.error("Error:", error));
});

// Funkce pro načtení úlů z API a jejich přidání do select boxu
function loadHivesForForm(hiveId) {
    fetch(`${apiUrl}/hives`, {credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            const hiveSelect = document.getElementById("box_hive_id");

            // Pro každé hive_id přidáme možnost do <select>
            data.forEach(hive => {
                const option = document.createElement("option");
                option.value = hive.hive_id;
                option.text = `${hive.hive_name} (ID: ${hive.hive_id})`;
                hiveSelect.appendChild(option);
            });

            // Předvyplnění hodnoty, pokud existuje odpovídající možnost
            if (hiveId) {
                const optionExists = [...hiveSelect.options].some(option => option.value === hiveId);

                if (optionExists) {
                    hiveSelect.value = hiveId; // Nastavení hodnoty select boxu
                } else {
                    console.error('Hive ID z URL neodpovídá žádné možnosti v selectu.');
                }
            }
        })
        .catch(error => console.error("Error loading hives:", error));
}

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

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const hiveId = urlParams.get('hive_id'); // Získání hive_id z URL

    loadHivesForForm(hiveId);
};