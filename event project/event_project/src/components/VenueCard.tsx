import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import type { ViewStyle } from 'react-native';
import { MapPin, Heart, Users } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing, shadows } from '../theme/tokens';
import { Rating } from './ui/Rating';
import { Badge } from './ui/Badge';
import { useI18n } from '../services/i18n';
import type { VenueWithDetails } from '../types';

interface VenueCardProps {
  venue: VenueWithDetails;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  style?: ViewStyle;
  language: 'he' | 'ar';
}

export function VenueCard({ venue, onPress, onFavoritePress, isFavorite, style, language }: VenueCardProps) {
  const { t } = useI18n();
  const coverImage = venue.media?.find((m: { is_cover: boolean; url: string; thumbnail_url: string | null }) => m.is_cover) || venue.media?.[0];
  const cityName = language === 'he' ? venue.city?.name_he : venue.city?.name_ar;
  const venueName = language === 'he' ? venue.business_name_he : (venue.business_name_ar || venue.business_name_he);

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed, style]} onPress={onPress}>
      <View style={styles.imageContainer}>
        {coverImage ? (
          <Image source={{ uri: coverImage.thumbnail_url || coverImage.url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
        {onFavoritePress && (
          <Pressable style={styles.heartButton} onPress={onFavoritePress}>
            <Heart
              size={20}
              color={isFavorite ? colors.error[500] : colors.white}
              fill={isFavorite ? colors.error[500] : 'transparent'}
            />
          </Pressable>
        )}
        {venue.availability_status && (
          <View style={styles.availabilityBadge}>
            <Badge
              label={venue.availability_status === 'available' ? t('common.available') : t('common.notAvailable')}
              variant={venue.availability_status === 'available' ? 'success' : 'error'}
            />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{venueName}</Text>
        {cityName && (
          <View style={styles.locationRow}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>{cityName}</Text>
          </View>
        )}
        <Rating rating={venue.rating} reviewCount={venue.review_count} />
        {venue.venue && (
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Users size={12} color={colors.textSecondary} />
              <Text style={styles.detailText}>{venue.venue.min_guests}-{venue.venue.max_guests}</Text>
            </View>
          </View>
        )}
        {venue.venue && (
          <Text style={styles.price}>{t('common.from')} ₪{venue.venue.price_per_guest} {t('common.perGuest')}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.neutral[200],
  },
  placeholder: {
    backgroundColor: colors.neutral[200],
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm,
    end: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 999,
    padding: spacing.xs,
  },
  availabilityBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    start: spacing.sm,
  },
  content: {
    padding: spacing.sm,
  },
  name: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: 4,
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  location: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  price: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.primary[600],
    marginTop: 6,
    textAlign: 'right',
  },
});
