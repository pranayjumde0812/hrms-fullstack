# NexusHR

A production-grade, enterprise Human Resource Management System (HRMS) architected as a full-stack monorepo. 

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, ShadcnUI, Lucide, TanStack Query
- **Backend:** Node.js, Express, Prisma ORM, MySQL
- **Validation:** Zod
- **Auth:** JWT HTTP-only Cookies
- **Language:** TypeScript (Strict Mode)

## Getting Started

### 1. Database Setup
NexusHR requires a relational MySQL database to strictly enforce ACID rules for Payroll computation and Timesheet integrity.

1. Ensure Docker Desktop is running locally.
2. At the root of the project, spin up the MySQL container:
   ```bash
   yarn db:up
   ```
*(If you are using your own local MySQL server, adapt the `DATABASE_URL` in `backend/.env` instead of running Docker.)*

### 2. Install Dependencies
Run the following at the project root to install all dependencies for both the frontend and backend:
```bash
yarn install
```

### 3. Run Prisma Migrations
Sync the Prisma schema to the MySQL database.
```bash
cd backend
npx prisma db push
```
*(Optionally you can run `npx prisma generate` if using an existing schema)*

### 4. Start Development Servers
Return to the root and start both backend and frontend concurrently:
```bash
yarn dev
```
- Frontend runs at: `http://localhost:5173`
- Backend API runs at: `http://localhost:3001`

## Accessing the Dashboard

1. Open `http://localhost:5173/login`
2. **Auto-Provisioning:** Enter `admin@nexushr.com` and any password with > 6 characters. The backend is configured to automatically provision the *first* attempt as a `SUPER_ADMIN` account on an empty system.

## Architecture Highlights
- **RBAC:** Routes and API endpoints are natively protected across four roles (`SUPER_ADMIN`, `HR_MANAGER`, `PROJECT_MANAGER`, `EMPLOYEE`).
- **Data Tables:** Highly reusable `DataTable` generic component enforcing client-side sort/filter capabilities instantly.
- **Relational Integrity:** Timesheets are strictly connected to Users and Projects. The Payroll engine uses approved Timesheets coupled with Employee base-salary constants to evaluate and generate robust compensation pipelines. 
