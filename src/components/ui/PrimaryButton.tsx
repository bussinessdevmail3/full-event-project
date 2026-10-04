import { StyleSheet, Pressable, ActivityIndicator, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function PrimaryButton({ title, onPress, variant = 'primary', size = 'md', loading, disabled, icon, style }: PrimaryButtonProps) {
  const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: fontSize.sm },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, fontSize: fontSize.md },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, fontSize: fontSize.lg },
  };

  const variantStyles = {
    primary: { backgroundColor: colors.primary[500] },
    secondary: { backgroundColor: colors.secondary[500] },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary[500] },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColors = {
    primary: colors.white,
    secondary: colors.white,
    outline: colors.primary[500],
    ghost: colors.primary[500],
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        (pressed || disabled) && styles.pressed,
        disabled && !loading && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: textColors[variant], fontSize: sizeStyles[size].fontSize }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
