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