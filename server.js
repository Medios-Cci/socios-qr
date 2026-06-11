const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const SHEET_ID = '1hW4aOcI4IofHLZ8Lw3z_foyKHGmE9y7RS8a29O9-gvs';
const SHEET_NAME = 'Socios CCI';
const URL_SHEET = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

// Endpoint que verifica el token del QR
app.get('/verificar/:token', async (req, res) => {
  const token = req.params.token;

  try {
    const response = await fetch(URL_SHEET);
    const text = await response.text();

    // Google devuelve el JSON envuelto, hay que limpiarlo
    const start = text.indexOf('{');
const end = text.lastIndexOf('}');
const json = JSON.parse(text.substring(start, end + 1));

    const filas = json.table.rows;

    // Buscamos el socio por token
    console.log('Token buscado::' , token);
    console.log('Primera fila:', JSON.stringify(filas[0]));
    const socio = filas.find(fila => {
  if (!fila || !fila.c || !fila.c<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[5]</a>) return false;
  const valorToken = fila.c<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[5]</a>?.v;
  return String(valorToken).trim() === String(token).trim();
});

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

// Endpoint que devuelve la credencial del socio
app.get('/socio/:token', async (req, res) => {
  res.sendFile(__dirname + '/public/credencial.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
