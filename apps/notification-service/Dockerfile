# syntax=docker/dockerfile:1
# Image de notification-service. Contexte de build : racine du dépôt (monorepo npm workspaces).
#   docker build -f apps/notification-service/Dockerfile --build-arg APP_VERSION=$(git rev-parse HEAD) -t notification-service .

# 1. Compilation : dépendances complètes, puis build des paquets partagés et du service
FROM node:24-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/nest-common/package.json packages/nest-common/
COPY apps/notification-service/package.json apps/notification-service/
RUN npm ci --ignore-scripts --no-audit --no-fund \
      -w @collector/contracts -w @collector/nest-common -w @collector/notification-service
COPY tsconfig.base.json tsconfig.node.json ./
COPY packages/contracts packages/contracts
COPY packages/nest-common packages/nest-common
COPY apps/notification-service apps/notification-service
RUN npm run build -w @collector/contracts -w @collector/nest-common -w @collector/notification-service

# 2. Dépendances de production uniquement (sans outils de build ni de test)
FROM node:24-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/nest-common/package.json packages/nest-common/
COPY apps/notification-service/package.json apps/notification-service/
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
      -w @collector/contracts -w @collector/nest-common -w @collector/notification-service

# 3. Image d'exécution : code compilé et dépendances de production, utilisateur non root
FROM node:24-alpine
ARG APP_VERSION=dev
ENV NODE_ENV=production \
    APP_VERSION=${APP_VERSION} \
    PORT=3001
WORKDIR /app
# Arborescence des dépendances de production, y compris les node_modules imbriqués des espaces de travail
COPY --from=deps /repo ./
COPY --from=build /repo/packages/contracts/dist packages/contracts/dist
COPY --from=build /repo/packages/nest-common/dist packages/nest-common/dist
COPY --from=build /repo/apps/notification-service/dist apps/notification-service/dist
# Les fichiers appartiennent à root et sont en lecture seule pour l'utilisateur node.
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3001/health/live > /dev/null || exit 1
CMD ["node", "apps/notification-service/dist/main.js"]
