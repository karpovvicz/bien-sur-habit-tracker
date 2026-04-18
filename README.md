# bien sûr

A minimalist daily commitment tracker built with Next.js and PostgreSQL. Track your daily habits, maintain streaks, and visualize your progress through an interactive calendar interface.

## What It Does

bien sûr (French for "of course") helps you stay accountable to daily commitments. The app provides a simple check-in system where you mark each day complete, building up consecutive day streaks. You can view your completion history through an animated monthly calendar that lets you navigate between months and see your progress over time.

The interface includes a streak counter that displays your current consecutive days, and all data persists to a PostgreSQL database so your progress is never lost.

## Tech Stack

**Frontend**
* Next.js 16.1.6 with App Router
* React 19.2.4
* TypeScript 5.9.3 (strict mode)
* Tailwind CSS 3.4.19
* Framer Motion 12.36.0 for animations
* Lucide React for icons

**Backend**
* Prisma 7.5.0 as the ORM
* PostgreSQL database
* Next.js API Routes for server endpoints

**Key Features**
* User authentication with email verification (powered by Clerk)
* Multi-user support - each user has their own isolated tracker
* Dark mode support with system preference detection
* Optimistic UI updates for instant feedback
* Type-safe database operations
* Animated transitions and micro-interactions

## Getting Started

### Prerequisites

You'll need Node.js installed (version 18 or higher recommended) and access to a PostgreSQL database. You can use a local PostgreSQL instance or a hosted service like Vercel Postgres.

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd bien-s-r
```

2. Install dependencies

```bash
npm install
```

3. Set up your environment variables

Create a `.env.local` file in the root directory:

```
DATABASE_URL="postgresql://user:password@localhost:5432/biensr"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

Replace the connection string with your actual PostgreSQL credentials.

For Clerk authentication keys, see **[CLERK_SETUP.md](CLERK_SETUP.md)** for detailed setup instructions.

4. Initialize the database

```bash
npx prisma db push
```

This creates the necessary tables in your database based on the Prisma schema.

5. Generate the Prisma Client

```bash
npx prisma generate
```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser. The application will hot-reload as you make changes to the code.

### Building for Production

```bash
npm run build
npm start
```

The build command automatically generates the Prisma Client before building the Next.js application.

## Project Structure

The codebase follows a clear separation of concerns:

**src/app/** contains the Next.js App Router pages and API routes. The main page is a client component that orchestrates the UI, while API routes handle database operations.

**src/components/** holds all React components. Each component is a client component and handles a specific piece of the UI (the check-in button, streak display, calendar grid, etc.).

**src/hooks/** contains custom React hooks. The `use-tracker.ts` hook manages all state for the tracker, including fetching data from the API and computing the current streak.

**src/lib/** has pure utility functions and type definitions. This includes date manipulation, storage layer functions for API calls, and the Prisma client setup.

**prisma/** contains the database schema defining the `DayRecord` and `Settings` models.

## Database Schema

The application uses two main models:

**DayRecord** stores individual day completions with fields for the date, completion status, and timestamps.

**Settings** stores user preferences like the commitment text they're tracking.

Both models use auto-incrementing IDs and include createdAt/updatedAt timestamps for audit trails.

## Development Notes

The codebase uses TypeScript strict mode to catch type errors at compile time. All components follow React best practices with immutable state updates and proper dependency arrays in hooks.

Styling is done entirely through Tailwind CSS with CSS variables for theming, allowing dark mode to work without JavaScript overhead. Animations use Framer Motion with spring physics for natural feeling transitions.

The `explanation.md` file in the repository contains extensive documentation about architectural decisions, component design, and implementation details if you want to understand the reasoning behind specific choices.

## API Endpoints

**GET /api/records** returns all day records from the database

**POST /api/records** creates or updates a day record (upsert operation)

**GET /api/settings** returns the user's commitment settings

**POST /api/settings** updates the commitment text

All endpoints return JSON and handle errors gracefully with appropriate HTTP status codes.

## Contributing

The project follows conventional commits and maintains a clean git history. Code should pass TypeScript type checking and ESLint validation before committing.

## License

This project is open source and available under the MIT License.