import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '../theme/tokens';
import { useI18n } from '../services/i18n';
import type { Availability } from '../types';

interface AvailabilityCalendarProps {
  availability: Availability[];
  selectedDate?: string | null;
  onDateSelect?: (date: string) => void;
  language: 'he' | 'ar';
}

export function AvailabilityCalendar({ availability, selectedDate, onDateSelect, language }: AvailabilityCalendarProps) {
  const { t } = useI18n();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const availMap = useMemo(() => {
    const map = new Map<string, string>();
    availability.forEach((a) => map.set(a.date, a.status));
    return map;
  }, [availability]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const monthName = currentMonth.toLocaleDateString(language === 'he' ? 'he-IL' : 'ar', { month: 'long', year: 'numeric' });

  const days: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

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
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(prev);
    }
  };

  const goNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const getStatusColor = (date: string): string | null => {
    const status = availMap.get(date);
    if (!status) return colors.neutral[100];
    switch (status) {
      case 'available': return colors.success[100];
      case 'booked': return colors.error[100];
      case 'pending': return colors.warning[100];
      case 'blocked': return colors.neutral[300];
      default: return colors.neutral[100];
    }
  };

  const getStatusTextColor = (date: string): string => {
    const status = availMap.get(date);
    if (!status) return colors.text;
    switch (status) {
      case 'available': return colors.success[700];
      case 'booked': return colors.error[700];
      case 'pending': return colors.warning[700];
      case 'blocked': return colors.neutral[500];
      default: return colors.text;
    }
  };

  const formatDate = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day: number): boolean => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  const isPast = (day: number): boolean => {
    const date = new Date(year, month, day);
    return date < today;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={goPrevMonth} hitSlop={8}>
          <ChevronRight size={24} color={colors.primary[500]} />
        </Pressable>
        <Text style={styles.monthName}>{monthName}</Text>
        <Pressable onPress={goNextMonth} hitSlop={8}>
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
          const dateStr = formatDate(day);
          const bg = getStatusColor(dateStr) || colors.neutral[100];
          const textColor = getStatusTextColor(dateStr);
          const isSelected = selectedDate === dateStr;
          const past = isPast(day);

          return (
            <Pressable
              key={index}
              style={[
                styles.day,
                { backgroundColor: bg },
                isSelected && styles.selectedDay,
                isToday(day) && styles.todayDay,
                past && styles.pastDay,
              ]}
              onPress={() => !past && onDateSelect?.(dateStr)}
              disabled={past}
            >
              <Text style={[styles.dayText, { color: past ? colors.textMuted : textColor }]}>
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success[100] }]} />
          <Text style={styles.legendText}>{t('calendar.available')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error[100] }]} />
          <Text style={styles.legendText}>{t('calendar.booked')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning[100] }]} />
          <Text style={styles.legendText}>{t('calendar.pending')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.neutral[300] }]} />
          <Text style={styles.legendText}>{t('calendar.blocked')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navArrow: {
    fontSize: 24,
    color: colors.primary[500],
    paddingHorizontal: spacing.md,
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
    fontSize: fontSize.sm,
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  todayDay: {
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  pastDay: {
    opacity: 0.4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
