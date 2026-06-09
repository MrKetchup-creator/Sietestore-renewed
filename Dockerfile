# Usar una imagen oficial de Nginx (solo para servir archivos estáticos)
FROM nginx:alpine
# Copiar los archivos de la carpeta "public" al directorio donde Nginx sirve los archivos
COPY ./public /usr/share/nginx/html
# Exponer el puerto 80
EXPOSE 80