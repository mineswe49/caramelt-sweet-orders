# Admin User Setup Guide

## Simple Setup - One Step! ✨

### Create Admin User in Supabase Auth

1. Go to https://app.supabase.com → Your Project
2. Click **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter:
   - **Email**: `admin@caramelt.local` (or your email)
   - **Password**: Choose a strong password
5. Click **Create user** ✅

**That's it!** Any user in Supabase Auth can access the admin dashboard.

---

## Test Admin Login

1. Go to http://localhost:3000/admin/login
2. Email: `admin@caramelt.local`
3. Password: [Your password from above]
4. Should redirect to `/admin/dashboard` ✅

---

## Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@caramelt.local` |
| Password | Your choice |
| Status | Active (just created) |

---

## Admin Dashboard Features

Once logged in, admin can:

✅ **View Orders**
- See all orders with customer details
- Filter by status (All, Pending, Accepted, Paid)
- View customer info linked from customers table
- Click order to see details

✅ **Accept Orders** (2-Step Process)
- Click **"Accept Order"** button
- Select confirmed prep date (must be 2+ days out)
- Click **"Accept Order"** to confirm
- Order status changes: PENDING_ADMIN_ACCEPTANCE → ACCEPTED

✅ **Mark Orders as Paid**
- Once order is ACCEPTED, click **"Mark as Paid"** button
- Optionally add admin comment
- Click **"Mark as Paid & Send Email"**
- Order status changes: ACCEPTED → PAID_CONFIRMED
- **✉️ Email automatically sent** to customer via Edge Function

✅ **View Order Details**
- Customer info (name, email, phone, WhatsApp)
- All items with quantities and prices
- Order timeline (Order Placed → Accepted → Payment Confirmed)
- Admin notes section

✅ **Manage Products**
- Create new products with images
- Edit existing products
- Set availability status
- Upload images to Supabase Storage
- View all products in the catalog

---

## Product Management Setup

### Step 1: Storage Bucket Setup ✅

The `caramelt` bucket has been created. Make sure it's configured:

1. Go to https://app.supabase.com → Your Project → **Storage**
2. Verify the `caramelt` bucket exists
3. Make sure **Public bucket** is toggled ON (blue) ✅
4. If not public, click the bucket and enable public access

### Step 2: Storage Permissions

1. Click on the `caramelt` bucket
2. Go to **Policies** tab
3. Verify these permissions exist:
   - Public read access for images
   - Authenticated write access for uploads
   - Delete access for image removal
4. If missing, create the policies

### Step 2: Add Products

1. Log in to admin dashboard: http://localhost:3000/admin/login
2. Click **Products** in the sidebar
3. Click **Add Product** button
4. Fill in:
   - **Product Name**: e.g., "Chocolate Caramel Cake"
   - **Description**: Detailed product description
   - **Price**: Set the price
   - **Image**: Click to upload product image (PNG, JPG, GIF - max 5MB)
   - **Available**: Check to make product available for purchase
5. Click **Create Product** ✅

### Step 3: Manage Products

**Edit Product:**
1. Click **Edit** button on any product card
2. Update details or image
3. Click **Update Product**

**Delete Product:**
1. Click **Delete** button on any product card
2. Confirm deletion (removes image from storage)

---

## Troubleshooting Image Uploads

### Error: "Failed to upload image" (500)

**Solution:**
1. ✅ Verify `caramelt` bucket exists:
   - Go to Storage → Check "caramelt" bucket is listed
   - If not, create it

2. ✅ Verify bucket is PUBLIC:
   - Click on caramelt bucket
   - Check toggle is ON (blue)
   - If OFF, click to enable

3. ✅ Verify you can access the bucket URL:
   - Go to https://app.supabase.com → Project Settings → API
   - Copy your Project URL (should look like: `https://xxxxx.supabase.co`)
   - Verify your `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` matches this

4. ✅ Check browser console for more details:
   - Open DevTools (F12) → Console
   - Try uploading again
   - Look for detailed error message from server

### Error: "File must be an image"
- Make sure you're selecting a real image file (PNG, JPG, GIF)
- Avoid files with wrong extensions

### Error: "File size must be less than 5MB"
- The file is too large
- Compress the image or use a smaller file

---

## Create Multiple Admins (Optional)

To add more admins, repeat the process:

1. **Authentication** → **Users** → **Add User**
2. Email: `manager@caramelt.local`
3. Password: [Strong password]
4. Click **Create user**

Now both admins can log in independently.

---

## Reset Admin Password

If an admin forgets their password:

1. Go to **Authentication** → **Users**
2. Click on the user
3. Click **Reset Password**
4. Supabase sends reset link to their email

---

## Security Notes

✅ Admin passwords hashed by Supabase Auth (bcrypt)
✅ Admin users must authenticate via login page
✅ Only authenticated users can access `/admin/dashboard`
✅ All auth is handled by Supabase Auth service
✅ No extra database tables = simpler & more secure

---

## Architecture

```
Supabase Auth (auth.users)
    ↓
    ├─ Email: admin@caramelt.local
    ├─ Password: [hashed]
    └─ Session: Manages login/logout
         ↓
    Next.js Admin Dashboard
    Checks: Is user authenticated?
         ↓
    If YES → Show admin panel
    If NO → Redirect to login
```

---

## Troubleshooting

**Can't log in?**
- Verify email matches exactly
- Check password is correct
- Verify user exists in Auth → Users

**404 on dashboard?**
- Check user is logged in
- Verify you're going to: http://localhost:3000/admin/login

**Orders not showing?**
- Verify orders exist in database
- Check Supabase connection (see dev server logs)
