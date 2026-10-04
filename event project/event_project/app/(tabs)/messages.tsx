import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { colors, fontFamily, fontSize, spacing } from '@/src/theme/tokens';
import { useI18n } from '@/src/services/i18n';
import { EmptyState } from '@/src/components/ui/EmptyState';

export default function MessagesScreen() {
  const { t } = useI18n();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('messages.title')}</Text>
      </View>
      <EmptyState
        icon={<MessageCircle size={48} color={colors.textMuted} />}
        title={t('messages.empty')}
        description={t('messages.emptyDesc')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    color: colors.text,
    textAlign: 'right',
  },
});
