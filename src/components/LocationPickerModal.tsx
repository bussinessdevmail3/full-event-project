import { StyleSheet, Text, View, Pressable, Modal, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MapPin, Check } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '../theme/tokens';
import { useI18n } from '../services/i18n';
import type { Region, City } from '../types';

interface LocationPickerModalProps {
  visible: boolean;
  regions: Region[];
  cities: City[];
  selectedCityId: string | null;
  onSelect: (cityId: string | null) => void;
  onClose: () => void;
}

export function LocationPickerModal({
  visible,
  regions,
  cities,
  selectedCityId,
  onSelect,
  onClose,
}: LocationPickerModalProps) {
  const { t, language, isRTL } = useI18n();

  const citiesByRegion = (regionId: string) =>
    cities.filter((c) => c.region_id === regionId).sort((a, b) => a.sort_order - b.sort_order);

  const selectedCity = cities.find((c) => c.id === selectedCityId);
  const selectedCityName = selectedCity
    ? language === 'he'
      ? selectedCity.name_he
      : selectedCity.name_ar
    : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <X size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('home.selectArea')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedCityName && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedLabel}>{t('common.location')}</Text>
            <Text style={styles.selectedValue}>{selectedCityName}</Text>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable
            style={[styles.allCitiesButton, !selectedCityId && styles.allCitiesButtonActive]}
            onPress={() => { onSelect(null); onClose(); }}
          >
            <MapPin size={18} color={!selectedCityId ? colors.primary[500] : colors.textSecondary} />
            <Text style={[styles.allCitiesText, !selectedCityId && styles.allCitiesTextActive]}>
              {t('explore.allCities')}
            </Text>
          </Pressable>

          {regions.sort((a, b) => a.sort_order - b.sort_order).map((region) => {
            const regionCities = citiesByRegion(region.id);
            if (regionCities.length === 0) return null;
            const regionName = language === 'he' ? region.name_he : region.name_ar;

            return (
              <View key={region.id} style={styles.regionSection}>
                <Text style={styles.regionTitle}>{regionName}</Text>
                {regionCities.map((city) => {
                  const isSelected = selectedCityId === city.id;
                  const cityName = language === 'he' ? city.name_he : city.name_ar;
                  return (
                    <Pressable
                      key={city.id}
                      style={[styles.cityItem, isSelected && styles.cityItemActive]}
                      onPress={() => { onSelect(city.id); onClose(); }}
                    >
                      <Text style={[styles.cityName, isSelected && styles.cityNameActive]}>
                        {cityName}
                      </Text>
                      {isSelected && <Check size={18} color={colors.primary[500]} />}
                    </Pressable>
                  );
                })}
              </View>
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
  allCitiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  allCitiesButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  allCitiesText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  allCitiesTextActive: {
    color: colors.primary[700],
  },
  regionSection: {
    marginBottom: spacing.md,
  },
  regionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    textAlign: 'right',
  },
  cityItem: {
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
  cityItemActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  cityName: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
  },
  cityNameActive: {
    color: colors.primary[700],
  },
});
