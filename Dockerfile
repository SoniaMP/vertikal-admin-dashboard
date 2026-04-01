# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# Etapa de dependencias
FROM base AS deps
WORKDIR /app

# Instalamos dependencias nativas necesarias para compilar módulos nativos
RUN apk add --no-cache python3 make g++ libc6-compat

# Copiamos archivos de dependencias
COPY package.json package-lock.json* ./

# Instalamos dependencias
RUN npm ci

# Etapa de construcción
FROM base AS builder
WORKDIR /app

# Copiamos node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiamos todo el código fuente
COPY . .

# Variables de entorno para el build
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_NAME

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}

# Generamos el cliente de Prisma y creamos DB temporal para el build
RUN npx prisma generate
RUN DATABASE_URL=file:/tmp/build.db npx prisma migrate deploy
ENV DATABASE_URL=file:/tmp/build.db

# Construimos la aplicación Next.js
RUN npm run build

# Etapa final de ejecución
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Creamos usuario y grupo para Next.js
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos archivos públicos
COPY --from=builder /app/public ./public

# Copiamos el output standalone de Next.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiamos Prisma y configuración
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json

# Copiamos scripts de administración
COPY --from=builder /app/scripts ./scripts

# Copiamos node_modules necesarios para Prisma y better-sqlite3 en runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

# Establecemos permisos correctos
RUN chown -R nextjs:nodejs /app

# Creamos directorio para la base de datos
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# ---- migrate (job) ----
FROM deps AS migrate
WORKDIR /app

# Prisma schema, migrations, and config
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Generate Prisma client (needed for seed)
RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && chown -R 1001:1001 /app/data"]