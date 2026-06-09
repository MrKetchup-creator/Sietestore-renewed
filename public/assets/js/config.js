// assets/js/config.js
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080' // Para pruebas locales
    : 'https://tu-backend-en-render.onrender.com'; // Para producción

export { API_BASE_URL };