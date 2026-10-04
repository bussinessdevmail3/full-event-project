import { StyleSheet, Text, View, ScrollView, Pressable, Image, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, MapPin, Clock, CheckCircle, Music, Globe, ChevronLeft, Instagram, Facebook, Youtube, Calendar } from 'lucide-react-native';
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

export default function ArtistDetailScreen() {
  const { id, date: paramDate } = useLocalSearchParams<{ id: string; date?: string }>();
  const { t, language, isRTL } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(paramDate || null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => db.getArtistById(id),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['artist-reviews', id],
    queryFn: () => db.getReviews(id),
    enabled: !!id,
  });

  const { data: availability } = useQuery({
    queryKey: ['artist-availability', id],
    queryFn: () => db.getAvailability(id, format(new Date(), 'yyyy-MM-dd'), format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd')),
    enabled: !!id,
  });

  const { data: serviceAreas } = useQuery({
    queryKey: ['artist-service-areas', id],
    queryFn: () => db.getServiceAreas(id),
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
        </View>
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState title={t('common.somethingWentWrong')} description={t('common.tryAgain')} />
      </SafeAreaView>
    );
  }

  const artistName = language === 'he' ? artist.business_name_he : (artist.business_name_ar || artist.business_name_he);
  const description = language === 'he' ? artist.description_he : (artist.description_ar || artist.description_he);
  const cityName = artist.city ? (language === 'he' ? artist.city.name_he : artist.city.name_ar) : null;
  const coverImage = artist.media?.[selectedImageIndex];
  const languages = artist.artist ? (language === 'he' ? artist.artist.languages_he : artist.artist.languages_ar) : null;
  const genres = artist.artist?.artist_genres?.map((ag: { genre: { id: string; name_he: string; name_ar: string } | null }) => ag.genre).filter(Boolean) || [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.galleryContainer}>
          {coverImage && (
            <Image source={{ uri: coverImage.url }} style={styles.coverImage} />
          )}
          <View style={styles.overlay} />
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
          </Pressable>
          <Pressable style={styles.heartButton} onPress={() => favoriteMutation.mutate()}>
            <Heart
              size={24}
              color={isFavorite ? colors.error[500] : colors.white}
              fill={isFavorite ? colors.error[500] : 'transparent'}
            />
          </Pressable>
        </View>

        {/* Thumbnails */}
        {artist.media && artist.media.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnails}
            contentContainerStyle={{ paddingHorizontal: spacing.md }}
          >
            {artist.media.map((media, idx) => (
              <Pressable
                key={media.id}
                onPress={() => setSelectedImageIndex(idx)}
                style={[styles.thumbnail, selectedImageIndex === idx && styles.thumbnailActive]}
              >
                <Image source={{ uri: media.thumbnail_url || media.url }} style={styles.thumbnailImage} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          {/* Name & Rating */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.title}>{artistName}</Text>
                {artist.is_verified && (
                  <CheckCircle size={20} color={colors.primary[500]} />
                )}
              </View>
              {cityName && (
                <View style={styles.locationRow}>
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text style={styles.locationText}>{cityName}</Text>
                </View>
              )}
              <View style={styles.ratingRow}>
                <Rating rating={artist.rating} size={16} />
                <Text style={styles.reviewCount}>{artist.review_count} {t('venue.reviewsCount')}</Text>
              </View>
            </View>
            {artist.starting_price !== null && (
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>{t('artist.startingPrice')}</Text>
                <Text style={styles.priceValue}>₪{artist.starting_price.toLocaleString()}</Text>
              </View>
            )}
          </View>

          {/* About */}
          {description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('artist.about')}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          )}

          {/* Genres */}
          {genres.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('artist.genres')}</Text>
              <View style={styles.chipsRow}>
                {genres.map((g) => (
                  <View key={g!.id} style={styles.chip}>
                    <Music size={12} color={colors.primary[600]} />
                    <Text style={styles.chipText}>
                      {language === 'he' ? g!.name_he : g!.name_ar}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('artist.languages')}</Text>
              <View style={styles.chipsRow}>
                {languages.map((lang, i) => (
                  <View key={i} style={styles.chip}>
                    <Globe size={12} color={colors.secondary[600]} />
                    <Text style={styles.chipText}>{lang}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Service Areas */}
          {serviceAreas && serviceAreas.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('artist.serviceAreas')}</Text>
              <View style={styles.chipsRow}>
                {serviceAreas.map((city) => (
                  <View key={city.id} style={styles.chip}>
                    <MapPin size={12} color={colors.textSecondary} />
                    <Text style={styles.chipText}>
                      {language === 'he' ? city.name_he : city.name_ar}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Performance Duration */}
          {artist.artist && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('artist.performanceDuration')}</Text>
              <View style={styles.durationCard}>
                <Clock size={20} color={colors.primary[500]} />
                <Text style={styles.durationText}>
                  {Math.floor(artist.artist.performance_duration_min / 60)} {t('artist.hours')} {artist.artist.performance_duration_min % 60} {t('artist.minutes')}
                </Text>
              </View>
            </View>
          )}

          {/* Packages */}
          {artist.packages && artist.packages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('artist.packages')}</Text>
              {artist.packages.map((pkg) => {
                const pkgName = language === 'he' ? pkg.name_he : (pkg.name_ar || pkg.name_he);
                const pkgDesc = language === 'he' ? pkg.description_he : (pkg.description_ar || pkg.description_he);
                return (
                  <View key={pkg.id} style={styles.packageCard}>
                    <View style={styles.packageHeader}>
                      <Text style={styles.packageName}>{pkgName}</Text>
                      <Text style={styles.packagePrice}>₪{pkg.price.toLocaleString()}</Text>
                    </View>
                    {pkgDesc && <Text style={styles.packageDescription}>{pkgDesc}</Text>}
                    {pkg.included_services && pkg.included_services.length > 0 && (
                      <View style={styles.packageIncludes}>
                        {pkg.included_services.map((svc, i) => (
                          <View key={i} style={styles.includeItem}>
                            <CheckCircle size={12} color={colors.success[500]} />
                            <Text style={styles.includeText}>{svc}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('artist.availability')}</Text>
            <AvailabilityCalendar
              availability={availability || []}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              language={language}
            />
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('artist.reviews')}</Text>
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
              <Text style={styles.noReviews}>{t('artist.noReviews')}</Text>
            )}
          </View>

          {/* Social Links */}
          {(artist.instagram || artist.facebook || artist.youtube) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('artist.socialLinks')}</Text>
              <View style={styles.socialRow}>
                {artist.instagram && (
                  <Pressable style={styles.socialButton} onPress={() => Linking.openURL(artist.instagram!)}>
                    <Instagram size={20} color={colors.white} />
                  </Pressable>
                )}
                {artist.facebook && (
                  <Pressable style={[styles.socialButton, { backgroundColor: '#1877F2' }]} onPress={() => Linking.openURL(artist.facebook!)}>
                    <Facebook size={20} color={colors.white} />
                  </Pressable>
                )}
                {artist.youtube && (
                  <Pressable style={[styles.socialButton, { backgroundColor: '#FF0000' }]} onPress={() => Linking.openURL(artist.youtube!)}>
                    <Youtube size={20} color={colors.white} />
                  </Pressable>
                )}
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA Bar */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomFavoriteButton} onPress={() => favoriteMutation.mutate()}>
          <Heart
            size={22}
            color={isFavorite ? colors.error[500] : colors.textSecondary}
            fill={isFavorite ? colors.error[500] : 'transparent'}
          />
        </Pressable>
          <PrimaryButton
          title={selectedDate ? t('common.available') : t('artist.checkAvailability')}
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
    height: 300,
  },
  coverImage: {
    width: '100%',
    height: 300,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  priceBox: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  priceValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.primary[600],
    textAlign: 'right',
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  chipText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'right',
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: radius.md,
  },
  durationText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.primary[700],
    textAlign: 'right',
  },
  packageCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  packageName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
  },
  packagePrice: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.primary[600],
  },
  packageDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  packageIncludes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  includeText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
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
  socialRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E4405F',
    alignItems: 'center',
    justifyContent: 'center',
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
