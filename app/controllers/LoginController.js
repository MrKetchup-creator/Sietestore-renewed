import LoginView from '../views/LoginView.js';
import { API_BASE_URL } from '../../assets/js/config.js';

export default class LoginController {

    static selectedRole = "admin";

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

    static async login() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            // 🔥 Asegúrate de que API_BASE_URL esté importado o definido globalmente
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                alert(errorMsg);
                return;
            }

            const user = await response.json();

            if (user.role.toLowerCase() !== this.selectedRole) {
                alert(`Este usuario es ${user.roleLabel}, no puede acceder como ${this.selectedRole === 'admin' ? 'Administrador' : 'Empleado'}`);
                return;
            }

            window.currentUser = user;
            await window.loadData();

            if (user.role.toLowerCase() === 'admin') {
                window.navegarA('dashboard');
            } else {
                window.navegarA('pos');
            }

        } catch (error) {
            console.error('Error en el login:', error);
            alert("Error de conexión con el servidor. Asegúrate de que el backend esté corriendo en localhost:8080.");
        }
    }
}