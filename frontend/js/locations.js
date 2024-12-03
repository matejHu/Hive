import { apiUrl } from './config.js';

document.getElementById("locationForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let location_name = document.getElementById("location_name").value;

    fetch(`${apiUrl}/locations`, {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            location_name: location_name
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Vymazání formuláře po odeslání
            document.getElementById("locationForm").reset();
            loadLocations();
        })
        .catch(error => console.error("Error:", error));
});

function loadLocations() {
    fetch(`${apiUrl}/locations`, {credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';

            data.forEach(record => {
                const recordDiv = document.createElement('div');
                recordDiv.textContent = `Location ID: ${record.location_id}, Name: ${record.location_name}`;

                recordDiv.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    const confirmDelete = confirm(`Opravdu chcete smazat lokaci s ID ${record.location_id}?`);
                    if (confirmDelete) {
                        deleteLocation(record.location_id);
                    }
                });

                resultsDiv.appendChild(recordDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching locations:', error);
        });
}

function deleteLocation(location_id) {
    fetch(`${apiUrl}/locations/${location_id}`, {
        method: 'DELETE',
        credentials: 'include'
    })
        .then(response => {
            if (response.ok) {
                alert(`Lokace s ID ${location_id} byla úspěšně smazána.`);
                loadLocations();
            } else {
                alert('Došlo k chybě při mazání lokace.');
            }
        })
        .catch(error => {
            console.error('Error deleting location:', error);
        });
}