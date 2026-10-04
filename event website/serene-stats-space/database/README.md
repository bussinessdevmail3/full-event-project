# Connecting the dashboard to your app's Supabase

The dashboards use the same tables as the mobile app (booking_requests, supplier_profiles with verification_status, availability with status, etc.).

1. In your Supabase SQL Editor, run `database/sync.sql` once. It doesn't change your tables. It adds user_roles, the security rules, and the automatic actions: holding dates, keeping booking history, and the admin-only supplier approval.
2. Copy `database/.env.example` to `.env` and fill in the same two values your mobile app uses in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` — the Project URL and the anon (publishable) key. Those are the only values needed.
3. Make yourself admin:
   `insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where email = 'you@example.com';`

Status values used:
- booking_requests.status: requested, supplier_reviewing, offer_sent, customer_accepted, payment_pending, confirmed, rejected, cancelled, completed
- availability.status: available, pending, booked, blocked
- availability.status: available, blocked, booked
- supplier_profiles.verification_status: pending, approved, rejected, suspended
- supplier_types.code: `venue` = hall, any other code = singer/artist
