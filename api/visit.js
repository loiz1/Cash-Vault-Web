/* Registro de visitas de AstroSeec Web.
   POST /api/visit            → registra una visita (beacon desde el sitio)
   GET  /api/visit?k=CLAVE    → lista el registro (requiere VISIT_LOG_KEY)
   GET  /api/visit?k=CLAVE&purgar=1 → borra entradas de más de 12 meses */
const { put, list, del, get } = require('@vercel/blob');

const KEY = process.env.VISIT_LOG_KEY || '';
const MESES_REGISTRO = 12;

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 5000) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

const clean = (v, n) => String(v || '').slice(0, n);

module.exports = async (req, res) => {
  /* —— registro —— */
  if (req.method === 'POST') {
    const b = await readBody(req);
    const rec = {
      ts: new Date().toISOString(),
      ip: clean((req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.headers['x-real-ip'], 64) || 'desconocida',
      pais: clean(req.headers['x-vercel-ip-country'], 8),
      ciudad: clean(decodeURIComponent(req.headers['x-vercel-ip-city'] || ''), 64),
      ua: clean(req.headers['user-agent'], 300),
      pagina: clean(b.pagina, 120),
      ref: clean(b.ref, 300),
      lang: clean(b.lang, 24),
      pantalla: clean(b.pantalla, 24),
      id: clean(b.id, 40)
    };
    const nombre = 'visitas/' + rec.ts.replace(/[:.]/g, '-') + '-' + Math.random().toString(36).slice(2, 8) + '.json';
    await put(nombre, JSON.stringify(rec), { access: 'private', contentType: 'application/json', addRandomSuffix: false });
    res.statusCode = 204;
    res.end();
    return;
  }

  /* —— consulta / purga: requiere clave —— */
  const url = new URL(req.url, 'https://x');
  if (!KEY || url.searchParams.get('k') !== KEY) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'clave inválida' }));
    return;
  }

  const { blobs } = await list({ prefix: 'visitas/', limit: 1000 });

  if (url.searchParams.get('purgar') === '1') {
    const limite = Date.now() - MESES_REGISTRO * 30 * 24 * 3600 * 1000;
    let borradas = 0;
    for (const blob of blobs) {
      const m = blob.pathname.match(/visitas\/(\d{4}-\d{2}-\d{2})/);
      if (m && new Date(m[1]).getTime() < limite) {
        await del(blob.pathname);
        borradas++;
      }
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ purgadas: borradas }));
    return;
  }

  const orden = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname)).slice(0, 1000);
  const items = [];
  for (const blob of orden) {
    try {
      const r = await get(blob.pathname, { access: 'private' });
      if (r && r.stream) {
        const txt = await new Response(r.stream).text();
        items.push(JSON.parse(txt));
      }
    } catch (e) { /* salta entradas ilegibles */ }
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ total: blobs.length, items }));
};
