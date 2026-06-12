import PosView from './PosView.js';

export default class AdminDashboardView {

    static async renderDashboardContent() {
        const stats = await this.loadDashboardStats();
        
        if (!stats) {
            return `<div class="error">Error cargando datos del dashboard</div>`;
        }

        const ventasMes = stats.ventasMes || 0;
        const ventasHoy = stats.ventasHoy || 0;
        const stockTotal = stats.stockTotal || 0;
        const stockCritico = stats.stockCritico || 0;

        const labels = [];
        const data = [];
        if (stats.ventasPorDia) {
            stats.ventasPorDia.forEach(dia => {
                const fecha = new Date(dia[0]);
                labels.push(`${fecha.getDate()}/${fecha.getMonth() + 1}`);
                data.push(dia[1]);
            });
        }

        while (labels.length < 7) {
            const today = new Date();
            const day = new Date(today);
            day.setDate(today.getDate() - (6 - labels.length));
            labels.push(`${day.getDate()}/${day.getMonth() + 1}`);
            data.push(0);
        }

        return `
            <header class="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Resumen de actividad y métricas clave.</p>
                </div>
                <div class="date-box">${new Date().toLocaleDateString()}</div>
            </header>

            <section class="stats-grid">
                <div class="stat-card">
                    <h4>Ventas del Mes</h4>
                    <h2>$${ventasMes.toFixed(2)}</h2>
                </div>
                <div class="stat-card">
                    <h4>Ventas de Hoy</h4>
                    <h2>$${ventasHoy.toFixed(2)}</h2>
                </div>
                <div class="stat-card">
                    <h4>Total en Stock</h4>
                    <h2>${stockTotal}</h2>
                </div>
                <div class="stat-card danger">
                    <h4>Stock Crítico</h4>
                    <h2>${stockCritico}</h2>
                </div>
            </section>

            <section class="dashboard-main">
                <div class="chart-box">
                    <h3>Ventas (Últimos 7 días)</h3>
                    <canvas id="salesWeekChart" width="400" height="200" style="max-width:100%; height:auto;"></canvas>
                </div>
                <div class="alerts-box">
                    <h3>Alertas de Stock</h3>
                    <div class="alert-list" id="alertList"></div>
                </div>
            </section>

            <section class="sales-table">
                <h3>Últimas Ventas</h3>
                <table class="report-table">
                    <thead><tr><th>ID VENTA</th><th>FECHA</th><th>MÉTODO</th><th>VENDEDOR</th><th>TOTAL</th></tr></thead>
                    <tbody id="ultimasVentasTable"></tbody>
                </table>
            </section>
        `;
    }

    static renderInventoryContent() {
        return `
            <div class="inventory-header">
                <div>
                    <h1>Inventario</h1>
                    <p>Gestión del catálogo de productos y stock.</p>
                </div>
                <button class="export-btn" id="btn-new-product">+ Nuevo Producto</button>
            </div>
            <div class="inventory-table">
                <table>
                    <thead><tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>TALLA / COLOR</th><th>PRECIO</th><th>STOCK</th></tr></thead>
                    <tbody>
                        ${PosView.products.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td><span class="category-badge">${product.category}</span></td>
                                <td>${product.talla}<br>${product.color}</td>
                                <td>$${product.price}.00</td>
                                <td class="stock-number ${product.stock <= 3 ? 'stock-low' : ''}">${product.stock}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderReportsContent() {
        return `
            <div class="reports-header">
                <div>
                    <h1>Reportes Gerenciales</h1>
                    <p>Análisis de ventas e inventario para toma de decisiones.</p>
                </div>
                <button class="export-btn" onclick="window.exportReport()">⬇ Exportar</button>
            </div>
            <div class="reports-tabs">
                <button class="report-tab active" id="tab-top" onclick="window.showReportTab('top')">📈 Más Vendidos</button>
                <button class="report-tab" id="tab-stock" onclick="window.showReportTab('stock')">⚠ Stock Bajo</button>
                <button class="report-tab" id="tab-history" onclick="window.showReportTab('history')">🕒 Historial</button>
            </div>
            <div class="reports-card">
                <div id="topProductsView">
                    <div class="filters">
                        <label>Período <select><option>Últimos 7 días</option><option>Últimos 30 días</option></select></label>
                    </div>
                    <h2>Top Productos Más Vendidos</h2>
                    <table class="report-table">
                        <thead><tr><th>Producto</th><th>Unidades Vendidas</th></tr></thead>
                        <tbody id="topProductsTable"><tr><td colspan="2">Cargando datos...</td></tr></tbody>
                    </table>
                </div>
                <div id="stockView" style="display:none;">
                    <h2>Productos con Stock Bajo</h2>
                    <table class="report-table">
                        <thead><tr><th>Producto</th><th>Stock</th><th>Estado</th></tr></thead>
                        <tbody id="stockBajoTable"><tr><td colspan="3">Cargando datos...</td></tr></tbody>
                    </table>
                </div>
                <div id="historyView" style="display:none;">
                    <h2>Historial de Ventas</h2>
                    <table class="report-table">
                        <thead><tr><th>ID</th><th>Fecha</th><th>Método</th><th>Total</th><th>Recibo</th></tr></thead>
                        <tbody id="historialVentasTable"><tr><td colspan="5">Cargando historial...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static bindInventoryEvents() {
        const newProductBtn = document.getElementById("btn-new-product");
        if (newProductBtn) {
            newProductBtn.addEventListener("click", () => {
                AdminDashboardView.showNewProductModal();
            });
        }
    }

    static showNewProductModal() {
        const existingModal = document.getElementById("new-product-modal");
        if (existingModal) existingModal.remove();

        const modal = document.createElement("div");
        modal.id = "new-product-modal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal">
                <h2>Nuevo Producto</h2>
                <input id="productName" placeholder="Nombre">
                <input id="productPrice" type="number" placeholder="Precio de venta">
                <input id="productCost" type="number" placeholder="Costo"> 
                <input id="productStock" type="number" placeholder="Stock">
                <input id="productTalla" placeholder="Talla">
                <input id="productColor" placeholder="Color">
                <select id="productCategory">
                    <option value="dama">Dama</option>
                    <option value="caballero">Caballero</option>
                    <option value="gorra">Gorra</option>
                </select>
                <div class="modal-buttons">
                    <button id="cancelProduct">Cancelar</button>
                    <button id="saveProduct">Crear Producto</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById("cancelProduct").addEventListener("click", () => {
            document.getElementById("new-product-modal").remove();
        });
        document.getElementById("saveProduct").addEventListener("click", () => {
            AdminDashboardView.createProduct();
        });
    }

    static removeNewProductModal() {
        const existingModal = document.getElementById("new-product-modal");
        if (existingModal) existingModal.remove();
    }

    static async createProduct() {
        if (!window.currentUser || !window.currentUser.id) {
            alert("Error: No hay sesión activa. Por favor, recarga la página y vuelve a iniciar sesión.");
            return;
        }

        const nuevoProducto = {
            codigoReferencia: "PROD-" + Date.now(),
            nombre: document.getElementById("productName").value,
            idCategoria: document.getElementById("productCategory").value === 'dama' ? 1 : 
                        document.getElementById("productCategory").value === 'caballero' ? 2 : 3,
            talla: document.getElementById("productTalla").value,
            color: document.getElementById("productColor").value,
            precioVenta: Number(document.getElementById("productPrice").value),
            costo: Number(document.getElementById("productCost").value),
            stockActual: Number(document.getElementById("productStock").value),
            stockMinimo: 5,
            activo: true
        };

        if (!nuevoProducto.costo || nuevoProducto.costo <= 0) {
            alert("El costo debe ser un número positivo.");
            return;
        }

        try {
            const response = await fetch(`${window.API_BASE_URL}/api/productos`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-User-Id': window.currentUser.id.toString()
                },
                body: JSON.stringify(nuevoProducto)
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                alert("Error del servidor: " + errorMsg);
                return;
            }

            alert("✅ Producto creado exitosamente");
            document.getElementById("new-product-modal").remove();
            await window.loadData();
            window.navegarA('inventory');
        } catch (error) {
            console.error('Error al crear producto:', error);
            alert("Error de conexión con el servidor.");
        }
    }

    static drawSalesChart(labels, data) {
        const canvas = document.getElementById("salesWeekChart");
        if (!canvas) return;

        if (window.salesChartInstance) window.salesChartInstance.destroy();

        const ctx = canvas.getContext('2d');
        window.salesChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas ($)',
                    data: data,
                    backgroundColor: '#09142f',
                    borderRadius: 8,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { callbacks: { label: (ctx) => `$${ctx.raw.toFixed(2)}` } }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Monto ($)' }, ticks: { callback: (value) => `$${value}` } },
                    x: { title: { display: true, text: 'Día' } }
                }
            }
        });
    }

    static async loadDashboardStats() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/api/stats`);
            if (!response.ok) throw new Error('Error al cargar estadísticas');
            return await response.json();
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            return null;
        }
    }

    static async loadAlertasStock() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/api/productos/low-stock?threshold=3`);
            if (!response.ok) throw new Error('Error cargando alertas');
            const productos = await response.json();
            
            const alertList = document.getElementById('alertList');
            if (productos.length === 0) {
                alertList.innerHTML = '<p class="text-muted">No hay productos críticos.</p>';
                return;
            }
            
            alertList.innerHTML = productos.map(p => `
                <div class="alert-item">
                    <span class="alert-product">${p.nombre}</span>
                    <span class="alert-stock ${p.stockActual === 0 ? 'status-out' : 'status-danger'}">${p.stockActual}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error cargando alertas:', error);
        }
    }

    static async loadUltimasVentas() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/api/ventas?limit=5`);
            if (!response.ok) throw new Error('Error cargando ventas');
            const ventas = await response.json();
            
            const tableBody = document.getElementById('ultimasVentasTable');
            if (!tableBody) return;
            
            if (ventas.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">No hay ventas registradas</td></tr>';
                return;
            }
            
            tableBody.innerHTML = ventas.map(v => `
                <tr>
                    <td>#${v.id_venta}</td>
                    <td>${new Date(v.fecha_hora).toLocaleDateString()}</td>
                    <td>${v.metodo_pago}</td>
                    <td>${v.usuario_nombre}</td>
                    <td><span class="stock-number">$${v.total_venta.toFixed(2)}</span></td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error cargando ventas:', error);
        }
    }

    static async loadHistorialVentas() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/api/ventas`);
            if (!response.ok) throw new Error('Error cargando historial');
            const ventas = await response.json();
            
            const tableBody = document.getElementById('historialVentasTable');
            if (!tableBody) return;
            
            if (ventas.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">No hay ventas registradas</td></tr>';
                return;
            }
            
            tableBody.innerHTML = ventas.map(v => `
                <tr>
                    <td>#${v.id_venta}</td>
                    <td>${new Date(v.fecha_hora).toLocaleDateString()}</td>
                    <td>${v.metodo_pago}</td>
                    <td><span class="stock-number">$${v.total_venta.toFixed(2)}</span></td>
                    <td>
                        <button onclick="window.downloadReceipt(${v.id_venta})" 
                            style="background-color: #07142e; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                            Recibo
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error cargando historial de ventas:', error);
            const tableBody = document.getElementById('historialVentasTable');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="5">Error al cargar el historial</td></tr>';
            }
        }
    }

    static async loadTopProducts() {
        const tableBody = document.getElementById('topProductsTable');
        if (!tableBody) return;

        const categorySelect = document.querySelector('#topProductsView select:nth-of-type(2)');
        let categoryId = null;
        if (categorySelect) {
            const map = { 'Todas': null, 'Dama': 1, 'Caballero': 2, 'Gorra': 3 };
            categoryId = map[categorySelect.value] || null;
        }

        try {
            let url = `${window.API_BASE_URL}/api/dashboard/top-productos`;
            if (categoryId !== null) url += `?categoryId=${categoryId}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            const productos = await response.json();

            if (productos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="2">No hay ventas registradas.</td></tr>';
                return;
            }

            tableBody.innerHTML = productos.map(p => `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.totalVendido}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error cargando top productos:', error);
            tableBody.innerHTML = '<tr><td colspan="2" style="color: #ff365f;">⚠ Error al cargar los datos. Revisa la consola.</td></tr>';
        }
    }

    static async loadStockBajo() {
        const tableBody = document.getElementById('stockBajoTable');
        if (!tableBody) return;

        try {
            const response = await fetch(`${window.API_BASE_URL}/api/productos/low-stock?threshold=3`);
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            const productos = await response.json();
            
            if (productos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3">No hay productos con stock bajo.</td></tr>';
                return;
            }
            
            tableBody.innerHTML = productos.map(p => `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.stockActual}</td>
                    <td>${p.stockActual === 0 ? '<span class="status-out">Agotado</span>' : p.stockActual <= 1 ? '<span class="status-danger">Crítico</span>' : '<span class="status-good">Bueno</span>'}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error cargando stock bajo:', error);
            tableBody.innerHTML = '<tr><td colspan="3" style="color: #ff365f;">⚠ Error al cargar los datos. Revisa la consola.</td></tr>';
        }
    }
}