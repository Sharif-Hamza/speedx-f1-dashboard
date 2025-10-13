# 🚨 FIX WAITLIST RLS ERROR

## You're getting this error:
```
"new row violates row-level security policy for table \"waitlist_users\""
```

## 🔧 **SOLUTION: Run This SQL**

1. Go to: https://bzfrmujzxmfufvumknkq.supabase.co
2. Click **SQL Editor**
3. Click **New Query**
4. Copy the entire `FIX_WAITLIST_RLS.sql` file
5. Paste and **RUN**

This will:
- ✅ Fix the RLS policy that's blocking signups
- ✅ Enable email verification for new users
- ✅ Make waitlist signups work properly

---

## 📧 **Email Verification Flow**

After running the SQL fix, the flow will be:

1. **User signs up on waitlist**
   - Fills out the form
   - Gets email verification message

2. **User checks email**
   - Receives verification link from Supabase
   - Clicks the link to verify

3. **Email verified ✅**
   - User is redirected to pending page
   - Status shows "Pending Review"

4. **Admin approves** (from admin dashboard)
   - Go to http://localhost:3001
   - Click "Waitlist" tab
   - Click ✅ Approve button

5. **User can now login!**
   - Go to http://localhost:3000/login
   - Login with credentials
   - Access full dashboard

---

## ⚙️ **Supabase Email Settings**

Make sure email confirmation is enabled:

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Email**
3. Make sure **"Enable email confirmations"** is checked
4. Set **Confirm email** to enabled

---

## 🧪 **Test It:**

1. Run the SQL fix (`FIX_WAITLIST_RLS.sql`)
2. Go to http://localhost:3000
3. Sign up with a test email
4. You'll see "Check Your Email!" message
5. Check email for verification link
6. Click the link
7. Go to admin dashboard to approve
8. Login and test!

**Both apps running:**
- User App: http://localhost:3000
- Admin App: http://localhost:3001
