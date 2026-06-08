import PosView from './PosView.js';

export default class AdminDashboardView {

    // ============================================================
    // 🟢 MÉTODOS QUE RENDERIZAN SOLO EL CONTENIDO (Sin Sidebar)
    // ============================================================

    static renderDashboardContent() {
        const ventasMes = PosView.sales.reduce((sum, sale) => sum + sale.total, 0);
        const hoy = new Date().toLocaleDateString();
        const ventasHoy = PosView.sales
            .filter(sale => sale.date === hoy) // 🔥 Coincidencia exacta de fecha
            .reduce((sum, sale) => sum + sale.total, 0);
        const totalStock = PosView.products.reduce((sum, product) => sum + product.stock, 0);
        const stockCritico = PosView.products.filter(product => product.stock <= 1).length;

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
                    <h2>${totalStock}</h2>
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
                    <div class="alert-list">
                        ${PosView.products.filter(p => p.stock <= 1).length > 0
                            ? PosView.products.filter(p => p.stock <= 1).map(p => `
                                <div class="alert-item">
                                    <span class="alert-product">${p.name}</span>
                                    <span class="alert-stock ${p.stock === 0 ? 'status-out' : 'status-danger'}">${p.stock}</span>
                                </div>
                            `).join('')
                            : '<p class="text-muted">No hay productos críticos.</p>'
                        }
                    </div>
                </div>
            </section>

            <section class="sales-table">
                <h3>Últimas Ventas</h3>
                <table class="report-table">
                    <thead>
                        <tr><th>ID VENTA</th><th>FECHA</th><th>ITEMS</th><th>MÉTODO</th><th>TOTAL</th></tr>
                    </thead>
                    <tbody>
                        ${PosView.sales.length > 0
                            ? PosView.sales.slice().reverse().map(sale => `
                                <tr>
                                    <td>#${sale.id}</td>
                                    <td>${sale.date}</td>
                                    <td>${sale.items.length} prendas</td>
                                    <td>${sale.payment}</td>
                                    <td><span class="stock-number">$${sale.total}.00</span></td>
                                </tr>
                            `).join('')
                            : '<tr><td colspan="5">No hay ventas registradas</td></tr>'
                        }
                    </tbody>
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
                    <thead>
                        <tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>TALLA / COLOR</th><th>PRECIO</th><th>STOCK</th></tr>
                    </thead>
                    <tbody>
                        ${PosView.products.map(product => `
                            <tr>
                                <td>
                                    <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 15px; vertical-align: middle;">
                                    ${product.name}
                                </td>
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

    // ============================================================
    // 📊 REPORTES CON DISEÑO ESTABLE Y UNIFICADO
    // ============================================================

    static renderReportsContent() {
        const productsSold = {};
        PosView.sales.forEach(sale => {
            sale.items.forEach(item => {
                productsSold[item.name] = (productsSold[item.name] || 0) + item.qty;
            });
        });
        const topProducts = Object.entries(productsSold).sort((a, b) => b[1] - a[1]);

        return `
            <div class="reports-header">
                <div>
                    <h1>Reportes Gerenciales</h1>
                    <p>Análisis de ventas e inventario para toma de decisiones.</p>
                </div>
                <button class="export-btn">⬇ Exportar</button>
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
                        <label>Categoría <select><option>Todas</option><option>Dama</option><option>Caballero</option><option>Gorra</option></select></label>
                    </div>
                    <h2>Top Productos Más Vendidos</h2>
                    <table class="report-table">
                        <thead>
                            <tr><th>Producto</th><th>Unidades Vendidas</th></tr>
                        </thead>
                        <tbody>
                            ${topProducts.length > 0
                                ? topProducts.map(p => `<tr><td>${p[0]}</td><td>${p[1]}</td></tr>`).join('')
                                : '<tr><td colspan="2">No hay ventas registradas.</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
                <div id="stockView" style="display:none;">
                    <h2>Productos con Stock Bajo</h2>
                    <table class="report-table">
                        <thead>
                            <tr><th>Producto</th><th>Stock</th><th>Estado</th></tr>
                        </thead>
                        <tbody>
                            ${PosView.products.filter(p => p.stock <= 3).map(p => `
                                <tr>
                                    <td>${p.name}</td>
                                    <td>${p.stock}</td>
                                    <td>${p.stock === 0 ? '<span class="status-out">Agotado</span>' : p.stock === 1 ? '<span class="status-danger">Crítico</span>' : '<span class="status-good">Bueno</span>'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div id="historyView" style="display:none;">
                    <h2>Historial de Ventas</h2>
                    <table class="report-table">
                        <thead>
                            <tr><th>ID</th><th>Fecha</th><th>Método</th><th>Total</th></tr>
                        </thead>
                        <tbody>
                            ${PosView.sales.length > 0
                                ? PosView.sales.map(s => `<tr><td>#${s.id}</td><td>${s.date}</td><td>${s.payment}</td><td><span class="stock-number">$${s.total}.00</span></td></tr>`).join('')
                                : '<tr><td colspan="4">No hay ventas registradas</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // ============================================================
    // 🔧 LÓGICA DE MODALES (Sin cambios, pero robusta)
    // ============================================================

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
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement("div");
        modal.id = "new-product-modal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal">
                <h2>Nuevo Producto</h2>
                <input id="productName" placeholder="Nombre">
                <input id="productPrice" type="number" placeholder="Precio">
                <input id="productStock" type="number" placeholder="Stock">
                <input id="productTalla" placeholder="Talla">
                <input id="productColor" placeholder="Color">
                <select id="productCategory">
                    <option value="dama">Dama</option>
                    <option value="caballero">Caballero</option>
                    <option value="gorra">Gorra</option>
                </select>
                <input id="productImage" placeholder="Ruta imagen">
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
            document.getElementById("new-product-modal").remove();
        });
    }

    static removeNewProductModal() {
        const existingModal = document.getElementById("new-product-modal");
        if (existingModal) {
            existingModal.remove();
        }
    }

    static createProduct() {
        const newProduct = {
            id: PosView.products.length + 1,
            name: document.getElementById("productName").value,
            price: Number(document.getElementById("productPrice").value),
            stock: Number(document.getElementById("productStock").value),
            talla: document.getElementById("productTalla").value,
            color: document.getElementById("productColor").value,
            category: document.getElementById("productCategory").value,
            image: document.getElementById("productImage").value || "assets/images/gorra.jpeg"
        };
        PosView.products.push(newProduct);
        window.navegarA('inventory');
    }

    static drawSalesChart() {
        const canvas = document.getElementById("salesWeekChart");
        if (!canvas) return;

        const sales = PosView.sales || [];
        const today = new Date();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            last7Days.push(d.toLocaleDateString());
        }

        const dailyTotals = new Array(7).fill(0);
        sales.forEach(sale => {
            const dayIndex = last7Days.findIndex(day => day === sale.date);
            if (dayIndex !== -1) dailyTotals[dayIndex] += sale.total;
        });

        const labels = last7Days.map(day => day.split('/').slice(0,2).join('/'));
        if (window.salesChartInstance) window.salesChartInstance.destroy();

        const ctx = canvas.getContext('2d');
        window.salesChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas ($)',
                    data: dailyTotals,
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

    static bindReportsEvents() {}
}