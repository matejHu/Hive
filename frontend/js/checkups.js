import { apiUrl } from './config.js';

document.getElementById("checkupForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let checkup_type = document.getElementById("checkup_type").value;
    let checkup_flyby = document.getElementById("checkup_flyby").value;
    let checkup_date = new Date(document.getElementById("checkup_date").value).toISOString();
    let checkup_note = document.getElementById("checkup_note").value;
    let checkup_hive_id = document.getElementById("checkup_hive_id").value;

    fetch(`${apiUrl}/checkups`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            checkup_type: checkup_type,
            checkup_flyby: checkup_flyby,
            checkup_date: checkup_date,
            checkup_note: checkup_note,
            checkup_hive_id: checkup_hive_id
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Vymazání formuláře po odeslání
            document.getElementById("checkupForm").reset();
            loadRecords();
        })
        .catch(error => console.error("Error:", error));
});

// Funkce pro načtení úlů z API a jejich přidání do select boxu
function loadHivesForForm(hiveId) {
    fetch(`${apiUrl}/hives`)
        .then(response => response.json())
        .then(data => {
            const hiveSelect = document.getElementById("checkup_hive_id");

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
    fetch(`${apiUrl}/checkups`)
        .then(response => response.json())
        .then(data => {
            // Clear previous results
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';

            // Display all records
            data.forEach(record => {
                // Create a div for each record
                const recordDiv = document.createElement('div');
                recordDiv.textContent = `Checkup ID: ${record.checkup_id}, Type: ${record.checkup_type}, Flyby: ${record.checkup_flyby}, Date: ${record.checkup_date}, Note: ${record.checkup_note}, Hive: ${record.checkup_hive_id}`;

                // Add event listener for right-click (context menu)
                recordDiv.addEventListener('contextmenu', (event) => {
                    event.preventDefault(); // Prevent default context menu
                    const confirmDelete = confirm(`Opravdu chcete smazat záznam s ID ${record.checkup_id}?`);
                    if (confirmDelete) {
                        deleteRecord(record.checkup_id); // Call the delete function
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
function deleteRecord(checkup_id) {
    // Call the API to delete the record
    fetch(`${apiUrl}/checkups/${checkup_id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                alert(`Záznam s ID ${checkup_id} byl úspěšně smazán.`);
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