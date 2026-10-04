import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import type { ViewStyle } from 'react-native';
import { MapPin, Heart, Music } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing, shadows } from '../theme/tokens';
import { Rating } from './ui/Rating';
import { Badge } from './ui/Badge';
import { useI18n } from '../services/i18n';
import type { ArtistWithDetails } from '../types';

interface ArtistCardProps {
  artist: ArtistWithDetails;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  style?: ViewStyle;
  language: 'he' | 'ar';
}

export function ArtistCard({ artist, onPress, onFavoritePress, isFavorite, style, language }: ArtistCardProps) {
  const { t } = useI18n();
  const coverImage = artist.media?.find((m: { is_cover: boolean; url: string; thumbnail_url: string | null }) => m.is_cover) || artist.media?.[0];
  const artistName = language === 'he' ? artist.business_name_he : (artist.business_name_ar || artist.business_name_he);
  const cityName = language === 'he' ? artist.city?.name_he : artist.city?.name_ar;
  const genres = artist.artist?.artist_genres?.slice(0, 2).map((ag: { genre: { id: string; name_he: string; name_ar: string } | null }) => {
    const g = ag.genre;
    return language === 'he' ? g?.name_he : g?.name_ar;
  }).filter(Boolean) || [];

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
              size={18}
              color={isFavorite ? colors.error[500] : colors.white}
              fill={isFavorite ? colors.error[500] : 'transparent'}
            />
          </Pressable>
        )}
        {artist.is_verified && (
          <View style={styles.verifiedBadge}>
            <Badge label={t('artist.verified')} variant="primary" />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{artistName}</Text>
        {cityName && (
          <View style={styles.locationRow}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>{cityName}</Text>
          </View>
        )}
        <Rating rating={artist.rating} reviewCount={artist.review_count} />
        {genres.length > 0 && (
          <View style={styles.genresRow}>
            {genres.map((g: string | undefined, i: number) => g ? (
              <View key={i} style={styles.genreChip}>
                <Music size={10} color={colors.primary[600]} />
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ) : null)}
          </View>
        )}
        {artist.starting_price !== null && (
          <Text style={styles.price}>{t('common.from')} ₪{artist.starting_price.toLocaleString()}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
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
    height: 180,
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
    padding: 6,
  },
  verifiedBadge: {
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
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  genreText: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: colors.primary[700],
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
