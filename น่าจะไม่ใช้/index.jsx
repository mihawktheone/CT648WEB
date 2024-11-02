import express from 'express';
import axios from 'axios';
import { Client } from 'pg';

const app = express();
const PORT = 3000;

// PostgreSQL database configuration
const dbClient = new Client({
    host: '13.214.66.96',           // Database server IP
    port: 5432,                     // PostgreSQL port
    user: 'postgres',           // PostgreSQL username
    password: '1234',   // PostgreSQL password
    database: 'postgres',       // Database name
});

// ตรวจสอบการเชื่อมต่อกับ PostgreSQL
dbClient.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => {
        console.error('Failed to connect to PostgreSQL:', err.stack);
        process.exit(1); // Exit the application if the connection fails
    });

// ฟังก์ชันสร้างตาราง
async function initializeTable() {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS currency (
                date DATE PRIMARY KEY,
                currency TEXT,
                btc FLOAT
            );
        `;
        await dbClient.query(createTableQuery);
        console.log("Table 'currency' is ready.");
    } catch (error) {
        console.error('Error creating table:', error);
    }
}
initializeTable();

// ฟังก์ชันดึงข้อมูลและอัปเดตฐานข้อมูล
async function fetchDataAndUpdate() {
    try {
        // Fetch data from API
        const response = await axios.get('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/btc.json');
        const { date, btc } = response.data;

        // Debug: ตรวจสอบข้อมูลที่ได้จาก API
        console.log(`Fetched data: Date = ${date}, BTC = ${btc}`);

        // SQL query สำหรับ insert หรือ update
        const query = `
            INSERT INTO currency (date, currency, btc)
            VALUES ($1, $2, $3)
            ON CONFLICT (date) DO UPDATE
            SET btc = EXCLUDED.btc;
        `;
        const values = [date, 'BTC', btc];

        // Run query and log the result
        const result = await dbClient.query(query, values);
        console.log(`Database response:`, result);
        console.log(`Data for ${date} updated successfully.`);
        return { date, currency: 'BTC', btc };
    } catch (error) {
        console.error('Error fetching or updating data:', error);
        throw error; // Rethrow error to be handled in the route
    }
}

// Root endpoint สำหรับทดสอบการเชื่อมต่อ
app.get('/', (req, res) => {
    res.send('Welcome to the Currency API!');
});

// Endpoint สำหรับเรียกข้อมูลล่าสุด
app.get('/api/currency', async (req, res) => {
    try {
        const data = await fetchDataAndUpdate();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching currency data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});