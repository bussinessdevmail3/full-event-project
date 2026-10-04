import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '../../theme/tokens';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'accent';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'neutral', icon, style }: BadgeProps) {
  const variantStyles = {
    primary: { bg: colors.primary[50], text: colors.primary[700] },
    success: { bg: colors.success[50], text: colors.success[700] },
    warning: { bg: colors.warning[50], text: colors.warning[700] },
    error: { bg: colors.error[50], text: colors.error[700] },
    neutral: { bg: colors.neutral[100], text: colors.neutral[700] },
    accent: { bg: colors.accent[50], text: colors.accent[700] },
  };

  const v = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      {icon}
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
});
