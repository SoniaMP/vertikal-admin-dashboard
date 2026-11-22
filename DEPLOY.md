# Plan: Despliegue — Hostinger (landing) + Ionos VPS (webapp)

## Arquitectura

| Servicio | Hosting | Dominio | Contenido |
|----------|---------|---------|-----------|
| Landing estática | Hostinger (hosting web) | `vertikal.club` / `www.vertikal.club` | Página informativa del club |
| Webapp Next.js | Ionos VPS (Ubuntu + Docker) | `app.clubvertikal.es` | Registro, admin, Stripe |

Hostinger gestiona las DNS del dominio principal. Un registro A para el subdominio `app` apunta al VPS de Ionos donde corre la webapp con Docker + Caddy (HTTPS automático). SQLite se mantiene como BD.

---

## Archivos a crear (7 nuevos)

### 1. `Dockerfile` — Build multi-stage
- **Stage 1 (deps):** `node:20-alpine` + toolchain nativo (`python3 make g++`) para compilar `better-sqlite3`. Solo `npm ci`.
- **Stage 2 (builder):** Copia deps, código fuente. Ejecuta `prisma generate` + `npm run build`. Pasa `NEXT_PUBLIC_*` como build args.
- **Stage 3 (runner):** `node:20-alpine` limpio. Copia solo standalone output (`.next/standalone`, `.next/static`, `public`), archivos Prisma, y seed scripts. Usuario no-root `nextjs:1001`. Expone puerto 3000.

### 2. `.dockerignore`
- Excluye: `node_modules`, `.next`, `.git`, `.env*`, `*.db`, `.claude/`, `coverage`

### 3. `docker-compose.yml` — 2 servicios
- **`app`:** Imagen construida del Dockerfile. `env_file: .env.production`. Volumen para SQLite (`sqlite-data:/app/data`). Health check contra `/api/health`. Solo `expose: 3000` (no accesible desde fuera).
- **`caddy`:** Imagen `caddy:2-alpine`. Puertos 80, 443 al host. Monta `Caddyfile` read-only. Volúmenes para certs y config. Depende de que `app` esté healthy.
- Build args para `NEXT_PUBLIC_*` (se inyectan desde `.env` del host).

### 4. `Caddyfile`
- Reverse proxy a `app:3000` con dominio `app.clubvertikal.es`.
- Compresión gzip/zstd.
- Headers de seguridad (HSTS, X-Frame-Options, X-Content-Type-Options).
- Access log rotado.

### 5. `src/app/api/health/route.ts`
- GET endpoint que devuelve `{ status: "ok" }`. Usado por Docker healthcheck.

### 6. `.env.production.example`
- Template con todas las variables necesarias y comentarios:
  - `DATABASE_URL="file:/app/data/vertikal.db"`
  - `NEXTAUTH_URL="https://app.clubvertikal.es"`
  - `NEXT_PUBLIC_APP_URL="https://app.clubvertikal.es"`
  - Stripe live keys, Resend, NEXTAUTH_SECRET

### 7. `scripts/backup-db.sh`
- Usa `sqlite3 .backup` (seguro en caliente).
- Verifica integridad del backup con `PRAGMA integrity_check`.
- Rota backups (mantiene últimos 7 días).

---

## Archivos a modificar (1)

### `next.config.ts`
- Añadir `output: "standalone"` — necesario para que el build produzca un servidor autocontenido (~200MB vs ~1GB con node_modules completo).

---

## Archivos críticos existentes (no se modifican)

| Archivo | Relevancia |
|---------|-----------|
| `src/lib/prisma.ts` | Lee `DATABASE_URL` env var — apuntará a `/app/data/vertikal.db` en producción |
| `prisma/schema.prisma` | Schema para `prisma generate` dentro del Docker builder |
| `prisma/migrations/` | Se aplican con `prisma migrate deploy` post-despliegue |
| `prisma/seed.ts` | Datos iniciales — se ejecuta una vez en la inicialización |
| `.env.local` | Referencia de variables necesarias para crear `.env.production` |

---

## Parte 1: Configurar DNS en Hostinger

En el panel de Hostinger → DNS Zone Editor para `clubvertikal.es`:

> **Por confirmar:** el `Caddyfile` sirve `app.clubvertikal.es`, así que el registro `app`
> va en esa zona. Queda por verificar en qué dominio está la landing estática — esta
> guía la daba por `vertikal.club`.

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | @ | IP de Hostinger (ya configurado) | 14400 |
| A | www | IP de Hostinger (ya configurado) | 14400 |
| A | app | `TU_IP_IONOS` | 300 |

> Los registros `@` y `www` ya apuntan al hosting de Hostinger (landing estática).
> Solo hay que **añadir** el registro `app` apuntando al VPS de Ionos.

Verificar propagación:

```bash
dig app.clubvertikal.es +short
# Debe devolver la IP del VPS de Ionos
```

---

## Parte 2: Setup del VPS en Ionos

### 1. Setup inicial de Ubuntu

```bash
# SSH al VPS como root
ssh root@TU_IP_IONOS

# Actualizar paquetes
apt update && apt upgrade -y

# Timezone (España)
timedatectl set-timezone Europe/Madrid

# Crear usuario deploy
adduser deploy
usermod -aG sudo deploy

# Copiar SSH keys al usuario deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp   # HTTP/3
ufw enable
```

### 2. Instalar Docker

```bash
# Como usuario deploy
ssh deploy@TU_IP_IONOS

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker deploy

# Reconectar para aplicar grupo
exit
ssh deploy@TU_IP_IONOS

# Verificar
docker --version
docker compose version
```

### 3. Clonar repo y configurar

```bash
sudo mkdir -p /opt/vertikal
sudo chown deploy:deploy /opt/vertikal

git clone TU_REPO_URL /opt/vertikal
cd /opt/vertikal

# Crear .env.production. Ojo: `.env.production.example` nunca llegó a existir en el repo;
# las variables necesarias están listadas arriba, en "Archivos a crear → 6".
nano .env.production
```

### 4. Construir y arrancar

```bash
cd /opt/vertikal
docker compose build
docker compose up -d
```

### 5. Inicializar base de datos

> El contenedor `app` **no puede ejecutar el CLI de Prisma**: el stage `runner` copia solo
> unas pocas carpetas de `node_modules` y falta `valibot`, que `prisma` necesita. Todo lo que
> sea CLI va por el servicio `migrate`, que se construye `FROM deps` con el `npm ci` entero
> y monta el mismo volumen en lectura-escritura.

```bash
# Las migraciones ya se aplican solas al levantar: `app` depende de que `migrate` termine.
# Para lanzarlas a mano:
docker compose run --rm migrate npx prisma migrate deploy

# El seed importa `src/lib/password.ts`, que la imagen `migrate` no copia. Se monta al vuelo:
docker compose run --rm -v ./src:/app/src migrate npx tsx prisma/seed.ts
```

### 6. Verificar

```bash
docker compose ps                                          # contenedores running
curl -s https://app.clubvertikal.es/api/health               # {"status":"ok"}
curl -vI https://app.clubvertikal.es 2>&1 | grep "SSL"      # certificado HTTPS
```

### 7. Programar backups automáticos

```bash
# Ejecutar backup manual para verificar
cd /opt/vertikal
docker compose --profile backup run --rm backup
ls -la backups/
```

#### Cron (backup diario a las 3:00 AM)

```bash
crontab -e
# Añadir:
0 3 * * * cd /opt/vertikal && docker compose --profile backup run --rm backup >> /var/log/vertikal-backup.log 2>&1
```

#### Descargar backup a local (para inspección con DBeaver)

```bash
# Desde tu máquina local:
scp deploy@TU_IP_IONOS:/opt/vertikal/backups/LATEST_FILE ./vertikal-backup.db

# Listar backups disponibles:
ssh deploy@TU_IP_IONOS "ls -lh /opt/vertikal/backups/"
```

Abrir `vertikal-backup.db` con DBeaver (driver SQLite) para consultar datos.

#### Restaurar backup

```bash
ssh deploy@TU_IP_IONOS
cd /opt/vertikal

# 1. Parar la aplicación
docker compose down

# 2. Copiar backup al volumen
docker run --rm \
  -v sqlite-data:/app/data \
  -v ./backups:/backups \
  alpine sh -c "cp /backups/BACKUP_FILE /app/data/vertikal.db"

# 3. Reiniciar
docker compose up -d
```

---

## Parte 3: Conectar landing con webapp

En la landing estática de Hostinger, los botones de acción (CTA) deben enlazar a la webapp:

- "Inscríbete" → `https://app.clubvertikal.es`
- "Área de socios" / "Admin" → `https://app.clubvertikal.es/admin`

---

## Redespliegue (sin migraciones de BD)

```bash
ssh deploy@TU_IP_IONOS
cd /opt/vertikal

git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d

# Verificar
docker compose logs app
```

## Redespliegue (con migraciones de BD)

Si hay nuevos ficheros en `prisma/migrations/`, hacer backup antes.

```bash
ssh deploy@TU_IP_IONOS
cd /opt/vertikal

# 1. Backup de la BD
docker compose cp app:/app/data/vertikal.db ./backups/vertikal-$(date +%Y%m%d-%H%M%S).db

# 2. Pull, build, deploy
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d

# 3. Verificar migración
docker compose logs migrate

# 4. Verificar app
docker compose logs app
```

El servicio `migrate` ejecuta `prisma migrate deploy` automáticamente antes de que arranque `app`.

## Rollback (si la migración falla)

```bash
docker compose down

# Restaurar backup al volumen
docker compose run --rm \
  -v ./backups:/backups app \
  sh -c "cp /backups/vertikal-YYYYMMDD-HHMMSS.db /app/data/vertikal.db"

# Volver al commit anterior
git log --oneline -5          # buscar el último commit bueno
git checkout <commit-hash>

# Rebuild y restart
docker compose build --no-cache
docker compose up -d
```

## Comandos útiles

```bash
# Logs en tiempo real
docker compose logs -f app

# Reiniciar solo la app (sin rebuild)
docker compose restart app

# Rebuild solo la app
docker compose build --no-cache app && docker compose up -d app

# Shell dentro del contenedor
docker compose exec app sh

# Estado de migraciones (por `migrate`, no por `app`)
docker compose run --rm migrate npx prisma migrate status

# Backup manual
docker compose run --rm backup
```

### Consultar y modificar la base de datos

Van por contenedores distintos, y no es evidente: el único que tiene el CLI `sqlite3` es
`backup`, que monta la base en **solo lectura**; el que puede escribir es `migrate`, que
tiene el CLI de Prisma. `app` no sirve para ninguna de las dos cosas.

```bash
# Leer (solo lectura, imposible romper nada)
docker compose run --rm --entrypoint sh backup -c "sqlite3 -header -column /app/data/vertikal.db 'SELECT id, year FROM Season;'"

# Escribir (backup antes, siempre)
echo "UPDATE Season SET year = 2027 WHERE id = 'xxx';" | docker compose run --rm -T migrate npx prisma db execute --stdin
```

Evita los heredocs (`<<'SQL'`) por SSH: si el terminal añade sangría al delimitador de
cierre, el comando se queda colgado esperando entrada y no llega a ejecutarse.

---

## Troubleshooting

### Redirect a localhost en /admin

Verificar que `.env.production` en el VPS tiene:
```
NEXTAUTH_URL="https://app.clubvertikal.es"
AUTH_TRUST_HOST=true
```
Luego reiniciar: `docker compose down && docker compose up -d` (no hace falta rebuild, son env vars de runtime).

### La migración falla

Revisar logs con `docker compose logs migrate`. Restaurar backup si es necesario (ver sección Rollback).

### Caddy no sirve HTTPS

Verificar que los puertos 80 y 443 están abiertos en el firewall del VPS y que el DNS apunta a la IP correcta.
```bash
docker compose logs caddy
```

---

## Verificación end-to-end

1. `docker compose ps` — todos los contenedores running
2. `https://app.clubvertikal.es` — página de registro carga
3. `https://app.clubvertikal.es/admin` — redirect a login (no a localhost)
4. Login con admin — panel de administración funciona
5. Certificado HTTPS (candado verde)
6. Backup manual funciona: `docker compose run --rm backup`
