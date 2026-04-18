# Clerk Authentication Setup Instructions

Clerk authentication has been successfully integrated into your bien sûr app! Follow these steps to complete the setup.

## 1. Create a Clerk Account

1. Go to https://clerk.com and sign up for a free account
2. Create a new application in the Clerk Dashboard
3. Choose "Email" and "Password" as authentication methods (you can add more later)
4. Enable email verification in the settings

## 2. Get Your Clerk API Keys

1. In the Clerk Dashboard, go to **API Keys** in the left sidebar
2. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

## 3. Set Up Environment Variables

1. Create a `.env.local` file in the root of your project:

```bash
# Database (your existing PostgreSQL connection)
DATABASE_URL="postgresql://user:password@localhost:5432/biensr"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here
```

2. Replace the placeholder keys with your actual Clerk keys from step 2

## 4. Update Your Database Schema

Run the following command to push the schema changes (adds userId fields):

```bash
npx prisma db push
```

This will:
- Add `userId` field to the `DayRecord` model
- Add `userId` field to the `Settings` model
- Create a unique constraint on `userId + date` for DayRecord
- Create a unique constraint on `userId` for Settings

**Note:** This is a breaking change for existing data. If you have existing records in your database, you may need to manually migrate them or clear the database first.

## 5. Start the Development Server

```bash
npm run dev
```

## 6. Test the Authentication Flow

1. Visit http://localhost:3000
2. You should be redirected to the sign-in page
3. Click "Sign up" to create a new account
4. Enter your email and password
5. Check your email for the verification link
6. Click the verification link
7. You should be redirected back to the app
8. Your habit tracker is now personalized to your account!

## What Changed

### Database Schema
- **DayRecord**: Now includes `userId` field. Each user has their own day records.
- **Settings**: Now includes `userId` field. Each user has their own commitment text.

### API Routes
- All API endpoints now require authentication
- Records and settings are filtered by the authenticated user's ID
- Unauthorized requests return 401 status

### UI Changes
- Added sign-in page at `/sign-in`
- Added sign-up page at `/sign-up`
- Added UserButton in the header (click to see account menu and sign out)
- Middleware protects all routes except sign-in/sign-up

### User Experience
- Each user has their own isolated habit tracker
- Multiple users can use the app independently
- Email verification ensures valid email addresses
- Secure authentication handled by Clerk

## Clerk Dashboard Features

In the Clerk Dashboard, you can:
- View all users
- Manually verify/unverify emails
- Ban/unban users
- Customize email templates
- Add social login providers (Google, GitHub, etc.)
- Configure password requirements
- Set up webhooks for user events

## Troubleshooting

### "Unauthorized" errors
- Make sure your `.env.local` file has the correct Clerk keys
- Restart the dev server after adding environment variables

### Database errors
- Make sure you ran `npx prisma db push`
- Check that your `DATABASE_URL` is correct

### Email verification not working
- Check your spam folder
- In development, Clerk uses a test email service
- For production, you may want to configure a custom email provider

## Next Steps

- Customize the Clerk components with your app's theme
- Add more authentication methods (Google, GitHub, etc.)
- Set up production keys when deploying
- Configure custom email templates in Clerk Dashboard

## Support

- Clerk Documentation: https://clerk.com/docs
- Clerk Discord: https://clerk.com/discord