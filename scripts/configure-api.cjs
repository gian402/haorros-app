const fs = require('node:fs');
const path = require('node:path');
const raw = process.env.API_BASE_URL || process.argv[2];
if (!raw) throw new Error('Configura API_BASE_URL, por ejemplo https://api.tudominio.com/api');
const url = new URL(raw);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !url.pathname.endsWith('/api')) {
  throw new Error('API_BASE_URL debe ser HTTPS, terminar en /api y no contener credenciales ni parámetros.');
}
fs.writeFileSync(path.join(__dirname, '../src/api/config.json'), JSON.stringify({baseUrl: url.toString().replace(/\/$/, '')}) + '\n');
console.log('Dirección de la API configurada.');
