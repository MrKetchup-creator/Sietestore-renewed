// Configuración dinámica según el entorno
const API_BASE_URL = (() => {
    // Si estamos en el dominio de Firebase (la demo en la nube)
    if (window.location.hostname === 'sietestore-app.web.app') {
        // 🔥 Cambia esta URL por la que te genere ngrok cada vez
        // Nota: ngrok genera una URL nueva cada vez que lo inicias.
        // Para mantener la demo funcionando, actualiza este valor manualmente
        // o usa una variable de entorno en tiempo de despliegue.
        return 'https://backer-emporium-limit.ngrok-free.dev'; // 👈 esta URL debe cambiarse cada vez que se ejecute el comando de ngrok 
    }
    // Si estamos en local (Live Server, etc.)
    return 'http://localhost:8080';
})();

export { API_BASE_URL };