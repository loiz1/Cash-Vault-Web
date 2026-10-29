/* Registro de visita — envía el beacon al registro propio del sitio.
   Nunca interfiere con la página: todo falla en silencio. */
(function () {
    'use strict';
    try {
        var base = /localhost|127\.0\.0\.1/.test(location.hostname) ? 'https://astroseec-web.vercel.app' : '';
        var d = {
            pagina: (location.pathname.split('/').pop() || 'index'),
            ref: document.referrer || '',
            lang: navigator.language || '',
            pantalla: (screen.width || 0) + 'x' + (screen.height || 0)
        };
        try {
            var id = localStorage.getItem('astro-visitante');
            if (!id) {
                id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
                localStorage.setItem('astro-visitante', id);
            }
            d.id = id;
        } catch (e) { /* sin localStorage: seguimos sin id */ }

        var body = JSON.stringify(d);
        if (navigator.sendBeacon) {
            navigator.sendBeacon(base + '/api/visit', new Blob([body], { type: 'application/json' }));
        } else {
            fetch(base + '/api/visit', { method: 'POST', body: body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
        }
    } catch (e) { /* silencio */ }
})();
