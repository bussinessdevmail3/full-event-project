/*
# Fix profiles INSERT policy

## Problem
The `profiles` table has SELECT and UPDATE policies but NO INSERT policy.
When a new user registers, the auth context tries to insert a row into `profiles`
with `id = auth.uid()`. Without an INSERT policy, this silently fails due to RLS.

## Changes
1. Add INSERT policy on `profiles` allowing authenticated users to insert their own row.
2. Add DELETE policy on `profiles` allowing users to delete their own row (for account deletion).

## Security
- INSERT: `WITH CHECK (auth.uid() = id)` — users can only create a profile with their own auth UID.
- DELETE: `USING (auth.uid() = id)` — users can only delete their own profile.
*/

DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_delete_own_profile" ON profiles;
CREATE POLICY "users_delete_own_profile"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);
