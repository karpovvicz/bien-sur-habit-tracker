# Database Setup Guide

## Quick Start

Once you have your Vercel Postgres database connection string:

1. **Update `.env` file**:
   ```bash
   DATABASE_URL="your-vercel-postgres-connection-string"
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Run Database Migration**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Vercel Postgres Setup

### Option 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Copy the `DATABASE_URL` connection string
7. Paste it into your `.env` file

### Option 2: Vercel CLI

```bash
# Deploy to Vercel first
npx vercel

# Then add Postgres in the dashboard
```

## Migration Commands

### Create and apply migration
```bash
npx prisma migrate dev --name init
```

### Generate Prisma Client (after schema changes)
```bash
npx prisma generate
```

### View database in browser
```bash
npx prisma studio
```

## Production Deployment

When deploying to Vercel:

1. Add `DATABASE_URL` as an environment variable in Vercel dashboard
2. The migration will run automatically during build
3. Or manually run: `npx prisma migrate deploy`

## Troubleshooting

### "Prisma Client not found"
Run: `npx prisma generate`

### "Cannot connect to database"
- Check your `DATABASE_URL` in `.env`
- Ensure the database is running
- Check firewall/network settings

### "Migration failed"
- Check if the database is empty
- Try: `npx prisma migrate reset` (WARNING: deletes all data)
- Then: `npx prisma migrate dev`

## Data Migration from localStorage

If you have existing data in localStorage that you want to migrate:

1. First complete the database setup above
2. Open your app in the browser
3. Open DevTools Console
4. Run this script to export localStorage data:

```javascript
const data = localStorage.getItem('bien-sur-state');
console.log(data);
// Copy the output
```

5. You can manually add records via the API or Prisma Studio

## Schema Overview

### DayRecord Model
- `date` (String, unique) - Format: YYYY-MM-DD
- `completed` (Boolean) - Whether "done for today" was checked
- `completedAt` (DateTime, nullable) - When it was completed

### Settings Model
- `commitment` (String) - Your daily commitment text
