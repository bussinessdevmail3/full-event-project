import { StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors, fontFamily, fontSize, spacing } from '../../theme/tokens';

interface RatingProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
  reviewCount?: number;
}

export function Rating({ rating, size = 14, showNumber = true, reviewCount }: RatingProps) {
  return (
    <View style={styles.container}>
      <Star size={size} color={colors.warning[400]} fill={colors.warning[400]} />
      {showNumber && (
        <Text style={styles.rating}>{rating.toFixed(1)}</Text>
      )}
      {reviewCount !== undefined && (
        <Text style={styles.reviewCount}>({reviewCount})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginStart: 2,
  },
  reviewCount: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginStart: 2,
  },
});
