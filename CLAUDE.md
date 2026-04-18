# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

bien sûr is a minimalist daily commitment tracker built with Next.js 16 (App Router), React 19, TypeScript, and PostgreSQL. Users authenticate via Clerk, check in daily to build streaks, view their progress through an animated calendar, and maintain accountability for daily commitments. Each user has their own isolated tracker data.

## Development Commands

### Setup and Installation
```bash
npm install                    # Install dependencies (automatically runs prisma generate)
npx prisma db push            # Initialize database schema
npx prisma generate           # Generate Prisma Client
```

### Development
```bash
npm run dev                   # Start development server at http://localhost:3000
npm run build                 # Build for production (automatically runs prisma generate)
npm start                     # Start production server
npm run lint                  # Run ESLint
```

### Database Operations
```bash
npx prisma studio             # Open Prisma Studio GUI
npx prisma db push            # Push schema changes to database
npx prisma generate           # Regenerate Prisma Client after schema changes
```

## Architecture

### Authentication Layer
- **Clerk** for user authentication with email verification
- ClerkProvider wraps the entire app in `src/app/layout.tsx`
- Middleware in `src/middleware.ts` protects all routes except `/sign-in` and `/sign-up`
- `auth()` from `@clerk/nextjs/server` used in API routes to get authenticated `userId`
- All database records scoped to the authenticated user
- UserButton component in main page header for account management
- Environment variables required: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

### Database Layer
- **Prisma ORM** with PostgreSQL adapter using `pg` connection pool
- Custom Prisma Client output: `src/generated/prisma/client`
- Uses Prisma 7 with `@prisma/adapter-pg` for PostgreSQL connection pooling
- Global singleton pattern in `src/lib/prisma.ts` to prevent connection exhaustion
- Two main models:
  - `DayRecord`: Daily completions with `userId`, `date` (YYYY-MM-DD), `completed`, `completedAt`
    - Unique constraint on `userId + date` (one record per user per day)
    - Indexed on `userId` and `date`
  - `Settings`: User preferences with `userId` (unique), `commitment` text
- All queries filtered by authenticated user's `userId` from Clerk
- Connection string required in `.env.local` as `DATABASE_URL`

### API Layer
- Next.js API Routes in `src/app/api/`
- **All endpoints require authentication** - return 401 if no userId from `auth()`
- **GET/POST /api/records**: Fetch user's records or upsert a day record
  - All queries filtered by authenticated `userId`
  - Upsert uses `userId_date` unique constraint
- **GET/POST /api/settings**: Fetch or update user's commitment settings
  - Auto-creates settings on first GET if not exists
  - Upsert by `userId` (unique constraint)
- All endpoints return JSON, handle errors with appropriate HTTP status codes
- Records transformed from database format to client format (records map keyed by date)

### State Management
- Single source of truth: `useTracker` hook in `src/hooks/use-tracker.ts`
- Manages all tracker state: records map, commitment text, loading states
- **Optimistic updates**: UI updates immediately before database persists
- Streak calculation in `useMemo` - counts consecutive completed days backward from today
- Storage abstraction in `src/lib/storage.ts` handles API communication

### Component Architecture
All components are client components (`'use client'`):
- **src/app/page.tsx**: Main orchestrator, uses `useTracker` hook
- **src/components/calendar-grid.tsx**: Renders 42-day calendar grid
- **src/components/day-cell.tsx**: Individual day cell with completion state
- **src/components/month-nav.tsx**: Month navigation controls
- **src/components/streak-display.tsx**: Shows current streak count
- **src/components/today-action.tsx**: Primary check-in button
- **src/components/theme-provider.tsx**: Dark mode system preference detection

### Utilities
- **src/lib/dates.ts**: Pure date manipulation functions (format, parse, calendar generation)
  - All dates stored as strings in `YYYY-MM-DD` format
  - Calendar generation accounts for week starting Monday (not Sunday)
  - Always generates 42-day grid (6 weeks) for consistent layout
- **src/lib/types.ts**: TypeScript type definitions
- **src/lib/utils.ts**: Tailwind CSS class merging with `clsx` and `tailwind-merge`

### Styling
- Tailwind CSS with CSS variables for theming (`--background`, `--foreground`, etc.)
- Dark mode via CSS `prefers-color-scheme` media query (no JavaScript)
- Framer Motion for animations with spring physics
- All animations use `layout` prop for automatic FLIP animations

## Key Implementation Details

### Date Handling
- Dates are strings in `YYYY-MM-DD` format for consistency and comparison
- Use `getToday()` for current date string, never `new Date().toISOString()`
- Calendar weeks start on Monday (adjusted in `getCalendarDays`)

### Streak Calculation
Streaks count backward from today. If today is not complete, streak starts from yesterday:
```typescript
// Counts consecutive completed days backward from current date
// Skips future dates, breaks on first incomplete day
```

### Optimistic UI Updates
Always update local state first, then persist to database:
```typescript
setState(prev => ({ ...prev, records: { ...prev.records, [today]: newRecord } }));
await saveDayRecord(newRecord);
```

### Prisma Client Generation
The Prisma Client is generated to a custom location: `src/generated/prisma/client`. After schema changes:
1. Run `npx prisma generate` to regenerate the client
2. Import from `@/generated/prisma/client` (not `@prisma/client`)
3. Build script automatically runs `prisma generate` before building

### Database Connection
Uses connection pooling with `pg` library and Prisma PostgreSQL adapter. The singleton pattern in `src/lib/prisma.ts` prevents creating multiple Prisma Client instances in development (hot reload).

## Common Patterns

### Adding a New API Endpoint
1. Create `route.ts` in `src/app/api/[endpoint]/`
2. Export `GET`, `POST`, etc. as async functions
3. Import `auth` from `@clerk/nextjs/server` and get `userId`
4. Return 401 if `!userId` (unauthorized)
5. Use `prisma` singleton from `src/lib/prisma.ts`
6. Filter all queries by `userId` to ensure data isolation
7. Return `NextResponse.json()` with appropriate status codes
8. Add corresponding function in `src/lib/storage.ts`

### Adding a New Component
1. Create file in `src/components/` with `.tsx` extension
2. Add `'use client'` directive if using hooks or interactivity
3. Import types from `src/lib/types.ts`
4. Use Tailwind CSS classes, merge with `cn()` utility from `src/lib/utils.ts`
5. Add Framer Motion animations if needed with spring physics

### Modifying Database Schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` to update database
3. Run `npx prisma generate` to regenerate client
4. Restart dev server to pick up changes

## TypeScript Configuration
Strict mode enabled. All components and utilities are fully typed. Use types from `src/lib/types.ts` and generated Prisma types from `src/generated/prisma/client`.