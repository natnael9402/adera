# Adera Foundation Platform

A modern, transparent humanitarian and blockchain-powered crowdfunding platform, impact store, and administrative operations suite for the **Adera Foundation**.

---

## Platform Overview

The platform consists of 4 core sub-applications and shared services:

1. **Frontend Portal (/frontend - Port 3005)**
   - Public campaign discovery, storytelling, direct impact metrics, and real-time live donor feed.
   - Creator Campaign Studio (/causes/new) with guided 16:9 image framing and \ crypto anti-spam verification deposit.
   - Multi-crypto donation checkout (BTC, ETH, USDC, USDT, SOL) with QR codes.

2. **Impact Store & Reseller Hub (/store - Port 3003)**
   - Certified humanitarian goods marketplace funding community initiatives.
   - Reseller studio, reseller onboarding, public storefronts, and order tracking.

3. **Admin Operations Console (/admin - Port 3002)**
   - Cause management, funds slider, and verification proof review with high-res lightbox inspection.
   - One-click approvals and live deployment controls.
   - Product catalog management and platform telemetry.

4. **NestJS Backend API (/backend - Port 5001)**
   - Modular NestJS REST API with Prisma ORM & PostgreSQL.
   - JWT authentication, email verification codes, and file uploads.
   - Real-time crypto price tracking and donation ledger.

---

## Quick Start

### 1. Start Database & Mail Services
`ash
docker-compose up -d
`

### 2. Backend Setup
`ash
cd backend
npm install
npx prisma db push
npm run start:dev
`

### 3. Frontend Setup
`ash
cd frontend
npm install
npm run dev
`

### 4. Admin Setup
`ash
cd admin
npm install
npm run dev
`

### 5. Store Setup
`ash
cd store
npm install
npm run dev
`

---

## Tech Stack

- **Frontend / Admin / Store**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: NestJS, Prisma ORM, PostgreSQL, RxJS, Class Validator
- **Crypto & Payments**: Dynamic multi-chain QR codes (BTC, ETH, SOL, USDC, USDT)
