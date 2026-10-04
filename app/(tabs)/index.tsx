import { StyleSheet, Text, View, ScrollView, Pressable, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { Calendar, MapPin, Users, Wallet, Search, ChevronRight, Sparkles, Calendar as CalIcon } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing, shadows } from '@/src/theme/tokens';
import { useI18n } from '@/src/services/i18n';
import { useAuth } from '@/src/services/auth';
import { useSearchCriteria } from '@/src/services/search-context';
import { db } from '@/src/services/database';
import { VenueCard } from '@/src/components/VenueCard';
import { ArtistCard } from '@/src/components/ArtistCard';
import { SectionHeader } from '@/src/components/SectionHeader';
import { VenueCardSkeleton, ArtistCardSkeleton } from '@/src/components/ui/Skeleton';
import { DatePickerModal } from '@/src/components/DatePickerModal';
import { LocationPickerModal } from '@/src/components/LocationPickerModal';
import { NumberPickerModal } from '@/src/components/NumberPickerModal';
import { CalendarHeart, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

const guestOptions = [
  { value: 50, label: '50+' },
  { value: 100, label: '100+' },
  { value: 200, label: '200+' },
  { value: 300, label: '300+' },
  { value: 500, label: '500+' },
];

const budgetOptions = [
  { value: 20000, label: '₪20,000+' },
  { value: 50000, label: '₪50,000+' },
  { value: 80000, label: '₪80,000+' },
  { value: 100000, label: '₪100,000+' },
  { value: 150000, label: '₪150,000+' },
];

export default function HomeScreen() {
  const { t, language, isRTL } = useI18n();
  const { user, profile } = useAuth();
  const router = useRouter();
  const { criteria, setSearchType, setDate, setCityId, setGuests, setBudget } = useSearchCriteria();
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showBudgetPicker, setShowBudgetPicker] = useState(false);

  const { data: event } = useQuery({
    queryKey: ['active-event', user?.id],
    queryFn: () => db.getActiveEvent(user!.id),
    enabled: !!user,
  });

  const { data: featuredVenues, isLoading: venuesLoading, refetch: refetchVenues } = useQuery({
    queryKey: ['featured-venues', language],
    queryFn: () => db.getFeaturedVenues(6),
  });

  const { data: featuredArtists, isLoading: artistsLoading, refetch: refetchArtists } = useQuery({
    queryKey: ['featured-artists', language],
    queryFn: () => db.getFeaturedArtists(6),
  });

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => db.getCities(),
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: () => db.getRegions(),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchVenues(), refetchArtists()]);
    setRefreshing(false);
  }, [refetchVenues, refetchArtists]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greetingMorning');
    if (hour < 18) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  })();

  const eventCity = cities?.find((c) => c.id === event?.city_id);
  const eventCityName = eventCity ? (language === 'he' ? eventCity.name_he : eventCity.name_ar) : null;
  const eventDate = event?.event_date ? format(new Date(event.event_date), 'dd.MM.yyyy') : null;

  const selectedCity = cities?.find((c) => c.id === criteria.cityId);
  const selectedCityName = selectedCity ? (language === 'he' ? selectedCity.name_he : selectedCity.name_ar) : null;
  const selectedDateDisplay = criteria.date
    ? format(new Date(criteria.date + 'T00:00:00'), 'dd.MM.yyyy')
    : null;

  const handleSearch = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{profile?.full_name || ''}</Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/profile')} hitSlop={8}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(profile?.full_name || '?')[0]?.toUpperCase()}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>{t('home.whatLookingFor')}</Text>
          <View style={styles.typeSelector}>
            <Pressable
              style={[styles.typeButton, criteria.searchType === 'venue' && styles.typeButtonActive]}
              onPress={() => setSearchType('venue')}
            >
              <Text style={[styles.typeButtonText, criteria.searchType === 'venue' && styles.typeButtonTextActive]}>
                {t('home.venue')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.typeButton, criteria.searchType === 'singer' && styles.typeButtonActive]}
              onPress={() => setSearchType('singer')}
            >
              <Text style={[styles.typeButtonText, criteria.searchType === 'singer' && styles.typeButtonTextActive]}>
                {t('home.singer')}
              </Text>
            </Pressable>
          </View>

          {/* Date Field */}
          <Pressable
            style={[styles.searchField, selectedDateDisplay && styles.searchFieldActive]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={selectedDateDisplay ? colors.primary[500] : colors.textSecondary} />
            <Text style={[styles.searchFieldText, selectedDateDisplay && styles.searchFieldTextActive]}>
              {selectedDateDisplay || t('home.selectDate')}
            </Text>
          </Pressable>

          {/* Location Field */}
          <Pressable
            style={[styles.searchField, selectedCityName && styles.searchFieldActive]}
            onPress={() => setShowLocationPicker(true)}
          >
            <MapPin size={20} color={selectedCityName ? colors.primary[500] : colors.textSecondary} />
            <Text style={[styles.searchFieldText, selectedCityName && styles.searchFieldTextActive]}>
              {selectedCityName || t('home.selectArea')}
            </Text>
          </Pressable>

          {/* Guests + Budget Row */}
          <View style={styles.searchRow}>
            <Pressable
              style={[styles.searchField, styles.searchFieldHalf, criteria.guests != null && styles.searchFieldActive]}
              onPress={() => setShowGuestPicker(true)}
            >
              <Users size={20} color={criteria.guests != null ? colors.primary[500] : colors.textSecondary} />
              <Text style={[styles.searchFieldText, criteria.guests != null && styles.searchFieldTextActive]}>
                {criteria.guests ? `${criteria.guests}+` : t('home.guests')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.searchField, styles.searchFieldHalf, criteria.budget != null && styles.searchFieldActive]}
              onPress={() => setShowBudgetPicker(true)}
            >
              <Wallet size={20} color={criteria.budget != null ? colors.primary[500] : colors.textSecondary} />
              <Text style={[styles.searchFieldText, criteria.budget != null && styles.searchFieldTextActive]}>
                {criteria.budget ? `₪${criteria.budget.toLocaleString()}+` : t('home.selectBudget')}
              </Text>
            </Pressable>
          </View>

          {/* Search Button */}
          <Pressable
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Search size={20} color={colors.white} />
            <Text style={styles.searchButtonText}>{t('home.search')}</Text>
          </Pressable>
        </View>

        {/* Upcoming Event */}
        {event ? (
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.eventIconContainer}>
                <CalendarHeart size={20} color={colors.white} />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.event_name}</Text>
                <Text style={styles.eventDetails}>
                  {eventDate} · {eventCityName} · {event.expected_guests} {t('common.guests')}
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.eventAction}
              onPress={() => router.push('/(tabs)/event')}
            >
              <Text style={styles.eventActionText}>{t('home.viewAll')}</Text>
              <ChevronRight size={16} color={colors.primary[500]} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.createEventCard}
            onPress={() => router.push('/(tabs)/event')}
          >
            <View style={styles.createEventIcon}>
              <Plus size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.createEventInfo}>
              <Text style={styles.createEventTitle}>{t('home.createEvent')}</Text>
              <Text style={styles.createEventDesc}>{t('home.createEventDesc')}</Text>
            </View>
            <ChevronRight size={20} color={colors.primary[500]} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
          </Pressable>
        )}

        {/* Recommended Venues */}
        <SectionHeader
          title={t('home.recommendedVenues')}
          actionText={t('home.viewAll')}
          onActionPress={() => router.push('/(tabs)/explore')}
        />
        {venuesLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {[0, 1, 2].map((i) => <VenueCardSkeleton key={i} />)}
          </ScrollView>
        ) : featuredVenues && featuredVenues.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {featuredVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                language={language}
                onPress={() => router.push(`/venue/${venue.id}`)}
                style={{ marginEnd: spacing.md }}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noData}>{t('common.noResults')}</Text>
        )}

        {/* Popular Singers */}
        <SectionHeader
          title={t('home.popularSingers')}
          actionText={t('home.viewAll')}
          onActionPress={() => router.push('/(tabs)/explore')}
        />
        {artistsLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {[0, 1, 2].map((i) => <ArtistCardSkeleton key={i} />)}
          </ScrollView>
        ) : featuredArtists && featuredArtists.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {featuredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                language={language}
                onPress={() => router.push(`/artist/${artist.id}`)}
                style={{ marginEnd: spacing.md }}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noData}>{t('common.noResults')}</Text>
        )}

        {/* Featured Providers */}
        <SectionHeader title={t('home.featuredProviders')} />
        <View style={styles.featuredRow}>
          {(featuredVenues || []).slice(0, 2).map((venue) => {
            const coverImage = venue.media?.find((m) => m.is_cover) || venue.media?.[0];
            const name = language === 'he' ? venue.business_name_he : (venue.business_name_ar || venue.business_name_he);
            return (
              <Pressable
                key={venue.id}
                style={styles.featuredCard}
                onPress={() => router.push(`/venue/${venue.id}`)}
              >
                {coverImage && (
                  <Image source={{ uri: coverImage.thumbnail_url || coverImage.url }} style={styles.featuredImage} />
                )}
                <View style={styles.featuredOverlay} />
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredName} numberOfLines={1}>{name}</Text>
                  <View style={styles.featuredRating}>
                    <Sparkles size={12} color={colors.warning[400]} />
                    <Text style={styles.featuredRatingText}>{venue.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={criteria.date}
        onSelect={setDate}
        onClose={() => setShowDatePicker(false)}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        regions={regions || []}
        cities={cities || []}
        selectedCityId={criteria.cityId}
        onSelect={setCityId}
        onClose={() => setShowLocationPicker(false)}
      />

      {/* Guests Picker Modal */}
      <NumberPickerModal
        visible={showGuestPicker}
        title={t('home.guests')}
        icon="guests"
        options={guestOptions}
        selectedValue={criteria.guests}
        onSelect={setGuests}
        onClose={() => setShowGuestPicker(false)}
      />

      {/* Budget Picker Modal */}
      <NumberPickerModal
        visible={showBudgetPicker}
        title={t('home.selectBudget')}
        icon="budget"
        options={budgetOptions}
        selectedValue={criteria.budget}
        onSelect={setBudget}
        onClose={() => setShowBudgetPicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greeting: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  userName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'right',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.white,
  },
  searchSection: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  searchTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  typeButtonActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  typeButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: colors.primary[600],
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    minHeight: 52,
  },
  searchFieldActive: {
    backgroundColor: colors.primary[50],
    borderWidth: 1.5,
    borderColor: colors.primary[200],
  },
  searchFieldText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'right',
  },
  searchFieldTextActive: {
    color: colors.primary[700],
    fontFamily: fontFamily.medium,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchFieldHalf: {
    flex: 1,
    marginBottom: 0,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[500],
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  searchButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  eventCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'right',
  },
  eventDetails: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  eventAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  eventActionText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.primary[500],
  },
  createEventCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.primary[50],
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
  },
  createEventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createEventInfo: {
    flex: 1,
  },
  createEventTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.primary[700],
    textAlign: 'right',
  },
  createEventDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.primary[600],
    marginTop: 2,
    textAlign: 'right',
  },
  horizontalList: {
    paddingHorizontal: spacing.md,
  },
  noData: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    padding: spacing.lg,
  },
  featuredRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  featuredCard: {
    flex: 1,
    height: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: spacing.sm,
    start: spacing.sm,
    end: spacing.sm,
  },
  featuredName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  featuredRatingText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.white,
  },
});
