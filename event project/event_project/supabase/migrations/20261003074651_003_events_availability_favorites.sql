/*
# Events, Availability, Favorites

1. New Tables:
   - `events` — Customer events (engagement, wedding, etc.)
   - `availability` — Supplier availability per date (AVAILABLE, PENDING, BOOKED, BLOCKED)
   - `favorites` — Customer favorite suppliers

2. Security:
   - events: owner-only CRUD
   - availability: public read, owner-only writes
   - favorites: owner-only CRUD

3. Notes:
   - Availability has unique constraint on (supplier_id, date) to prevent double-booking
   - All owner columns default to auth.uid()
*/

-- Events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_type_id uuid REFERENCES event_types(id),
  event_date date NOT NULL,
  city_id uuid REFERENCES cities(id),
  location text,
  expected_guests int NOT NULL DEFAULT 0,
  total_budget numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_events" ON events;
CREATE POLICY "owner_read_events" ON events FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_insert_events" ON events;
CREATE POLICY "owner_insert_events" ON events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_update_events" ON events;
CREATE POLICY "owner_update_events" ON events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_delete_events" ON events;
CREATE POLICY "owner_delete_events" ON events FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- Availability
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'booked', 'blocked')),
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(supplier_id, date)
);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_availability" ON availability;
CREATE POLICY "public_read_availability" ON availability FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "owner_insert_availability" ON availability;
CREATE POLICY "owner_insert_availability" ON availability FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = availability.supplier_id AND sp.user_id = auth.uid()));
DROP POLICY IF EXISTS "owner_update_availability" ON availability;
CREATE POLICY "owner_update_availability" ON availability FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = availability.supplier_id AND sp.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = availability.supplier_id AND sp.user_id = auth.uid()));
DROP POLICY IF EXISTS "owner_delete_availability" ON availability;
CREATE POLICY "owner_delete_availability" ON availability FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = availability.supplier_id AND sp.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_availability_supplier_date ON availability(supplier_id, date);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, supplier_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_favorites" ON favorites;
CREATE POLICY "owner_read_favorites" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_insert_favorites" ON favorites;
CREATE POLICY "owner_insert_favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_delete_favorites" ON favorites;
CREATE POLICY "owner_delete_favorites" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_supplier ON favorites(supplier_id);