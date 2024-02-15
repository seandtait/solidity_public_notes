const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// Middleware for JSON body parsing and CORS
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_IP
}));

// Create a pool connection to the database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Connect to the database on server startup
pool.getConnection()
    .then(conn => {
        console.log('Connected to the MySQL database.');
        conn.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Route for creating a message
app.post('/create', async (req, res) => {
    try {
        const { uuid, date, senderAddress, tip, message } = req.body;
        let hexTip = tip.toString(16);
        hexTip = '0x' + hexTip.padStart(64, '0');

        const [results] = await pool.query(
            'INSERT INTO messages (uuid, date, sender_address, tip, message) VALUES (?, ?, ?, ?, ?)',
            [uuid, date, senderAddress, hexTip, message]
        );
        res.status(201).json({ message: 'Message created', id: results.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route for getting all messages
app.get('/get', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT uuid, date, tip, message FROM messages ORDER BY tip DESC;');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route for getting a single message by uuid
app.get('/find/:uuid', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT uuid, date, tip, message FROM messages WHERE uuid = ?', [req.params.uuid]);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});




