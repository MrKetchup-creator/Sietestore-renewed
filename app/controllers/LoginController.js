import LoginView from '../views/LoginView.js';
import PosView from '../views/PosView.js';
import AdminDashboardView from '../views/AdminDashboardView.js';

export default class LoginController {

    static selectedRole = "admin";

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

    static init() {
        document.getElementById("app").innerHTML = LoginView.render();
        this.bindEvents();
    }

    static bindEvents() {
        const roleButtons = document.querySelectorAll(".role-btn");

        roleButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                roleButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.selectedRole = btn.dataset.role;
            });
        });

        const loginForm = document.getElementById("loginForm");

        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.login();
        });
    }

    static login() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const user = this.users.find(u => u.email === email);

        if (!user) {
            alert("Correo no registrado");
            return;
        }

        if (user.password !== password) {
            alert("Contraseña incorrecta");
            return;
        }

        if (user.role !== this.selectedRole) {
            alert("Ese usuario no pertenece a ese rol");
            return;
        }

        // Guardar usuario actual
        window.currentUser = user;

        if (user.role === "admin") {
            document.getElementById("app").innerHTML = AdminDashboardView.render();
            return;
        }

        document.getElementById("app").innerHTML = PosView.render();
    }
}