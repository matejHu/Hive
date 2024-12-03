import { apiUrl } from './config.js';

// Function to render a single hive
function renderHive(hive) {
    const container = document.getElementById('hiveContainer');

    // Create hive element
    const hiveElement = document.createElement('div');
    hiveElement.classList.add('hive');

    // Create hive header
    const hiveHeader = document.createElement('div');
    hiveHeader.classList.add('hive-header');
    hiveHeader.textContent = `Úl: ${hive.hive_name}`;
    hiveElement.appendChild(hiveHeader);

    // Create hive year
    const hiveYear = document.createElement('div');
    hiveYear.classList.add('hive-year');
    hiveYear.textContent = `Rok vytvoření: ${hive.hive_year}`;
    hiveElement.appendChild(hiveYear);

    // Render boxes section
    if (hive.boxes.length > 0) {
        const boxesSection = document.createElement('div');
        boxesSection.classList.add('section');
        const boxesTitle = document.createElement('div');
        boxesTitle.classList.add('section-title');
        boxesTitle.textContent = 'Boxy:';
        boxesSection.appendChild(boxesTitle);

        hive.boxes.forEach(box => {
            const boxElement = document.createElement('div');
            boxElement.classList.add('item');
            boxElement.innerHTML = `
                <div class="item-title">${box.box_type} (Rok: ${box.box_year})</div>
                <div class="item-note">Poznámky: ${box.box_notes}</div>
            `;
            boxesSection.appendChild(boxElement);
        });

        hiveElement.appendChild(boxesSection);
    }

    // Render mothers section
    if (hive.mothers.length > 0) {
        const mothersSection = document.createElement('div');
        mothersSection.classList.add('section');
        const mothersTitle = document.createElement('div');
        mothersTitle.classList.add('section-title');
        mothersTitle.textContent = 'Matky:';
        mothersSection.appendChild(mothersTitle);

        hive.mothers.forEach(mother => {
            const motherElement = document.createElement('div');
            motherElement.classList.add('item');
            motherElement.innerHTML = `
                <div class="item-title">Původ: ${mother.mother_origin} (Rok: ${mother.mother_year})</div>
                <div class="item-note">Poznámky: ${mother.mother_notes}</div>
            `;
            mothersSection.appendChild(motherElement);
        });

        hiveElement.appendChild(mothersSection);
    }

    // Render checkups section
    if (hive.checkups.length > 0) {
        const checkupsSection = document.createElement('div');
        checkupsSection.classList.add('section');
        const checkupsTitle = document.createElement('div');
        checkupsTitle.classList.add('section-title');
        checkupsTitle.textContent = 'Kontroly:';
        checkupsSection.appendChild(checkupsTitle);

        hive.checkups.forEach(checkup => {
            const checkupElement = document.createElement('div');
            checkupElement.classList.add('item');
            checkupElement.innerHTML = `
                <div class="item-title">Typ kontroly: ${checkup.checkup_type}</div>
                <div>Datum: ${new Date(checkup.checkup_date).toLocaleDateString()}</div>
                <div>Letová aktivita: ${checkup.checkup_flyby}</div>
                <div class="item-note">Poznámky: ${checkup.checkup_note}</div>
            `;
            checkupsSection.appendChild(checkupElement);
        });

        hiveElement.appendChild(checkupsSection);
    }

    // Separator for next hive
    const separator = document.createElement('div');
    separator.classList.add('separator');
    hiveElement.appendChild(separator);

    container.appendChild(hiveElement);
}

// Function to fetch data from the API
async function fetchHiveDetails(hiveId) {
    try {
        const response = await fetch(`${apiUrl}/hivesWithDetails/${hiveId}`);
        if (!response.ok) {
            throw new Error(`Error fetching hive details: ${response.statusText}`);
        }

        const hiveData = await response.json();
        renderHive(hiveData);
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById('hiveContainer').innerText = 'Chyba při načítání dat.';
    }
}

// Function to get hive_id from the URL
function getHiveIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('hive_id');
}

// Get hive_id from URL and fetch hive details
const hiveId = getHiveIdFromUrl(); // Get hive_id from URL
if (hiveId) {
    fetchHiveDetails(hiveId);
} else {
    document.getElementById('hiveContainer').innerText = 'Hive ID nebylo nalezeno v URL.';
}