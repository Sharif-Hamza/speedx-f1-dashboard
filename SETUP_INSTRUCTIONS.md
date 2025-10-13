# SpeedX Dashboard - Waitlist Setup Instructions

## 🚀 Quick Start

### 1. Run the SQL Schema in Supabase

1. Go to your Supabase project: https://bzfrmujzxmfufvumknkq.supabase.co
2. Navigate to the SQL Editor
3. Copy the entire contents of `WAITLIST_SCHEMA.sql`
4. Paste and run it in the SQL Editor

This will create:
- `waitlist_users` table
- `user_profiles` table
- Approval/rejection functions
- All necessary triggers and RLS policies

### 2. Start the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## 🔄 User Flow

### For New Users:
1. Visit http://localhost:3000 → Redirects to `/waitlist`
2. Fill out the waitlist form (name, email, password)
3. Click "Join Waitlist" → Redirected to `/pending`
4. See "Pending Review" status page

### For Admins (Using SpeedX Admin Dashboard):
1. Go to SpeedX Admin Dashboard
2. View waitlist users in the database
3. Approve or reject users using SQL or admin interface:
   ```sql
   -- To approve a user
   SELECT approve_waitlist_user(
     'user-waitlist-id-here'::uuid,
     'admin@example.com'
   );
   
   -- To reject a user
   SELECT reject_waitlist_user(
     'user-waitlist-id-here'::uuid,
     'admin@example.com',
     'Optional rejection reason'
   );
   ```

### For Approved Users:
1. Receive email notification (if configured)
2. Visit http://localhost:3000 → Redirects to `/login`
3. Enter same credentials used for waitlist
4. Access full dashboard at `/dashboard`

## 📱 Mobile App Integration

The same auth credentials work for both:
- ✅ Web Dashboard (this app)
- ✅ Mobile App (SpeedX iOS/Android)

Users create ONE account that works everywhere!

## 🗂️ File Structure

```
app/
├── page.tsx                 # Root redirect logic
├── waitlist/
│   └── page.tsx            # Waitlist signup form
├── pending/
│   └── page.tsx            # Pending approval page
├── login/
│   └── page.tsx            # Login for approved users
└── dashboard/
    └── page.tsx            # Main dashboard (protected)

contexts/
└── AuthContext.tsx          # Authentication state management

lib/
└── supabase.ts             # Supabase client config

.env.local                   # Environment variables (already configured)
WAITLIST_SCHEMA.sql         # Database schema to run in Supabase
```

## 🎨 Features

- ✨ Apple-inspired UI with Framer Motion animations
- 🔐 Secure authentication with Supabase
- 📊 Real-time waitlist status checking
- 🎯 Protected dashboard routes
- 📱 Fully responsive design
- ⚡ Optimized performance

## 🛠️ Admin Tasks

### View All Waitlist Users
```sql
SELECT * FROM waitlist_users ORDER BY created_at DESC;
```

### View Pending Users Only
```sql
SELECT * FROM waitlist_users WHERE status = 'pending' ORDER BY created_at DESC;
```

### Check User Profile
```sql
SELECT * FROM user_profiles WHERE email = 'user@example.com';
```

## 🔧 Troubleshooting

### User can't log in after approval
1. Check waitlist status: `SELECT * FROM waitlist_users WHERE email = 'user@example.com';`
2. Check profile approval: `SELECT * FROM user_profiles WHERE email = 'user@example.com';`
3. Make sure `waitlist_approved = true` in user_profiles

### RLS Errors
Make sure you ran the ENTIRE `WAITLIST_SCHEMA.sql` file, including:
- All RLS policies
- GRANT permissions
- Trigger functions

## 📧 Next Steps

1. ✅ Run the SQL schema
2. ✅ Test the waitlist flow
3. 🔄 Integrate with SpeedX Admin Dashboard
4. 📧 Add email notifications (optional)
5. 🚀 Deploy to production

## 🎯 Production Checklist

- [ ] Run SQL schema on production Supabase
- [ ] Update environment variables for production
- [ ] Test email confirmation (if using)
- [ ] Configure email templates
- [ ] Set up admin approval workflow
- [ ] Test complete user flow
- [ ] Enable RLS policies
- [ ] Configure rate limiting

---

**Need Help?** Check the SpeedX Admin Dashboard for user management!
