/*
# Core Foundation Tables

Creates the foundational tables for the event booking platform:

1. New Tables:
   - `regions` — Geographic regions (North, Center, South, etc.)
   - `cities` — Cities belonging to regions
   - `supplier_types` — Types of suppliers (Venue, Singer, Photographer, DJ, etc.) — extensible
   - `service_categories` — Sub-categories within supplier types
   - `amenities` — Venue amenities (parking, accessibility, kosher, etc.)
   - `genres` — Music/artist genres (Arabic, Dabke, Pop, etc.)
   - `event_types` — Types of events (Wedding, Engagement, Birthday, etc.)

2. Security:
   - All tables have RLS enabled
   - All tables are publicly readable (anon + authenticated) since they are reference data
   - No writes from frontend (admin-managed in the future)

3. Notes:
   - All IDs are UUIDs
   - created_at / updated_at on every table
   - Designed for extensibility — new supplier types, genres, amenities can be added without schema changes
*/

-- Regions
CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL,
  name_ar text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_regions" ON regions;
CREATE POLICY "public_read_regions" ON regions FOR SELECT TO anon, authenticated USING (true);

-- Cities
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name_he text NOT NULL,
  name_ar text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_cities" ON cities;
CREATE POLICY "public_read_cities" ON cities FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_cities_region_id ON cities(region_id);

-- Supplier Types
CREATE TABLE IF NOT EXISTS supplier_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_he text NOT NULL,
  name_ar text NOT NULL,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE supplier_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_supplier_types" ON supplier_types;
CREATE POLICY "public_read_supplier_types" ON supplier_types FOR SELECT TO anon, authenticated USING (true);

-- Service Categories (sub-categories within a supplier type)
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_type_id uuid NOT NULL REFERENCES supplier_types(id) ON DELETE CASCADE,
  code text NOT NULL,
  name_he text NOT NULL,
  name_ar text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(supplier_type_id, code)
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_service_categories" ON service_categories;
CREATE POLICY "public_read_service_categories" ON service_categories FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_service_categories_supplier_type_id ON service_categories(supplier_type_id);

-- Amenities
CREATE TABLE IF NOT EXISTS amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_he text NOT NULL,
  name_ar text NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_amenities" ON amenities;
CREATE POLICY "public_read_amenities" ON amenities FOR SELECT TO anon, authenticated USING (true);

-- Genres
CREATE TABLE IF NOT EXISTS genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_he text NOT NULL,
  name_ar text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_genres" ON genres;
CREATE POLICY "public_read_genres" ON genres FOR SELECT TO anon, authenticated USING (true);

-- Event Types
CREATE TABLE IF NOT EXISTS event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_he text NOT NULL,
  name_ar text NOT NULL,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_event_types" ON event_types;
CREATE POLICY "public_read_event_types" ON event_types FOR SELECT TO anon, authenticated USING (true);