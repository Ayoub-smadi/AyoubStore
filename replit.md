# RouteSync Project Status

## Overview
RouteSync is a smart school bus tracking application for schools and parents.

## Current State
- **Parent Dashboard**: Fully implemented with real-time GPS tracking, student details, ETA/Distance calculation, and notifications.
- **Admin Dashboard**: Basic structure in place with bus and student management.
- **Database**: PostgreSQL with users, schools, students, buses, and notifications tables.
- **Localization**: RTL/LTR support with English and Arabic translations.

## Credentials
- Admin: `admin` / `admin123`
- Parent: `parent` / `parent123`
- Driver: `driver1` / `driver123`

## Key Files
- `client/src/pages/parent/dashboard.tsx`: Main parent interface.
- `server/storage.ts`: Database access layer.
- `shared/schema.ts`: Database schema definitions.
