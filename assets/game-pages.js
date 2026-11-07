/* Small, progressively enhanced interactions for the game landing pages. */
(function () {
    'use strict';
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    var explorer = document.querySelector('.pet-explorer');
    if (explorer) {
        var portrait = explorer.querySelector('.selected-pet');
        var caption = explorer.querySelector('.pet-caption');
        var choices = explorer.querySelectorAll('.pet-choice');
        choices.forEach(function (button) {
            button.addEventListener('click', function () {
                var source = button.querySelector('img');
                portrait.src = source.getAttribute('src');
                portrait.alt = button.dataset.name + ', mascota Fruti Salvaje';
                caption.querySelector('span').textContent = 'FRUTI SALVAJE · ' + button.dataset.pet + ' / 12';
                caption.querySelector('h3').textContent = button.dataset.name;
                choices.forEach(function (choice) {
                    choice.setAttribute('aria-pressed', String(choice === button));
                });
            });
        });
    }
})();
