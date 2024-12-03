import { apiUrl } from './config.js';

document.getElementById("motherForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let mother_origin = document.getElementById("mother_origin").value;
    let mother_year = document.getElementById("mother_year").value;
    let mother_notes = document.getElementById("mother_notes").value;
    let mother_hive_id = document.getElementById("mother_hive_id").value;

    const urlParams = new URLSearchParams(window.location.search);
    const hiveId = urlParams.get('hive_id');
    const motherId = urlParams.get('mother_id');

    if (!motherId && !mother_hive_id) {
        submitForm(hiveId, mother_origin, mother_year, mother_notes, mother_hive_id);
    } else if (!motherId) {  // Přidává se nová matka
        checkMothersCount(mother_hive_id).then(canProceed => {
            if (canProceed) {
                submitForm(motherId, mother_origin, mother_year, mother_notes, mother_hive_id);
            }
        }).catch(error => console.error("Error checking mothers count:", error));
    } else {  // Úprava existující matky
        submitForm(motherId, mother_origin, mother_year, mother_notes, mother_hive_id);
    }
});

function checkMothersCount(selectedHive) {
    return fetch(`${apiUrl}/hiveMothersCount/${selectedHive}`, {credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            const currentMotherCount = parseInt(data.mothers_count);

            // Kontrola, zda nebude překročen limit 1 mother
            if (currentMotherCount >= 1) {
                alert("This hive " + selectedHive + " cannot have more than 1 mother.");
                return false;  // Nepovolit přidání new mother
            }

            return true;  // Povolit přidání new mother
        })
        .catch(error => {
            console.error("Error fetching hive mother count:", error);
            return false;  // Přerušit operaci při chybě
        });
}

function submitForm(motherId, mother_origin, mother_year, mother_notes, mother_hive_id) {
    const url = motherId ? `${apiUrl}/mothers/${motherId}` : `${apiUrl}/mothers`;
    const method = motherId ? "PUT" : "POST";

    fetch(url, {
        method: method,
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mother_origin: mother_origin,
            mother_year: mother_year,
            mother_notes: mother_notes,
            mother_hive_id: mother_hive_id
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            loadRecords();
        })
        .catch(error => console.error("Error:", error));
}

function loadHivesForForm(selectedHiveId = null) {
    return fetch(`${apiUrl}/hives`, {credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            const hiveSelect = document.getElementById('mother_hive_id');
            hiveSelect.innerHTML = '<option value="" disabled selected>Select Hive</option>'; // Resetování

            data.forEach(hive => {
                const option = document.createElement('option');
                option.value = hive.hive_id;
                option.textContent = `Hive ${hive.hive_id}`;
                // Používáme volné porovnání == kvůli možnému rozdílu v typech (např. číslo a string)
                if (selectedHiveId && selectedHiveId == hive.hive_id) {
                    option.selected = true; // Nastavení vybraného úlu
                }
                hiveSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading hives:', error));
}
document.getElementById("loadButton").addEventListener("click", loadRecords);

function loadRecords() {
    fetch(`${apiUrl}/mothers`, {credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';

            data.forEach(record => {
                const recordDiv = document.createElement('div');
                recordDiv.textContent = `Mother ID: ${record.mother_id}, Origin: ${record.mother_origin}, Year: ${record.mother_year}, Notes: ${record.mother_notes}, Hive: ${record.mother_hive_id}`;

                recordDiv.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    const confirmDelete = confirm(`Opravdu chcete smazat záznam s ID ${record.mother_id}?`);
                    if (confirmDelete) {
                        deleteRecord(record.mother_id);
                    }
                });

                resultsDiv.appendChild(recordDiv);
            });
        })
        .catch(error => console.error('Error fetching records:', error));
}

function deleteRecord(mother_id) {
    fetch(`${apiUrl}/mothers/${mother_id}`, {
        credentials: 'include',
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                alert(`Záznam s ID ${mother_id} byl úspěšně smazán.`);
                loadRecords();
            } else {
                alert('Došlo k chybě při mazání záznamu.');
            }
        })
        .catch(error => console.error('Error deleting record:', error));
}

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const hiveId = urlParams.get('hive_id');
    const motherId = urlParams.get('mother_id');

    if (hiveId) {
        loadHivesForForm(hiveId);
    }
    if (motherId) {
        loadMotherData(motherId);
    }

    // Odebrání parametrů z URL bez obnovení stránky
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', cleanUrl);
};

function loadMotherData(motherId) {
    fetch(`${apiUrl}/mothers/${motherId}`, {credentials: 'include',})
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('mother_origin').value = data.mother_origin;
                document.getElementById('mother_year').value = data.mother_year;
                document.getElementById('mother_notes').value = data.mother_notes;

                loadHivesForForm(data.mother_hive_id);
                document.title = `Mother ${motherId} update`;
            }
        })
        .catch(error => console.error("Chyba při načítání dat o mother:", error));
}