import { apiUrl } from './config.js';

// Funkce pro kontrolu, jestli je uživatel přihlášen
function checkAuthStatus() {
    fetch(`${apiUrl}/isLoggedIn`, {
        method: 'GET',
        credentials: 'include' // Pro odesílání cookies (session)
    })
        .then(response => response.json())
        .then(data => {
            const authLink = document.getElementById('authLink');

            if (data.success) {
                // Uživatel je přihlášený, změň odkaz na Logout
                authLink.textContent = 'Logout';
                authLink.href = '#';
                authLink.addEventListener('click', function (event) {
                    event.preventDefault();
                    logoutUser();
                });
            } else {
                // Uživatel není přihlášený, změň odkaz na Login
                authLink.textContent = 'Login';
                authLink.href = 'login.html'; // Změň na svou přihlašovací stránku
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });
}

// Funkce pro odhlášení
function logoutUser() {
    fetch(`${apiUrl}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = 'login.html'; // Změň na svou přihlašovací stránku
            } else {
                alert('Failed to log out: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
}

// Zkontroluj stav přihlášení při načtení stránky
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Funkce pro skrytí všech kontextových nabídek
function hideAllContextMenus() {
    const locationContextMenu = document.getElementById("locationContextMenu");
    const hiveContextMenu = document.getElementById("hiveContextMenu");
    const boxContextMenu = document.getElementById("boxContextMenu");
    const motherContextMenu = document.getElementById("motherContextMenu");

    locationContextMenu.style.display = 'none';
    hiveContextMenu.style.display = 'none';
    boxContextMenu.style.display = 'none';
    motherContextMenu.style.display = 'none';
}

function locationsWithHives() {
    fetch(`${apiUrl}/locations`, { credentials: 'include' })
        .then(response => response.json())
        .then(locations => {
            const locationContainer = document.getElementById("locationContainer");
            locationContainer.innerHTML = '';  // Vymaže stávající obsah

            // Zkontrolujeme, zda jsou nějaké lokace
            if (locations.length === 0) {
                const noLocationsMessage = document.createElement('p');
                noLocationsMessage.textContent = "User doesn't have any locations or hives";
                locationContainer.appendChild(noLocationsMessage);
                return;  // Pokud nejsou lokace, ukončíme funkci
            }

            // Pro každou lokaci vytvoříme nový kontejner
            locations.forEach(location => {
                // Vytvoříme nový div pro lokaci
                const locationDiv = document.createElement('div');
                locationDiv.className = 'location';  // Třída pro stylování
                locationDiv.dataset.locationId = location.location_id;  // Uložení ID lokace do data atributu

                locationDiv.addEventListener('dragover', (e) => {
                    e.preventDefault(); // Necessary to allow dropping
                });

                locationDiv.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const locationId = locationDiv.dataset.locationId;
                });

                // Přidáme název lokace
                const locationTitle = document.createElement('h3');
                locationTitle.textContent = `Location: ${location.location_name}`;
                locationDiv.appendChild(locationTitle);

                // Přidáme kontejner pro úly, který bude mít stejné ID jako lokace
                const hiveContainer = document.createElement('div');
                hiveContainer.className = 'hive-container';
                hiveContainer.id = `hiveContainer-${location.location_id}`;  // Unikátní ID pro úly v této lokaci
                locationDiv.appendChild(hiveContainer);

                // Přidáme celou lokaci do hlavního kontejneru
                locationContainer.appendChild(locationDiv);

                // Přidáme event listener pro kliknutí pravým tlačítkem
                locationDiv.addEventListener('contextmenu', function (event) {
                    event.preventDefault();  // Zabráníme výchozí kontextové nabídce
                    // Zastavení šíření události, aby neproběhlo kliknutí jinde
                    event.stopPropagation();

                    // Skryj všechny ostatní kontextové nabídky
                    hideAllContextMenus();


                    const contextMenu = document.getElementById('locationContextMenu');  // Tvůj kontextový element
                    contextMenu.style.top = `${event.pageY}px`;
                    contextMenu.style.left = `${event.pageX}px`;
                    contextMenu.style.display = 'block';

                    // Aktualizace odkazu v kontextové nabídce
                    const addHiveLink = document.getElementById('addHive');
                    // const upgradeLocationLink = document.getElementById('upgradeLocation');
                    // const detailLocationLink = document.getElementById('detailLocation');
                    // const deleteLocationLink = document.getElementById('deleteLocation');

                    if (addHiveLink) addHiveLink.href = `hives.html?location_id=${location.location_id}`;  
                    // if (upgradeLocationLink) upgradeLocationLink.href = ``;  
                    // if (detailLocationLink) detailLocationLink.href = ``;  
                    // if (deleteLocationLink) deleteLocationLink.href = ``;  



                });

                // Zavoláme funkci pro zobrazení úlů v konkrétní lokaci
                loadHivesWithBoxes(location.location_id);
            });
        })
        .catch(error => console.error('Error fetching locations:', error));
}

// Function to update the hive's location in the database
function updateHiveLocationInDatabase(hiveId, locationId) {
    console.log(`Updating hive ${hiveId} to new location ${locationId}`);

    // AJAX/Fetch request to update the hive's location in the database
    fetch(`${apiUrl}/updateHiveLocation`, {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hiveId, locationId }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);

            // Najdi element úlu na stránce
            const hiveDiv = document.querySelector(`[data-hive-id="${hiveId}"]`);

            // Pokud byl úl úspěšně přesunut, přesuň ho do nové lokace (v HTML)
            const newLocationDiv = document.querySelector(`[data-location-id="${locationId}"]`);

            if (hiveDiv && newLocationDiv) {
                newLocationDiv.appendChild(hiveDiv);  // Přesunutí úlu do nové lokace
                console.log(`Hive ${hiveId} successfully moved to location ${locationId}`);
            } else {
                console.error('Could not find hive or location element in the DOM');
            }

            // Optional: Aktualizace UI bez reloadu celé stránky
        })
        .catch((error) => {
            console.error('Error updating hive location:', error);
        });
}

// Function to update the mothers's hive in the database (simulated)
function updateMotherHiveInDatabase(hiveId, motherId) {
    console.log(`Updating mother ${motherId} to new hive ${hiveId}`);
    // Here you would make an AJAX/Fetch request to your backend to update the database
    fetch(`${apiUrl}/updateMotherHive`, {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hiveId, motherId }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            const motherContainer = document.querySelector(`[data-hive-id="${hiveId}"] .mother`);
            if (motherContainer) {
                motherContainer.textContent = `Mother ID: ${motherId}`;
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


function loadHivesWithBoxes(locationId) {
    fetch(`${apiUrl}/hivesWithBoxes/${locationId}`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const hiveContainer = document.getElementById(`hiveContainer-${locationId}`);
            hiveContainer.innerHTML = '';  // Vymaže předchozí obsah kontejneru pro úly

            data.forEach(hive => {
                const hiveDiv = document.createElement('div');
                hiveDiv.className = 'hive';
                hiveDiv.innerHTML = `<strong>Hive ID: ${hive.hive_id}</strong>`;

                // Povolit přetahování
                hiveDiv.setAttribute('draggable', true);
                hiveDiv.dataset.hiveId = hive.hive_id;  // Uložení ID úlu

                // Události pro prvek, který se přetahuje
                hiveDiv.addEventListener('dragstart', dragStart);
                hiveDiv.addEventListener('dragend', dragEnd);

                // Události pro cílový prvek
                hiveDiv.addEventListener('dragover', dragOver);
                hiveDiv.addEventListener('drop', drop);

                document.body.appendChild(hiveDiv);  // Přidá úl na stránku

                // Vytvoření boxů
                if (hive.boxes.length > 0) {
                    hive.boxes.forEach(box => {
                        if (box.box_id !== null && box.box_id !== undefined) {
                            const boxDiv = document.createElement('div');
                            boxDiv.className = 'box';
                            boxDiv.textContent = `${box.box_type}`;

                            // Povolit přetahování
                            boxDiv.setAttribute('draggable', true);
                            boxDiv.dataset.boxId = box.box_id;  // Uložení ID boxu

                            // Události pro prvek, který se přetahuje
                            boxDiv.addEventListener('dragstart', dragStart);
                            boxDiv.addEventListener('dragend', dragEnd);

                            // Kontextová nabídka po kliknutí pravým tlačítkem na box
                            boxDiv.addEventListener('contextmenu', function (event) {
                                event.preventDefault();  // Zabraň výchozí kontextové nabídce
                                event.stopPropagation();

                                // Skryj všechny ostatní kontextové nabídky
                                hideAllContextMenus();

                                const boxContextMenu = document.getElementById("boxContextMenu");
                                const boxDetailsLink = document.getElementById("boxDetailsLink");
                                const moveBoxLink = document.getElementById("moveBoxLink");
                                const deleteBoxLink = document.getElementById("deleteBoxLink");
                                const addProduction = document.getElementById("productionRecord");
                                const updateBox = document.getElementById("boxUpdate");
                                const qrBox = document.getElementById("qrbox");

                                // Nastavení odkazů pro box s ID boxu
                                boxDetailsLink.href = `boxDetail.html?box_id=${box.box_id}`;
                                moveBoxLink.href = `moveBox.html?box_id=${box.box_id}`;
                                deleteBoxLink.href = `deleteBox.html?box_id=${box.box_id}`;
                                addProduction.href = `productionRecord.html?box_id=${box.box_id}`;
                                updateBox.href = `boxUpdate.html?hive_id=${hive.hive_id}&box_id=${box.box_id}`;
                                qrBox.href = `qrbox.html?box_id=${box.box_id}`;

                                // Zobrazení kontextové nabídky na pozici myši
                                boxContextMenu.style.display = 'block';
                                boxContextMenu.style.top = `${event.pageY}px`;
                                boxContextMenu.style.left = `${event.pageX}px`;
                            });

                            hiveDiv.appendChild(boxDiv)
                        }
                    });
                }

                const motherDiv = document.createElement('div');
                motherDiv.className = 'mother';

                if (hive.mother_id !== null && hive.mother_id !== undefined) {
                    // Pokud matka existuje
                    motherDiv.textContent = `Mother ID: ${hive.mother_id}`;

                    // Povolit přetahování
                    motherDiv.setAttribute('draggable', true);
                    motherDiv.dataset.motherId = hive.mother_id; // Uložení ID matky

                    // Události pro přetahování
                    motherDiv.addEventListener('dragstart', dragStart);
                    motherDiv.addEventListener('dragend', dragEnd);

                    // Kontextová nabídka
                    motherDiv.addEventListener('contextmenu', function (event) {
                        event.preventDefault(); // Zabraň výchozí kontextové nabídce
                        event.stopPropagation();

                        // Skryj všechny ostatní kontextové nabídky
                        hideAllContextMenus();

                        // Inicializace kontextového menu
                        const motherContextMenu = document.getElementById("motherContextMenu");
                        if (!motherContextMenu) return; // Zajistí, že menu existuje

                        const motherDetails = document.getElementById("motherDetails");
                        const updateMother = document.getElementById("updateMother");
                        const deleteMother = document.getElementById("deleteMother");

                        // Nastavení odkazů pro matku s ID mother
                        if (motherDetails) motherDetails.href = `motherDetail.html?mother_id=${hive.mother_id}`;
                        if (updateMother) updateMother.href = `mothers.html?mother_id=${hive.mother_id}`;
                        if (deleteMother) deleteMother.href = `deleteMother.html?mother_id=${hive.mother_id}`; // Přidání odkazu

                        // Zobrazení kontextové nabídky na pozici myši
                        motherContextMenu.style.display = 'block';
                        motherContextMenu.style.top = `${event.pageY}px`;
                        motherContextMenu.style.left = `${event.pageX}px`;
                    });
                } else {
                    // Pokud matka neexistuje
                    motherDiv.textContent = `EMPTY`;
                }

                // Přidání matky na konec úlu
                hiveDiv.appendChild(motherDiv);

                // Kontextová nabídka po kliknutí pravým tlačítkem na úl
                hiveDiv.addEventListener('contextmenu', async function (event) {
                    event.preventDefault();  // Zabraň výchozí kontextové nabídce
                    event.stopPropagation();
                    // Skryj všechny ostatní kontextové nabídky
                    hideAllContextMenus();

                    const hiveContextMenu = document.getElementById("hiveContextMenu");
                    const addCheckupLink = document.getElementById("addCheckupLink");
                    const addMotherLink = document.getElementById("addMotherLink");
                    const addBoxLink = document.getElementById("addBoxLink");
                    const hiveDetails = document.getElementById("hiveDetails");
                    const hiveUpdate = document.getElementById("hiveUpdate");
                    const hiveDelete = document.getElementById("hiveDelete");
                    const hiveCheckups = document.getElementById("hiveCheckups");
                    const hiveqr = document.getElementById("hiveqr");



                    // Nastavení odkazů pro přidání checkupu, mother a boxu s ID úlu
                    addCheckupLink.href = `checkups.html?hive_id=${hive.hive_id}`;
                    addMotherLink.href = `mothers.html?hive_id=${hive.hive_id}`;
                    addBoxLink.href = `boxUpdate.html?hive_id=${hive.hive_id}`;
                    hiveDetails.href = `hiveDetail.html?hive_id=${hive.hive_id}`;
                    hiveUpdate.href = `hiveUpdate.html?hive_id=${hive.hive_id}`;
                    hiveCheckups.href = `/api/hives/${hive.hive_id}/checkups`;
                    hiveqr.href = `qrhive.html?hive_id=${hive.hive_id}`;

                    try {
                        // Načtení počtu boxů z backendu
                        const response = await fetch(`${apiUrl}/hiveBoxCount/${hive.hive_id}`, {
                            credentials: 'include',
                        });
                        if (!response.ok) throw new Error("Failed to fetch box count");
                        const data = await response.json();

                        const maxBoxes = 5; // Maximální počet boxů v úlu
                        const currentBoxCount = parseInt(data.box_count, 10);

                        // Zakázání nebo povolení možnosti "Přidat box"
                        if (currentBoxCount >= maxBoxes) {
                            addBoxLink.style.color = "gray"; // Vizuální indikace zakázání
                            addBoxLink.style.pointerEvents = 'none';
                            addBoxLink.textContent = `Max ${maxBoxes} boxů`;
                        } else {
                            addBoxLink.style.color = "black"; // Aktivní vzhled
                            addBoxLink.style.pointerEvents = "auto"; // Povolení kliknutí
                            addBoxLink.title = ""; // Odstranění tooltipu
                            addBoxLink.textContent = `Přidat box`;
                        }
                    } catch (error) {
                        console.error("Error fetching box count:", error);
                    }

                    // Funkce pro zobrazení potvrzovacího dialogu při mazání úlu
                    hiveDelete.addEventListener('click', function () {
                        const userConfirmed = confirm(`Opravdu chcete smazat úl s ID ${hive.hive_id}?`);

                        if (userConfirmed) {
                            deleteRecord(hive.hive_id);

                            // Po úspěšném smazání obnovíme stránku
                            alert('Úl byl úspěšně smazán.');
                            location.reload();  // Obnoví stránku

                        } else {
                            alert('Mazání úlu bylo zrušeno.');
                        }
                    });


                    // Zobrazení kontextové nabídky na pozici myši
                    hiveContextMenu.style.display = 'block';
                    hiveContextMenu.style.top = `${event.pageY}px`;
                    hiveContextMenu.style.left = `${event.pageX}px`;
                });

                // Přidání úlu do kontejneru
                hiveContainer.appendChild(hiveDiv);
            });
        })
        .catch(error => console.error('Error fetching hives:', error));
}

// Skrytí kontextové nabídky při kliknutí mimo ni
document.addEventListener('click', function () {
    document.getElementById("hiveContextMenu").style.display = 'none';
    document.getElementById("boxContextMenu").style.display = 'none';
    document.getElementById("motherContextMenu").style.display = 'none';
});

// Načti data při načtení stránky
window.onload = function () {
    locationsWithHives();
};

document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
        // Stránka je opět viditelná
        window.location.reload(); // Automaticky refreshni stránku
    }
});


function deleteRecord(hive_id) {
    // Call the API to delete the record
    fetch(`${apiUrl}/hives/${hive_id}`, {
        method: 'DELETE',
        credentials: "include"
    })
        .then(response => {
            if (response.ok) {
                alert(`Záznam s ID ${hive_id} byl úspěšně smazán.`);
                loadRecords(); // Reload records after deletion
            } else {
                alert('Došlo k chybě při mazání záznamu.');
            }
        })
        .catch(error => {
            console.error('Error deleting record:', error);
        });
}

document.addEventListener('click', function (e) {
    hideAllContextMenus();
});


 // DRAG AND DROP 

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.hiveId); // Uloží ID úlu
    e.target.classList.add('dragging'); // Přidá třídu pro vizuální indikaci
}

function dragEnd(e) {
    e.target.classList.remove('dragging'); // Odstraní vizuální indikaci
}

function dragOver(e) {
    e.preventDefault(); // Nutné, aby bylo možné provést "drop"
    e.dataTransfer.dropEffect = 'move'; // Vizualizace efektu přetažení
}
function drop(e) {
    e.preventDefault();

}
