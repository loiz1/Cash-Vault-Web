/* Interacciones de demostración. Ninguna información se envía ni se guarda. */
(function () {
    'use strict';
    var landingForm = document.getElementById('landingForm');
    if (landingForm) landingForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!landingForm.reportValidity()) return;
        var status = document.getElementById('landingStatus');
        status.textContent = 'Demostración: el formulario se completó, pero no se envió a ningún negocio.';
        landingForm.reset();
    });

    if (document.body.classList.contains('coffee-demo')) {
        var motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var revealItems = document.querySelectorAll('.coffee-reveal');
        document.documentElement.classList.add('coffee-js');
        if (motionOff || !('IntersectionObserver' in window)) {
            revealItems.forEach(function (item) { item.classList.add('coffee-in'); });
        } else {
            var revealObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('coffee-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.14, rootMargin: '0px 0px -35px 0px' });
            revealItems.forEach(function (item) { revealObserver.observe(item); });

            var sectionObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    document.querySelectorAll('.coffee-links a').forEach(function (link) {
                        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
                        else link.removeAttribute('aria-current');
                    });
                });
            }, { rootMargin: '-25% 0px -60% 0px' });
            document.querySelectorAll('#carta, #origen, #visitanos').forEach(function (section) { sectionObserver.observe(section); });
        }

        var dateField = document.querySelector('.coffee-reservation input[type="date"]');
        if (dateField) {
            var today = new Date();
            today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
            dateField.min = today.toISOString().slice(0, 10);
        }
    }

    var leads = [
        { name: 'Mariana Torres', company: 'Tienda Central', email: 'mariana@ejemplo.com', stage: 'Nuevo', date: 'Hoy' },
        { name: 'Andrés Rojas', company: 'Servicios Norte', email: 'andres@ejemplo.com', stage: 'En seguimiento', date: 'Ayer' },
        { name: 'Camila Díaz', company: 'Estudio Local', email: 'camila@ejemplo.com', stage: 'Propuesta', date: '12 nov' },
        { name: 'Julián Pérez', company: 'Comercial JP', email: 'julian@ejemplo.com', stage: 'Nuevo', date: '10 nov' }
    ];
    var leadList = document.getElementById('leadList');
    if (leadList) {
        var leadSearch = document.getElementById('leadSearch');
        var leadFilter = document.getElementById('leadFilter');
        var leadForm = document.getElementById('leadForm');
        var leadPanel = document.getElementById('leadPanel');
        var leadStatus = document.getElementById('leadStatus');
        var renderLeads = function () {
            var query = leadSearch.value.trim().toLocaleLowerCase('es');
            var stageFilter = leadFilter.value;
            var rows = leads.filter(function (lead) {
                var text = (lead.name + ' ' + lead.company + ' ' + lead.email).toLocaleLowerCase('es');
                return (!query || text.includes(query)) && (stageFilter === 'Todos' || lead.stage === stageFilter);
            });
            leadList.innerHTML = rows.length ? rows.map(function (lead) {
                return '<tr><td><strong>' + escapeHtml(lead.name) + '</strong></td><td>' + escapeHtml(lead.company) + '</td><td>' + escapeHtml(lead.email) + '</td><td><select aria-label="Etapa de ' + escapeHtml(lead.name) + '" data-lead="' + escapeHtml(lead.email) + '"><option' + selected(lead.stage, 'Nuevo') + '>Nuevo</option><option' + selected(lead.stage, 'En seguimiento') + '>En seguimiento</option><option' + selected(lead.stage, 'Propuesta') + '>Propuesta</option><option' + selected(lead.stage, 'Cerrado') + '>Cerrado</option></select></td><td>' + escapeHtml(lead.date) + '</td></tr>';
            }).join('') : '<tr><td colspan="5" class="demo-empty">No hay contactos que coincidan con esta búsqueda.</td></tr>';
            leadList.querySelectorAll('select[data-lead]').forEach(function (select) {
                select.addEventListener('change', function () {
                    var lead = leads.find(function (item) { return item.email === select.dataset.lead; });
                    if (lead) lead.stage = select.value;
                    renderLeads();
                });
            });
            document.getElementById('leadCount').textContent = String(leads.length);
            document.getElementById('activeLeadCount').textContent = String(leads.filter(function (lead) { return lead.stage !== 'Cerrado'; }).length);
        };
        document.getElementById('addLeadButton').addEventListener('click', function () { leadPanel.hidden = !leadPanel.hidden; if (!leadPanel.hidden) document.getElementById('leadName').focus(); });
        document.getElementById('cancelLead').addEventListener('click', function () { leadPanel.hidden = true; leadForm.reset(); });
        leadSearch.addEventListener('input', renderLeads);
        leadFilter.addEventListener('change', renderLeads);
        leadForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!leadForm.reportValidity()) return;
            var values = new FormData(leadForm);
            leads.unshift({ name: values.get('name'), company: values.get('company'), email: values.get('email'), stage: values.get('stage'), date: 'Ahora' });
            leadForm.reset(); leadPanel.hidden = true;
            leadStatus.textContent = 'Contacto añadido a esta demostración local.';
            renderLeads();
        });
        renderLeads();
    }

    var products = [
        { sku: 'PRD-001', name: 'Producto de ejemplo A', category: 'Categoría 1', price: 45000, qty: 24, min: 5 },
        { sku: 'PRD-002', name: 'Producto de ejemplo B', category: 'Categoría 2', price: 32000, qty: 4, min: 5 },
        { sku: 'PRD-003', name: 'Producto de ejemplo C', category: 'Categoría 1', price: 78500, qty: 13, min: 4 },
        { sku: 'PRD-004', name: 'Producto de ejemplo D', category: 'Categoría 3', price: 21000, qty: 2, min: 5 }
    ];
    var productList = document.getElementById('productList');
    if (productList) {
        var productSearch = document.getElementById('productSearch');
        var productForm = document.getElementById('productForm');
        var productPanel = document.getElementById('productPanel');
        var productStatus = document.getElementById('productStatus');
        var money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
        var renderProducts = function () {
            var query = productSearch.value.trim().toLocaleLowerCase('es');
            var visible = products.map(function (product, index) { return { product: product, index: index }; }).filter(function (row) {
                return (row.product.name + ' ' + row.product.sku + ' ' + row.product.category).toLocaleLowerCase('es').includes(query);
            });
            productList.innerHTML = visible.length ? visible.map(function (row) {
                var product = row.product;
                return '<tr><td><span class="demo-pill">' + escapeHtml(product.sku) + '</span></td><td><strong>' + escapeHtml(product.name) + '</strong></td><td>' + escapeHtml(product.category) + '</td><td>' + money.format(product.price) + '</td><td><span class="stock-control"><button type="button" data-change="-1" data-index="' + row.index + '" aria-label="Restar una unidad a ' + escapeHtml(product.name) + '">−</button><strong class="' + (product.qty <= product.min ? 'stock-low' : 'stock-ok') + '">' + product.qty + '</strong><button type="button" data-change="1" data-index="' + row.index + '" aria-label="Sumar una unidad a ' + escapeHtml(product.name) + '">+</button></span></td><td>' + (product.qty <= product.min ? '<span class="stock-low">Stock bajo</span>' : '<span class="stock-ok">Disponible</span>') + '</td></tr>';
            }).join('') : '<tr><td colspan="6" class="demo-empty">No hay productos que coincidan con esta búsqueda.</td></tr>';
            productList.querySelectorAll('button[data-change]').forEach(function (button) {
                button.addEventListener('click', function () {
                    var row = products[Number(button.dataset.index)];
                    row.qty = Math.max(0, row.qty + Number(button.dataset.change));
                    renderProducts();
                });
            });
            document.getElementById('productCount').textContent = String(products.length);
            document.getElementById('unitCount').textContent = String(products.reduce(function (sum, item) { return sum + item.qty; }, 0));
            document.getElementById('lowStockCount').textContent = String(products.filter(function (item) { return item.qty <= item.min; }).length);
        };
        document.getElementById('addProductButton').addEventListener('click', function () { productPanel.hidden = !productPanel.hidden; if (!productPanel.hidden) document.getElementById('productName').focus(); });
        document.getElementById('cancelProduct').addEventListener('click', function () { productPanel.hidden = true; productForm.reset(); });
        productSearch.addEventListener('input', renderProducts);
        productForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!productForm.reportValidity()) return;
            var values = new FormData(productForm);
            products.unshift({ sku: values.get('sku'), name: values.get('name'), category: values.get('category'), price: Number(values.get('price')), qty: Number(values.get('qty')), min: Number(values.get('min')) });
            productForm.reset(); productPanel.hidden = true;
            productStatus.textContent = 'Producto añadido a esta demostración local.';
            renderProducts();
        });
        renderProducts();
    }

    function selected(value, option) { return value === option ? ' selected' : ''; }
    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; });
    }
}());
