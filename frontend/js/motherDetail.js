import { apiUrl } from './config.js';

// Function to render mother details
function renderMother(mother) {
    const container = document.getElementById('motherContainer');

    // Create mother element
    const motherElement = document.createElement('div');
    motherElement.classList.add('mother');

    // Create mother header
    const motherHeader = document.createElement('div');
    motherHeader.classList.add('mother-header');
    motherHeader.textContent = `Původ: ${mother.mother_origin}`;
    motherElement.appendChild(motherHeader);

    // Create mother year
    const motherYear = document.createElement('div');
    motherYear.classList.add('mother-year');
    motherYear.textContent = `Rok: ${mother.mother_year}`;
    motherElement.appendChild(motherYear);

    // Render notes
    const motherNotes = document.createElement('div');
    motherNotes.classList.add('item');
    motherNotes.innerHTML = `
        <div class="item-title">Poznámky:</div>
        <div class="item-note">${mother.mother_notes || 'Žádné poznámky'}</div>
    `;
    motherElement.appendChild(motherNotes);

    // Display mother ID for reference
    const motherId = document.createElement('div');
    motherId.classList.add('mother-id');
    motherId.textContent = `ID matky: ${mother.mother_id}`;
    motherElement.appendChild(motherId);

    container.appendChild(motherElement);
}

// Function to fetch mother data from the API
async function fetchMotherDetails(motherId) {
    try {
        const response = await fetch(`${apiUrl}/mothers/${motherId}`);
        if (!response.ok) {
            throw new Error(`Error fetching mother details: ${response.statusText}`);
        }

        const motherData = await response.json();
        renderMother(motherData);
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById('motherContainer').innerText = 'Chyba při načítání dat.';
    }
}

// Function to get mother_id from the URL
function getMotherIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('mother_id');
}

// Get mother_id from URL and fetch mother details
const motherId = getMotherIdFromUrl(); // Get mother_id from URL
if (motherId) {
    fetchMotherDetails(motherId);
} else {
    document.getElementById('motherContainer').innerText = 'Mother ID nebylo nalezeno v URL.';
}