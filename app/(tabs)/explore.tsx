import { StyleSheet, Text, View, ScrollView, Pressable, FlatList, TextInput as RNTextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Calendar, MapPin } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '@/src/theme/tokens';
import { useI18n } from '@/src/services/i18n';
import { useSearchCriteria } from '@/src/services/search-context';
import { db } from '@/src/services/database';
import { VenueCard } from '@/src/components/VenueCard';
import { ArtistCard } from '@/src/components/ArtistCard';
import { FilterChip } from '@/src/components/ui/FilterChip';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { VenueCardSkeleton, ArtistCardSkeleton } from '@/src/components/ui/Skeleton';
import { DatePickerModal } from '@/src/components/DatePickerModal';
import { LocationPickerModal } from '@/src/components/LocationPickerModal';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import type { VenueWithDetails, ArtistWithDetails } from '@/src/types';

type SearchType = 'venue' | 'singer';
type SortOption = 'recommended' | 'rating' | 'price_low' | 'price_high' | 'popular';

export default function ExploreScreen() {
  const { t, language, isRTL } = useI18n();
  const router = useRouter();
  const { criteria, setDate: setCtxDate, setCityId: setCtxCityId, setGuests: setCtxGuests, setBudget: setCtxBudget } = useSearchCriteria();

  const [searchType, setSearchType] = useState<SearchType>(criteria.searchType);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [sort, setSort] = useState<SortOption>('recommended');

  // Sync search type from context on mount
  useEffect(() => {
    setSearchType(criteria.searchType);
  }, [criteria.searchType]);

  // Venue-specific filters
  const [venueType, setVenueType] = useState<string>('all');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Artist-specific filters
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Use criteria from context as the primary search parameters
  const selectedDate = criteria.date;
  const selectedCity = criteria.cityId;
  const minGuests = criteria.guests;
  const maxBudget = criteria.budget;

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => db.getCities(),
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: () => db.getRegions(),
  });

  const { data: amenities } = useQuery({
    queryKey: ['amenities'],
    queryFn: () => db.getAmenities(),
  });

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: () => db.getGenres(),
  });

  const venueParams = useMemo(() => ({
    cityId: selectedCity || undefined,
    date: selectedDate || undefined,
    minGuests: minGuests || undefined,
    maxBudget: maxBudget || undefined,
    venueType: venueType !== 'all' ? venueType : undefined,
    amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    sort,
  }), [selectedCity, selectedDate, minGuests, maxBudget, venueType, selectedAmenities, sort]);

  const artistParams = useMemo(() => ({
    cityId: selectedCity || undefined,
    date: selectedDate || undefined,
    maxBudget: maxBudget || undefined,
    genreIds: selectedGenres.length > 0 ? selectedGenres : undefined,
    sort,
  }), [selectedCity, selectedDate, maxBudget, selectedGenres, sort]);

  const { data: venues, isLoading: venuesLoading } = useQuery({
    queryKey: ['explore-venues', venueParams],
    queryFn: () => db.getVenues(venueParams),
    enabled: searchType === 'venue',
  });

  const { data: artists, isLoading: artistsLoading } = useQuery({
    queryKey: ['explore-artists', artistParams],
    queryFn: () => db.getArtists(artistParams),
    enabled: searchType === 'singer',
  });

  const toggleAmenity = (code: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(code) ? prev.filter((a) => a !== code) : [...prev, code]
    );
  };

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setCtxDate(null);
    setCtxCityId(null);
    setCtxGuests(null);
    setCtxBudget(null);
    setVenueType('all');
    setSelectedAmenities([]);
    setSelectedGenres([]);
    setSort('recommended');
  };

  const activeFiltersCount =
    (selectedCity ? 1 : 0) +
    (selectedDate ? 1 : 0) +
    (venueType !== 'all' ? 1 : 0) +
    selectedAmenities.length +
    selectedGenres.length +
    (minGuests ? 1 : 0) +
    (maxBudget ? 1 : 0);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recommended', label: t('explore.sortRecommended') },
    { value: 'rating', label: t('explore.sortRating') },
    { value: 'price_low', label: t('explore.sortPriceLow') },
    { value: 'price_high', label: t('explore.sortPriceHigh') },
    { value: 'popular', label: t('explore.sortPopular') },
  ];

  const filteredVenues = useMemo(() => {
    if (!venues) return venues;
    if (!searchQuery) return venues;
    const q = searchQuery.toLowerCase();
    return venues.filter((v) => {
      const name = (language === 'he' ? v.business_name_he : (v.business_name_ar || v.business_name_he)).toLowerCase();
      return name.includes(q);
    });
  }, [venues, searchQuery, language]);

  const filteredArtists = useMemo(() => {
    if (!artists) return artists;
    if (!searchQuery) return artists;
    const q = searchQuery.toLowerCase();
    return artists.filter((a) => {
      const name = (language === 'he' ? a.business_name_he : (a.business_name_ar || a.business_name_he)).toLowerCase();
      return name.includes(q);
    });
  }, [artists, searchQuery, language]);

  const renderVenueItem = useCallback(({ item }: { item: VenueWithDetails }) => (
    <VenueCard
      venue={item}
      language={language}
      onPress={() => router.push({ pathname: '/venue/[id]', params: { id: item.id, date: selectedDate || '' } })}
      style={styles.cardItem}
    />
  ), [language, router, selectedDate]);

  const renderArtistItem = useCallback(({ item }: { item: ArtistWithDetails }) => (
    <ArtistCard
      artist={item}
      language={language}
      onPress={() => router.push({ pathname: '/artist/[id]', params: { id: item.id, date: selectedDate || '' } })}
      style={styles.cardItem}
    />
  ), [language, router, selectedDate]);

  const selectedCityObj = cities?.find((c) => c.id === selectedCity);
  const selectedCityName = selectedCityObj ? (language === 'he' ? selectedCityObj.name_he : selectedCityObj.name_ar) : null;
  const selectedDateDisplay = selectedDate
    ? format(new Date(selectedDate + 'T00:00:00'), 'dd.MM.yyyy')
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('explore.title')}</Text>
      </View>

      {/* Active Search Criteria Bar */}
      {(selectedDateDisplay || selectedCityName || minGuests || maxBudget) && (
        <View style={styles.criteriaBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.criteriaBarContent}>
            {selectedDateDisplay && (
              <Pressable style={styles.criteriaChip} onPress={() => setShowDatePicker(true)}>
                <Calendar size={14} color={colors.primary[500]} />
                <Text style={styles.criteriaChipText}>{selectedDateDisplay}</Text>
                <Pressable onPress={() => setCtxDate(null)} hitSlop={8}>
                  <X size={12} color={colors.textSecondary} />
                </Pressable>
              </Pressable>
            )}
            {selectedCityName && (
              <Pressable style={styles.criteriaChip} onPress={() => setShowLocationPicker(true)}>
                <MapPin size={14} color={colors.primary[500]} />
                <Text style={styles.criteriaChipText}>{selectedCityName}</Text>
                <Pressable onPress={() => setCtxCityId(null)} hitSlop={8}>
                  <X size={12} color={colors.textSecondary} />
                </Pressable>
              </Pressable>
            )}
            {minGuests && (
              <View style={styles.criteriaChip}>
                <Text style={styles.criteriaChipText}>{minGuests}+ {t('common.guests')}</Text>
                <Pressable onPress={() => setCtxGuests(null)} hitSlop={8}>
                  <X size={12} color={colors.textSecondary} />
                </Pressable>
              </View>
            )}
            {maxBudget && (
              <View style={styles.criteriaChip}>
                <Text style={styles.criteriaChipText}>₪{maxBudget.toLocaleString()}+</Text>
                <Pressable onPress={() => setCtxBudget(null)} hitSlop={8}>
                  <X size={12} color={colors.textSecondary} />
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textMuted} />
          <RNTextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('explore.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            textAlign="right"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} color={activeFiltersCount > 0 ? colors.white : colors.textSecondary} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Date + Location quick filters */}
      <View style={styles.quickFiltersRow}>
        <Pressable
          style={[styles.quickFilter, selectedDateDisplay && styles.quickFilterActive]}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={16} color={selectedDateDisplay ? colors.primary[500] : colors.textSecondary} />
          <Text style={[styles.quickFilterText, selectedDateDisplay && styles.quickFilterTextActive]} numberOfLines={1}>
            {selectedDateDisplay || t('home.selectDate')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.quickFilter, selectedCityName && styles.quickFilterActive]}
          onPress={() => setShowLocationPicker(true)}
        >
          <MapPin size={16} color={selectedCityName ? colors.primary[500] : colors.textSecondary} />
          <Text style={[styles.quickFilterText, selectedCityName && styles.quickFilterTextActive]} numberOfLines={1}>
            {selectedCityName || t('home.selectArea')}
          </Text>
        </Pressable>
      </View>

      {/* Type Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, searchType === 'venue' && styles.tabActive]}
          onPress={() => setSearchType('venue')}
        >
          <Text style={[styles.tabText, searchType === 'venue' && styles.tabTextActive]}>
            {t('explore.venues')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, searchType === 'singer' && styles.tabActive]}
          onPress={() => setSearchType('singer')}
        >
          <Text style={[styles.tabText, searchType === 'singer' && styles.tabTextActive]}>
            {t('explore.singers')}
          </Text>
        </Pressable>
      </View>

      {/* Sort - separate from search criteria */}
      <View style={styles.sortRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sortOptions.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              selected={sort === opt.value}
              onPress={() => setSort(opt.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>{t('explore.filters')}</Text>
            {activeFiltersCount > 0 && (
              <Pressable onPress={clearFilters}>
                <Text style={styles.clearText}>{t('explore.clearFilters')}</Text>
              </Pressable>
            )}
          </View>

          {/* Venue-specific filters */}
          {searchType === 'venue' && (
            <>
              <Text style={styles.filterLabel}>{t('explore.filterVenueType')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                <FilterChip label={t('explore.allTypes')} selected={venueType === 'all'} onPress={() => setVenueType('all')} />
                <FilterChip label={t('explore.indoor')} selected={venueType === 'indoor'} onPress={() => setVenueType('indoor')} />
                <FilterChip label={t('explore.outdoor')} selected={venueType === 'outdoor'} onPress={() => setVenueType('outdoor')} />
                <FilterChip label={t('explore.garden')} selected={venueType === 'garden'} onPress={() => setVenueType('garden')} />
                <FilterChip label={t('explore.combined')} selected={venueType === 'combined'} onPress={() => setVenueType('combined')} />
              </ScrollView>

              <Text style={styles.filterLabel}>{t('explore.filterAmenities')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {amenities?.map((a) => (
                  <FilterChip
                    key={a.id}
                    label={language === 'he' ? a.name_he : a.name_ar}
                    selected={selectedAmenities.includes(a.code)}
                    onPress={() => toggleAmenity(a.code)}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {/* Artist-specific filters */}
          {searchType === 'singer' && (
            <>
              <Text style={styles.filterLabel}>{t('explore.genre')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {genres?.map((g) => (
                  <FilterChip
                    key={g.id}
                    label={language === 'he' ? g.name_he : g.name_ar}
                    selected={selectedGenres.includes(g.id)}
                    onPress={() => toggleGenre(g.id)}
                  />
                ))}
              </ScrollView>
            </>
          )}
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {searchType === 'venue'
              ? `${filteredVenues?.length || 0} ${t('explore.results')}`
              : `${filteredArtists?.length || 0} ${t('explore.results')}`}
          </Text>
        </View>

        {searchType === 'venue' ? (
          venuesLoading ? (
            <View style={styles.gridContainer}>
              {[0, 1, 2, 3].map((i) => <VenueCardSkeleton key={i} />)}
            </View>
          ) : filteredVenues && filteredVenues.length > 0 ? (
            <FlatList
              data={filteredVenues}
              keyExtractor={(item) => item.id}
              renderItem={renderVenueItem}
              numColumns={2}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.gridRow}
            />
          ) : (
            <EmptyState
              title={t('common.noResults')}
              description={t('common.noResultsDesc')}
            />
          )
        ) : artistsLoading ? (
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3].map((i) => <ArtistCardSkeleton key={i} />)}
          </View>
        ) : filteredArtists && filteredArtists.length > 0 ? (
          <FlatList
            data={filteredArtists}
            keyExtractor={(item) => item.id}
            renderItem={renderArtistItem}
            numColumns={2}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.gridRow}
          />
        ) : (
          <EmptyState
            title={t('common.noResults')}
            description={t('common.noResultsDesc')}
          />
        )}
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onSelect={setCtxDate}
        onClose={() => setShowDatePicker(false)}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        regions={regions || []}
        cities={cities || []}
        selectedCityId={selectedCity}
        onSelect={setCtxCityId}
        onClose={() => setShowLocationPicker(false)}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    color: colors.text,
    textAlign: 'right',
  },
  criteriaBar: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  criteriaBarContent: {
    gap: spacing.xs,
  },
  criteriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  criteriaChipText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.primary[700],
  },
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    end: -4,
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: colors.white,
  },
  quickFiltersRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  quickFilter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
  },
  quickFilterActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  quickFilterText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  quickFilterTextActive: {
    color: colors.primary[700],
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  tabText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  sortRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  filtersPanel: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filtersTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
  },
  clearText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.error[500],
  },
  filterLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  resultsCount: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  gridRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  cardItem: {
    flex: 1,
    width: '100%',
    maxWidth: 200,
  },
});
