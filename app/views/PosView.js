export default class PosView {

    static users = [
    {
        email: "admin@sietestore.com",
        password: "123",
        role: "admin",
        name: "Deinnys (Admin)",
        roleLabel: "Administrador"
    },
    {
        email: "vendedor@sietestore.com",
        password: "123",
        role: "empleado",
        name: "Juan (Vendedor)",
        roleLabel: "Empleado"
    }
];
    static products = [
    {
        id:1,
        name:"Camisa Blanca",
        price:35,
        category:"caballero",
        talla:"M",
        color:"Blanco",
        stock:3,
        image:"assets/images/camisa.jpeg"
    },
    {
        id:2,
        name:"Pantalón Chino Beige",
        price:45,
        category:"caballero",
        talla:"32",
        color:"Beige",
        stock:3,
        image:"assets/images/pantalon.jpeg"
    },
    {
        id:3,
        name:"Vestido Floral Verano",
        price:60,
        category:"dama",
        talla:"S",
        color:"Rojo/Flores",
        stock:3,
        image:"assets/images/vestido.jpeg"
    },
    {
        id:4,
        name:"Blusa Seda Negra",
        price:40,
        category:"dama",
        talla:"M",
        color:"Negro",
        stock:3,
        image:"assets/images/blusa.jpeg"
    },
    {
        id:5,
        name:"Gorra Azul Marino",
        price:25,
        category:"gorra",
        talla:"Única",
        color:"Azul Marino",
        stock:3,
        image:"assets/images/gorra.jpeg"
    }
];
    static cart = [];

    static sales = [];


    static render() {
    const isAdmin = window.currentUser?.role === "admin";
    // Si no hay usuario o es empleado, solo mostramos el POS (y quizás un botón de logout)
    return `
        <div class="pos-layout">
            <aside class="admin-sidebar">
                <div class="brand">SIETE<span>STORE</span></div>
                <div class="profile">
                    <p>PERFIL</p>
                    <h3>${window.currentUser?.name || "Empleado"}</h3>
                    <span>${window.currentUser?.roleLabel || "Empleado"}</span>
                </div>
                <nav class="menu">
                    ${isAdmin ? '<button onclick="goDashboard()">Dashboard</button>' : ''}
                    <button class="active">Punto de Venta</button>
                    ${isAdmin ? '<button onclick="goInventory()">Inventario</button>' : ''}
                    ${isAdmin ? '<button onclick="goReports()">Reportes</button>' : ''}
                    
                </nav>
                <button class="logout-btn" onclick="location.reload()">Cerrar Sesión</button>
            </aside>
            <!-- Resto del contenido: búsqueda, categorías, grid de productos, carrito -->
            <main class="products-panel">
                <div class="search-box">
                    <input type="text" placeholder="Buscar por nombre o código..." onkeyup="searchProducts(this.value)">
                </div>
                <div class="categories">
                    <button onclick="filterProducts('all')" class="active">Todos</button>
                    <button onclick="filterProducts('dama')">Dama</button>
                    <button onclick="filterProducts('caballero')">Caballero</button>
                    <button onclick="filterProducts('gorra')">Gorra</button>
                </div>
                <div class="products-grid" id="productsGrid">
                    ${this.renderProducts(this.products)}
                </div>
            </main>
            <section class="cart-panel" id="cartPanel">
                ${this.renderCart()}
            </section>
        </div>
    `;
}

    static renderProducts(products){
    return products.map(p=>`
        <div class="product-card" onclick="addToCart(${p.id})">
            <img src="${p.image}" class="product-img">

            <h4>${p.name}</h4>

            <small>${p.talla} • ${p.color}</small>
            <small>Stock: ${p.stock}</small>

            <p>$${p.price}.00</p>
        </div>
    `).join('');
}

    static renderCart(){

    const total = this.cart.reduce((sum,item)=>sum + (item.price * item.qty),0);

    return `
        <div class="cart-header">
            🛒 Venta Activa
            <span class="items-badge">${this.cart.length} items</span>
        </div>

        <div class="cart-body">
            ${
                this.cart.length === 0
                ? `<div class="empty-cart">🛍️<br>El carrito está vacío</div>`
                : this.cart.map(item=>`
                    <div class="cart-item">
                        <img src="${item.image}" class="cart-img">

                        <div class="cart-info">
                            <h4>${item.name}</h4>

                            <div class="qty-box">
                                <button onclick="changeQty(${item.id},-1)">−</button>
                                <span>${item.qty}</span>
                                <button onclick="changeQty(${item.id},1)">+</button>
                            </div>
                        </div>

                        <strong>$${item.price * item.qty}.00</strong>

                        <button class="delete-btn"
                        onclick="removeFromCart(${item.id})">🗑</button>
                    </div>
                `).join('')
            }
        </div>

        <div class="payment-section">
            <h3>Método de pago</h3>

            <div class="payment-options">
                <button onclick="selectPayment('Efectivo')"
                class="${window.selectedPayment==='Efectivo'?'active':''}">
                Efectivo
                </button>

                <button onclick="selectPayment('Tarjeta')"
                class="${window.selectedPayment==='Tarjeta'?'active':''}">
                Tarjeta
                </button>

                <button onclick="selectPayment('Transferencia')"
                class="${window.selectedPayment==='Transferencia'?'active':''}">
                Transferencia
                </button>
            </div>

            <div class="total-row">
                <span>Total</span>
                <strong>$${total}.00</strong>
            </div>

            <button class="pay-btn"
            onclick="processPayment()">
            Procesar Pago
            </button>
        </div>
    `;
}   

}
