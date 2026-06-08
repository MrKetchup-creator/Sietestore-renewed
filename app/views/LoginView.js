export default class LoginView {
    static render() {
        return `
        <div class="login-card">

            <div class="login-header">
                <div class="logo">SIETE<span>STORE</span></div>
                <p class="subtitle">Sistema de Gestión de Tienda</p>
            </div>

            <div class="login-body">

                <h2>Iniciar Sesión</h2>

                <label>Perfil de Acceso</label>

                <div class="role-selector">
                    <button 
                        type="button" 
                        class="role-btn active" 
                        data-role="admin"
                    >
                        Administrador
                    </button>

                    <button 
                        type="button" 
                        class="role-btn" 
                        data-role="empleado"
                    >
                        Empleado
                    </button>
                </div>

                <form id="loginForm">

                    <div class="input-group">
                        <label>Correo Electrónico</label>

                        <div class="input-icon">
                            <span>👤</span>
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@sietestore.com"
                                required
                            >
                        </div>
                    </div>

                    <div class="input-group">
                        <label>Contraseña</label>

                        <div class="input-icon">
                            <span>🔒</span>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                            >
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        class="login-btn"
                    >
                        Ingresar
                    </button>

                </form>

                <div class="credentials">
                    Credenciales de prueba:<br>
                    Admin: admin@sietestore.com / 123<br>
                    Emp: vendedor@sietestore.com / 123
                </div>

            </div>

        </div>
        `;
    }
}