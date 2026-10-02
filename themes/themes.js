/* ============================================================
   AstroSeec — Revisión de diseños
   Barra superior: un toggle por diseño (de Demos Webs) y un
   check ✓/✗ para aprobar o descartar. Las decisiones y el tema
   activo se guardan en localStorage. Solo cambia el diseño,
   nunca la información de la página.
   ============================================================ */
(function () {
    'use strict';
    if (!document.querySelector('.hero')) return; // solo la página principal

    var KEY = 'astroseec_disenos_v1';
    var THEMES = [
        { id: '018', name: 'Diorama de papel' },
        { id: '025', name: 'Ciudad isométrica', fonts: 'Quicksand:wght@500;600;700' },
        { id: '028', name: 'Tabla periódica' },
        { id: '045', name: 'Vitral gótico', fonts: 'Cinzel:wght@400;600' },
        { id: '046', name: 'Jardín de hábitos', fonts: 'Nunito:wght@400;600;700;800' },
        { id: '048', name: 'Claymorphism', fonts: 'Nunito:wght@600;700;800;900' },
        { id: '061', name: 'Luciérnagas', fonts: 'Cormorant+Garamond:ital,wght@0,400;1,300;1,500' },
        { id: '076', name: 'Control de misión' },
        { id: '078', name: 'Árbol fractal', fonts: 'Cormorant+Garamond:ital,wght@0,500;1,400;1,500' },
        { id: '088', name: 'Reloj de arena' },
        { id: '091', name: 'Día alpino' },
        { id: '092', name: 'Mezclador de ambientes' }
    ];
    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- estado ---------- */
    var S = { active: null, ok: [], no: [], closed: false };
    try {
        var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
        if (saved && typeof saved === 'object') {
            S.active = THEMES.some(function (t) { return t.id === saved.active; }) ? saved.active : null;
            S.ok = Array.isArray(saved.ok) ? saved.ok.filter(validId) : [];
            S.no = Array.isArray(saved.no) ? saved.no.filter(validId) : [];
            S.closed = !!saved.closed;
        }
    } catch (e) { /* estado por defecto */ }
    function validId(id) { return THEMES.some(function (t) { return t.id === id; }); }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

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
    function fxDust(n) {
        var h = fxHost(); if (!h) return;
        for (var i = 0; i < n; i++) {
            var d = document.createElement('i');
            d.className = 'fx-dust';
            d.style.cssText = 'left:' + rnd(10, 90) + '%;top:' + rnd(10, 80) + '%;animation-delay:-' + rnd(0, 9) + 's;animation-duration:' + rnd(7, 12) + 's';
            h.appendChild(d);
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
    function fxCanvas(draw, opts) {
        var h = fxHost(); if (!h || REDUCED) return;
        var canvas = document.createElement('canvas');
        h.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        var raf = 0, W = 0, H = 0, t0 = performance.now();
        function size() {
            var r = h.getBoundingClientRect();
            W = canvas.width = Math.max(1, r.width);
            H = canvas.height = Math.max(1, r.height);
        }
        size();
        window.addEventListener('resize', size);
        function loop(now) {
            draw(ctx, W, H, (now - t0) / 1000);
            raf = requestAnimationFrame(loop);
        }
        raf = requestAnimationFrame(loop);
        cleanups.push(function () {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', size);
            canvas.remove();
        });
        if (opts && opts.init) opts.init(W, H);
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
        fxCanvas(function (ctx, W, H, t, dtIn) {
            var dt = Math.min(.05, dtIn || .016);
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
        '025': function () { fxStars(46); fxAdd('fx-sky'); },
        '028': function () { /* grid y glow van en el CSS del tema */ },
        '045': function () { fxAdd('fx-vitral'); fxDust(14); },
        '046': function () { fxAdd('fx-sun'); },
        '048': function () { ['b1', 'b2', 'b3', 'b4'].forEach(function (b) { fxAdd('fx-blob ' + b); }); },
        '061': function () { fxFireflies(); },
        '076': function () { /* HUD y grid van en el CSS del tema */ },
        '078': function () { fxGrain(.08); fxLeaves(); },
        '088': function () { fxStars(40); fxMotes(12); },
        '091': function () { fxAdd('fx-sky'); fxStars(30); },
        '092': function () { fxGrain(.06); fxAdd('fx-amb warm'); fxAdd('fx-amb green'); }
    };

    /* ---------- carga de CSS y fuentes por tema ---------- */
    var loaded = {};
    function ensureAssets(id) {
        var t = THEMES.filter(function (x) { return x.id === id; })[0];
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
        refreshChips();
    }

    /* ---------- barra ---------- */
    var bar, tab, chips = {};
    function buildBar() {
        bar = document.createElement('div');
        bar.className = 'rvz-bar';
        bar.id = 'rvzBar';
        var chipsHtml = THEMES.map(function (t) {
            return '<div class="rvz-chip" data-id="' + t.id + '">' +
                '<label class="rvz-switch" title="Ver este diseño"><input type="checkbox" data-id="' + t.id + '" aria-label="Activar diseño ' + t.name + '"><span></span></label>' +
                '<span class="rvz-name">' + t.name + '</span>' +
                '<span class="rvz-verdict"></span>' +
                '<div class="rvz-actions">' +
                '<button type="button" class="rvz-ok" data-id="' + t.id + '" title="Aprobar diseño">✓</button>' +
                '<button type="button" class="rvz-no" data-id="' + t.id + '" title="Descartar diseño">✗</button>' +
                '</div></div>';
        }).join('');
        bar.innerHTML =
            '<div class="rvz-head"><strong>Revisión de diseños</strong>' +
            '<span class="rvz-hint">Activa un diseño con el switch · debajo, apríbalo ✓ o descártalo ✗</span>' +
            '<div class="rvz-summary"><span class="rvz-sum-text" id="rvzSum"></span>' +
            '<button type="button" class="rvz-reset" id="rvzReset">Restablecer</button>' +
            '<button type="button" class="rvz-min" id="rvzMin" title="Ocultar barra">–</button></div></div>' +
            '<div class="rvz-chips">' + chipsHtml + '</div>';

        tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'rvz-tab';
        tab.innerHTML = '🎨 <span>Diseños</span>';
        tab.addEventListener('click', function () { setClosed(false); });

        document.body.appendChild(bar);
        document.body.appendChild(tab);

        bar.querySelectorAll('.rvz-switch input').forEach(function (inp) {
            inp.addEventListener('change', function () {
                var id = inp.getAttribute('data-id');
                if (inp.checked) {
                    applyTheme(id);
                } else if (S.active === id) {
                    applyTheme(null); // volver al diseño original
                } else {
                    refreshChips();
                }
            });
        });
        bar.querySelectorAll('.rvz-actions button').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = btn.getAttribute('data-id');
                var kind = btn.classList.contains('rvz-ok') ? 'ok' : 'no';
                S[kind] = S[kind].indexOf(id) >= 0 ? S[kind].filter(function (x) { return x !== id; }) : S[kind].concat([id]);
                var other = kind === 'ok' ? 'no' : 'ok';
                S[other] = S[other].filter(function (x) { return x !== id; });
                save();
                refreshChips();
            });
        });
        bar.querySelector('#rvzReset').addEventListener('click', function () {
            S.ok = []; S.no = []; save(); refreshChips();
        });
        bar.querySelector('#rvzMin').addEventListener('click', function () { setClosed(true); });
    }

    function setClosed(closed) {
        S.closed = closed;
        save();
        bar.style.display = closed ? 'none' : '';
        tab.classList.toggle('show', closed);
        document.body.classList.toggle('rvz-open', !closed);
    }

    function refreshChips() {
        THEMES.forEach(function (t) {
            var chip = chips[t.id];
            if (!chip) return;
            var isActive = S.active === t.id;
            chip.classList.toggle('active', isActive);
            chip.classList.toggle('ok', S.ok.indexOf(t.id) >= 0);
            chip.classList.toggle('no', S.no.indexOf(t.id) >= 0);
            chip.querySelector('.rvz-switch input').checked = isActive;
            chip.querySelector('.rvz-verdict').textContent =
                S.ok.indexOf(t.id) >= 0 ? '✓ aprobado' : (S.no.indexOf(t.id) >= 0 ? '✗ descartado' : '');
        });
        var sum = document.getElementById('rvzSum');
        if (sum) {
            sum.innerHTML = 'Aprobados: <b class="ok">' + S.ok.length + '</b> · Descartados: <b class="no">' + S.no.length + '</b>';
        }
    }

    buildBar();
    THEMES.forEach(function (t) { chips[t.id] = bar.querySelector('.rvz-chip[data-id="' + t.id + '"]'); });
    if (S.active) applyTheme(S.active); else refreshChips();
    setClosed(S.closed);
})();
