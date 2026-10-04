import { StyleSheet, View } from 'react-native';
import type { DimensionValue, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, radius: r = radius.sm, style }: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius: r },
        style,
      ]}
    />
  );
}

export function VenueCardSkeleton() {
  return (
    <View style={styles.venueCardSkeleton}>
      <Skeleton width="100%" height={140} radius={radius.lg} />
      <Skeleton width="70%" height={16} style={{ marginTop: spacing.sm }} />
      <Skeleton width="50%" height={14} style={{ marginTop: spacing.xs }} />
      <Skeleton width="60%" height={14} style={{ marginTop: spacing.xs }} />
    </View>
  );
}

export function ArtistCardSkeleton() {
  return (
    <View style={styles.artistCardSkeleton}>
      <Skeleton width={80} height={80} radius={40} />
      <Skeleton width="60%" height={16} style={{ marginTop: spacing.sm }} />
      <Skeleton width="40%" height={14} style={{ marginTop: spacing.xs }} />
      <Skeleton width="50%" height={14} style={{ marginTop: spacing.xs }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral[200],
  },
  venueCardSkeleton: {
    width: 240,
    padding: spacing.sm,
  },
  artistCardSkeleton: {
    width: 160,
    alignItems: 'center',
    padding: spacing.sm,
  },
});
