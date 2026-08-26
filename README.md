# Adera Foundation Platform

A modern, transparent humanitarian and blockchain-powered crowdfunding platform, impact store, and administrative operations suite for the **Adera Foundation**.

---

## 🏛 Sub-Applications & Port Architecture

| Domain / Subdomain | Service | Local Dev Port | Production Host Port | Container Port |
| :--- | :--- | :--- | :--- | :--- |
| **`aderafoundation.com`** | Frontend Portal | `3005` | **`6000`** | `3000` |
| **`api.aderafoundation.com`** | NestJS Backend API | `5001` | **`6001`** | `5001` |
| **`admin.aderafoundation.com`** | Admin Console | `3002` | **`6002`** | `3000` |
| **`shop.aderafoundation.com`** | Impact Storefront | `3003` | **`6003`** | `3000` |
| *Database* | PostgreSQL 16 | `5432` | **`6432`** | `5432` |

---

## 🚀 Production Deployment (Docker + VPS)

### 1. Configure Environment
```bash
cp production.env.example .env
nano .env
```

### 2. Deploy with Automated Script
```bash
chmod +x deploy.sh
./deploy.sh
```

Or run via Docker Compose directly:
```bash
docker compose up -d --build
```

---

## 🌐 Nginx Proxy Manager Setup (`http://YOUR_SERVER_IP:81`)

Add 4 Proxy Hosts in NPM with SSL enabled (Request Let's Encrypt Certificate, Force SSL, Websockets Support, Block Common Exploits):

1. **`aderafoundation.com` & `www.aderafoundation.com`**
   - Forward Hostname / IP: `172.17.0.1` *(or `adera-frontend`)*
   - Forward Port: `6000`

2. **`api.aderafoundation.com`**
   - Forward Hostname / IP: `172.17.0.1` *(or `adera-backend`)*
   - Forward Port: `6001`

3. **`admin.aderafoundation.com`**
   - Forward Hostname / IP: `172.17.0.1` *(or `adera-admin`)*
   - Forward Port: `6002`

4. **`shop.aderafoundation.com`**
   - Forward Hostname / IP: `172.17.0.1` *(or `adera-store`)*
   - Forward Port: `6003`

---

## 💻 Local Development Setup

```bash
# 1. Start PostgreSQL
docker compose up -d adera-db

# 2. Start Backend API (:5001)
cd backend && npm install && npx prisma db push && npm run start:dev

# 3. Start Frontend Web (:3005)
cd frontend && npm install && npm run dev

# 4. Start Admin Console (:3002)
cd admin && npm install && npm run dev

# 5. Start Impact Store (:3003)
cd store && npm install && npm run dev
```
