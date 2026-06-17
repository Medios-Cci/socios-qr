const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const SHEET_ID = '1hW4aOcI4IofHLZ8Lw3z_foyKHGmE9y7RS8a29O9-gvs';
const SHEET_NAME = 'Socios CCI';
const URL_SHEET = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

// Manifest dinámico por token
app.get('/manifest/:token', (req, res) => {
  const token = req.params.token;
  const base = 'https://socios-qr-wallet.onrender.com';

  const manifest = {
    name: 'Credencial CCI',
    short_name: 'CCI',
    description: 'Credencial digital de socio CCI Argentina',
    start_url: `${base}/socio/${token}`,
    scope: `${base}/`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#111111',
    theme_color: '#C9A84C',
    icons: [
      {
        src: `${base}/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: `${base}/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  };

  res.setHeader('Content-Type', 'application/manifest+json');
  res.json(manifest);
});

// Service Worker
app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(__dirname + '/public/sw.js');
});

// Verificar token
app.get('/verificar/:token', async (req, res) => {
  const token = req.params.token;

  try {
    const response = await fetch(URL_SHEET);
    const text = await response.text();

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const json = JSON.parse(text.substring(start, end + 1));

    const filas = json.table.rows;

    console.log('Token buscado:', token);
    console.log('Primera fila:', JSON.stringify(filas[0]));

    const socio = filas.find(fila => {
  if (!fila || !fila.c || !fila.c[5]) return false;
const valorToken = fila.c[5]?.v;
if (String(valorToken).includes('1349')) {
  console.log('>>> FILA CON 1349:', JSON.stringify(fila.c[5]));
}
      return String(valorToken).trim() === String(token).trim();
    });

    console.log('Total filas procesadas:', filas.length);

    if (!socio) {
      return res.json({
        encontrado: false,
        mensaje: 'Socio no encontrado'
      });
    }

       const nombre = socio.c[0]?.v || '';
       const apellido = socio.c[1]?.v || '';
       const empresa = socio.c[2]?.v || '';
       const numero = socio.c[3]?.v || '';
       const estado = socio.c[4]?.v || '';
    
    const activo = estado.toLowerCase() === 'activo';

    return res.json({
      encontrado: true,
      activo: activo,
      nombre: `${nombre} ${apellido}`,
      empresa: empresa,
      numero_socio: numero,
      estado: estado,
      mensaje: activo ? '✅ Socio ACTIVO' : '❌ Socio INACTIVO'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al leer los datos' });
  }
});

// Credencial visual
app.get('/socio/:token', (req, res) => {
  res.sendFile(__dirname + '/public/credencial.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
