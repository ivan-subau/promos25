const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Cambia el nombre del archivo JSON si es necesario:
const KEYFILEPATH = './gen-lang-client-0832181337-82de18481ef3.json';
// Coloca el ID de tu Google Sheet:
const SHEET_ID = '1yUzTI7Kv2jklmoGyxCS5WasSdRil0EMFk6cYOgcnXtg';

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Agrega esta línea

async function getSheetsService() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
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
    res.status(500).json({ error: err.toString() });
  }
});

// Ruta para escribir (POST)
app.post('/escribir', async (req, res) => {
  try {
    const sheets = await getSheetsService();
    const { valores } = req.body;
    const rango = 'Hoja1!A1'; // Cambia el rango según donde quieras escribir

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: rango,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [valores] },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:' + PORT);
});
