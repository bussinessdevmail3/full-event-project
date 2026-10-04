/*
# Seed Availability Data for Demo Suppliers

1. Inserts:
   - Availability data for all 8 demo suppliers (mix of available/booked/blocked dates across Oct 2026 - Dec 2027)
   - Key dates like 2027-08-15 are booked for most suppliers to demonstrate availability filtering

2. Notes:
   - Uses generate_series for broad date coverage
   - ON CONFLICT to be idempotent
*/

-- Venue 1 (Royal Palace)
INSERT INTO availability (supplier_id, date, status)
SELECT '11111111-0000-0000-0000-000000000001', d::date,
  CASE
    WHEN d::date IN ('2027-08-15', '2027-09-05', '2027-06-12', '2027-07-03') THEN 'booked'
    WHEN d::date IN ('2027-08-22', '2027-09-12') THEN 'blocked'
    ELSE 'available'
  END
FROM generate_series('2026-10-01'::date, '2027-12-31'::date, '1 day'::interval) d
ON CONFLICT (supplier_id, date) DO NOTHING;

-- Venue 2 (Golden Hall)
INSERT INTO availability (supplier_id, date, status)
SELECT '11111111-0000-0000-0000-000000000002', d::date,
  CASE
    WHEN d::date IN ('2027-08-15', '2027-10-10', '2027-05-20') THEN 'booked'
    WHEN d::date IN ('2027-09-01') THEN 'blocked'
    ELSE 'available'
  END
FROM generate_series('2026-10-01'::date, '2027-12-31'::date, '1 day'::interval) d
ON CONFLICT (supplier_id, date) DO NOTHING;

-- Venue 3 (Garden Events)
INSERT INTO availability (supplier_id, date, status)
SELECT '11111111-0000-0000-0000-000000000003', d::date,
  CASE
    WHEN d::date IN ('2027-08-15', '2027-07-15', '2027-06-20') THEN 'booked'
    ELSE 'available'
  END
FROM generate_series('2026-10-01'::date, '2027-12-31'::date, '1 day'::interval) d
ON CONFLICT (supplier_id, date) DO NOTHING;

-- Venue 4 (Crystal Venue)
INSERT INTO availability (supplier_id, date, status)
SELECT '11111111-0000-0000-0000-000000000004', d::date,
  CASE
    WHEN d::date IN ('2027-08-15', '2027-09-20') THEN 'booked'
    WHEN d::date IN ('2027-10-01', '2027-10-02') THEN 'blocked'
    ELSE 'available'
  END
FROM generate_series('2026-10-01'::date, '2027-12-31'::date, '1 day'::interval) d
ON CONFLICT (supplier_id, date) DO NOTHING;

-- Artist 1 (Ahmad Singer)
INSERT INTO availability (supplier_id, date, status)
SELECT '22222222-0000-0000-0000-000000000001', d::date,
  CASE
    WHEN d::date IN ('2027-08-15', '2027-09-05', '2027-06-12') THEN 'booked'
    ELSE 'available'
  END
FROM generate_series('2026-10-01'::date, '2027-12-31'::date, '1 day'::interval) d
ON CONFLICT (supplier_id, date) DO NOTHING;

-- Artist 2 (Layla Live)
INSERT INTO availability (supplier_id, date, status)
SELECT '22222222-0000-0000-0000-000000000002', d::date,
  CASE
    WHEN d::date IN ('2027-08-15', '2027-10-10') THEN 'booked'
    ELSE 'available'
  END
FROM generate_series('2026-10-01'::date, '2027-12-31'::date, '1 day'::interval) d
ON CONFLICT (supplier_id, date) DO NOTHING;

-- Artist 3 (Omar Events)
INSERT INTO availability (supplier_id, date, status)
SELECT '22222222-0000-0000-0000-000000000003', d::date,
  CASE
    WHEN d::date IN ('2027-08-15') THEN 'booked'
    ELSE 'available'
  END
FROM generate_series('2026-10-01'::date, '2027-12-31'::date, '1 day'::interval) d
ON CONFLICT (supplier_id, date) DO NOTHING;

-- Artist 4 (Nour Music)
INSERT INTO availability (supplier_id, date, status)
SELECT '22222222-0000-0000-0000-000000000004', d::date,
  CASE
    WHEN d::date IN ('2027-08-15', '2027-09-20', '2027-11-15') THEN 'booked'
    ELSE 'available'
  END
FROM generate_series('2026-10-01'::date, '2027-12-31'::date, '1 day'::interval) d
ON CONFLICT (supplier_id, date) DO NOTHING;