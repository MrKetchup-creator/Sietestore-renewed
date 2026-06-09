export default class PosView {

    static users = [
        { email: "admin@sietestore.com", password: "123", role: "admin", name: "Deinnys (Admin)", roleLabel: "Administrador" },
        { email: "vendedor@sietestore.com", password: "123", role: "empleado", name: "Juan (Vendedor)", roleLabel: "Empleado" }
    ];

    static products = [
        { id: 1, name: "Camisa Blanca", price: 35, category: "caballero", talla: "M", color: "Blanco", stock: 3, image: "assets/images/camisa.jpeg" },
        { id: 2, name: "Pantalón Chino Beige", price: 45, category: "caballero", talla: "32", color: "Beige", stock: 3, image: "assets/images/pantalon.jpeg" },
        { id: 3, name: "Vestido Floral Verano", price: 60, category: "dama", talla: "S", color: "Rojo/Flores", stock: 3, image: "assets/images/vestido.jpeg" },
        { id: 4, name: "Blusa Seda Negra", price: 40, category: "dama", talla: "M", color: "Negro", stock: 3, image: "assets/images/blusa.jpeg" },
        { id: 5, name: "Gorra Azul Marino", price: 25, category: "gorra", talla: "Única", color: "Azul Marino", stock: 3, image: "assets/images/gorra.jpeg" }
    ];

    static cart = [];
    static sales = [];

    static renderContent() {
        const isAdmin = window.currentUser?.role === "admin";
        return `
            <div class="pos-layout-inner">
                <div class="products-panel">
                    <div class="search-box">
                        <input type="text" placeholder="Buscar por nombre o código..." onkeyup="window.searchProducts(this.value)">
                    </div>
                    <div class="categories">
                        <button onclick="window.filterProducts('all')" class="active">Todos</button>
                        <button onclick="window.filterProducts('dama')">Dama</button>
                        <button onclick="window.filterProducts('caballero')">Caballero</button>
                        <button onclick="window.filterProducts('gorra')">Gorra</button>
                    </div>
                    <div class="products-grid" id="productsGrid">
                        ${this.renderProducts(this.products)}
                    </div>
                </div>
                <div class="cart-panel" id="cartPanel">
                    ${this.renderCart()}
                </div>
            </div>
        `;
    }

    static renderProducts(products) {
        return products.map(p => `
            <div class="product-card" onclick="window.addToCart(${p.id})">
                <div class="product-img-placeholder"></div>
                <h4>${p.name}</h4>
                <small>${p.talla} • ${p.color}</small>
                <small>Stock: ${p.stock}</small>
                <p>$${p.price}.00</p>
            </div>
        `).join('');
    }

    static renderCart() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        return `
            <div class="cart-header">
                🛒 Venta Activa
                <span class="items-badge">${this.cart.length} items</span>
            </div>
            <div class="cart-body">
                ${this.cart.length === 0
                    ? `<div class="empty-cart">🛍️<br>El carrito está vacío</div>`
                    : this.cart.map(item => `
                        <div class="cart-item">
                            <div class="product-img-placeholder" style="width:62px; height:62px;"></div>
                            <div class="cart-info">
                                <h4>${item.name}</h4>
                                <div class="qty-box">
                                    <button onclick="window.changeQty(${item.id},-1)">−</button>
                                    <span>${item.qty}</span>
                                    <button onclick="window.changeQty(${item.id},1)">+</button>
                                </div>
                            </div>
                            <strong>$${item.price * item.qty}.00</strong>
                            <button class="delete-btn" onclick="window.removeFromCart(${item.id})">🗑</button>
                        </div>
                    `).join('')
                }
            </div>
            <div class="payment-section">
                <h3>Método de pago</h3>
                <div class="payment-options">
                    <button onclick="window.selectPayment('Efectivo')" class="${window.selectedPayment === 'Efectivo' ? 'active' : ''}">Efectivo</button>
                    <button onclick="window.selectPayment('Tarjeta')" class="${window.selectedPayment === 'Tarjeta' ? 'active' : ''}">Tarjeta</button>
                    <button onclick="window.selectPayment('Transferencia')" class="${window.selectedPayment === 'Transferencia' ? 'active' : ''}">Transferencia</button>
                </div>
                <div class="total-row">
                    <span>Total</span>
                    <strong>$${total}.00</strong>
                </div>
                <button class="pay-btn" onclick="window.processPayment()">Procesar Pago</button>
            </div>
        `;
    }
}