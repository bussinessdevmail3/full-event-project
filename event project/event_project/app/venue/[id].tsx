import { StyleSheet, Text, View, ScrollView, Pressable, Image, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, MapPin, Users, Star, CheckCircle, Car, Accessibility, Star as StarIcon, ChevronLeft, Phone, Calendar } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing, shadows } from '@/src/theme/tokens';
import { useI18n } from '@/src/services/i18n';
import { useAuth } from '@/src/services/auth';
import { db } from '@/src/services/database';
import { Rating } from '@/src/components/ui/Rating';
import { Badge } from '@/src/components/ui/Badge';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { AvailabilityCalendar } from '@/src/components/AvailabilityCalendar';
import { DatePickerModal } from '@/src/components/DatePickerModal';
import { format } from 'date-fns';

export default function VenueDetailScreen() {
  const { id, date: paramDate } = useLocalSearchParams<{ id: string; date?: string }>();
  const { t, language, isRTL } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(paramDate || null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => db.getVenueById(id),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['venue-reviews', id],
    queryFn: () => db.getReviews(id),
    enabled: !!id,
  });

  const { data: availability } = useQuery({
    queryKey: ['venue-availability', id],
    queryFn: () => db.getAvailability(id, format(new Date(), 'yyyy-MM-dd'), format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd')),
    enabled: !!id,
  });

  const { data: isFavorite } = useQuery({
    queryKey: ['is-favorite', user?.id, id],
    queryFn: () => db.isFavorite(user!.id, id),
    enabled: !!user && !!id,
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await db.removeFavorite(user!.id, id);
      } else {
        await db.addFavorite(user!.id, id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-favorite', user?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Skeleton width="100%" height={280} />
          <Skeleton width="60%" height={24} style={{ marginTop: spacing.md }} />
          <Skeleton width="40%" height={16} style={{ marginTop: spacing.sm }} />
          <Skeleton width="100%" height={100} style={{ marginTop: spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!venue) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState
          title={t('common.somethingWentWrong')}
          description={t('common.tryAgain')}
        />
      </SafeAreaView>
    );
  }

  const venueName = language === 'he' ? venue.business_name_he : (venue.business_name_ar || venue.business_name_he);
  const description = language === 'he' ? venue.description_he : (venue.description_ar || venue.description_he);
  const cityName = venue.city ? (language === 'he' ? venue.city.name_he : venue.city.name_ar) : null;
  const coverImage = venue.media?.[selectedImageIndex];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          {coverImage && (
            <Image source={{ uri: coverImage.url }} style={styles.coverImage} />
          )}
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.white} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
          </Pressable>
          <Pressable
            style={styles.heartButton}
            onPress={() => favoriteMutation.mutate()}
          >
            <Heart
              size={24}
              color={isFavorite ? colors.error[500] : colors.white}
              fill={isFavorite ? colors.error[500] : 'transparent'}
            />
          </Pressable>
          {venue.is_verified && (
            <View style={styles.verifiedBadge}>
              <Badge label={t('venue.verified')} variant="primary" icon={<CheckCircle size={12} color={colors.primary[700]} />} />
            </View>
          )}
        </View>

        {/* Thumbnail strip */}
        {venue.media && venue.media.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnails}
            contentContainerStyle={{ paddingHorizontal: spacing.md }}
          >
            {venue.media.map((media, idx) => (
              <Pressable
                key={media.id}
                onPress={() => setSelectedImageIndex(idx)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === idx && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri: media.thumbnail_url || media.url }} style={styles.thumbnailImage} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Name & Rating */}
          <Text style={styles.title}>{venueName}</Text>
          {cityName && (
            <View style={styles.locationRow}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={styles.locationText}>{cityName}</Text>
            </View>
          )}
          <View style={styles.ratingRow}>
            <Rating rating={venue.rating} size={18} />
            <Text style={styles.reviewCount}>{venue.review_count} {t('venue.reviewsCount')}</Text>
          </View>

          {/* Quick Details */}
          {venue.venue && (
            <View style={styles.quickDetails}>
              <View style={styles.quickDetailItem}>
                <Users size={18} color={colors.primary[500]} />
                <Text style={styles.quickDetailText}>{venue.venue.min_guests}-{venue.venue.max_guests}</Text>
                <Text style={styles.quickDetailLabel}>{t('common.guests')}</Text>
              </View>
              <View style={styles.quickDetailDivider} />
              <View style={styles.quickDetailItem}>
                <StarIcon size={18} color={colors.primary[500]} />
                <Text style={styles.quickDetailText}>₪{venue.venue.price_per_guest}</Text>
                <Text style={styles.quickDetailLabel}>{t('common.perGuest')}</Text>
              </View>
              <View style={styles.quickDetailDivider} />
              <View style={styles.quickDetailItem}>
                <Calendar size={18} color={colors.primary[500]} />
                <Text style={styles.quickDetailText}>{t('venue.venueType')}</Text>
                <Text style={styles.quickDetailLabel}>{t(`explore.${venue.venue.venue_type}`)}</Text>
              </View>
            </View>
          )}

          {/* About */}
          {description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('venue.about')}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          )}

          {/* Amenities */}
          {venue.venue?.venue_amenities && venue.venue.venue_amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('venue.amenities')}</Text>
              <View style={styles.amenitiesGrid}>
                {venue.venue.venue_amenities.map((va: { amenity: { id: string; name_he: string; name_ar: string; code: string } | null }) => {
                  const amenity = va.amenity;
                  if (!amenity) return null;
                  return (
                    <View key={amenity.id} style={styles.amenityItem}>
                      <CheckCircle size={16} color={colors.success[500]} />
                      <Text style={styles.amenityText}>
                        {language === 'he' ? amenity.name_he : amenity.name_ar}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Availability Calendar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('venue.availability')}</Text>
            <AvailabilityCalendar
              availability={availability || []}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              language={language}
            />
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('venue.reviews')}</Text>
            {reviews && reviews.length > 0 ? (
              <View>
                {reviews.map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {(review.customer_name || '?')[0]?.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.reviewInfo}>
                        <Text style={styles.reviewName}>{review.customer_name}</Text>
                        <Rating rating={review.rating} size={12} showNumber={false} />
                      </View>
                    </View>
                    {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noReviews}>{t('venue.noReviews')}</Text>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.bottomFavoriteButton}
          onPress={() => favoriteMutation.mutate()}
        >
          <Heart
            size={22}
            color={isFavorite ? colors.error[500] : colors.textSecondary}
            fill={isFavorite ? colors.error[500] : 'transparent'}
          />
        </Pressable>
        <PrimaryButton
          title={selectedDate ? t('common.available') : t('venue.checkAvailability')}
          onPress={() => {
            if (selectedDate) {
              const status = availability?.find((a) => a.date === selectedDate)?.status;
              if (status === 'booked') {
                Alert.alert(t('calendar.booked'), t('explore.notAvailableOn') + ' ' + format(new Date(selectedDate + 'T00:00:00'), 'dd.MM.yyyy'));
              } else if (status === 'blocked') {
                Alert.alert(t('calendar.blocked'), t('explore.notAvailableOn') + ' ' + format(new Date(selectedDate + 'T00:00:00'), 'dd.MM.yyyy'));
              } else {
                Alert.alert(t('calendar.available'), t('explore.availableOn') + ' ' + format(new Date(selectedDate + 'T00:00:00'), 'dd.MM.yyyy'));
              }
            } else {
              setShowDatePicker(true);
            }
          }}
          size="lg"
          style={styles.bottomCtaButton}
        />
      </View>

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        onClose={() => setShowDatePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    padding: spacing.md,
  },
  galleryContainer: {
    position: 'relative',
    height: 280,
  },
  coverImage: {
    width: '100%',
    height: 280,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    start: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 50,
    end: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: spacing.md,
    start: spacing.md,
  },
  thumbnails: {
    paddingVertical: spacing.sm,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    marginEnd: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: colors.primary[500],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopStartRadius: radius.xl,
    borderTopEndRadius: radius.xl,
    marginTop: -spacing.md,
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    color: colors.text,
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  locationText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  reviewCount: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  quickDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
  },
  quickDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickDetailText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: 4,
  },
  quickDetailLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickDetailDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'right',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  amenityText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'right',
  },
  reviewItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.primary[700],
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'right',
  },
  reviewComment: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
    textAlign: 'right',
  },
  noReviews: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'right',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    start: 0,
    end: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.lg,
  },
  bottomFavoriteButton: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCtaButton: {
    flex: 1,
  },
});
