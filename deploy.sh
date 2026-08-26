#!/bin/bash
set -e

echo "========================================================="
echo " Adera Foundation Platform - VPS Deployment Setup"
echo "========================================================="

# 1. Verify Docker installation
if ! command -v docker &> /dev/null; then
    echo "[1/4] Installing Docker engine..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "[1/4] Docker engine is ready."
fi

# 2. Verify Docker Compose plugin
if ! docker compose version &> /dev/null; then
    echo "[2/4] Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin
else
    echo "[2/4] Docker Compose plugin is ready."
fi

# 3. Environment configuration
if [ ! -f .env ]; then
    echo "[3/4] No .env file found! Copying from production.env.example..."
    cp production.env.example .env
    echo ">>> ACTION REQUIRED: Please edit .env with your real secrets before starting: nano .env"
    exit 1
else
    echo "[3/4] Production .env file found."
fi

# 4. Build and run containers
echo "[4/4] Building and launching Adera Docker stack..."
docker compose up -d --build

echo "Waiting for database and backend initialization..."
sleep 8

echo ""
echo "========================================================="
echo " [OK] Adera Foundation Services Running Successfully!"
echo "========================================================="
echo "Local Port Matrix:"
echo " - Main Frontend:  http://localhost:6000"
echo " - Backend API:    http://localhost:6001"
echo " - Admin Console:  http://localhost:6002"
echo " - Impact Store:   http://localhost:6003"
echo " - PostgreSQL:     localhost:6432"
echo ""
echo "========================================================="
echo " Nginx Proxy Manager Setup (http://YOUR_SERVER_IP:81)"
echo "========================================================="
echo "Add 4 Proxy Hosts in NPM with SSL enabled:"
echo " 1. aderafoundation.com (and www.aderafoundation.com)"
echo "    -> Forward Hostname/IP: 172.17.0.1 (or adera-frontend)"
echo "    -> Forward Port:        6000 (or 3000)"
echo "    -> SSL: Request Let's Encrypt Certificate, Force SSL"
echo ""
echo " 2. api.aderafoundation.com"
echo "    -> Forward Hostname/IP: 172.17.0.1 (or adera-backend)"
echo "    -> Forward Port:        6001 (or 5001)"
echo "    -> SSL: Request Let's Encrypt Certificate, Force SSL"
echo ""
echo " 3. admin.aderafoundation.com"
echo "    -> Forward Hostname/IP: 172.17.0.1 (or adera-admin)"
echo "    -> Forward Port:        6002 (or 3000)"
echo "    -> SSL: Request Let's Encrypt Certificate, Force SSL"
echo ""
echo " 4. shop.aderafoundation.com"
echo "    -> Forward Hostname/IP: 172.17.0.1 (or adera-store)"
echo "    -> Forward Port:        6003 (or 3000)"
echo "    -> SSL: Request Let's Encrypt Certificate, Force SSL"
echo ""
echo "========================================================="
