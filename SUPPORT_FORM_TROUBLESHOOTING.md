# Support Form Troubleshooting Guide

## Issue
The "Send to Support" button on the support page (`/support`) is not working when clicked.

## Root Cause Analysis
The issue is most likely one of the following:
1. ❌ The `support_requests` table doesn't exist in Supabase
2. ❌ RLS (Row Level Security) policies are blocking anonymous inserts
3. ❌ Supabase environment variables are not configured
4. ❌ Network/CORS issue preventing API calls

## Solution Steps

### Step 1: Run the SQL Fix Script
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `fix-support-form.sql` (located in the project root)
4. Copy and paste the entire SQL script
5. Click **Run**
6. Verify that all steps complete successfully

The script will:
- ✅ Create the `support_requests` table if it doesn't exist
- ✅ Enable Row Level Security
- ✅ Drop old/conflicting policies
- ✅ Create new policies that allow anonymous inserts
- ✅ Grant proper permissions to the `anon` role
- ✅ Create performance indexes
- ✅ Test the setup with a sample insert

### Step 2: Verify Environment Variables
Check that your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in:
Supabase Dashboard → Settings → API

### Step 3: Restart the Development Server
After running the SQL script, restart your Next.js dev server:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test the Form
1. Open your browser to `http://localhost:3000/support`
2. Open the browser's Developer Console (F12 or Cmd+Option+I on Mac)
3. Fill out the support form:
   - Name: Test User
   - Email: test@example.com
   - Topic: Any topic
   - Message: Type at least 20 characters
4. Click "Send to Support"

### Step 5: Check Console Logs
In the browser console, you should see:
```
Form submitted with data: {name: "...", email: "...", ...}
Sending request to /api/support-requests...
Response status: 200
Response data: {success: true, ...}
```

In the terminal (where Next.js is running), you should see:
```
=== Support Request API Called ===
Request body: {name: "...", email: "...", ...}
Validation passed, inserting into database...
Successfully created support request: {...}
```

## Debugging Tips

### If you see validation errors:
- Check that all form fields are filled
- Ensure the message is at least 20 characters
- Verify the email format is valid

### If you see database errors:
- Verify the SQL script ran successfully
- Check Supabase Dashboard → Table Editor → support_requests exists
- Check Supabase Dashboard → Authentication → Policies for support_requests

### If you see network errors:
- Verify `.env.local` has correct Supabase credentials
- Check browser console for CORS errors
- Ensure Supabase URL is accessible

### If the form just does nothing:
- Open browser console to see JavaScript errors
- Check that the form submit handler is attached
- Verify React is rendering the form correctly

## Verification Queries

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'support_requests';

-- Check RLS policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'support_requests';

-- Check recent support requests
SELECT id, name, email, topic, created_at, status 
FROM support_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- Test anonymous insert
INSERT INTO support_requests (name, email, topic, message)
VALUES ('Test', 'test@test.com', 'test', 'This is a test message with enough characters.');
```

## Code Changes Made

### 1. Enhanced Frontend Validation (`app/support/page.tsx`)
- Added comprehensive console logging
- Added all field validation before submission
- Better error messages

### 2. Enhanced API Logging (`app/api/support-requests/route.ts`)
- Added detailed request/response logging
- Better error messages with context
- Supabase error details included

### 3. SQL Fix Script (`fix-support-form.sql`)
- Creates table if missing
- Fixes RLS policies for anonymous inserts
- Grants proper permissions
- Includes test queries

## Expected Behavior After Fix

1. User fills out the support form
2. Form validates all fields
3. API receives the request
4. Data is inserted into Supabase
5. Success message appears: "✓ Thanks! We'll reply within 1–2 business days."
6. Form fields reset after 5 seconds

## Need More Help?

If the issue persists after following all steps:

1. Share the console logs from both browser and terminal
2. Share a screenshot of the Supabase policies page
3. Verify the table exists in Supabase Table Editor
4. Check if other API routes are working (e.g., `/api/data-requests`)
