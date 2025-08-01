# Etapa 1: Construcción de dependencias
FROM node:18-alpine AS dependencies

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install --production 
# Instala solo dependencias de producción

# Etapa 2: Construcción de la aplicación (si hubiera un paso de transpilación, etc.)
# En tu caso, solo copiamos el código fuente
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . . 
# Copia todo el código fuente

# Etapa 3: Imagen final de producción
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia solo lo esencial de la etapa de construcción
COPY --from=build /usr/src/app/server.js ./
COPY --from=build /usr/src/app/package.json ./ 
# Necesario para el start script si lo usas
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/config ./config
COPY --from=build /usr/src/app/middleware ./middleware
COPY --from=build /usr/src/app/routes ./routes
COPY --from=build /usr/src/app/src ./src 
# Si tienes más carpetas de código fuente

# Expone el puerto en el que corre el backend
EXPOSE 3017

# El comando para iniciar el servidor
CMD [ "node", "server.js" ]