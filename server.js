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
    const json = JSON.parse(text.substring(47, text.length - 2));
    const filas = json.table.rows;

    // Buscamos el socio por token
    const socio = filas.find(fila => {
      const valorToken = fila.c<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[5]</a>?.v;

    });

    if (!socio) {
      return res.json({
        encontrado: false,
        mensaje: 'Socio no encontrado'
      });
    }

    const nombre = socio.c<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[0]</a>?.v || '';
    const apellido = socio.c<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[1]</a>?.v || '';
    const empresa = socio.c<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[2]</a>?.v || '';
    const numero  = socio.c<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[3]</a>?.v || '';
    const estado  = socio.c<a href="" class="citation-link" target="_blank" style="vertical-align: super; font-size: 0.8em; margin-left: 3px;">[4]</a>?.v || '';

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
