const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

let KEYFILEPATH = './credentials.json';

// Si hay variable de entorno, crea el archivo
if (process.env.GOOGLE_CREDENTIALS) {
  try {
    const credsPath = path.join(__dirname, 'credentials.json');
    fs.writeFileSync(credsPath, process.env.GOOGLE_CREDENTIALS);
    KEYFILEPATH = credsPath;
    console.log('✓ Credentials file created from environment variable');
  } catch (err) {
    console.error('Error creating credentials file:', err);
  }
}

const SHEET_ID = '1yUzTI7Kv2jklmoGyxCS5WasSdRil0EMFk6cYOgcnXtg';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

async function getSheetsService() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
  } catch (err) {
    console.error('Error in getSheetsService:', err.message);
    throw err;
  }
}

// Ruta para leer (GET)
app.get('/leer', async (req, res) => {
  try {
    const sheets = await getSheetsService();
    const rango = 'Hoja1!A1:Z100';
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: rango,
    });
    res.json(result.data);
  } catch (err) {
    console.error('Error en /leer:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Ruta para escribir (POST)
app.post('/escribir', async (req, res) => {
  try {
    const sheets = await getSheetsService();
    const { valores } = req.body;
    const rango = 'Hoja1!A1';

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: rango,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [valores] },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error en /escribir:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
