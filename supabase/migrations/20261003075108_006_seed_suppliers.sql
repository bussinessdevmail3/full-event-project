/*
# Seed Demo Suppliers: Venues and Artists

1. Inserts:
   - 4 venue supplier profiles + venue details + amenities + service areas + media
   - 4 artist/singer supplier profiles + artist details + genres + service areas + media + packages
   - Media uses Pexels image URLs

2. Notes:
   - All suppliers are APPROVED and visible publicly
   - No real auth users needed — user_id is null for demo suppliers
*/

-- ===== VENUE 1: Royal Palace (Nazareth) =====
INSERT INTO supplier_profiles (id, user_id, supplier_type_id, business_name_he, business_name_ar, description_he, description_ar, phone, email, city_id, rating, review_count, is_verified, is_featured, verification_status, starting_price, min_price, max_price, total_bookings)
VALUES ('11111111-0000-0000-0000-000000000001', null, 'c0000000-0000-0000-0000-000000000001',
  'ארמון רויאל', 'قاعة رويال بالاس',
  'אולם אירועים יוקרתי בנצרת עם קיבולת של עד 600 אורחים. אולם מפואר עם גינה פורחת, חניה פרטית ומטבח כשר.',
  'قاعة فاخرة في الناصرة بسعة تصل إلى 600 ضيف. قاعة رائعة مع حديقة مزهرة ومواقف خاصة ومطبخ كوشر.',
  '050-1234567', 'info@royalpalace.example', 'b0000000-0000-0000-0000-000000000002',
  4.8, 127, true, true, 'approved', 230, 230, 350, 340)
ON CONFLICT (id) DO NOTHING;

INSERT INTO venues (id, supplier_id, min_guests, max_guests, price_per_guest, venue_type, has_parking, has_accessibility, is_kosher, latitude, longitude)
VALUES ('21111111-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 150, 600, 230, 'combined', true, true, true, 32.6996, 35.2966)
ON CONFLICT (id) DO NOTHING;

INSERT INTO venue_amenities (venue_id, amenity_id) VALUES
  ('21111111-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
  ('21111111-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'),
  ('21111111-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003'),
  ('21111111-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004'),
  ('21111111-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005'),
  ('21111111-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000007'),
  ('21111111-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

INSERT INTO supplier_service_areas (supplier_id, city_id) VALUES
  ('11111111-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('11111111-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004'),
  ('11111111-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012')
ON CONFLICT DO NOTHING;

INSERT INTO media (supplier_id, url, thumbnail_url, media_type, sort_order, is_cover) VALUES
  ('11111111-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 0, true),
  ('11111111-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 1, false),
  ('11111111-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 2, false),
  ('11111111-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 3, false)
ON CONFLICT DO NOTHING;

-- ===== VENUE 2: Golden Hall (Haifa) =====
INSERT INTO supplier_profiles (id, user_id, supplier_type_id, business_name_he, business_name_ar, description_he, description_ar, phone, email, city_id, rating, review_count, is_verified, is_featured, verification_status, starting_price, min_price, max_price, total_bookings)
VALUES ('11111111-0000-0000-0000-000000000002', null, 'c0000000-0000-0000-0000-000000000001',
  'אולם גולדן', 'قاعة جولدن هول',
  'אולם אירועים מודרני בחיפה עם תאורה מרשימה ועיצוב עכשווי. מתאים לאירועים אינטימיים וגדולים כאחד.',
  'قاعة مناسبات عصرية في حيفا مع إضاءة مبهرة وتصميم عصري. مناسبة للمناسبات الحميمة والكبيرة على حد سواء.',
  '050-2345678', 'info@goldenhall.example', 'b0000000-0000-0000-0000-000000000001',
  4.6, 89, true, false, 'approved', 180, 180, 280, 210)
ON CONFLICT (id) DO NOTHING;

INSERT INTO venues (id, supplier_id, min_guests, max_guests, price_per_guest, venue_type, has_parking, has_accessibility, is_kosher, latitude, longitude)
VALUES ('21111111-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 100, 450, 180, 'indoor', true, true, false, 32.7940, 34.9896)
ON CONFLICT (id) DO NOTHING;

INSERT INTO venue_amenities (venue_id, amenity_id) VALUES
  ('21111111-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001'),
  ('21111111-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002'),
  ('21111111-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000005'),
  ('21111111-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000007'),
  ('21111111-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

INSERT INTO supplier_service_areas (supplier_id, city_id) VALUES
  ('11111111-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001'),
  ('11111111-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

INSERT INTO media (supplier_id, url, thumbnail_url, media_type, sort_order, is_cover) VALUES
  ('11111111-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/2609324/pexels-photo-2609324.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/2609324/pexels-photo-2609324.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 0, true),
  ('11111111-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 1, false),
  ('11111111-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/256737/pexels-photo-256737.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/256737/pexels-photo-256737.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 2, false)
ON CONFLICT DO NOTHING;

-- ===== VENUE 3: Garden Events (Tiberias) =====
INSERT INTO supplier_profiles (id, user_id, supplier_type_id, business_name_he, business_name_ar, description_he, description_ar, phone, email, city_id, rating, review_count, is_verified, is_featured, verification_status, starting_price, min_price, max_price, total_bookings)
VALUES ('11111111-0000-0000-0000-000000000003', null, 'c0000000-0000-0000-0000-000000000001',
  'אירועי גינה', 'حدائق المناسبات',
  'גינה פורחת על שפת הכנרת עם נוף מדהים. אידיאלי לחתונות ואירועי קיץ תחת כיפת השמיים.',
  'حديقة مزهرة على ضفاف بحيرة طبريا مع منظر خلاب. مثالية للأعراس والمناسبات الصيفية تحت سماء مفتوحة.',
  '050-3456789', 'info@gardenevents.example', 'b0000000-0000-0000-0000-000000000003',
  4.9, 156, true, true, 'approved', 200, 200, 320, 280)
ON CONFLICT (id) DO NOTHING;

INSERT INTO venues (id, supplier_id, min_guests, max_guests, price_per_guest, venue_type, has_parking, has_accessibility, is_kosher, latitude, longitude)
VALUES ('21111111-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003', 80, 400, 200, 'garden', true, false, true, 32.7872, 35.5308)
ON CONFLICT (id) DO NOTHING;

INSERT INTO venue_amenities (venue_id, amenity_id) VALUES
  ('21111111-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001'),
  ('21111111-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003'),
  ('21111111-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004'),
  ('21111111-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000006')
ON CONFLICT DO NOTHING;

INSERT INTO supplier_service_areas (supplier_id, city_id) VALUES
  ('11111111-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'),
  ('11111111-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000012')
ON CONFLICT DO NOTHING;

INSERT INTO media (supplier_id, url, thumbnail_url, media_type, sort_order, is_cover) VALUES
  ('11111111-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 0, true),
  ('11111111-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 1, false),
  ('11111111-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 2, false)
ON CONFLICT DO NOTHING;

-- ===== VENUE 4: Crystal Venue (Tel Aviv) =====
INSERT INTO supplier_profiles (id, user_id, supplier_type_id, business_name_he, business_name_ar, description_he, description_ar, phone, email, city_id, rating, review_count, is_verified, is_featured, verification_status, starting_price, min_price, max_price, total_bookings)
VALUES ('11111111-0000-0000-0000-000000000004', null, 'c0000000-0000-0000-0000-000000000001',
  'קריסטל ויו', 'كريستال فينيو',
  'אולם בוטיק מהודר בתל אביב לאירועים יוקרתיים עד 250 אורחים. עיצוב אלגנטי ושירות VIP.',
  'قاعة بوتيك فاخرة في تل أبيب للمناسبات الراقية حتى 250 ضيف. تصميم أنيق وخدمة VIP.',
  '050-4567890', 'info@crystalvenue.example', 'b0000000-0000-0000-0000-000000000005',
  4.7, 73, true, false, 'approved', 300, 300, 450, 150)
ON CONFLICT (id) DO NOTHING;

INSERT INTO venues (id, supplier_id, min_guests, max_guests, price_per_guest, venue_type, has_parking, has_accessibility, is_kosher, latitude, longitude)
VALUES ('21111111-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000004', 50, 250, 300, 'indoor', false, true, true, 32.0853, 34.7818)
ON CONFLICT (id) DO NOTHING;

INSERT INTO venue_amenities (venue_id, amenity_id) VALUES
  ('21111111-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002'),
  ('21111111-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000003'),
  ('21111111-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005'),
  ('21111111-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000007'),
  ('21111111-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

INSERT INTO supplier_service_areas (supplier_id, city_id) VALUES
  ('11111111-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005'),
  ('11111111-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000006'),
  ('11111111-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000007')
ON CONFLICT DO NOTHING;

INSERT INTO media (supplier_id, url, thumbnail_url, media_type, sort_order, is_cover) VALUES
  ('11111111-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 0, true),
  ('11111111-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/2609324/pexels-photo-2609324.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/2609324/pexels-photo-2609324.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 1, false),
  ('11111111-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 2, false)
ON CONFLICT DO NOTHING;

-- ===== ARTIST 1: Ahmad Singer =====
INSERT INTO supplier_profiles (id, user_id, supplier_type_id, business_name_he, business_name_ar, description_he, description_ar, phone, email, city_id, rating, review_count, is_verified, is_featured, verification_status, starting_price, min_price, max_price, total_bookings, instagram, facebook)
VALUES ('22222222-0000-0000-0000-000000000001', null, 'c0000000-0000-0000-0000-000000000002',
  'אחמד זמר', 'أحمد المطرب',
  'זמר מוערך המתמחה במוזיקה ערבית מסורתית ודבקה. מופיע בחתונות ואירועים בכל רחבי הגליל והצפון.',
  'مطرب محترف متخصص في الموسيقى العربية التقليدية والدبكة. يغني في الأعراس والمناسبات في جميع أنحاء الجليل والشمال.',
  '050-5678901', 'info@ahmadsinger.example', 'b0000000-0000-0000-0000-000000000002',
  4.9, 203, true, true, 'approved', 3500, 3500, 8000, 180, 'ahmadsinger', 'ahmadsinger')
ON CONFLICT (id) DO NOTHING;

INSERT INTO artists (id, supplier_id, performance_duration_min, languages_he, languages_ar)
VALUES ('32222222-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 180, ARRAY['עברית','ערבית'], ARRAY['العربية','العبرية'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO artist_genres (artist_id, genre_id) VALUES
  ('32222222-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001'),
  ('32222222-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002'),
  ('32222222-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005'),
  ('32222222-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000006')
ON CONFLICT DO NOTHING;

INSERT INTO supplier_service_areas (supplier_id, city_id) VALUES
  ('22222222-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('22222222-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
  ('22222222-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004'),
  ('22222222-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

INSERT INTO media (supplier_id, url, thumbnail_url, media_type, sort_order, is_cover) VALUES
  ('22222222-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 0, true),
  ('22222222-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/1370548/pexels-photo-1370548.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1370548/pexels-photo-1370548.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 1, false),
  ('22222222-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 2, false)
ON CONFLICT DO NOTHING;

INSERT INTO supplier_packages (supplier_id, name_he, name_ar, description_he, description_ar, price, duration_hours, included_services) VALUES
  ('22222222-0000-0000-0000-000000000001', 'חבילת בסיס', 'باقة أساسية', 'הופעה של שעתיים עם זמר ונגן קלידים', 'أداء لمدة ساعتين مع مطرب وعازف كيبورد', 3500, 2, ARRAY['זמר','נגן קלידים','מערכת סאונד']),
  ('22222222-0000-0000-0000-000000000001', 'חבילת פרימיום', 'باقة بريميوم', 'הופעה של 3 שעות עם זמר, נגנים ורקדנית דבקה', 'أداء لمدة 3 ساعات مع مطرب وموسيقيين وراقصة دبكة', 6000, 3, ARRAY['זמר','להקה','רקדנית דבקה','מערכת סאונד','תאורה'])
ON CONFLICT DO NOTHING;

-- ===== ARTIST 2: Layla Live =====
INSERT INTO supplier_profiles (id, user_id, supplier_type_id, business_name_he, business_name_ar, description_he, description_ar, phone, email, city_id, rating, review_count, is_verified, is_featured, verification_status, starting_price, min_price, max_price, total_bookings, instagram, youtube)
VALUES ('22222222-0000-0000-0000-000000000002', null, 'c0000000-0000-0000-0000-000000000002',
  'ליילה לייב', 'ليلى لايف',
  'זמרת מצליחה המשלבת מוזיקה ערבית עם פופ מודרני. מופעים חיים עם אנרגיה וקסם לכל סוגי האירועים.',
  'مطربة ناجحة تمزج بين الموسيقى العربية والبوب الحديث. عروض حية بطاقة وسحر لجميع أنواع المناسبات.',
  '050-6789012', 'info@laylalive.example', 'b0000000-0000-0000-0000-000000000005',
  4.7, 156, true, true, 'approved', 4000, 4000, 9000, 140, 'laylalive', 'laylalive')
ON CONFLICT (id) DO NOTHING;

INSERT INTO artists (id, supplier_id, performance_duration_min, languages_he, languages_ar)
VALUES ('32222222-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 150, ARRAY['עברית','ערבית','אנגלית'], ARRAY['العربية','العبرية','الإنجليزية'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO artist_genres (artist_id, genre_id) VALUES
  ('32222222-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001'),
  ('32222222-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003'),
  ('32222222-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000004'),
  ('32222222-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

INSERT INTO supplier_service_areas (supplier_id, city_id) VALUES
  ('22222222-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005'),
  ('22222222-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006'),
  ('22222222-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000007')
ON CONFLICT DO NOTHING;

INSERT INTO media (supplier_id, url, thumbnail_url, media_type, sort_order, is_cover) VALUES
  ('22222222-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 0, true),
  ('22222222-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/1370548/pexels-photo-1370548.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1370548/pexels-photo-1370548.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 1, false),
  ('22222222-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 2, false)
ON CONFLICT DO NOTHING;

INSERT INTO supplier_packages (supplier_id, name_he, name_ar, description_he, description_ar, price, duration_hours, included_services) VALUES
  ('22222222-0000-0000-0000-000000000002', 'חבילת סולו', 'باقة منفردة', 'הופעת סולו של שעה וחצי עם פלייביסט מותאם', 'أداء منفرد لمدة ساعة ونصف مع قائمة تشغيل مخصصة', 4000, 1.5, ARRAY['זמרת','מערכת סאונד']),
  ('22222222-0000-0000-0000-000000000002', 'חבילת להקה מלאה', 'باقة فرقة كاملة', 'הופעה של 3 שעות עם להקה מלאה ותאורה', 'أداء لمدة 3 ساعات مع فرقة كاملة وإضاءة', 9000, 3, ARRAY['זמרת','להקה','מערכת סאונד','תאורה','DJ'])
ON CONFLICT DO NOTHING;

-- ===== ARTIST 3: Omar Events =====
INSERT INTO supplier_profiles (id, user_id, supplier_type_id, business_name_he, business_name_ar, description_he, description_ar, phone, email, city_id, rating, review_count, is_verified, is_featured, verification_status, starting_price, min_price, max_price, total_bookings, instagram)
VALUES ('22222222-0000-0000-0000-000000000003', null, 'c0000000-0000-0000-0000-000000000002',
  'עומר אירועים', 'عمر للمناسبات',
  'זמר מוערך המתמחה במוזיקה מזרחית וחתונות. קול חם ונוכחות בימתית מרשימה.',
  'مطرب محترف متخصص في الموسيقى الشرقية والأعراس. صوت دافئ وحضور مسرحي مبهر.',
  '050-7890123', 'info@omarevents.example', 'b0000000-0000-0000-0000-000000000010',
  4.5, 92, true, false, 'approved', 3000, 3000, 6500, 110, 'omarevents')
ON CONFLICT (id) DO NOTHING;

INSERT INTO artists (id, supplier_id, performance_duration_min, languages_he, languages_ar)
VALUES ('32222222-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 120, ARRAY['עברית','ערבית'], ARRAY['العربية','العبرية'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO artist_genres (artist_id, genre_id) VALUES
  ('32222222-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003'),
  ('32222222-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000005'),
  ('32222222-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

INSERT INTO supplier_service_areas (supplier_id, city_id) VALUES
  ('22222222-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000010'),
  ('22222222-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000011'),
  ('22222222-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;

INSERT INTO media (supplier_id, url, thumbnail_url, media_type, sort_order, is_cover) VALUES
  ('22222222-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 0, true),
  ('22222222-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 1, false)
ON CONFLICT DO NOTHING;

INSERT INTO supplier_packages (supplier_id, name_he, name_ar, description_he, description_ar, price, duration_hours, included_services) VALUES
  ('22222222-0000-0000-0000-000000000003', 'חבילה סטנדרטית', 'باقة قياسية', 'הופעה של שעתיים עם זמר ונגן', 'أداء لمدة ساعتين مع مطرب وعازف', 3000, 2, ARRAY['זמר','נגן','מערכת סאונד'])
ON CONFLICT DO NOTHING;

-- ===== ARTIST 4: Nour Music =====
INSERT INTO supplier_profiles (id, user_id, supplier_type_id, business_name_he, business_name_ar, description_he, description_ar, phone, email, city_id, rating, review_count, is_verified, is_featured, verification_status, starting_price, min_price, max_price, total_bookings, tiktok)
VALUES ('22222222-0000-0000-0000-000000000004', null, 'c0000000-0000-0000-0000-000000000002',
  'נור מיוזיק', 'نور ميوزك',
  'זמרת צעירה ומוכשרת המביאה סגנון רענן ומודרני. מופיעה באירועים פרטיים, חתונות ופסטיבלים.',
  'مطربة شابة وموهوبة تجلب أسلوباً منعشاً وعصرياً. تؤدي في المناسبات الخاصة والأعراس والمهرجانات.',
  '050-8901234', 'info@nourmusic.example', 'b0000000-0000-0000-0000-000000000008',
  4.6, 67, true, false, 'approved', 2800, 2800, 5500, 85, 'nourmusic')
ON CONFLICT (id) DO NOTHING;

INSERT INTO artists (id, supplier_id, performance_duration_min, languages_he, languages_ar)
VALUES ('32222222-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 120, ARRAY['עברית','ערבית'], ARRAY['العربية','العبرية'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO artist_genres (artist_id, genre_id) VALUES
  ('32222222-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002'),
  ('32222222-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004'),
  ('32222222-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;

INSERT INTO supplier_service_areas (supplier_id, city_id) VALUES
  ('22222222-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000008'),
  ('22222222-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000009'),
  ('22222222-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

INSERT INTO media (supplier_id, url, thumbnail_url, media_type, sort_order, is_cover) VALUES
  ('22222222-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/1370548/pexels-photo-1370548.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1370548/pexels-photo-1370548.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 0, true),
  ('22222222-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=400', 'photo', 1, false)
ON CONFLICT DO NOTHING;

INSERT INTO supplier_packages (supplier_id, name_he, name_ar, description_he, description_ar, price, duration_hours, included_services) VALUES
  ('22222222-0000-0000-0000-000000000004', 'חבילה בסיסית', 'باقة أساسية', 'הופעה של שעתיים', 'أداء لمدة ساعتين', 2800, 2, ARRAY['זמרת','מערכת סאונד'])
ON CONFLICT DO NOTHING;