# RouteSync Project Status

## Overview
RouteSync is a smart school bus tracking application for schools, parents, and drivers. It provides real-time GPS tracking, student management, and trip monitoring with English/Arabic (LTR/RTL) support.

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, Leaflet maps, React Query, wouter routing
- **Backend**: Node.js, Express 5, Drizzle ORM, PostgreSQL
- **Auth**: Session-based authentication with bcrypt password hashing
- **Build**: Vite (dev), esbuild (prod), tsx for TypeScript execution

## Architecture
- `client/` - React frontend
- `server/` - Express backend (routes, storage, auth, seed, vite setup)
- `shared/` - Shared types and schema (Drizzle + Zod)

## Key Files
- `server/index.ts` - Express app entry point
- `server/routes.ts` - API routes with session auth middleware
- `server/auth.ts` - Password hashing utilities (bcrypt)
- `server/storage.ts` - Database access layer (DatabaseStorage class)
- `server/seed.ts` - Database seeding (admin user + school)
- `server/db.ts` - Drizzle + pg pool setup
- `shared/schema.ts` - DB schema (users, schools, buses, students, trips, attendance, notifications)
- `shared/routes.ts` - Shared API route definitions
- `client/src/App.tsx` - Frontend routing
- `client/src/pages/` - Role-based pages (admin, parent, driver, landing)

## Security
- Passwords hashed with bcrypt (12 salt rounds)
- Session-based auth with httpOnly cookies
- Admin-only middleware protecting management routes
- Passwords never returned in API responses
- SESSION_SECRET stored as a Replit secret

## Database
- Replit PostgreSQL (DATABASE_URL set automatically)
- Schema: users, schools, buses, students, trips, attendance, notifications

## Default Credentials
- Admin: `admin` / `admin123`

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `SESSION_SECRET` - Session signing secret (set as Replit secret)
- `PORT` - Server port (defaults to 5000)

## Roles
- **admin** - Full management access (users, buses, students)
- **driver** - Can update bus location, manage trips
- **parent** - Can view linked student and bus location
