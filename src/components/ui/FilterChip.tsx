import { StyleSheet, Text, Pressable } from 'react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '../../theme/tokens';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

export function FilterChip({ label, selected, onPress, icon }: FilterChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  selectedLabel: {
    color: colors.primary[700],
  },
});
