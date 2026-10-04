/*
# Profiles, Supplier Profiles, and Supplier Details

Creates user profile tables and supplier-related tables.

1. New Tables:
   - `profiles` — Base profile for every auth user (role: customer, supplier, admin)
   - `customer_profiles` — Extended customer info
   - `supplier_profiles` — Extended supplier info with verification status
   - `supplier_service_areas` — Which cities/regions a supplier serves
   - `venues` — Venue-specific details linked to supplier_profiles
   - `venue_amenities` — Many-to-many between venues and amenities
   - `artists` — Artist/singer-specific details linked to supplier_profiles
   - `artist_genres` — Many-to-many between artists and genres
   - `supplier_packages` — Packages offered by suppliers
   - `media` — Media items (photos, videos) for suppliers

2. Security:
   - profiles: owner can read/update own row; all authenticated can read basic profile
   - customer_profiles: owner-only CRUD
   - supplier_profiles: public read (only approved suppliers visible to customers), owner can update own
   - venue/artist details: public read, owner update only
   - media: public read, owner create/update/delete

3. Notes:
   - Role stored in profiles table (raw_app_meta_data is the authoritative source, mirrored here)
   - Supplier verification status: PENDING, APPROVED, REJECTED, SUSPENDED
   - Designed so supplier app/admin can be added later without schema changes
*/

-- Profiles (base table for all users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'supplier', 'admin')),
  preferred_language text NOT NULL DEFAULT 'he' CHECK (preferred_language IN ('he', 'ar')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Customer Profiles (extended info)
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  default_event_type_id uuid REFERENCES event_types(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer_read_own" ON customer_profiles;
CREATE POLICY "customer_read_own" ON customer_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "customer_insert_own" ON customer_profiles;
CREATE POLICY "customer_insert_own" ON customer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "customer_update_own" ON customer_profiles;
CREATE POLICY "customer_update_own" ON customer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "customer_delete_own" ON customer_profiles;
CREATE POLICY "customer_delete_own" ON customer_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Supplier Profiles
CREATE TABLE IF NOT EXISTS supplier_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_type_id uuid NOT NULL REFERENCES supplier_types(id),
  business_name_he text NOT NULL,
  business_name_ar text,
  description_he text,
  description_ar text,
  phone text,
  email text,
  website text,
  instagram text,
  facebook text,
  tiktok text,
  youtube text,
  city_id uuid REFERENCES cities(id),
  address text,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  is_verified boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  min_price numeric(10,2),
  max_price numeric(10,2),
  starting_price numeric(10,2),
  total_bookings int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE supplier_profiles ENABLE ROW LEVEL SECURITY;

-- Public can read only approved suppliers
DROP POLICY IF EXISTS "public_read_approved_suppliers" ON supplier_profiles;
CREATE POLICY "public_read_approved_suppliers" ON supplier_profiles
  FOR SELECT TO anon, authenticated
  USING (verification_status = 'approved');

-- Supplier owner can read/update own profile
DROP POLICY IF EXISTS "supplier_read_own" ON supplier_profiles;
CREATE POLICY "supplier_read_own" ON supplier_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "supplier_update_own" ON supplier_profiles;
CREATE POLICY "supplier_update_own" ON supplier_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_supplier_profiles_type ON supplier_profiles(supplier_type_id);
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_city ON supplier_profiles(city_id);
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_featured ON supplier_profiles(is_featured) WHERE is_featured = true;

-- Supplier Service Areas
CREATE TABLE IF NOT EXISTS supplier_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  city_id uuid REFERENCES cities(id) ON DELETE CASCADE,
  region_id uuid REFERENCES regions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE supplier_service_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_service_areas" ON supplier_service_areas;
CREATE POLICY "public_read_service_areas" ON supplier_service_areas FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_supplier_service_areas_supplier ON supplier_service_areas(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_service_areas_city ON supplier_service_areas(city_id);

-- Venues (venue-specific details)
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL UNIQUE REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  min_guests int NOT NULL DEFAULT 0,
  max_guests int NOT NULL DEFAULT 0,
  price_per_guest numeric(10,2) NOT NULL DEFAULT 0,
  venue_type text NOT NULL DEFAULT 'indoor' CHECK (venue_type IN ('indoor', 'outdoor', 'garden', 'combined')),
  has_parking boolean NOT NULL DEFAULT false,
  has_accessibility boolean NOT NULL DEFAULT false,
  is_kosher boolean NOT NULL DEFAULT false,
  kosher_certificate text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_venues" ON venues;
CREATE POLICY "public_read_venues" ON venues FOR SELECT TO anon, authenticated USING (true);

-- Owner can update their own venue details
DROP POLICY IF EXISTS "owner_update_venue" ON venues;
CREATE POLICY "owner_update_venue" ON venues
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = venues.supplier_id AND sp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = venues.supplier_id AND sp.user_id = auth.uid()));

-- Venue Amenities
CREATE TABLE IF NOT EXISTS venue_amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  amenity_id uuid NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  UNIQUE(venue_id, amenity_id)
);

ALTER TABLE venue_amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_venue_amenities" ON venue_amenities;
CREATE POLICY "public_read_venue_amenities" ON venue_amenities FOR SELECT TO anon, authenticated USING (true);

-- Artists (singer/artist-specific details)
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL UNIQUE REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  performance_duration_min int NOT NULL DEFAULT 120,
  languages_he text[],
  languages_ar text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_artists" ON artists;
CREATE POLICY "public_read_artists" ON artists FOR SELECT TO anon, authenticated USING (true);

-- Artist Genres
CREATE TABLE IF NOT EXISTS artist_genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  genre_id uuid NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  UNIQUE(artist_id, genre_id)
);

ALTER TABLE artist_genres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_artist_genres" ON artist_genres;
CREATE POLICY "public_read_artist_genres" ON artist_genres FOR SELECT TO anon, authenticated USING (true);

-- Supplier Packages
CREATE TABLE IF NOT EXISTS supplier_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  name_he text NOT NULL,
  name_ar text,
  description_he text,
  description_ar text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  duration_hours int,
  included_services text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE supplier_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_packages" ON supplier_packages;
CREATE POLICY "public_read_packages" ON supplier_packages FOR SELECT TO anon, authenticated USING (true);

-- Media (photos, videos for suppliers)
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  thumbnail_url text,
  media_type text NOT NULL DEFAULT 'photo' CHECK (media_type IN ('photo', 'video')),
  sort_order int NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_media" ON media;
CREATE POLICY "public_read_media" ON media FOR SELECT TO anon, authenticated USING (true);

-- Owner can manage their media
DROP POLICY IF EXISTS "owner_insert_media" ON media;
CREATE POLICY "owner_insert_media" ON media
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = media.supplier_id AND sp.user_id = auth.uid()));

DROP POLICY IF EXISTS "owner_update_media" ON media;
CREATE POLICY "owner_update_media" ON media
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = media.supplier_id AND sp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = media.supplier_id AND sp.user_id = auth.uid()));

DROP POLICY IF EXISTS "owner_delete_media" ON media;
CREATE POLICY "owner_delete_media" ON media
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = media.supplier_id AND sp.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_media_supplier ON media(supplier_id, sort_order);