import { apiUrl } from './config.js';

// Function to render box details
function renderBox(box) {
    const container = document.getElementById('boxContainer');

    // Create box element
    const boxElement = document.createElement('div');
    boxElement.classList.add('box');

    // Create box header
    const boxHeader = document.createElement('div');
    boxHeader.classList.add('box-header');
    boxHeader.textContent = `Typ boxu: ${box.box_type}`;
    boxElement.appendChild(boxHeader);

    // Create box year
    const boxYear = document.createElement('div');
    boxYear.classList.add('box-year');
    boxYear.textContent = `Rok vytvoření: ${box.box_year}`;
    boxElement.appendChild(boxYear);

    // Render notes
    const boxNotes = document.createElement('div');
    boxNotes.classList.add('item');
    boxNotes.innerHTML = `
        <div class="item-title">Poznámky:</div>
        <div class="item-note">${box.box_notes || 'Žádné poznámky'}</div>
    `;
    boxElement.appendChild(boxNotes);

    // Display box ID for reference
    const boxId = document.createElement('div');
    boxId.classList.add('box-id');
    boxId.textContent = `ID boxu: ${box.box_id}`;
    boxElement.appendChild(boxId);

    container.appendChild(boxElement);
}

// Function to fetch box data from the API
async function fetchBoxDetails(boxId) {
    try {
        const response = await fetch(`${apiUrl}/boxes/${boxId}`);
        if (!response.ok) {
            throw new Error(`Error fetching box details: ${response.statusText}`);
        }

        const boxData = await response.json();
        renderBox(boxData);
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById('boxContainer').innerText = 'Chyba při načítání dat.';
    }
}

// Function to get box_id from the URL
function getBoxIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('box_id');
}

// Get box_id from URL and fetch box details
const boxId = getBoxIdFromUrl(); // Get box_id from URL
if (boxId) {
    fetchBoxDetails(boxId);
} else {
    document.getElementById('boxContainer').innerText = 'Box ID nebylo nalezeno v URL.';
}