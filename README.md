# EG INVESTMENT — Demo Project

This repository contains a demo-mode implementation of the EG INVESTMENT platform built with Next.js, TypeScript, Tailwind CSS and Prisma (PostgreSQL).

It intentionally includes demo flows for membership submission, task submissions, referrals and withdrawals but does NOT perform live payment provider or WhatsApp/SMS integrations. Those are left as configurable integration points.

Quick start (local)

1. Clone the repo:
   git clone https://github.com/Elisa079/eg-investment.git
2. Install dependencies:
   npm install
3. Create a PostgreSQL database and set DATABASE_URL in a .env file (copy .env.example -> .env)
4. Generate Prisma client and run migrations:
   npx prisma generate
   npx prisma migrate dev --name init
5. Seed demo data:
   npm run seed
6. Start dev server:
   npm run dev

Default admin user created by the seed:
- phone: +25479491677
- username: admin
- password: ChangeMe!123

Notes
- Replace JWT_SECRET in .env before using.
- This is intended as a demo. Before going live you must integrate an official payment provider, set up WhatsApp Business API with a BSP, enable secure secrets storage, and conduct legal/financial reviews.

Files added in demo flows
- prisma/schema.prisma — Expanded data model
- prisma/seed.ts — Creates admin and sample tasks
- app/api/membership/submit/route.ts — Membership submission (demo)
- app/api/membership/manual-verify/route.ts — Admin verification endpoint (demo)
- app/api/tasks/route.ts — Public tasks listing
- app/api/tasks/create/route.ts — Admin create task endpoint
- app/api/submissions/route.ts — Submit a task with media (demo)
- app/api/referrals/claim/route.ts — Claim referral for a user
- app/api/withdrawals/request/route.ts — Request withdrawal (demo ledger hold)
- app/api/admin/overview/route.ts — Admin overview for pending items

If you want, I can now:
- Add admin UI pages to approve memberships, submissions, and withdrawals (frontend)
- Add presigned upload integration with S3 for real media upload
- Add background worker (BullMQ) for media deletion and notification dispatch
- Add automated tests and CI

Tell me which next piece you want me to push and I will add it to the repository.
