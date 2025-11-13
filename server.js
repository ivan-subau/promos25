const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const SHEET_ID = '1yUzTI7Kv2jklmoGyxCS5WasSdRil0EMFk6cYOgcnXtg';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

async function getSheetsService() {
  try {
    // Leer credenciales directamente desde variable de entorno
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('GOOGLE_CREDENTIALS environment variable not set');
    }

    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
  } catch (err) {
    console.error('Error in getSheetsService:', err.message);
    throw err;
  }
}

app.get('/leer', async (req, res) => {
  try {
    const sheets = await getSheetsService();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Hoja1!A1:Z100',
    });
    res.json(result.data);
  } catch (err) {
    console.error('Error en /leer:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/escribir', async (req, res) => {
  try {
    const sheets = await getSheetsService();
    const { valores } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Hoja1!A1',
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
