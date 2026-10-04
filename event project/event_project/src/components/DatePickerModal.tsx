import { StyleSheet, Text, View, Pressable, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '../theme/tokens';
import { useI18n } from '../services/i18n';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
  onClose: () => void;
  minDate?: string;
  maxDate?: string;
}

export function DatePickerModal({
  visible,
  selectedDate,
  onSelect,
  onClose,
  minDate,
  maxDate,
}: DatePickerModalProps) {
  const { t, language, isRTL } = useI18n();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : today;
  const maxDateObj = maxDate
    ? new Date(maxDate + 'T00:00:00')
    : new Date(today.getFullYear() + 2, 11, 31);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleDateString(language === 'he' ? 'he-IL' : 'ar', {
    month: 'long',
    year: 'numeric',
  });

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const arr: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [year, month]);

  const dayLabels = [
    t('calendar.sun'),
    t('calendar.mon'),
    t('calendar.tue'),
    t('calendar.wed'),
    t('calendar.thu'),
    t('calendar.fri'),
    t('calendar.sat'),
  ];

  const goPrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    const minMonth = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
    if (prev >= minMonth) {
      setCurrentMonth(prev);
    }
  };

  const goNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    const maxMonth = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), 1);
    if (next <= maxMonth) {
      setCurrentMonth(next);
    }
  };

  const formatDate = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(year, month, day);
    return date < minDateObj || date > maxDateObj;
  };

  const isDateSelected = (day: number): boolean => {
    return selectedDate === formatDate(day);
  };

  const isToday = (day: number): boolean => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const handleDayPress = (day: number) => {
    if (isDateDisabled(day)) return;
    onSelect(formatDate(day));
    onClose();
  };

  const displayDate = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(language === 'he' ? 'he-IL' : 'ar', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <X size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('calendar.selectDate')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {displayDate && (
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateLabel}>{t('common.date')}</Text>
            <Text style={styles.selectedDateValue}>{displayDate}</Text>
          </View>
        )}

        <View style={styles.calendarContainer}>
          <View style={styles.monthHeader}>
            <Pressable onPress={goPrevMonth} hitSlop={8} style={styles.navButton}>
              <ChevronRight size={24} color={colors.primary[500]} />
            </Pressable>
            <Text style={styles.monthName}>{monthName}</Text>
            <Pressable onPress={goNextMonth} hitSlop={8} style={styles.navButton}>
              <ChevronLeft size={24} color={colors.primary[500]} />
            </Pressable>
          </View>

          <View style={styles.weekHeader}>
            {dayLabels.map((label, i) => (
              <Text key={i} style={styles.dayLabel}>{label}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, index) => {
              if (day === null) return <View key={index} style={styles.emptyDay} />;
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day)
              const todayFlag = isToday(day);

              return (
                <Pressable
                  key={index}
                  style={[
                    styles.day,
                    selected && styles.selectedDay,
                    disabled && styles.disabledDay,
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={disabled}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selected && styles.selectedDayText,
                      disabled && styles.disabledDayText,
                      todayFlag && !selected && styles.todayText,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedDate && (
          <Pressable style={styles.clearButton} onPress={() => { onSelect(null); onClose(); }}>
            <Text style={styles.clearButtonText}>{t('explore.clearFilters')}</Text>
          </Pressable>
        )}

        <View style={{ height: spacing.sm }} />
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
  },
  selectedDateContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[50],
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.md,
  },
  selectedDateLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  selectedDateValue: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.primary[700],
    marginTop: 2,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navButton: {
    padding: spacing.sm,
  },
  monthName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    marginVertical: 1,
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
  selectedDay: {
    backgroundColor: colors.primary[500],
  },
  selectedDayText: {
    color: colors.white,
    fontFamily: fontFamily.bold,
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: colors.textMuted,
  },
  todayText: {
    color: colors.primary[600],
    fontFamily: fontFamily.bold,
  },
  clearButton: {
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.error[500],
  },
});
