import LoginView from '/app/views/LoginView.js';
import LoginController from '/app/controllers/LoginController.js';
import PosView from '/app/views/PosView.js';
import AdminDashboardView from '/app/views/AdminDashboardView.js';

document.addEventListener("DOMContentLoaded", () => {
    window.navegarA('login');
});

// -------- CONFIGURACIÓN GLOBAL DEL POS ---------
window.selectedPayment = "Efectivo";
window.currentCategory = "all"; // 🔥 Para recordar el filtro actual

// -------- FUNCIONES GLOBALES DEL POS ---------
window.filterProducts = function(category) {
    window.currentCategory = category;
    let products;
    if (category === "all") {
        products = PosView.products;
    } else {
        products = PosView.products.filter(p => p.category === category);
    }
    document.getElementById("productsGrid").innerHTML = PosView.renderProducts(products);
    document.querySelectorAll('.categories button').forEach(b => b.classList.remove('active'));
    const targetBtn = Array.from(document.querySelectorAll('.categories button'))
        .find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${category}'`));
    if (targetBtn) targetBtn.classList.add('active');
};

window.addToCart = function(id) {
    const product = PosView.products.find(p => p.id === id);
    if (product.stock <= 0) { alert("Producto agotado"); return; }
    const existing = PosView.cart.find(p => p.id === id);
    if (existing) existing.qty++;
    else PosView.cart.push({ ...product, qty: 1 });
    product.stock--;
    updateCart();
    refreshProducts();
};

window.changeQty = function(id, change) {
    const item = PosView.cart.find(p => p.id === id);
    const product = PosView.products.find(p => p.id === id);
    if (change > 0) {
        if (product.stock <= 0) { alert("No hay más stock disponible"); return; }
        item.qty++;
        product.stock--;
    } else {
        item.qty--;
        product.stock++;
        if (item.qty <= 0) PosView.cart = PosView.cart.filter(p => p.id !== id);
    }
    updateCart();
    refreshProducts();
};

window.removeFromCart = function(id) {
    PosView.cart = PosView.cart.filter(p => p.id !== id);
    updateCart();
};

window.selectPayment = function(method) {
    window.selectedPayment = method;
    updateCart();
};

window.processPayment = function() {
    if (PosView.cart.length === 0) { alert("El carrito está vacío"); return; }
    const sale = {
        id: "s" + (PosView.sales.length + 1),
        // 🔥 CORRECCIÓN CRUCIAL: Guardamos la fecha sin hora para que el gráfico funcione
        date: new Date().toLocaleDateString(), 
        payment: window.selectedPayment,
        total: PosView.cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
        items: [...PosView.cart]
    };
    PosView.sales.push(sale);
    alert("Pedido realizado con éxito\nMétodo de pago: " + window.selectedPayment);
    PosView.cart = [];
    updateCart();
    refreshProducts();
};

window.searchProducts = function(value) {
    const search = value.toLowerCase();
    const filtered = PosView.products.filter(product => product.name.toLowerCase().includes(search));
    document.getElementById("productsGrid").innerHTML = PosView.renderProducts(filtered);
};

function updateCart() { document.getElementById("cartPanel").innerHTML = PosView.renderCart(); }

function refreshProducts() {
    const category = window.currentCategory;
    let products;
    if (category === "all") {
        products = PosView.products;
    } else {
        products = PosView.products.filter(p => p.category === category);
    }
    document.getElementById("productsGrid").innerHTML = PosView.renderProducts(products);
}

// -------- NAVEGACIÓN UNIFICADA Y ABSOLUTAMENTE ESTABLE ---------
window.navegarA = function(vista) {
    const app = document.getElementById('app');

    if (vista === 'login') {
        app.innerHTML = LoginView.render();
        LoginController.bindEvents();
        return;
    }

    const isAdmin = window.currentUser?.role === "admin";
    let sidebarButtons = '';

    if (isAdmin) {
        sidebarButtons += `
            <button class="${vista === 'dashboard' ? 'active' : ''}" onclick="window.navegarA('dashboard')">Dashboard</button>
            <button class="${vista === 'inventory' ? 'active' : ''}" onclick="window.navegarA('inventory')">Inventario</button>
            <button class="${vista === 'reports' ? 'active' : ''}" onclick="window.navegarA('reports')">Reportes</button>
        `;
    }
    sidebarButtons += `
        <button class="${vista === 'pos' ? 'active' : ''}" onclick="window.navegarA('pos')">Punto de Venta</button>
    `;

    let contentHTML = '';
    if (vista === 'dashboard') {
        contentHTML = AdminDashboardView.renderDashboardContent();
    } else if (vista === 'inventory') {
        AdminDashboardView.removeNewProductModal();
        contentHTML = AdminDashboardView.renderInventoryContent();
    } else if (vista === 'reports') {
        contentHTML = AdminDashboardView.renderReportsContent();
    } else if (vista === 'pos') {
        contentHTML = PosView.renderContent();
    }

    app.innerHTML = `
        <div class="dashboard-layout">
            <aside class="admin-sidebar">
                <div class="brand">SIETE<span>STORE</span></div>
                <div class="profile">
                    <p>PERFIL</p>
                    <h3>${window.currentUser?.name || "Administrador"}</h3>
                    <span>${window.currentUser?.roleLabel || "Administrador"}</span>
                </div>
                <nav class="menu">
                    ${sidebarButtons}
                </nav>
                <button class="logout-btn" onclick="window.navegarA('login')">Cerrar Sesión</button>
            </aside>
            <main class="admin-content" id="dynamic-content">
                ${contentHTML}
            </main>
        </div>
    `;

    if (vista === 'dashboard') {
        // 🔥 Pequeño delay para asegurar que el canvas existe antes de dibujar
        setTimeout(() => AdminDashboardView.drawSalesChart(), 150);
    } else if (vista === 'inventory') {
        AdminDashboardView.bindInventoryEvents();
    } else if (vista === 'reports') {
        // 🔥 Aseguramos que la pestaña inicial se muestre correctamente sin "fade out"
        setTimeout(() => window.showReportTab('top'), 50);
    }
};

window.showReportTab = function(tab) {
    // 1. Ocultar todas las vistas
    document.getElementById("topProductsView").style.display = "none";
    document.getElementById("stockView").style.display = "none";
    document.getElementById("historyView").style.display = "none";

    // 2. Quitar la clase 'active' de todos los botones
    document.querySelectorAll(".report-tab").forEach(b => b.classList.remove("active"));

    // 3. Mostrar la vista y activar el botón correspondiente usando IDs
    if (tab === "top") {
        document.getElementById("topProductsView").style.display = "block";
        document.getElementById("tab-top").classList.add("active");
    } else if (tab === "stock") {
        document.getElementById("stockView").style.display = "block";
        document.getElementById("tab-stock").classList.add("active");
    } else if (tab === "history") {
        document.getElementById("historyView").style.display = "block";
        document.getElementById("tab-history").classList.add("active");
    }
};