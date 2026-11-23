# syntax=docker/dockerfile:1
# Image du front-end. Contexte de build : racine du dépôt (monorepo npm workspaces).
#   docker build -f apps/web-app/Dockerfile -t web-app .

# 1. Build Vite
FROM node:24-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web-app/package.json apps/web-app/
RUN npm ci --ignore-scripts --no-audit --no-fund -w @collector/web-app
COPY tsconfig.base.json ./
COPY apps/web-app apps/web-app
RUN npm run build -w @collector/web-app

# 2. Service des fichiers statiques par nginx, sans privilèges (port 8080, utilisateur nginx)
FROM nginxinc/nginx-unprivileged:1.31-alpine
# Configuration d'exécution servie sur /config.js (voir docker/default.conf.template).
# Valeurs relatives par défaut : le front, les API et Keycloak sont derrière la même ALB.
ENV API_CATALOG_URL=/api/catalog \
    API_NOTIFICATIONS_URL=/api/notifications \
    KEYCLOAK_URL=/auth \
    KEYCLOAK_REALM=collector \
    KEYCLOAK_CLIENT_ID=web-app
COPY apps/web-app/docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /repo/apps/web-app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://127.0.0.1:8080/healthz > /dev/null || exit 1
