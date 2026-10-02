/* ============================================================
   AstroSeec — Cambio de diseño
   Botón toggle en la navegación (junto a «Contacto»): cada clic
   aplica un diseño aleatorio de los aprobados; doble clic vuelve
   al diseño original. El tema activo se guarda en localStorage.
   Solo cambia el diseño, nunca la información de la página.
   ============================================================ */
(function () {
    'use strict';
    if (!document.querySelector('.hero')) return; // solo la página principal

    var KEY = 'astroseec_tema_v2';
    var OLD_KEY = 'astroseec_disenos_v1'; // decisions de la fase de revisión
    var THEMES = [
        { id: '018', name: 'Diorama de papel' },
        { id: '061', name: 'Luciérnagas', fonts: 'Cormorant+Garamond:ital,wght@0,400;1,300;1,500' },
        { id: '078', name: 'Árbol fractal', fonts: 'Cormorant+Garamond:ital,wght@0,500;1,400;1,500' },
        { id: '088', name: 'Reloj de arena' },
        { id: '091', name: 'Día alpino' }
    ];
    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- estado ---------- */
    var S = { active: null };
    try {
        var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (saved && THEMES.some(function (t) { return t.id === saved.active; })) {
            S.active = saved.active;
        } else {
            // migrar el tema activo de la fase de revisión si sirve
            var old = JSON.parse(localStorage.getItem(OLD_KEY) || 'null');
            if (old && THEMES.some(function (t) { return t.id === old.active; })) S.active = old.active;
            localStorage.removeItem(OLD_KEY);
            save();
        }
    } catch (e) { /* estado por defecto */ }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
    function themeById(id) {
        return THEMES.filter(function (t) { return t.id === id; })[0] || null;
    }

    /* ---------- efectos firma (funciones de cada demo) ---------- */
    var fxHostEl = null;
    function fxHost() {
        var hero = document.querySelector('.hero');
        if (!hero) return null;
        if (!fxHostEl || !fxHostEl.isConnected) {
            fxHostEl = hero.querySelector(':scope > .theme-fx');
            if (!fxHostEl) {
                fxHostEl = document.createElement('div');
                fxHostEl.className = 'theme-fx';
                hero.appendChild(fxHostEl);
            }
        }
        return fxHostEl;
    }
    var cleanups = [];
    function clearFx() {
        cleanups.forEach(function (f) { try { f(); } catch (e) { } });
        cleanups = [];
        var h = document.querySelector('.theme-fx');
        if (h) h.innerHTML = '';
        document.querySelectorAll('.fx-grain').forEach(function (g) { g.remove(); });
    }
    function rnd(a, b) { return a + Math.random() * (b - a); }

    function fxStars(n) {
        var h = fxHost(); if (!h) return;
        for (var i = 0; i < n; i++) {
            var s = document.createElement('i');
            s.className = 'fx-star';
            var size = rnd(1.2, 2.4);
            s.style.cssText = 'left:' + rnd(0, 100) + '%;top:' + rnd(0, 70) + '%;width:' + size + 'px;height:' + size + 'px;animation-delay:-' + rnd(0, 3) + 's;animation-duration:' + rnd(2.2, 4.5) + 's';
            h.appendChild(s);
        }
    }
    function fxMotes(n) {
        var h = fxHost(); if (!h) return;
        for (var i = 0; i < n; i++) {
            var m = document.createElement('i');
            m.className = 'fx-mote';
            m.style.cssText = 'left:' + rnd(2, 98) + '%;bottom:-4%;--dx:' + rnd(-40, 60) + 'px;animation-duration:' + rnd(9, 18) + 's;animation-delay:-' + rnd(0, 14) + 's';
            h.appendChild(m);
        }
    }
    function fxGrain(opacity) {
        var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";
        var g = document.createElement('div');
        g.className = 'fx-grain';
        g.style.cssText = 'background-image:url("data:image/svg+xml,' + encodeURIComponent(svg) + '");opacity:' + (opacity || 0.07);
        document.body.appendChild(g);
    }
    function fxAdd(cls) {
        var h = fxHost(); if (!h) return;
        var d = document.createElement('div');
        d.className = cls;
        h.appendChild(d);
        return d;
    }
    function fxCanvas(draw) {
        var h = fxHost(); if (!h || REDUCED) return;
        var canvas = document.createElement('canvas');
        h.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        var raf = 0, W = 0, H = 0, last = performance.now(), t0 = last;
        function size() {
            var r = h.getBoundingClientRect();
            W = canvas.width = Math.max(1, r.width);
            H = canvas.height = Math.max(1, r.height);
        }
        size();
        window.addEventListener('resize', size);
        function loop(now) {
            var dt = Math.min(.05, (now - last) / 1000);
            last = now;
            draw(ctx, W, H, (now - t0) / 1000, dt);
            raf = requestAnimationFrame(loop);
        }
        raf = requestAnimationFrame(loop);
        cleanups.push(function () {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', size);
            canvas.remove();
        });
    }

    // Luciérnagas (061): sprite radial aditivo + parpadeo suave
    function fxFireflies() {
        var N = 16, flies = [];
        for (var i = 0; i < N; i++) flies.push({
            x: Math.random(), y: rnd(.25, .95),
            vx: rnd(-.02, .02), vy: rnd(-.012, .012),
            r: rnd(5, 11), ph: rnd(-1.5, 1.5), sp: rnd(.35, .8)
        });
        fxCanvas(function (ctx, W, H, t) {
            ctx.clearRect(0, 0, W, H);
            ctx.globalCompositeOperation = 'lighter';
            flies.forEach(function (f) {
                f.x += f.vx / 60; f.y += f.vy / 60;
                if (f.x < -.05) f.x = 1.05; if (f.x > 1.05) f.x = -.05;
                if (f.y < .15) f.y = .98; if (f.y > 1.02) f.y = .18;
                var ph = (t * f.sp + f.ph) % (Math.PI * 2);
                var b = Math.exp(-Math.pow(Math.sin(ph), 2) / .18);
                var R = f.r * (0.6 + b * 0.9) * (H / 620);
                var x = f.x * W, y = f.y * H;
                var g = ctx.createRadialGradient(x, y, 0, x, y, R * 2.4);
                g.addColorStop(0, 'rgba(252,255,226,' + (.14 + .8 * b) + ')');
                g.addColorStop(.35, 'rgba(232,255,138,' + (.3 * b) + ')');
                g.addColorStop(1, 'rgba(200,240,110,0)');
                ctx.globalAlpha = 1;
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(x, y, R * 2.4, 0, 6.2832); ctx.fill();
            });
            ctx.globalCompositeOperation = 'source-over';
        });
    }
    // Hojas cayendo (078): elipse que aletea
    function fxLeaves() {
        var COLORS = ['#e76f51', '#e9c46a', '#f4a261', '#b5834d', '#8a9a5b'];
        var N = 14, leaves = [];
        function spawn(first) {
            return {
                x: Math.random(), y: first ? Math.random() : -0.06,
                vy: rnd(.05, .1), ph: rnd(0, 6.28), fs: rnd(2.4, 4.2),
                rot: rnd(0, 6.28), vr: rnd(-1.2, 1.2),
                size: rnd(4, 8), c: COLORS[(Math.random() * COLORS.length) | 0]
            };
        }
        for (var i = 0; i < N; i++) leaves.push(spawn(true));
        fxCanvas(function (ctx, W, H, t, dt) {
            ctx.clearRect(0, 0, W, H);
            leaves.forEach(function (p, idx) {
                p.y += p.vy * dt;
                p.x += Math.sin(t * .8 + p.ph) * .00035;
                p.rot += p.vr * dt; p.fl = t * p.fs + p.ph;
                if (p.y > 1.06) leaves[idx] = spawn(false);
                var r = p.size * (H / 620);
                var sq = Math.max(.35, Math.abs(Math.cos(p.fl)));
                ctx.save();
                ctx.translate(p.x * W, p.y * H);
                ctx.rotate(p.rot);
                ctx.globalAlpha = .8;
                ctx.fillStyle = p.c;
                ctx.beginPath();
                ctx.ellipse(0, 0, r, r * sq, 0, 0, 6.2832);
                ctx.fill();
                ctx.restore();
            });
        });
    }

    var FX_BY_THEME = {
        '018': function () { fxGrain(.09); },
        '061': function () { fxFireflies(); },
        '078': function () { fxGrain(.08); fxLeaves(); },
        '088': function () { fxStars(40); fxMotes(12); },
        '091': function () { fxAdd('fx-sky'); fxStars(30); }
    };

    /* ---------- carga de CSS y fuentes por tema ---------- */
    var loaded = {};
    function ensureAssets(id) {
        var t = themeById(id);
        if (!t) return;
        if (!loaded['css' + id]) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'themes/t-' + id + '.css';
            document.head.appendChild(link);
            loaded['css' + id] = true;
        }
        if (t.fonts && !loaded['f' + id]) {
            var f = document.createElement('link');
            f.rel = 'stylesheet';
            f.href = 'https://fonts.googleapis.com/css2?family=' + t.fonts + '&display=swap';
            document.head.appendChild(f);
            loaded['f' + id] = true;
        }
    }

    /* ---------- botón toggle en la navegación ---------- */
    var btn, btnLabel;
    var DICE_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.2" cy="8.2" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.8" cy="15.8" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.8" cy="8.2" r="1.15" fill="currentColor" stroke="none"/><circle cx="8.2" cy="15.8" r="1.15" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/></svg>';

    function buildButton() {
        var nav = document.querySelector('.nav-links');
        if (!nav) return;
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rvz-nav-btn';
        btn.title = 'Cambiar a un diseño aleatorio · doble clic: diseño original';
        btn.setAttribute('aria-label', 'Cambiar diseño de la web');
        btn.innerHTML = DICE_SVG + '<span></span>';
        btnLabel = btn.querySelector('span');
        btn.addEventListener('click', function () {
            applyTheme(randomId());
        });
        btn.addEventListener('dblclick', function (e) {
            e.preventDefault();
            applyTheme(null);
        });
        nav.appendChild(btn);
    }
    function randomId() {
        var pool = THEMES.filter(function (t) { return t.id !== S.active; });
        return pool[(Math.random() * pool.length) | 0].id;
    }
    function refreshButton() {
        if (!btnLabel) return;
        var t = themeById(S.active);
        btn.classList.toggle('on', !!t);
        btnLabel.textContent = t ? t.name : 'Diseño';
    }

    function applyTheme(id) {
        clearFx();
        if (id) {
            ensureAssets(id);
            document.documentElement.setAttribute('data-theme', id);
            try { FX_BY_THEME[id] && FX_BY_THEME[id](); } catch (e) { }
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        S.active = id;
        save();
        refreshButton();
    }

    buildButton();
    if (S.active) applyTheme(S.active); else refreshButton();
})();
