const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Servírování statických souborů z adresáře 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Připojení k PostgreSQL
const pool = new Pool({
    user: 'postgres', // tvůj PostgreSQL uživatelský účet
    host: 'localhost',
    database: 'mydatabase', // název databáze
    password: 'pg1234gRes', // tvoje heslo
    port: 5432,
});

// POST dat do boxes
app.post("/api/boxes", (req, res) => {
    const { box_id, box_type, box_year, box_notes, box_hive_id } = req.body;

    pool.query(
        "INSERT INTO boxes (box_id, box_type, box_year, box_notes, box_hive_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [box_id, box_type, box_year, box_notes, box_hive_id || null],
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
    const { mother_id, mother_origin, mother_year, mother_notes, mother_hive_id} = req.body;

    pool.query(
        "INSERT INTO mothers (mother_id, mother_origin, mother_year, mother_notes, mother_hive_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [mother_id, mother_origin, mother_year, mother_notes, mother_hive_id || null],
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
    const { checkup_id, checkup_type, checkup_flyby, checkup_date, checkup_note, checkup_hive_id } = req.body;

    pool.query(
        "INSERT INTO checkups (checkup_id, checkup_type, checkup_flyby, checkup_date, checkup_note, checkup_hive_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [checkup_id, checkup_type, checkup_flyby, checkup_date, checkup_note, checkup_hive_id || null],
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
    const { hive_id, hive_year, hive_name } = req.body;

    pool.query(
        "INSERT INTO hives (hive_id, hive_year, hive_name) VALUES ($1, $2, $3) RETURNING *",
        [hive_id, hive_year, hive_name],
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

//GET všechny úly s výpisem přiřazených boxů
app.get("/api/hivesWithBoxes", (req, res) => {
    pool.query(`
        SELECT h.hive_id, h.hive_name, h.hive_year, 
               json_agg(json_build_object('box_id', b.box_id, 'box_type', b.box_type, 'box_year', b.box_year)) as boxes
        FROM hives h
        LEFT JOIN boxes b ON h.hive_id = b.box_hive_id
        GROUP BY h.hive_id;
    `, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error fetching hives with boxes");
        } else {
            res.status(200).json(result.rows);
        }
    });
});

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

// Spuštění serveru
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});