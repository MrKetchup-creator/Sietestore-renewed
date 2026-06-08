import LoginController from '../../app/controllers/LoginController.js';
import PosView from '../../app/views/PosView.js';


document.addEventListener("DOMContentLoaded", () => {
    LoginController.init();
});

window.selectedPayment = "Efectivo";

window.filterProducts = function(category){

    let products;

    if(category === "all"){
        products = PosView.products;
    }else{
        products = PosView.products.filter(
            p => p.category === category
        );
    }

    document.getElementById("productsGrid").innerHTML =
        PosView.renderProducts(products);
}

window.addToCart = function(id){

    const product = PosView.products.find(p=>p.id===id);

    if(product.stock <= 0){
        alert("Producto agotado");
        return;
    }

    const existing = PosView.cart.find(p=>p.id===id);

    if(existing){
        existing.qty++;
    }else{
        PosView.cart.push({...product,qty:1});
    }

    product.stock--;

    updateCart();
    refreshProducts();
};

window.changeQty = function(id,change){

    const item = PosView.cart.find(p=>p.id===id);
    const product = PosView.products.find(p=>p.id===id);

    if(change > 0){

        if(product.stock <= 0){
            alert("No hay más stock disponible");
            return;
        }

        item.qty++;
        product.stock--;

    } else {

        item.qty--;
        product.stock++;

        if(item.qty <= 0){
            PosView.cart = PosView.cart.filter(p=>p.id!==id);
        }
    }

    updateCart();
    refreshProducts();
};

window.removeFromCart = function(id){
    PosView.cart = PosView.cart.filter(p=>p.id!==id);
    updateCart();
};

window.selectPayment = function(method){
    window.selectedPayment = method;
    updateCart();
};

window.processPayment = function(){

    if(PosView.cart.length === 0){
        alert("El carrito está vacío");
        return;
    }

    const sale = {

        id: "s" + (PosView.sales.length + 1),

        date: new Date().toLocaleString(),

        payment: window.selectedPayment,

        total: PosView.cart.reduce(
            (sum,item) => sum + (item.price * item.qty),
            0
        ),

        items: [...PosView.cart]
    };

    PosView.sales.push(sale);

    alert(
        "Pedido realizado con éxito\nMétodo de pago: "
        + window.selectedPayment
    );

    PosView.cart = [];
   

    updateCart();
    refreshProducts();
};

function updateCart(){
    document.getElementById("cartPanel").innerHTML =
        PosView.renderCart();
}

window.searchProducts = function(value){

    const search = value.toLowerCase();

    const filtered = PosView.products.filter(product =>
        product.name.toLowerCase().includes(search)
    );

    document.getElementById("productsGrid").innerHTML =
        PosView.renderProducts(filtered);
};

function refreshProducts(){
    document.getElementById("productsGrid").innerHTML =
        PosView.renderProducts(PosView.products);
}

import AdminDashboardView from '../../app/views/AdminDashboardView.js';

window.goDashboard = function(){
    document.getElementById("app").innerHTML =
        AdminDashboardView.render();
};

window.goInventory = function(){
    document.getElementById("app").innerHTML =
        AdminDashboardView.renderInventory();

    AdminDashboardView.bindInventoryEvents();
};

window.goReports = function(){
    document.getElementById("app").innerHTML =
        AdminDashboardView.renderReports();

    AdminDashboardView.bindReportsEvents();
};
window.showReportTab = function(tab){

    document.getElementById("topProductsView").style.display = "none";
    document.getElementById("stockView").style.display = "none";
    document.getElementById("historyView").style.display = "none";

    document.querySelectorAll(".report-tab")
        .forEach(btn => btn.classList.remove("active"));

    if(tab === "top"){
        document.getElementById("topProductsView").style.display = "block";
        document.querySelector('[onclick="showReportTab(\'top\')"]')
            .classList.add("active");
    }

    if(tab === "stock"){
        document.getElementById("stockView").style.display = "block";
        document.querySelector('[onclick="showReportTab(\'stock\')"]')
            .classList.add("active");
    }

    if(tab === "history"){
        document.getElementById("historyView").style.display = "block";
        document.querySelector('[onclick="showReportTab(\'history\')"]')
            .classList.add("active");
    }
}

window.filterTopProducts = function(){

    const category =
        document.getElementById("categoryFilter").value;

    document.getElementById("app").innerHTML =
        AdminDashboardView.renderReports(category);

    AdminDashboardView.bindReportsEvents();
};

const ventasMes = PosView.sales.reduce(
    (sum, sale) => sum + sale.total,
    0
);
window.goPos = function() {
    document.getElementById("app").innerHTML = PosView.render();
};