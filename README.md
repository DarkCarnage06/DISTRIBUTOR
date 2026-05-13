# FMCG Wholesale Order Portal

B2B wholesale order management for an FMCG distributor. Store owners sign in to browse the catalog and place orders; admins approve accounts, manage products, and track order fulfillment.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- NextAuth.js (Auth.js v5) with credentials (username + password)
- PostgreSQL + Prisma ORM

## Prerequisites

- Node.js 20+
- A PostgreSQL database

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Environment**

Copy `.env.example` to `.env` and set values:

- `DATABASE_URL` — PostgreSQL connection string, for example `postgresql://USER:PASSWORD@localhost:5432/distributor?schema=public`
- `AUTH_SECRET` — random string (e.g. `openssl rand -base64 32`)
- `NEXTAUTH_URL` — app base URL (e.g. `http://localhost:3000` for local dev)

3. **Database schema**

```bash
npx prisma migrate dev --name init
```

Alternatively, for a quick local prototype without migration files:

```bash
npx prisma db push
```

4. **Seed sample data**

```bash
npm run db:seed
```

This creates:

- Admin: `admin` / `admin123`
- Two approved customers: `freshmart`, `cornerstore` / `store123`
- Ten FMCG-style products and one sample order

5. **Run the app**

```bash
npm run dev
```

Open `http://localhost:3000`, sign in as admin or customer, and use the sidebar to navigate.

## Production build

```bash
npm run build
npm start
```

Ensure `NEXTAUTH_URL` matches your public URL in production.

## Roles

- **Admin** — `/admin/*`: dashboard, customers (create / approve / deactivate), products (CRUD), orders (filters + status updates).
- **Customer** — `/customer/*`: after approval, catalog, cart, and order history. Pending accounts see `/customer/pending` until an admin approves them.

## License

Private / internal use.
