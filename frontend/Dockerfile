# Etapa 1: Construcción
FROM node:18-alpine AS build

WORKDIR /app

# Declarar argumentos de construcción para variables de entorno
ARG INTERNAL_API_URL
ARG HOST
ARG PORT
ARG VITE_PUBLIC_API_URL

# Establecer variables de entorno para el entorno de construcción
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV HOST=$HOST
ENV PORT=$PORT
ENV VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instala las dependencias del proyecto definidas en package.json
RUN npm install

# Copiamos el resto de los archivos del proyecto
COPY . .

# Construimos la aplicación en modo servidor
# Pasamos las variables de entorno al comando de construcción
RUN VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL npm run build

# Etapa 2: Producción
# Usamos una imagen más ligera para ejecutar la aplicación
FROM node:18-alpine

WORKDIR /app

# Copiamos solo los archivos necesarios de la etapa de construcción
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Exponemos el puerto interno en el que corre la aplicación Astro
EXPOSE 4317

# El comando para iniciar el servidor de Astro en producción
CMD ["node", "dist/server/entry.mjs"]