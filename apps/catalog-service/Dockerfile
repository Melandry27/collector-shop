# syntax=docker/dockerfile:1
# Image de catalog-service. Contexte de build : racine du dépôt (monorepo npm workspaces).
#   docker build -f apps/catalog-service/Dockerfile --build-arg APP_VERSION=$(git rev-parse HEAD) -t catalog-service .

# 1. Compilation : dépendances complètes, puis build des paquets partagés et du service
FROM node:26-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/nest-common/package.json packages/nest-common/
COPY apps/catalog-service/package.json apps/catalog-service/
RUN npm ci --ignore-scripts --no-audit --no-fund \
      -w @collector/contracts -w @collector/nest-common -w @collector/catalog-service
COPY tsconfig.base.json tsconfig.node.json ./
COPY packages/contracts packages/contracts
COPY packages/nest-common packages/nest-common
COPY apps/catalog-service apps/catalog-service
RUN npm run build -w @collector/contracts -w @collector/nest-common -w @collector/catalog-service

# 2. Dépendances de production uniquement (sans outils de build ni de test)
FROM node:26-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/nest-common/package.json packages/nest-common/
COPY apps/catalog-service/package.json apps/catalog-service/
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
      -w @collector/contracts -w @collector/nest-common -w @collector/catalog-service

# 3. Image d'exécution : code compilé et dépendances de production, utilisateur non root
FROM node:26-alpine
ARG APP_VERSION=dev
ENV NODE_ENV=production \
    APP_VERSION=${APP_VERSION} \
    PORT=3000
WORKDIR /app
# Arborescence des dépendances de production, y compris les node_modules imbriqués des espaces de travail
COPY --from=deps /repo ./
COPY --from=build /repo/packages/contracts/dist packages/contracts/dist
COPY --from=build /repo/packages/nest-common/dist packages/nest-common/dist
COPY --from=build /repo/apps/catalog-service/dist apps/catalog-service/dist
# Les fichiers appartiennent à root et sont en lecture seule pour l'utilisateur node.
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/health/live > /dev/null || exit 1
CMD ["node", "apps/catalog-service/dist/main.js"]
