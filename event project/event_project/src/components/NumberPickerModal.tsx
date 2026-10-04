import { StyleSheet, Text, View, Pressable, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Users, Wallet, Check } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '../theme/tokens';
import { useI18n } from '../services/i18n';

interface NumberPickerModalProps {
  visible: boolean;
  title: string;
  icon: 'guests' | 'budget';
  options: { value: number; label: string }[];
  selectedValue: number | null;
  onSelect: (value: number | null) => void;
  onClose: () => void;
}

export function NumberPickerModal({
  visible,
  title,
  icon,
  options,
  selectedValue,
  onSelect,
  onClose,
}: NumberPickerModalProps) {
  const { t, isRTL } = useI18n();
  const Icon = icon === 'guests' ? Users : Wallet;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <X size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedValue !== null && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedLabel}>{title}</Text>
            <Text style={styles.selectedValue}>
              {icon === 'budget' ? '₪' : ''}{selectedValue.toLocaleString()}{icon === 'guests' ? ' ' + t('common.guests') : ''}
            </Text>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable
            style={[styles.optionItem, selectedValue === null && styles.optionItemActive]}
            onPress={() => { onSelect(null); onClose(); }}
          >
            <View style={styles.optionLeft}>
              <Icon size={20} color={selectedValue === null ? colors.primary[500] : colors.textSecondary} />
              <Text style={[styles.optionText, selectedValue === null && styles.optionTextActive]}>
                {t('explore.anyBudget')}
              </Text>
            </View>
            {selectedValue === null && <Check size={18} color={colors.primary[500]} />}
          </Pressable>

          {options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={[styles.optionItem, isSelected && styles.optionItemActive]}
                onPress={() => { onSelect(opt.value); onClose(); }}
              >
                <View style={styles.optionLeft}>
                  <Icon size={20} color={isSelected ? colors.primary[500] : colors.textSecondary} />
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                    {opt.label}
                  </Text>
                </View>
                {isSelected && <Check size={18} color={colors.primary[500]} />}
              </Pressable>
            );
          })}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'right',
  },
  selectedContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[50],
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.md,
  },
  selectedLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  selectedValue: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.primary[700],
    marginTop: 2,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionItemActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
  },
  optionTextActive: {
    color: colors.primary[700],
  },
});
