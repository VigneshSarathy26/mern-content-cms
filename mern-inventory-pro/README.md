# Event-Driven MERN Inventory Management System (`mern-inventory-pro`)

`mern-inventory-pro` is a scalable, full-stack inventory management platform built using the MERN stack designed around an **Event-Driven Architecture (EDA)**. By utilizing asynchronous event loops, the gateway immediately returns `202 Accepted` to warehouse operators and purchasing managers, processing heavy integrations (stock deductions, supplier purchase orders, low-stock email triggers, audit trail indexing) as background events.

---

## 🚀 Key Features

* **Decoupled Architecture:** High availability API gateway that processes inventory updates and sales orders by pushing payload packets to an event stream.
* **Dual-Mode Event Broker:** Automatically runs using Redis Streams if a Redis server is available, or gracefully falls back to an In-Memory asynchronous Event Loop emulator for frictionless out-of-the-box local runs.
* **Eventual Consistency UI:** The frontend utilizes optimistic state deductions and automatic polling loops to update order and stock statuses in real-time, showing smooth transitions from `PENDING_FULFILLMENT` to `PROCESSING` -> `FULFILLED` or `REPLENISHED`.
* **Idempotency Safeguard:** DB transaction audits trace incoming messages against uniqueness keys (`idempotencyKey`) to prevent duplicate stock subtractions or double-order placements.
* **Dead Letter Queue (DLQ):** System tracks failing events (max 3 retries) and moves them to a DLQ state. Admins can view logs and manually trigger overrides/retries from the Operational Dashboard / Settings screen.
* **Role-Based Access Control (RBAC):** Separate views and privileges for `ADMIN`, `INVENTORY_MANAGER`, and `WAREHOUSE_STAFF`.
* **Inventory & Supplier Manager:** Admins and Managers can manage product catalogs, SKUs, reorder thresholds, supplier lead times, purchase orders, and stock adjustments.
* **Persistent Application Log Mounts:** Real-time HTTP request trails and server outputs are captured and written to local log streams mapped on the host machine (`logs/access.log` and `logs/app.log`).

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Zustand, Modern CSS Styling, Lucide Icons, React Router 6.
* **Backend:** Node.js, Express, Mongoose, Zod.
* **Event Broker:** Redis Streams (`ioredis` client) / In-Memory Event Broker.
* **Databases:** MongoDB (Mongoose models), Redis (Caching & Event Streams).
* **Reverse Proxy:** Nginx (orchestrating ports in container).
* **Orchestration:** Docker Compose.
* **Testing & Linting:** Jest (unit & integration testing), Playwright (E2E testing), ESLint.

---

## 🔑 Default Credentials

The database is automatically seeded with default accounts upon initial start:

* **Admin Email / Username:** `admin@inventorypro.com` (or `admin`)
* **Password:** `password123`
* **Enterprise SSO:** Click **Sign in with Microsoft Entra ID** on the login screen.

---

## 🏃 Quick Start

### Option A: Running with Docker Compose (Recommended)
```bash
docker compose up -d --build
```
Access the application at `http://localhost/`

### Option B: Running Locally (Manual Setup)

1. **Setup Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🧪 Testing

* **Backend Integration Tests:** `cd backend && npm run test`
* **E2E Playwright Tests:** `npm run test:e2e`
