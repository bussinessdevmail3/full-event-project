// Database row types

export type UserRole = 'customer' | 'supplier' | 'admin';
export type Language = 'he' | 'ar';
export type SupplierVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type AvailabilityStatus = 'available' | 'pending' | 'booked' | 'blocked';
export type BookingStatus =
  | 'requested'
  | 'supplier_reviewing'
  | 'offer_sent'
  | 'customer_accepted'
  | 'payment_pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed';
export type VenueType = 'indoor' | 'outdoor' | 'garden' | 'combined';

export interface Region {
  id: string;
  name_he: string;
  name_ar: string;
  sort_order: number;
}

export interface City {
  id: string;
  region_id: string;
  name_he: string;
  name_ar: string;
  sort_order: number;
}

export interface SupplierType {
  id: string;
  code: string;
  name_he: string;
  name_ar: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Amenity {
  id: string;
  code: string;
  name_he: string;
  name_ar: string;
  icon: string | null;
}

export interface Genre {
  id: string;
  code: string;
  name_he: string;
  name_ar: string;
}

export interface EventType {
  id: string;
  code: string;
  name_he: string;
  name_ar: string;
  icon: string | null;
  sort_order: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  preferred_language: Language;
}

export interface SupplierProfile {
  id: string;
  user_id: string | null;
  supplier_type_id: string;
  business_name_he: string;
  business_name_ar: string | null;
  description_he: string | null;
  description_ar: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
  city_id: string | null;
  address: string | null;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
  verification_status: SupplierVerificationStatus;
  starting_price: number | null;
  min_price: number | null;
  max_price: number | null;
  total_bookings: number;
}

export interface Venue {
  id: string;
  supplier_id: string;
  min_guests: number;
  max_guests: number;
  price_per_guest: number;
  venue_type: VenueType;
  has_parking: boolean;
  has_accessibility: boolean;
  is_kosher: boolean;
  kosher_certificate: string | null;
  latitude: number | null;
  longitude: number | null;
  venue_amenities?: { amenity: Amenity }[];
}

export interface Artist {
  id: string;
  supplier_id: string;
  performance_duration_min: number;
  languages_he: string[] | null;
  languages_ar: string[] | null;
  artist_genres?: { genre: Genre }[];
}

export interface SupplierPackage {
  id: string;
  supplier_id: string;
  name_he: string;
  name_ar: string | null;
  description_he: string | null;
  description_ar: string | null;
  price: number;
  duration_hours: number | null;
  included_services: string[] | null;
}

export interface MediaItem {
  id: string;
  supplier_id: string;
  url: string;
  thumbnail_url: string | null;
  media_type: 'photo' | 'video';
  sort_order: number;
  is_cover: boolean;
}

export interface Availability {
  id: string;
  supplier_id: string;
  date: string;
  status: AvailabilityStatus;
  note: string | null;
}

export interface EventItem {
  id: string;
  user_id: string;
  event_name: string;
  event_type_id: string | null;
  event_date: string;
  city_id: string | null;
  location: string | null;
  expected_guests: number;
  total_budget: number;
  notes: string | null;
  is_active: boolean;
}

export interface Review {
  id: string;
  supplier_id: string;
  customer_id: string | null;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  customer_name: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  supplier_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title_he: string | null;
  title_ar: string | null;
  body_he: string | null;
  body_ar: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

// Joined types for queries
export interface SupplierWithCity extends SupplierProfile {
  city?: City | null;
  supplier_type?: SupplierType | null;
}

export interface VenueWithDetails extends SupplierProfile {
  city?: City | null;
  venue?: Venue | null;
  venue_amenities?: { amenity: Amenity }[];
  media?: MediaItem[];
  is_favorite?: boolean;
  availability_status?: AvailabilityStatus | null;
}

export interface ArtistWithDetails extends SupplierProfile {
  city?: City | null;
  artist?: Artist | null;
  artist_genres?: { genre: Genre }[];
  media?: MediaItem[];
  packages?: SupplierPackage[];
  is_favorite?: boolean;
  availability_status?: AvailabilityStatus | null;
}
