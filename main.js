/* AstroSeec — comportamiento común a todas las páginas */
(function () {
    'use strict';

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Nav: fondo translúcido al separarse del borde superior */
    var nav = document.querySelector('.nav');
    var rotor = document.getElementById('rotor');
    var ticking = false;

    function onScroll() {
        var y = window.scrollY || document.documentElement.scrollTop;
        if (nav) nav.classList.toggle('scrolled', y > 16);
        if (rotor && !reduce) rotor.style.transform = 'rotate(' + (y * 0.05).toFixed(2) + 'deg)';
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* Año del copyright */
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    /* Reloj de las maquetas de móvil (24 h, como Android) */
    var clocks = document.querySelectorAll('[data-clock]');
    if (clocks.length) {
        var tick = function () {
            var d = new Date();
            var t = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
            for (var i = 0; i < clocks.length; i++) clocks[i].textContent = t;
        };
        tick();
        setInterval(tick, 30000);
    }

    /* Formulario "Desarrolla tu app" dentro del móvil (solo index) */
    var device = document.querySelector('.device');
    var deviceForm = document.getElementById('deviceForm');
    var formApp = document.getElementById('formApp');
    if (device && deviceForm && formApp) {
        var noteEl = formApp.querySelector('.df-note');
        var openForm = function (scroll) {
            device.classList.add('form-mode');
            deviceForm.hidden = false;
            if (scroll) device.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
            var first = formApp.querySelector('input');
            if (first && !scroll) first.focus();
        };
        var closeForm = function () {
            device.classList.remove('form-mode');
            deviceForm.hidden = true;
            if (noteEl) noteEl.hidden = true;
        };
        document.querySelectorAll('.btn-form-open').forEach(function (btn) {
            btn.addEventListener('click', function () { openForm(true); });
        });
        deviceForm.querySelector('.df-close').addEventListener('click', closeForm);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !deviceForm.hidden) closeForm();
        });

        formApp.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!formApp.checkValidity()) { formApp.reportValidity(); return; }
            var d = Object.fromEntries(new FormData(formApp).entries());
            var subject = encodeURIComponent('Solicitud de desarrollo de app — ' + d.nombre);
            var body = encodeURIComponent(
                'Nombre: ' + d.nombre + '\n' +
                'Teléfono: ' + d.telefono + '\n' +
                'Correo: ' + d.correo + '\n\n' +
                'Mensaje:\n' + d.mensaje
            );
            window.location.href = 'mailto:astroseec@gmail.com?subject=' + subject + '&body=' + body;
            if (noteEl) {
                noteEl.hidden = false;
                noteEl.classList.add('ok');
                noteEl.textContent = '¡Gracias, ' + d.nombre.split(' ')[0] + '! Se abrió tu correo con la solicitud lista para enviar.';
            }
            formApp.reset();
        });
    }

    /* Aparición progresiva de los bloques */
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (reduce || !('IntersectionObserver' in window)) {
        for (var j = 0; j < targets.length; j++) targets[j].classList.add('is-in');
        return;
    }

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    for (var k = 0; k < targets.length; k++) io.observe(targets[k]);
})();