import LoginView from '/app/views/LoginView.js';
import LoginController from '/app/controllers/LoginController.js';
import PosView from '/app/views/PosView.js';
import AdminDashboardView from '/app/views/AdminDashboardView.js';

document.addEventListener("DOMContentLoaded", () => {
    window.navegarA('login');
});

// -------- CONFIGURACIÓN GLOBAL DEL POS ---------
window.selectedPayment = "Efectivo";
window.currentCategory = "all";

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

// -------- PROCESAR PAGO ---------
window.processPayment = async function() {
    if (PosView.cart.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    const payload = {
        idUsuario: window.currentUser.id,
        metodoPago: window.selectedPayment,
        detalles: PosView.cart.map(item => ({
            idProducto: item.id,
            cantidad: item.qty
        }))
    };

    try {
        const response = await fetch('http://localhost:8080/api/ventas/procesar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            alert("Error al procesar la venta: " + errorMsg);
            return;
        }

        const ventaCreada = await response.json();
        alert(`✅ Venta #${ventaCreada.idVenta} procesada con éxito.\nMétodo de pago: ${window.selectedPayment}`);

        PosView.cart = [];
        updateCart();
        refreshProducts();

        const isDashboardVisible = document.querySelector('.stat-card') !== null;
        if (isDashboardVisible && window.currentUser?.role === "admin") {
            try {
                const stats = await AdminDashboardView.loadDashboardStats();
                if (stats) {
                    document.querySelector('.stat-card:nth-child(1) h2').textContent = `$${stats.ventasMes.toFixed(2)}`;
                    document.querySelector('.stat-card:nth-child(2) h2').textContent = `$${stats.ventasHoy.toFixed(2)}`;
                    document.querySelector('.stat-card:nth-child(3) h2').textContent = stats.stockTotal;
                    document.querySelector('.stat-card:nth-child(4) h2').textContent = stats.stockCritico;
                    
                    if (stats.ventasPorDia) {
                        const labels = [];
                        const data = [];
                        stats.ventasPorDia.forEach(dia => {
                            const fecha = new Date(dia[0]);
                            labels.push(`${fecha.getDate()}/${fecha.getMonth() + 1}`);
                            data.push(dia[1]);
                        });
                        AdminDashboardView.drawSalesChart(labels, data);
                    }
                    AdminDashboardView.loadAlertasStock();
                    AdminDashboardView.loadUltimasVentas();
                }
            } catch (dashboardError) {
                console.warn("No se pudo actualizar el dashboard (probablemente no está visible):", dashboardError);
            }
        }

    } catch (error) {
        console.error('Error al procesar venta:', error);
        alert("Error al procesar la venta. Revisa la consola para más detalles.");
    }
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

// -------- CARGAR DATOS DESDE EL BACKEND ---------
window.loadData = async function() {
    try {
        const productsResponse = await fetch('http://localhost:8080/api/productos');
        if (!productsResponse.ok) throw new Error('No se pudo cargar productos');
        const productsData = await productsResponse.json();

        PosView.products = productsData.map(p => ({
            id: p.idProducto,
            name: p.nombre,
            price: p.precioVenta,
            category: p.idCategoria === 1 ? 'dama' : 
                      p.idCategoria === 2 ? 'caballero' : 
                      p.idCategoria === 3 ? 'gorra' : 'dama',
            talla: p.talla,
            color: p.color,
            stock: p.stockActual,
            image: 'assets/images/placeholder.png'
        }));

        console.log('Productos cargados:', PosView.products.length);
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
};

// -------- NAVEGACIÓN ENTRE VISTAS ---------
window.navegarA = async function(vista) {
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
        contentHTML = await AdminDashboardView.renderDashboardContent();
    } else if (vista === 'inventory') {
        AdminDashboardView.removeNewProductModal();
        contentHTML = AdminDashboardView.renderInventoryContent();
        setTimeout(() => AdminDashboardView.bindInventoryEvents(), 150);
    } else if (vista === 'reports') {
        // 🔥 1. Asignar el contenido HTML de los reportes
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
        setTimeout(async () => {
            const stats = await AdminDashboardView.loadDashboardStats();
            if (stats && stats.ventasPorDia) {
                const labels = [];
                const data = [];
                stats.ventasPorDia.forEach(dia => {
                    const fecha = new Date(dia[0]);
                    labels.push(`${fecha.getDate()}/${fecha.getMonth() + 1}`);
                    data.push(dia[1]);
                });
                AdminDashboardView.drawSalesChart(labels, data);
            }
            AdminDashboardView.loadAlertasStock();
            AdminDashboardView.loadUltimasVentas();
        }, 150);
    }

    // 🔥 2. Si es la vista de reportes, simular un clic en la pestaña "Más Vendidos" después de que el DOM esté listo
    if (vista === 'reports') {
        // No hay que hacer clic. Solo llamar a la función. Su propio mecanismo interno
        // (reportTabRetryCount) se encargará de reintentar hasta que el DOM esté listo.
        setTimeout(async () => {
            await window.showReportTab('top');
        }, 200);
    }
};


let reportTabRetryCount = 0;
const MAX_RETRIES = 10;

window.showReportTab = async function(tab) {
    const topProductsView = document.getElementById('topProductsView');
    const stockView = document.getElementById('stockView');
    const historyView = document.getElementById('historyView');
    const tabs = document.querySelectorAll('.report-tab');

    // Si algún elemento no existe, esperar, pero con límite
    if (!topProductsView || !stockView || !historyView) {
        reportTabRetryCount++;
        if (reportTabRetryCount >= MAX_RETRIES) {
            console.error('Error crítico: No se pudieron cargar los elementos de reportes después de', MAX_RETRIES, 'intentos.');
            return; // Salir para evitar el bucle infinito
        }
        console.warn(`Elementos de reportes aún no cargados. Reintentando (${reportTabRetryCount}/${MAX_RETRIES})...`);
        setTimeout(() => window.showReportTab(tab), 100);
        return;
    }

    // Reiniciar el contador al cargar exitosamente
    reportTabRetryCount = 0;

    // 1. Ocultar todas las vistas
    topProductsView.style.display = "none";
    stockView.style.display = "none";
    historyView.style.display = "none";

    // 2. Quitar la clase 'active' de todos los botones
    tabs.forEach(b => b.classList.remove("active"));

    // 3. Mostrar la vista y activar el botón
    if (tab === "top") {
        topProductsView.style.display = "block";
        document.getElementById("tab-top").classList.add("active");
        await AdminDashboardView.loadTopProducts();
    } else if (tab === "stock") {
        stockView.style.display = "block";
        document.getElementById("tab-stock").classList.add("active");
        await AdminDashboardView.loadStockBajo();
    } else if (tab === "history") {
        historyView.style.display = "block";
        document.getElementById("tab-history").classList.add("active");
        await AdminDashboardView.loadHistorialVentas();
    }
};


window.exportReport = async function() {
    const activeTab = document.querySelector('.report-tab.active');
    let type = 'top';
    if (activeTab) {
        const tabId = activeTab.id;
        if (tabId === 'tab-top') type = 'top';
        else if (tabId === 'tab-stock') {
            alert("La exportación de Stock Bajo no está disponible en esta versión.");
            return;
        }
        else if (tabId === 'tab-history') type = 'history';
    }

    let url = `http://localhost:8080/api/reports/export?type=${type}`;
    
    if (type === 'top') {
        const categorySelect = document.querySelector('#topProductsView select:nth-of-type(2)');
        if (categorySelect) {
            const map = { 'Todas': null, 'Dama': 1, 'Caballero': 2, 'Gorra': 3 };
            const categoryId = map[categorySelect.value] || null;
            if (categoryId !== null) url += `&categoryId=${categoryId}`;
        }
    }

    window.location.href = url;
};


window.downloadReceipt = function(id) {
    window.open('http://localhost:8080/api/ventas/' + id + '/recibo', '_blank');
};

//futuras funciones para el dashboard y reportes se agregarán aquí
