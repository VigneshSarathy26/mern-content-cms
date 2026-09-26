# Event-Driven MERN Inventory Management System (`mern-inventory-pro`)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-5.2.0-646CFF.svg)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

`mern-inventory-pro` is a high-performance, full-stack enterprise inventory management platform built with the MERN stack (MongoDB, Express, React, Node.js) and designed around an **Event-Driven Architecture (EDA)**. 

By employing asynchronous event streaming, the API gateway immediately responds with HTTP `202 Accepted` to warehouse operators and procurement managers, offloading heavy downstream operations (stock subtractions, purchase order generation, threshold alerts, audit log indexing) to isolated background workers.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│    React SPA (Vite + Zustand)  │  Enterprise SSO (Microsoft Entra ID)    │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ HTTP / REST
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                        NGINX REVERSE PROXY (Port 80)                         │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │ /                                   │ /api/
┌───────────────────▼──────────────┐    ┌─────────────────▼───────────────────┐
│       FRONTEND CONTAINER         │    │      EXPRESS API GATEWAY            │
│       Vite Static Build          │    │      (Authentication & Validation)  │
└──────────────────────────────────┘    └─────────────────┬───────────────────┘
                                                          │ 202 Accepted + Event
                                        ┌─────────────────▼───────────────────┐
                                        │         EVENT BROKER                │
                                        │  Redis Streams / In-Memory Fallback │
                                        └─────────────────┬───────────────────┘
                                                          │ Event Processing Loop
                    ┌─────────────────────────────────────┼─────────────────────────────────────┐
                    │                                     │                                     │
         ┌──────────▼──────────┐               ┌──────────▼──────────┐               ┌──────────▼──────────┐
         │    Stock Worker     │               │    Order Worker     │               │ Notification Worker │
         └──────────┬──────────┘               └──────────┬──────────┘               └──────────┬──────────┘
                    │                                     │                                     │
                    └─────────────────────────────────────┼─────────────────────────────────────┘
                                                          │
                                        ┌─────────────────▼───────────────────┐
                                        │   DEAD LETTER QUEUE (DLQ WORKER)    │
                                        │   (Max 3 Retries -> Manual Admin)   │
                                        └─────────────────┬───────────────────┘
                                                          │ DB Operations
                                        ┌─────────────────▼───────────────────┐
                                        │         MONGODB DATABASE            │
                                        │   (Mongoose Models & Audit Logs)    │
                                        └─────────────────────────────────────┘
```

---

## 🚀 Key Features

- **Decoupled Event-Driven Architecture (EDA):** High-throughput Express API gateway receives operational payloads and immediately acknowledges request handling via `202 Accepted`, pushing job packets to background event loops.
- **Dual-Mode Event Broker:** Dynamically connects to **Redis Streams** via `ioredis` when available, with a zero-config fallback to an in-memory asynchronous event loop emulator for standalone local development.
- **Background Event Workers:**
  - **Stock Worker:** Processes async inventory additions, stock subtractions, and batch updates.
  - **Order Worker:** Handles order status transitions (`PENDING_FULFILLMENT` $\rightarrow$ `PROCESSING` $\rightarrow$ `FULFILLED` / `REPLENISHED`).
  - **Notification Worker:** Triggers alerts for reorder thresholds and low stock warnings.
  - **DLQ Worker:** Manages failed event retry cycles (up to 3 automated attempts) before pushing to Dead Letter Queue for manual admin intervention.
- **Idempotency Safeguards:** Database transaction audits validate incoming requests against unique idempotency keys (`idempotencyKey`) to block duplicate stock deductions or re-submitted orders.
- **Enterprise Single Sign-On (SSO) & RBAC:**
  - Support for **Microsoft Entra ID** (via `@azure/msal-react` & `@azure/msal-browser`) alongside standard JWT/Bcrypt authentication.
  - Granular Role-Based Access Control (`ADMIN`, `INVENTORY_MANAGER`, `WAREHOUSE_STAFF`).
- **Real-Time Operational Dashboard & Analytics:**
  - Visual charts, metrics, stock metrics, and supplier performance summaries.
  - Event log inspection panel with DLQ manual replay/override options.
- **Persistent Log Streams:** Automated HTTP traffic and application logging formatted via Winston & Morgan, mapped to persistent host disk storage (`logs/access.log` and `logs/app.log`).

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 18 (Vite)
- **State Management:** Zustand
- **Routing:** React Router v6
- **Styling:** Modern CSS with responsive design system
- **Icons:** Lucide React
- **Authentication:** MSAL Browser & React (`@azure/msal-react`)

### **Backend**
- **Runtime:** Node.js, Express.js
- **Database:** MongoDB & Mongoose ORM
- **Event Streaming & Caching:** Redis 7 (`ioredis`) / In-Memory Event Broker
- **Validation & Security:** Zod, JWT, BcryptJS, CORS, Helmet
- **Logging:** Winston & Morgan

### **Infrastructure & Testing**
- **Reverse Proxy:** Nginx (alpine)
- **Containerization:** Docker & Docker Compose
- **Integration Testing:** Jest & Supertest
- **E2E Testing:** Playwright

---

## 📁 Repository Structure

```text
mern-content-cms/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Redis, and Winston Logger configuration
│   │   ├── controllers/    # API Request Handlers & Business Logic
│   │   ├── middleware/     # Auth, RBAC, and Logging Middlewares
│   │   ├── models/         # Mongoose Schemas (User, Product, Order, Inventory, Supplier, Event)
│   │   ├── routes/         # Express Route Modules
│   │   ├── services/       # Database Seeding & Auxiliary Services
│   │   ├── workers/        # Async Background Event Workers (Stock, Order, Notification, DLQ)
│   │   └── server.js       # Express Application Entry Point
│   ├── tests/              # Backend Unit & Integration Tests (Jest)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Components & Navigation Elements
│   │   ├── pages/          # Application Pages (Dashboard, Inventory, Orders, Products, Analytics, Settings)
│   │   ├── store/          # Zustand State Stores
│   │   ├── utils/          # API Client & Helpers
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf          # Nginx Reverse Proxy Configuration
├── tests/
│   └── e2e/                # End-to-End Test Suite (Playwright)
├── docker-compose.yml      # Multi-container Orchestration
└── README.md
```

---

## 🔑 Default Credentials

Upon startup, the database is automatically seeded with default demo credentials:

| Role | Email / Username | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@inventorypro.com` or `admin` | `password123` | Full Access (User Mgmt, DLQ Retry, Settings) |
| **Enterprise SSO** | Click **Sign in with Microsoft Entra ID** | N/A | Microsoft Enterprise Auth Flow |

---

## ⚙️ Environment Variables

### **Backend (`backend/.env`)**

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern_inventory_pro
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=super_secret_jwt_key_inventory_pro_2026
NODE_ENV=development

# Optional Microsoft Entra ID (Azure SSO) Integration
AZURE_TENANT_ID=your-azure-tenant-id-here
AZURE_CLIENT_ID=your-azure-client-id-here
AZURE_CLIENT_SECRET=your-azure-client-secret-here
```

### **Frontend (`frontend/.env`)**

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Quick Start Guide

### **Option A: Running with Docker Compose (Recommended)**

Ensure [Docker](https://www.docker.com/) and Docker Compose are installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VigneshSarathy26/mern-content-cms.git
   cd mern-content-cms
   ```

2. **Launch all services in detached mode:**
   ```bash
   docker compose up -d --build
   ```

3. **Access the application:**
   - **Web Interface:** [http://localhost/](http://localhost/)
   - **Backend API Direct:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

4. **Stop the containers:**
   ```bash
   docker compose down
   ```

---

### **Option B: Running Locally (Manual Development)**

#### **1. Prerequisites**
- Node.js `v18.x` or higher
- MongoDB running locally (`mongodb://localhost:27017`)
- *(Optional)* Redis server running locally (`redis://localhost:6379`). If Redis is absent, the system falls back to an in-memory event broker.

#### **2. Start the Backend API Server**
```bash
cd backend
npm install
npm run dev
```
The server starts on `http://localhost:5000`.

#### **3. Start the Frontend Application**
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The Vite dev server starts on `http://localhost:3000`.

---

## 🧪 Testing & Code Quality

### **Backend Unit & Integration Tests (Jest)**
```bash
cd backend
npm run test
```

### **End-to-End Tests (Playwright)**
```bash
# Run E2E tests against running instance
npm run test:e2e
```

### **Linting**
```bash
# Lint Backend
cd backend && npm run lint

# Lint Frontend
cd frontend && npm run lint
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | System health check (MongoDB, Redis status) | ❌ |
| `POST` | `/api/auth/login` | User login & JWT issuance | ❌ |
| `POST` | `/api/auth/register` | User registration | ❌ |
| `GET` | `/api/products` | Fetch catalog products | 🔑 |
| `POST` | `/api/products` | Create product entry | 🔑 (Admin/Manager) |
| `GET` | `/api/inventory` | Retrieve current stock counts | 🔑 |
| `POST` | `/api/inventory/adjust` | Queue async inventory adjustment | 🔑 |
| `GET` | `/api/orders` | List order fulfillment status | 🔑 |
| `POST` | `/api/orders` | Queue order placement (`202 Accepted`) | 🔑 |
| `GET` | `/api/suppliers` | List suppliers & lead times | 🔑 |
| `GET` | `/api/events` | Inspect event stream audit & DLQ status | 🔑 (Admin) |
| `POST` | `/api/events/dlq/retry` | Re-queue failed DLQ event | 🔑 (Admin) |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

