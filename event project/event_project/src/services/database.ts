import { supabase } from './supabase';
import type {
  SupplierProfile, Venue, Artist, MediaItem, Review, Availability,
  City, Region, Amenity, Genre, EventType, SupplierPackage,
  VenueWithDetails, ArtistWithDetails, EventItem, Favorite, Notification,
} from '../types';

export const db = {
  // Reference data
  async getRegions(): Promise<Region[]> {
    const { data, error } = await supabase.from('regions').select('*').order('sort_order');
    if (error) throw error;
    return data as Region[];
  },

  async getCities(): Promise<City[]> {
    const { data, error } = await supabase.from('cities').select('*').order('sort_order');
    if (error) throw error;
    return data as City[];
  },

  async getEventTypes(): Promise<EventType[]> {
    const { data, error } = await supabase.from('event_types').select('*').order('sort_order');
    if (error) throw error;
    return data as EventType[];
  },

  async getAmenities(): Promise<Amenity[]> {
    const { data, error } = await supabase.from('amenities').select('*').order('name_he');
    if (error) throw error;
    return data as Amenity[];
  },

  async getGenres(): Promise<Genre[]> {
    const { data, error } = await supabase.from('genres').select('*').order('name_he');
    if (error) throw error;
    return data as Genre[];
  },

  // Venues
  async getVenues(params: {
    cityId?: string;
    date?: string;
    minGuests?: number;
    maxBudget?: number;
    minRating?: number;
    venueType?: string;
    amenities?: string[];
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<VenueWithDetails[]> {
    let query = supabase
      .from('supplier_profiles')
      .select(`
        *,
        city:cities(*),
        venue:venues(
          *,
          venue_amenities(
            amenity:amenities(*)
          )
        ),
        media(*)
      `)
      .eq('supplier_type_id', 'c0000000-0000-0000-0000-000000000001')
      .eq('verification_status', 'approved');

    if (params.cityId) {
      query = query.eq('city_id', params.cityId);
    }
    if (params.minRating) {
      query = query.gte('rating', params.minRating);
    }

    // Sorting
    switch (params.sort) {
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'price_low':
        query = query.order('starting_price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('starting_price', { ascending: false });
        break;
      case 'popular':
        query = query.order('total_bookings', { ascending: false });
        break;
      default:
        query = query.order('is_featured', { ascending: false }).order('rating', { ascending: false });
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = data as VenueWithDetails[];

    // Filter by venue type if specified
    if (params.venueType && params.venueType !== 'all') {
      results = results.filter((v) => v.venue?.venue_type === params.venueType);
    }

    // Filter by guest capacity
    if (params.minGuests) {
      results = results.filter((v) => v.venue && v.venue.max_guests >= params.minGuests!);
    }

    // Filter by max budget (price per guest)
    if (params.maxBudget) {
      results = results.filter((v) => v.venue && v.venue.price_per_guest <= params.maxBudget!);
    }

    // Filter by amenities
    if (params.amenities && params.amenities.length > 0) {
      results = results.filter((v) => {
        if (!v.venue?.venue_amenities) return false;
        const amenityCodes = v.venue.venue_amenities.map((va: { amenity: { code: string } | null }) => va.amenity?.code);
        return params.amenities!.every((code) => amenityCodes.includes(code));
      });
    }

    // Check availability if date is specified
    if (params.date) {
      const supplierIds = results.map((r) => r.id);
      if (supplierIds.length > 0) {
        const { data: availData } = await supabase
          .from('availability')
          .select('supplier_id, status')
          .in('supplier_id', supplierIds)
          .eq('date', params.date);

        const availMap = new Map<string, string>();
        (availData || []).forEach((a) => {
          availMap.set(a.supplier_id, a.status);
        });

        results = results.map((r) => ({
          ...r,
          availability_status: (availMap.get(r.id) as Availability['status']) || 'available',
        }));

        // Only show available suppliers when date is selected
        results = results.filter((r) => r.availability_status === 'available' || !r.availability_status);
      }
    }

    // Apply offset after filtering
    if (params.offset) {
      results = results.slice(params.offset);
    }

    return results;
  },

  async getVenueById(id: string): Promise<VenueWithDetails | null> {
    const { data, error } = await supabase
      .from('supplier_profiles')
      .select(`
        *,
        city:cities(*),
        venue:venues(
          *,
          venue_amenities(
            amenity:amenities(*)
          )
        ),
        media(*)
      `)
      .eq('id', id)
      .eq('verification_status', 'approved')
      .maybeSingle();

    if (error) throw error;
    return data as VenueWithDetails | null;
  },

  // Artists
  async getArtists(params: {
    cityId?: string;
    date?: string;
    maxBudget?: number;
    genreIds?: string[];
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<ArtistWithDetails[]> {
    let query = supabase
      .from('supplier_profiles')
      .select(`
        *,
        city:cities(*),
        artist:artists(
          *,
          artist_genres(
            genre:genres(*)
          )
        ),
        media(*),
        packages:supplier_packages(*)
      `)
      .eq('supplier_type_id', 'c0000000-0000-0000-0000-000000000002')
      .eq('verification_status', 'approved');

    if (params.cityId) {
      query = query.eq('city_id', params.cityId);
    }

    switch (params.sort) {
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'price_low':
        query = query.order('starting_price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('starting_price', { ascending: false });
        break;
      case 'popular':
        query = query.order('total_bookings', { ascending: false });
        break;
      default:
        query = query.order('is_featured', { ascending: false }).order('rating', { ascending: false });
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = data as ArtistWithDetails[];

    // Filter by max budget
    if (params.maxBudget) {
      results = results.filter((a) => a.starting_price !== null && a.starting_price! <= params.maxBudget!);
    }

    // Filter by genres
    if (params.genreIds && params.genreIds.length > 0) {
      results = results.filter((a) => {
        if (!a.artist?.artist_genres) return false;
        const genreIds = a.artist.artist_genres.map((ag: { genre: { id: string } | null }) => ag.genre?.id);
        return params.genreIds!.every((gid) => genreIds.includes(gid));
      });
    }

    // Check availability
    if (params.date) {
      const supplierIds = results.map((r) => r.id);
      if (supplierIds.length > 0) {
        const { data: availData } = await supabase
          .from('availability')
          .select('supplier_id, status')
          .in('supplier_id', supplierIds)
          .eq('date', params.date);

        const availMap = new Map<string, string>();
        (availData || []).forEach((a) => {
          availMap.set(a.supplier_id, a.status);
        });

        results = results.map((r) => ({
          ...r,
          availability_status: (availMap.get(r.id) as Availability['status']) || 'available',
        }));

        results = results.filter((r) => r.availability_status === 'available' || !r.availability_status);
      }
    }

    if (params.offset) {
      results = results.slice(params.offset);
    }

    return results;
  },

  async getArtistById(id: string): Promise<ArtistWithDetails | null> {
    const { data, error } = await supabase
      .from('supplier_profiles')
      .select(`
        *,
        city:cities(*),
        artist:artists(
          *,
          artist_genres(
            genre:genres(*)
          )
        ),
        media(*),
        packages:supplier_packages(*)
      `)
      .eq('id', id)
      .eq('verification_status', 'approved')
      .maybeSingle();

    if (error) throw error;
    return data as ArtistWithDetails | null;
  },

  // Featured suppliers
  async getFeaturedVenues(limit = 6): Promise<VenueWithDetails[]> {
    const { data, error } = await supabase
      .from('supplier_profiles')
      .select(`
        *,
        city:cities(*),
        venue:venues(*),
        media(*)
      `)
      .eq('supplier_type_id', 'c0000000-0000-0000-0000-000000000001')
      .eq('verification_status', 'approved')
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as VenueWithDetails[];
  },

  async getFeaturedArtists(limit = 6): Promise<ArtistWithDetails[]> {
    const { data, error } = await supabase
      .from('supplier_profiles')
      .select(`
        *,
        city:cities(*),
        artist:artists(*),
        media(*)
      `)
      .eq('supplier_type_id', 'c0000000-0000-0000-0000-000000000002')
      .eq('verification_status', 'approved')
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ArtistWithDetails[];
  },

  // Reviews
  async getReviews(supplierId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Review[];
  },

  // Availability
  async getAvailability(supplierId: string, startDate: string, endDate: string): Promise<Availability[]> {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('supplier_id', supplierId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return data as Availability[];
  },

  async checkAvailability(supplierId: string, date: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('availability')
      .select('status')
      .eq('supplier_id', supplierId)
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    return data?.status || 'available';
  },

  // Service areas
  async getServiceAreas(supplierId: string): Promise<City[]> {
    const { data, error } = await supabase
      .from('supplier_service_areas')
      .select('city:cities(*)')
      .eq('supplier_id', supplierId);

    if (error) throw error;
    return (data || []).map((item) => item.city as unknown as City).filter(Boolean);
  },

  // Events
  async getEvents(userId: string): Promise<EventItem[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data as EventItem[];
  },

  async getActiveEvent(userId: string): Promise<EventItem | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('event_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as EventItem | null;
  },

  async createEvent(event: Omit<EventItem, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>): Promise<EventItem | null> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as EventItem | null;
  },

  async updateEvent(id: string, updates: Partial<EventItem>): Promise<void> {
    const { error } = await supabase.from('events').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  },

  // Favorites
  async getFavorites(userId: string): Promise<(Favorite & { supplier: SupplierProfile })[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        supplier:supplier_profiles(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Favorite & { supplier: SupplierProfile })[];
  },

  async isFavorite(userId: string, supplierId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  },

  async addFavorite(userId: string, supplierId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, supplier_id: supplierId });
    if (error) throw error;
  },

  async removeFavorite(userId: string, supplierId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('supplier_id', supplierId);
    if (error) throw error;
  },

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as Notification[];
  },

  async markNotificationRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  },
};
