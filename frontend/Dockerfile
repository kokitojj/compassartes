# Etapa 1: Construcción
FROM node:18-alpine AS build

WORKDIR /app

# Declarar argumentos de construcción para variables de entorno
ARG INTERNAL_API_URL # <-- Asegúrate de que este valor sea http://backend:3007
ARG HOST
ARG PORT

# Establecer variables de entorno para el entorno de construcción
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV HOST=$HOST
ENV PORT=$PORT

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instala las dependencias del proyecto definidas en package.json
RUN npm install

# Copiamos el resto de los archivos del proyecto
COPY . .

# Construimos la aplicación en modo servidor
# Pasamos las variables de entorno al comando de construcción
RUN npm run build

# Etapa 2: Producción
# Usamos una imagen más ligera para ejecutar la aplicación
FROM node:18-alpine

WORKDIR /app

# Copiamos solo los archivos necesarios de la etapa de construcción
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Exponemos el puerto interno en el que corre la aplicación Astro
EXPOSE 4321

# El comando para iniciar el servidor de Astro en producción
CMD ["node", "dist/server/entry.mjs"]