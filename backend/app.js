const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { Pool } = require("pg");
const bcrypt = require('bcrypt');
const path = require("path");
const cors = require("cors");
const port = 3000;


const app = express();
app.use(bodyParser.json());

// Servírování statických souborů z adresáře 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: 'http://159.69.127.228',  // Povolený origin (frontendová URL)
    credentials: true  // Povolení credentials (např. cookies)
}));

// Middleware pro správu session
app.use(session({
    secret: "mamaprdivevane123", // Tento klíč musí být silný a tajný
    resave: false,              // Session nebude znovu uložena, pokud se nezmění
    saveUninitialized: false,   // Session nebude vytvořena, dokud nebude upravena
    cookie: { secure: false }   // `secure: true` by mělo být použito pouze v HTTPS prostředí
}));

// Připojení k PostgreSQL
const pool = new Pool({
    connectionString: 'postgresql://postgres:pg1234gRes@db:5432/mydatabase',
});

// ENDPOINT NA SLEDOVÁNÍ POČTU PŘIHLÁŠENÝCH UŽIVATELŮ
const sessionStore = []; // Array nebo databáze pro ukládání aktivních session

// Middleware pro sledování přihlášených uživatelů
app.use((req, res, next) => {
    if (req.session && req.session.user_id) {
        const existingUser = sessionStore.find((s) => s.user_id === req.session.user_id);
        if (!existingUser) {
            sessionStore.push({
                user_id: req.session.user_id,
                username: req.session.username, // Přidej, pokud ukládáš uživatelské jméno
                login_time: new Date(),
            });
        }
    }
    next();
});

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.path}`);
    next();
});

// Endpoint GET pro seznam přihlášených uživatelů
app.get("/api/active-users", (req, res) => {
    if (!req.session || !req.session.user_id) {
        return res.status(401).send("Unauthorized");
    }

    res.json(sessionStore);
});

app.get('/test-db', async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW()'); // Získá aktuální čas z databáze
      res.json({ message: 'Database connection successful!', time: result.rows[0].now });
    } catch (err) {
      res.status(500).json({ message: 'Database connection failed', error: err.message });
    }
  });

// Zabezpečený registrační endpoint
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Ověř, zda uživatel již existuje
        const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.json({ success: false, message: 'Username already exists' });
        }

        // Hashuj heslo před uložením do databáze
        const hashedPassword = await bcrypt.hash(password, 10); // 10 je "salt rounds"

        // Ulož uživatele do databáze
        await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);

        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});


// Přihlašovací endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];

            // Ověření hesla
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                // Uložení `user_id` do session
                req.session.user_id = user.user_id;
                res.json({ success: true, message: 'Login successful' });
            } else {
                res.json({ success: false, message: 'Invalid password' });
            }
        } else {
            res.json({ success: false, message: 'Invalid username' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Endpoint pro odhlášení
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to log out' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Ověření, zda je uživatel přihlášený
app.get('/api/isLoggedIn', (req, res) => {
    console.log("Session data:", req.session);  // Zkontrolujte, zda session obsahuje user_id
    if (req.session.user_id) {
        res.json({ success: true, message: 'User is logged in', user_id: req.session.user_id });
    } else {
        res.json({ success: false, message: 'User is not logged in' });
    }
});

app.post("/api/boxes", (req, res) => {
    const { box_type, box_year, box_notes, box_hive_id } = req.body;
    const user_id = req.session.user_id; // Získání user_id ze session

    if (!user_id) {
        return res.status(401).send("Unauthorized");
    }

    pool.query(
        "INSERT INTO boxes (box_type, box_year, box_notes, box_hive_id, box_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [box_type, box_year, box_notes, box_hive_id || null, user_id], // Přidání user_id do dotazu
        (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).send("Error saving data");
            } else {
                res.status(200).json(result.rows[0]);
            }
        }
    );
});

// POST dat do mothers
app.post("/api/mothers", (req, res) => {
    const { mother_origin, mother_year, mother_notes, mother_hive_id } = req.body;
    const user_id = req.session.user_id; // Získání user_id ze session

    if (!user_id) {
        return res.status(401).send("Unauthorized");
    }

    pool.query(
        "INSERT INTO mothers (mother_origin, mother_year, mother_notes, mother_hive_id, mother_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [mother_origin, mother_year, mother_notes, mother_hive_id || null, user_id],
        (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).send("Error saving data");
            } else {
                res.status(200).json(result.rows[0]);
            }
        }
    );
});

// POST dat do checkups
app.post("/api/checkups", (req, res) => {
    const { checkup_type, checkup_flyby, checkup_date, checkup_note, checkup_hive_id } = req.body;

    pool.query(
        "INSERT INTO checkups (checkup_type, checkup_flyby, checkup_date, checkup_note, checkup_hive_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [checkup_type, checkup_flyby, checkup_date, checkup_note, checkup_hive_id || null],
        (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).send("Error saving data");
            } else {
                res.status(200).json(result.rows[0]);
            }
        }
    );
});

// POST dat do hives
app.post("/api/hives", (req, res) => {
    const { hive_year, hive_name, hive_location_id } = req.body;
    const user_id = req.session.user_id; // Získání user_id ze session

    if (!user_id) {
        return res.status(401).send("Unauthorized");
    }

    pool.query(
        "INSERT INTO hives (hive_year, hive_name, hive_user_id, hive_location_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [hive_year, hive_name, user_id, hive_location_id],
        (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).send("Error saving data");
            } else {
                res.status(200).json(result.rows[0]);
            }
        }
    );
});

// POST dat do locations
app.post("/api/locations", (req, res) => {
    const { location_name } = req.body;
    const user_id = req.session.user_id; // Získání user_id ze session

    if (!user_id) {
        return res.status(401).send("Unauthorized");
    }

    pool.query(
        "INSERT INTO locations (location_name, location_user_id) VALUES ($1, $2) RETURNING *",
        [location_name, user_id],
        (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).send("Error saving data");
            } else {
                res.status(200).json(result.rows[0]);
            }
        }
    );
});

app.post("/api/assignBoxesToHive", (req, res) => {
    const { boxes, hive_id } = req.body;

    // Aktualizace všech vybraných boxů na zadané hive_id
    pool.query(
        "UPDATE boxes SET box_hive_id = $1 WHERE box_id = ANY($2::int[])",
        [hive_id, boxes],
        (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Error assigning boxes to hive.");
            }
            res.status(200).send("Boxes successfully assigned.");
        }
    );
});

// POST: Vytvoření nového záznamu produkce
app.post('/api/productions', async (req, res) => {
    const { production_hive_id, production_volume, production_date, production_type, production_note } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO production (production_hive_id, production_volume, production_date, production_type, production_note) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [production_hive_id, production_volume, production_date, production_type, production_note]
        );
        res.status(201).json(result.rows[0]); // Vrátí nově vytvořený záznam
    } catch (error) {
        console.error('Error creating production:', error);
        res.status(500).send('Server error');
    }
});

//GET všechny záznamy z boxes
app.get("/api/boxes", (req, res) => {
    pool.query("SELECT * FROM boxes", (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error fetching records");
        } else {
            res.status(200).json(result.rows);
        }
    });
});

// GET konkrétní záznam z boxes podle box_id a user_id
app.get("/api/boxes/:id", (req, res) => {
    const boxId = req.params.id;
    const userId = req.session.user_id; // Aktuální uživatel ze session

    pool.query(
        "SELECT * FROM boxes WHERE box_id = $1 AND box_user_id = $2",
        [boxId, userId],
        (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: "Database error" });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Box not found or access denied" });
            }

            res.json(result.rows[0]);
        }
    );
});

//GET všechny záznamy z mothers
app.get("/api/mothers", (req, res) => {
    pool.query("SELECT * FROM mothers", (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error fetching records");
        } else {
            res.status(200).json(result.rows);
        }
    });
});

// GET konkrétní záznam z mothers podle mother_id
app.get("/api/mothers/:id", (req, res) => {
    const motherId = req.params.id; // Získání box_id z URL parametru

    pool.query("SELECT * FROM mothers WHERE mother_id = $1", [motherId], (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error fetching the record");
        } else if (result.rows.length === 0) {
            res.status(404).send("Record not found");
        } else {
            res.status(200).json(result.rows[0]); // Vracíme konkrétní záznam
        }
    });
});

//GET všechny záznamy z checkups
app.get("/api/checkups", (req, res) => {
    pool.query("SELECT * FROM checkups", (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error fetching records");
        } else {
            res.status(200).json(result.rows);
        }
    });
});

// Endpoint pro získání všech záznamů kontrol (checkups) pro daný úl
app.get("/api/hives/:hiveId/checkups", (req, res) => {
    const hiveId = req.params.hiveId;

    pool.query(
        `SELECT * FROM checkups WHERE checkup_hive_id = $1`,
        [hiveId],
        (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).send("Error fetching checkups for the hive");
            } else if (result.rows.length === 0) {
                res.status(404).send(`No checkups found for hive with ID ${hiveId}`);
            } else {
                res.status(200).json(result.rows);
            }
        }
    );
});

//GET všechny záznamy z hives
app.get("/api/hives", (req, res) => {
    pool.query("SELECT * FROM hives", (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error fetching records");
        } else {
            res.status(200).json(result.rows);
        }
    });
});

//GET záznam hive podle id
app.get("/api/hives/:id", (req, res) => {
    const hiveId = req.params.id; // Získání hive_id z URL parametru

    pool.query("SELECT * FROM hives WHERE hive_id = $1", [hiveId], (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error fetching the record");
        } else if (result.rows.length === 0) {
            res.status(404).send("Record not found");
        } else {
            res.status(200).json(result.rows[0]); // Vracíme konkrétní záznam
        }
    });
});

//GET záznamy z hives pro formulář boxes
app.get("/api/hives", (req, res) => {
    pool.query("SELECT hive_id, hive_name FROM hives", (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error retrieving hives");
        } else {
            res.status(200).json(results.rows);
        }
    });
});


//GET záznamy z locations
app.get("/api/locations", (req, res) => {
    const userId = req.session.user_id;  // Získání user_id ze session
    
    pool.query(
        "SELECT location_id, location_name FROM locations WHERE location_user_id = $1", 
        [userId],  // Použití userId jako parametru v dotazu
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Error retrieving locations");
            } else {
                res.status(200).json(results.rows);  // Vrátí pouze lokace pro daného uživatele
            }
        }
    );
});


// GET všechny úly s výpisem přiřazených boxů a mother_id
app.get("/api/hivesWithBoxes/:locationId", (req, res) => {
    const locationId = req.params.locationId;  // Získání ID lokace z parametru URL
    const userId = req.session.user_id;  // Získání user_id ze session

    pool.query(`
        SELECT h.hive_id, h.hive_name, h.hive_year, 
               json_agg(json_build_object('box_id', b.box_id, 'box_type', b.box_type, 'box_year', b.box_year)) as boxes,
               m.mother_id  -- Přidání mother_id
        FROM hives h
        LEFT JOIN boxes b ON h.hive_id = b.box_hive_id
        LEFT JOIN mothers m ON h.hive_id = m.mother_hive_id  -- Přidání joinu pro mothers
        WHERE h.hive_user_id = $1  -- Filtrování podle user_id
          AND h.hive_location_id = $2  -- Filtrování podle location_id
        GROUP BY h.hive_id, m.mother_id;
    `, [userId, locationId], (error, result) => {  // Použití user_id a location_id
        if (error) {
            console.error(error);
            res.status(500).send("Error fetching hives with boxes and mothers");
        } else {
            res.status(200).json(result.rows);
        }
    });
});

// načítání lokací a hives
app.get('/api/locationsWithHives', (req, res) => {
    const user_id = req.session.user_id;  // Získání user_id ze session

    const query = `
        SELECT locations.location_id, locations.location_name, locations.location_user_id, hives.hive_id, hives.hive_name, hives.hive_year
        FROM locations
        LEFT JOIN hives 
        ON locations.location_id = hives.hive_location_id
        WHERE locations.location_user_id = $1;
    `;

    pool.query(query, [user_id], (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Error fetching locations and hives', error });
        }

        // Přímo vracíme výsledky jako JSON
        res.status(200).json(results.rows);
    });
});

// GET všechny boxy přiřazené podle id úlu
app.get("/api/hiveBoxCount/:hive_id", (req, res) => {
    const hive_id = req.params.hive_id;
    pool.query(
        "SELECT COUNT(*) AS box_count FROM boxes WHERE box_hive_id = $1",
        [hive_id],
        (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).send("Error fetching box count");
            } else {
                res.status(200).json(result.rows[0]);
            }
        }
    );
});

// GET všechny mothers přiřazené podle id úlu
app.get("/api/hiveMothersCount/:hive_id", (req, res) => {
    const hive_id = req.params.hive_id;
    pool.query(
        "SELECT COUNT(*) AS mothers_count FROM mothers WHERE mother_hive_id = $1",
        [hive_id],
        (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).send("Error fetching box count");
            } else {
                res.status(200).json(result.rows[0]);
            }
        }
    );
});

// GET počet boxů přiřazených k úlu
app.get("/api/hivesWithBoxCount", (req, res) => {
    pool.query(`
        SELECT h.hive_id, h.hive_name, h.hive_year, COUNT(b.box_id) AS box_count
        FROM hives h
        LEFT JOIN boxes b ON h.hive_id = b.box_hive_id
        GROUP BY h.hive_id;
    `, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error fetching hives and box counts");
        } else {
            res.status(200).json(result.rows);
        }
    });
});

// GET všechny záznamy připojené k hives
app.get("/api/hivesWithDetails", (req, res) => {
    // Dotaz pro úly
    pool.query(`SELECT * FROM hives`, (error, hivesResult) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Error fetching hives");
        }

        // Dotaz pro boxy
        pool.query(`SELECT * FROM boxes`, (error, boxesResult) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Error fetching boxes");
            }

            // Dotaz pro matky
            pool.query(`SELECT * FROM mothers`, (error, mothersResult) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send("Error fetching mothers");
                }

                // Dotaz pro kontroly
                pool.query(`SELECT * FROM checkups`, (error, checkupsResult) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).send("Error fetching checkups");
                    }

                    // Vytvoření kompletního datového objektu
                    const data = hivesResult.rows.map(hive => ({
                        ...hive,
                        boxes: boxesResult.rows.filter(box => box.box_hive_id === hive.hive_id),
                        mothers: mothersResult.rows.filter(mother => mother.mother_hive_id === hive.hive_id),
                        checkups: checkupsResult.rows.filter(checkup => checkup.checkup_hive_id === hive.hive_id)
                    }));

                    res.status(200).json(data);
                });
            });
        });
    });
});

// GET všechny záznamy o hive podle id
app.get("/api/hivesWithDetails/:hive_id", (req, res) => {
    const hiveId = req.params.hive_id;

    // Dotaz pro úl na základě hive_id
    pool.query(`SELECT * FROM hives WHERE hive_id = $1`, [hiveId], (error, hivesResult) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Error fetching hive");
        }

        if (hivesResult.rows.length === 0) {
            return res.status(404).send("Hive not found");
        }

        const hive = hivesResult.rows[0];

        // Dotaz pro boxy na základě hive_id
        pool.query(`SELECT * FROM boxes WHERE box_hive_id = $1`, [hiveId], (error, boxesResult) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Error fetching boxes");
            }

            // Dotaz pro matky na základě hive_id
            pool.query(`SELECT * FROM mothers WHERE mother_hive_id = $1`, [hiveId], (error, mothersResult) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send("Error fetching mothers");
                }

                // Dotaz pro kontroly na základě hive_id
                pool.query(`SELECT * FROM checkups WHERE checkup_hive_id = $1`, [hiveId], (error, checkupsResult) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).send("Error fetching checkups");
                    }

                    // Vytvoření kompletního datového objektu
                    const data = {
                        ...hive,
                        boxes: boxesResult.rows,
                        mothers: mothersResult.rows,
                        checkups: checkupsResult.rows
                    };

                    res.status(200).json(data);
                });
            });
        });
    });
});

// GET: Načtení všech záznamů produkce
app.get('/api/productions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM production');
        res.status(200).json(result.rows); // Vrátí všechny záznamy
    } catch (error) {
        console.error('Error fetching productions:', error);
        res.status(500).send('Server error');
    }
});

//DELETE boxes podle id
app.delete("/api/boxes/:id", (req, res) => {
    const id = req.params.id;

    pool.query("DELETE FROM boxes WHERE box_id = $1 RETURNING *", [id], (error, result) => {
        if (error) {
            console.error("Database error:", error); // Vypiš chybu do konzole
            res.status(500).send("Error deleting record");
        } else if (result.rows.length === 0) {
            res.status(404).send("Record not found");
        } else {
            res.status(200).json({ message: `Record with ID ${id} deleted successfully` });
        }
    });
});

//DELETE mothers podle id
app.delete("/api/mothers/:id", (req, res) => {
    const id = req.params.id;

    pool.query("DELETE FROM mothers WHERE mother_id = $1 RETURNING *", [id], (error, result) => {
        if (error) {
            console.error("Database error:", error); // Vypiš chybu do konzole
            res.status(500).send("Error deleting record");
        } else if (result.rows.length === 0) {
            res.status(404).send("Record not found");
        } else {
            res.status(200).json({ message: `Record with ID ${id} deleted successfully` });
        }
    });
});

//DELETE checkups podle id
app.delete("/api/checkups/:id", (req, res) => {
    const id = req.params.id;

    pool.query("DELETE FROM checkups WHERE checkup_id = $1 RETURNING *", [id], (error, result) => {
        if (error) {
            console.error("Database error:", error); // Vypiš chybu do konzole
            res.status(500).send("Error deleting record");
        } else if (result.rows.length === 0) {
            res.status(404).send("Record not found");
        } else {
            res.status(200).json({ message: `Record with ID ${id} deleted successfully` });
        }
    });
});

//DELETE hive podle id
app.delete("/api/hives/:id", (req, res) => {
    const id = req.params.id;

    // Nejprve nastavíme box_hive_id na NULL pro všechny boxy propojené s úlem
    pool.query("UPDATE boxes SET box_hive_id = NULL WHERE box_hive_id = $1", [id], (error, result) => {
        if (error) {
            console.error("Error updating boxes:", error);
            res.status(500).send("Error updating boxes");
        } else {
            // Poté smažeme samotný úl
            pool.query("DELETE FROM hives WHERE hive_id = $1 RETURNING *", [id], (error, result) => {
                if (error) {
                    console.error("Database error:", error);
                    res.status(500).send("Error deleting record");
                } else if (result.rows.length === 0) {
                    res.status(404).send("Record not found");
                } else {
                    res.status(200).json({ message: `Record with ID ${id} deleted successfully` });
                }
            });
        }
    });
});

//DELETE locations podle id
app.delete("/api/locations/:id", (req, res) => {
    const id = req.params.id;

    // Nejprve nastavíme hive_location_id na NULL pro všechny úly propojené s lokací
    pool.query("UPDATE hives SET hive_location_id = NULL WHERE hive_location_id = $1", [id], (error, result) => {
        if (error) {
            console.error("Error updating hives:", error);
            res.status(500).send("Error updating hives");
        } else {
            // Poté smažeme samotnou lokaci
            pool.query("DELETE FROM locations WHERE location_id = $1 RETURNING *", [id], (error, result) => {
                if (error) {
                    console.error("Database error:", error);
                    res.status(500).send("Error deleting record");
                } else if (result.rows.length === 0) {
                    res.status(404).send("Record not found");
                } else {
                    res.status(200).json({ message: `Record with ID ${id} deleted successfully` });
                }
            });
        }
    });
});

// DELETE: Smazání záznamu produkce podle ID
app.delete('/api/productions/:id', async (req, res) => {
    const production_id = req.params.id;

    try {
        const result = await pool.query('DELETE FROM production WHERE production_id = $1', [production_id]);

        if (result.rowCount === 0) {
            return res.status(404).send('Production record not found');
        }

        res.status(200).send(`Záznam produkce s ID ${production_id} byl úspěšně smazán.`);
    } catch (error) {
        console.error('Error deleting production:', error);
        res.status(500).send('Server error');
    }
});

// UPDATE hive podle id
app.put('/api/hives/:id', (req, res) => {
    const { hive_year, hive_name } = req.body;
    const hiveId = req.params.id;
    const query = 'UPDATE hives SET hive_year = $1, hive_name = $2 WHERE hive_id = $3 RETURNING *';

    pool.query(query, [hive_year, hive_name, hiveId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result.rows[0]);
    });
});

// API pro aktualizaci záznamu o boxu
app.put('/api/boxes/:id', (req, res) => {
    const boxId = req.params.id; // ID boxu, který chceme aktualizovat
    const { box_type, box_year, box_notes, box_hive_id } = req.body; // Data z formuláře

    const query = `
        UPDATE boxes 
        SET box_type = $1, box_year = $2, box_notes = $3, box_hive_id = $4 
        WHERE box_id = $5
        RETURNING *`; // Vracejí se aktualizované řádky

    const values = [box_type, box_year, box_notes, box_hive_id, boxId];

    pool.query(query, values, (error, result) => {
        if (error) {
            return res.status(500).json({ error: 'Chyba při aktualizaci boxu.' });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Box s daným ID nebyl nalezen.' });
        }
        res.json(result.rows[0]); // Vracím aktualizovaný záznam
    });
});

// API pro aktualizaci záznamu o kontrole (checkup)
app.put('/api/checkups/:id', (req, res) => {
    const checkupId = req.params.id; // ID kontroly, kterou chceme aktualizovat
    const { checkup_type, checkup_flyby, checkup_date, checkup_note, checkup_hive_id } = req.body; // Data z formuláře

    const query = `
        UPDATE checkups 
        SET checkup_type = $1, checkup_flyby = $2, checkup_date = $3, checkup_note = $4, checkup_hive_id = $5 
        WHERE checkup_id = $6
        RETURNING *`; // Vracíme aktualizované řádky

    const values = [checkup_type, checkup_flyby, checkup_date, checkup_note, checkup_hive_id, checkupId];

    pool.query(query, values, (error, result) => {
        if (error) {
            return res.status(500).json({ error: 'Chyba při aktualizaci kontroly.' });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Kontrola s daným ID nebyla nalezena.' });
        }
        res.json(result.rows[0]); // Vrátíme aktualizovaný záznam
    });
});

// API pro aktualizaci záznamu matky (mother)
app.put('/api/mothers/:id', (req, res) => {
    const motherId = req.params.id; // ID matky, kterou chceme aktualizovat
    const { mother_origin, mother_year, mother_notes, mother_hive_id } = req.body; // Data z formuláře

    // SQL dotaz pro aktualizaci záznamu matky
    const query = `
        UPDATE mothers 
        SET mother_origin = $1, mother_year = $2, mother_notes = $3, mother_hive_id = $4 
        WHERE mother_id = $5
        RETURNING *`; // Vracíme aktualizovaný záznam

    // Hodnoty pro SQL dotaz
    const values = [mother_origin, mother_year, mother_notes, mother_hive_id, motherId];

    // Spuštění dotazu
    pool.query(query, values, (error, result) => {
        if (error) {
            return res.status(500).json({ error: 'Chyba při aktualizaci matky.' });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Matka s daným ID nebyla nalezena.' });
        }
        res.json(result.rows[0]); // Vrátíme aktualizovaný záznam
    });
});

// UPDATE záznam o produkci podle id
app.put('/api/production/:id', async (req, res) => {
    const productionId = req.params.id;
    const { production_hive_id, production_volume, production_date, production_type, production_note } = req.body;

    if (!production_hive_id || !production_volume || !production_date || !production_type) {
        return res.status(400).json({ error: 'Všechna povinná pole musí být vyplněna' });
    }

    try {
        // SQL dotaz pro aktualizaci produkce podle ID
        const query = `
            UPDATE production
            SET production_hive_id = $1, production_volume = $2, production_date = $3, production_type = $4, production_note = $5
            WHERE production_id = $6
            RETURNING *;
        `;

        // Vykonání dotazu s poskytnutými hodnotami
        const result = await pool.query(query, [
            production_hive_id,
            production_volume,
            production_date,
            production_type,
            production_note,
            productionId
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Produktion nebyla nalezena' });
        }

        res.status(200).json({
            message: 'Produktion byla úspěšně aktualizována',
            production: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Došlo k chybě při aktualizaci produkce' });
    }
});

// Endpoint pro aktualizaci lokace úlu
app.post('/api/updateHiveLocation', (req, res) => {
    const { hiveId, locationId } = req.body;

    // SQL dotaz pro aktualizaci lokace úlu
    const query = `
        UPDATE hives 
        SET hive_location_id = $1 
        WHERE hive_id = $2
    `;

    // Spuštění dotazu s poskytnutými hodnotami
    pool.query(query, [locationId, hiveId], (error, results) => {
        if (error) {
            console.error('Error updating hive location:', error);
            res.status(500).json({ error: 'Error updating hive location' });
        } else {
            res.status(200).json({ message: 'Hive location updated successfully' });
        }
    });
});

// Endpoint pro aktualizaci matky do jiného úlu
app.post('/api/updateMotherHive', (req, res) => {
    const { hiveId, motherId } = req.body;

    // Zkontroluj, jestli už úl má matku
    const checkQuery = `
        SELECT * FROM mothers WHERE mother_hive_id = $1
    `;
    
    pool.query(checkQuery, [hiveId], (error, results) => {
        if (error) {
            console.error('Error checking hive:', error);
            return res.status(500).json({ error: 'Error checking hive for existing mother' });
        }

        // Pokud již matka existuje v úlu, vrať chybu
        if (results.rows.length > 0) {
            return res.status(400).json({ error: 'This hive already has a mother' });
        }

        // Pokud matka neexistuje, proveď aktualizaci
        const updateQuery = `
            UPDATE mothers 
            SET mother_hive_id = $1 
            WHERE mother_id = $2
        `;

        pool.query(updateQuery, [hiveId, motherId], (error, results) => {
            if (error) {
                console.error('Error updating mother location:', error);
                return res.status(500).json({ error: 'Error updating mother location' });
            }
            res.status(200).json({ message: 'Mother location updated successfully' });
        });
    });
});



// Spuštění serveru
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});