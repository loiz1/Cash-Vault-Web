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
    var WEB3FORMS_KEY = '7375938a-c17c-4f2a-89b5-24203072b9da'; // form contacto (web3forms, astroseec@gmail.com)
    var WEB3FORMS_DELETE_KEY = 'd3f904bd-5938-4b60-93b0-66729754ab85'; // form eliminación de datos
    function w3fSend(payload, ok, fail) {
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function (res) { return res.json().catch(function () { return {}; }); })
            .then(function (data) { if (data && data.success) ok(); else fail(); })
            .catch(fail);
    }
    var device = document.querySelector('.device');
    var deviceForm = document.getElementById('deviceForm');
    var formApp = document.getElementById('formApp');
    if (device && deviceForm && formApp) {
        var noteEl = formApp.querySelector('.df-note');
        // por defecto, el móvil muestra los iconos
        device.classList.remove('form-mode');
        deviceForm.hidden = true;
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
            var btnSend = formApp.querySelector('.df-send');
            var firstName = d.nombre.split(' ')[0];
            var show = function (ok, text) {
                btnSend.disabled = false;
                if (noteEl) {
                    noteEl.hidden = false;
                    noteEl.classList.toggle('ok', ok);
                    noteEl.textContent = text;
                }
                if (ok) formApp.reset();
            };
            var mailtoFallback = function () {
                var subject = encodeURIComponent('Solicitud de desarrollo de app — ' + d.nombre);
                var body = encodeURIComponent(
                    'Nombre: ' + d.nombre + '\n' +
                    'Teléfono: ' + d.telefono + '\n' +
                    'Correo: ' + d.correo + '\n\n' +
                    'Mensaje:\n' + d.mensaje
                );
                window.location.href = 'mailto:astroseec@gmail.com?subject=' + subject + '&body=' + body;
                show(true, '¡Gracias, ' + firstName + '! Se abrió tu correo con la solicitud lista para enviar.');
            };

            btnSend.disabled = true;
            if (noteEl) {
                noteEl.hidden = false;
                noteEl.classList.remove('ok');
                noteEl.textContent = 'Enviando…';
            }
            if (WEB3FORMS_KEY) {
                w3fSend({
                    access_key: WEB3FORMS_KEY,
                    subject: 'Solicitud de desarrollo de app — ' + d.nombre,
                    from_name: 'Web AstroSeec',
                    nombre: d.nombre,
                    telefono: d.telefono,
                    correo: d.correo,
                    mensaje: d.mensaje
                },
                function () { show(true, '¡Gracias, ' + firstName + '! Tu solicitud fue enviada; te responderemos muy pronto.'); },
                mailtoFallback);
            } else {
                mailtoFallback();
            }
        });

        // llegar desde otras páginas con ?form=1 abre el formulario
        if (location.search.indexOf('form=1') !== -1) openForm(true);
    }

    /* Formulario de eliminación de datos (delete-account.html) */
    var delForm = document.getElementById('formDelete');
    if (delForm) {
        var delNote = delForm.querySelector('.df-note');
        delForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!delForm.checkValidity()) { delForm.reportValidity(); return; }
            var d = Object.fromEntries(new FormData(delForm).entries());
            var btnSend = delForm.querySelector('button[type="submit"]');
            var show = function (ok, text) {
                btnSend.disabled = false;
                if (delNote) {
                    delNote.hidden = false;
                    delNote.classList.toggle('ok', ok);
                    delNote.textContent = text;
                }
                if (ok) delForm.reset();
            };
            var mailtoFallback = function () {
                var subject = encodeURIComponent('Solicitud de eliminación de datos — ' + d.aplicacion);
                var NL = String.fromCharCode(10);
                var body = encodeURIComponent('Aplicación: ' + d.aplicacion + NL + 'Correo registrado: ' + d.correo + NL + NL + 'Detalles:' + NL + (d.detalles || ''));
                window.location.href = 'mailto:astroseec@gmail.com?subject=' + subject + '&body=' + body;
                show(true, 'Se abrió tu correo con la solicitud lista para enviar.');
            };

            btnSend.disabled = true;
            if (delNote) {
                delNote.hidden = false;
                delNote.classList.remove('ok');
                delNote.textContent = 'Enviando…';
            }
            w3fSend({
                access_key: WEB3FORMS_DELETE_KEY,
                subject: 'Solicitud de eliminación de datos — ' + d.aplicacion + ' (' + d.correo + ')',
                from_name: 'Web AstroSeec',
                aplicacion: d.aplicacion,
                correo: d.correo,
                detalles: d.detalles || ''
            },
            function () { show(true, 'Solicitud recibida. Eliminaremos tu cuenta y tus datos en un máximo de 48 horas y te confirmaremos por correo.'); },
            mailtoFallback);
        });
    } else if (document.querySelector('.btn-form-open')) {
        // páginas sin móvil: los botones de contacto llevan al formulario del index
        document.querySelectorAll('.btn-form-open').forEach(function (btn) {
            btn.addEventListener('click', function () { location.href = 'index.html?form=1'; });
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