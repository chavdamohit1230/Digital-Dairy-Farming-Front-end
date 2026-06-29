# DairyPro – AI-Powered Digital Dairy Farm Management

**Enterprise-level system for Buffalo Dairy Farming (Murrah breed optimized).**  
Scalable, modular, cloud-ready SaaS for Indian rural dairy farmers.

---

## System Architecture

- **Frontend:** Next.js (App Router), React, Tailwind CSS, green + white rural-friendly UI, mobile-optimized
- **Backend:** Next.js API Routes (Node.js)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT (cookie + header), role-based access, ready for 2FA
- **i18n:** English, Hindi (हिंदी), Gujarati (ગુજરાતી)

### Modules

| Module | Description |
|--------|-------------|
| **Animal Management** | Full lifecycle (Calf → Heifer → Pregnant → Lactating → Dry → Sold/Dead), RFID, QR, Body Score, breed, bloodline |
| **Milk Production** | Morning/evening yield, fat %, SNF %, quality grade, 305-day lactation, peak milk, revenue per buffalo |
| **Feed & Nutrition** | Ration planner, green/dry fodder, concentrate, mineral mix, FCR, feed cost per buffalo |
| **Reproduction & Breeding** | Heat detection, AI/natural breeding, pregnancy diagnosis, expected calving, dry period, lactation cycle, DIM, alerts |
| **Health & Veterinary** | Vaccination calendar, disease history, treatment log, prescriptions, lab reports, health score |
| **Labour & HR** | Worker profile, attendance, task assignment (milking, feeding, cleaning), salary, incentives |
| **Finance** | Income/expense, P&L, cash flow, balance sheet, ROI, cost per litre, net profit per buffalo |
| **Loans & Subsidy** | EMI schedule, outstanding, subsidy tracking, PMEGP compliance |
| **Inventory** | Feed stock, medicine, equipment, low stock alerts |
| **Reports & Compliance** | Export PDF, Excel, CSV; compliance reports |
| **Multi-Farm** | Farm-level data isolation, multi-tenant ready |
| **IoT Ready** | Smart collar, milk meter, temperature, RFID, GPS (types and placeholders) |
| **AI Module** | Milk prediction, disease risk, feed optimization, fertility suggestions, profit forecast (placeholders) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (for full backend)

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dairyfarm?schema=public"
JWT_SECRET="your-secret-key"
```

### Database

```bash
npx prisma generate
npx prisma migrate dev --name init
# or push schema without migrations:
npx prisma db push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
**Without database:** Login uses mock users (see `lib/data.ts`). Use any demo email to get in; full CRUD and APIs require PostgreSQL.

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema to DB |
| `npm run db:studio` | Open Prisma Studio |

---

## Project Structure

```
├── app/
│   ├── api/           # API routes (auth, animals, …)
│   ├── layout.tsx
│   └── page.tsx
├── components/        # UI and feature components
│   ├── app-shell.tsx
│   ├── app-sidebar.tsx
│   ├── buffalo-page.tsx
│   ├── milk-page.tsx
│   ├── reproduction-page.tsx
│   ├── feed-page.tsx
│   ├── medical-page.tsx
│   ├── labour-page.tsx
│   ├── finance-page.tsx
│   ├── loans-page.tsx
│   ├── inventory-page.tsx
│   ├── reports-page.tsx
│   ├── settings-page.tsx
│   └── ui/            # shadcn-style components
├── lib/
│   ├── auth.ts        # JWT helpers
│   ├── auth-context.tsx
│   ├── db.ts          # Prisma client
│   ├── data.ts        # Mock data & types
│   ├── i18n/          # Messages (en, hi, gu) & context
│   ├── reports-export.ts  # CSV/PDF/Excel export helpers
│   ├── iot-types.ts   # IoT device types
│   ├── ai-module.ts   # AI prediction placeholders
│   └── utils.ts
├── prisma/
│   └── schema.prisma  # Full schema (animals, milk, feed, health, labour, finance, loans, inventory, alerts, audit)
└── README.md
```

---

## Security & Access

- **Roles:** admin, manager, worker, accountant, vet
- **Role-based permissions** per module (see `lib/data.ts` → `rolePermissions`)
- **JWT** in HTTP-only cookie and optional `Authorization: Bearer`
- **Audit log** model for critical actions (schema in Prisma)
- **2FA:** User model has `twoFactorEnabled` and `twoFactorSecret` for future TOTP

---

## Demo Login

Use any of the demo users (mock auth when DB not used):

- **Admin:** admin@dairyfarm.com  
- **Manager:** manager@dairyfarm.com  
- **Worker:** worker@dairyfarm.com  
- **Accountant:** accountant@dairyfarm.com  

Password is not validated in mock mode; any email from the list logs you in.

---

## License

Private. All rights reserved.
