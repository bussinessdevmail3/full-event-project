import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Users, Wallet, Plus, Pencil, Trash2, Check, Music, Building } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing, shadows } from '@/src/theme/tokens';
import { useI18n } from '@/src/services/i18n';
import { useAuth } from '@/src/services/auth';
import { db } from '@/src/services/database';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { TextInput } from '@/src/components/ui/TextInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { format } from 'date-fns';
import type { EventItem } from '@/src/types';

export default function EventScreen() {
  const { t, language, isRTL } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: () => db.getEvents(user!.id),
    enabled: !!user,
  });

  const { data: eventTypes } = useQuery({
    queryKey: ['event-types'],
    queryFn: () => db.getEventTypes(),
  });

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => db.getCities(),
  });

  const activeEvent = events?.find((e) => e.is_active) || events?.[0];

  const createMutation = useMutation({
    mutationFn: (event: Parameters<typeof db.createEvent>[0]) => db.createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['active-event', user?.id] });
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<EventItem> }) => db.updateEvent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['active-event', user?.id] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['active-event', user?.id] });
    },
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      t('event.delete'),
      t('event.delete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]
    );
  };

  if (creating) {
    return (
      <EventForm
        eventTypes={eventTypes || []}
        cities={cities || []}
        language={language}
        onCancel={() => setCreating(false)}
        onSave={(data) => createMutation.mutate(data)}
        saving={createMutation.isPending}
        t={t}
      />
    );
  }

  if (editing && activeEvent) {
    return (
      <EventForm
        initialEvent={activeEvent}
        eventTypes={eventTypes || []}
        cities={cities || []}
        language={language}
        onCancel={() => setEditing(false)}
        onSave={(data) => updateMutation.mutate({ id: activeEvent.id, updates: data })}
        saving={updateMutation.isPending}
        t={t}
      />
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('event.title')}</Text>
        </View>

        {activeEvent ? (
          <View style={styles.eventCard}>
            {/* Event name and type */}
            <View style={styles.eventTop}>
              <View style={styles.eventIconContainer}>
                <Calendar size={22} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventName}>{activeEvent.event_name}</Text>
                {activeEvent.event_type_id && eventTypes && (
                  <Text style={styles.eventType}>
                    {language === 'he'
                      ? eventTypes.find((et) => et.id === activeEvent.event_type_id)?.name_he
                      : eventTypes.find((et) => et.id === activeEvent.event_type_id)?.name_ar}
                  </Text>
                )}
              </View>
            </View>

            {/* Event details */}
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Calendar size={18} color={colors.primary[500]} />
                <Text style={styles.detailText}>
                  {format(new Date(activeEvent.event_date), 'dd.MM.yyyy')}
                </Text>
              </View>
              {activeEvent.city_id && cities && (
                <View style={styles.detailRow}>
                  <MapPin size={18} color={colors.primary[500]} />
                  <Text style={styles.detailText}>
                    {language === 'he'
                      ? cities.find((c) => c.id === activeEvent.city_id)?.name_he
                      : cities.find((c) => c.id === activeEvent.city_id)?.name_ar}
                  </Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Users size={18} color={colors.primary[500]} />
                <Text style={styles.detailText}>
                  {activeEvent.expected_guests} {t('common.guests')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Wallet size={18} color={colors.primary[500]} />
                <Text style={styles.detailText}>
                  ₪{activeEvent.total_budget.toLocaleString()}
                </Text>
              </View>
            </View>

            {activeEvent.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>{t('event.notes')}</Text>
                <Text style={styles.notesText}>{activeEvent.notes}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.eventActions}>
              <Pressable style={styles.actionButton} onPress={() => setEditing(true)}>
                <Pencil size={16} color={colors.primary[500]} />
                <Text style={styles.actionText}>{t('common.edit')}</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(activeEvent.id)}>
                <Trash2 size={16} color={colors.error[500]} />
                <Text style={[styles.actionText, { color: colors.error[500] }]}>{t('common.delete')}</Text>
              </Pressable>
            </View>

            {/* Planning Status */}
            <View style={styles.planningStatus}>
              <Text style={styles.planningTitle}>{t('event.planningStatus')}</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <View style={styles.statusIcon}>
                    <Building size={20} color={colors.neutral[400]} />
                  </View>
                  <Text style={styles.statusLabel}>{t('event.venue')}</Text>
                  <Text style={styles.statusValue}>{t('event.notBooked')}</Text>
                </View>
                <View style={styles.statusItem}>
                  <View style={styles.statusIcon}>
                    <Music size={20} color={colors.neutral[400]} />
                  </View>
                  <Text style={styles.statusLabel}>{t('event.singer')}</Text>
                  <Text style={styles.statusValue}>{t('event.notBooked')}</Text>
                </View>
              </View>
            </View>

            {/* Quick links */}
            <PrimaryButton
              title={t('event.findVenue')}
              onPress={() => router.push('/(tabs)/explore')}
              variant="outline"
              style={{ marginTop: spacing.md }}
            />
            <PrimaryButton
              title={t('event.findSinger')}
              onPress={() => router.push('/(tabs)/explore')}
              variant="outline"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        ) : (
          <EmptyState
            icon={<Plus size={48} color={colors.textMuted} />}
            title={t('event.noEvent')}
            description={t('event.noEventDesc')}
            action={
              <PrimaryButton
                title={t('event.createFirstEvent')}
                onPress={() => setCreating(true)}
                icon={<Plus size={18} color={colors.white} />}
              />
            }
            style={{ paddingTop: spacing.xxl }}
          />
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface EventFormProps {
  initialEvent?: EventItem;
  eventTypes: { id: string; name_he: string; name_ar: string }[];
  cities: { id: string; name_he: string; name_ar: string }[];
  language: 'he' | 'ar';
  onCancel: () => void;
  onSave: (data: Omit<EventItem, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>) => void;
  saving: boolean;
  t: (key: string) => string;
}

function EventForm({ initialEvent, eventTypes, cities, language, onCancel, onSave, saving, t }: EventFormProps) {
  const [eventName, setEventName] = useState(initialEvent?.event_name || '');
  const [eventTypeId, setEventTypeId] = useState(initialEvent?.event_type_id || '');
  const [eventDate, setEventDate] = useState(initialEvent?.event_date || '');
  const [cityId, setCityId] = useState(initialEvent?.city_id || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [expectedGuests, setExpectedGuests] = useState(String(initialEvent?.expected_guests || ''));
  const [totalBudget, setTotalBudget] = useState(String(initialEvent?.total_budget || ''));
  const [notes, setNotes] = useState(initialEvent?.notes || '');

  const handleSave = () => {
    if (!eventName || !eventDate) return;
    onSave({
      event_name: eventName,
      event_type_id: eventTypeId || null,
      event_date: eventDate,
      city_id: cityId || null,
      location: location || null,
      expected_guests: parseInt(expectedGuests) || 0,
      total_budget: parseFloat(totalBudget) || 0,
      notes: notes || null,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formHeader}>
          <Pressable onPress={onCancel}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </Pressable>
          <Text style={styles.formTitle}>{initialEvent ? t('event.editEvent') : t('event.createEvent')}</Text>
          <Pressable onPress={handleSave} disabled={saving}>
            <Text style={styles.saveText}>{t('common.save')}</Text>
          </Pressable>
        </View>

        <TextInput
          label={t('event.eventName')}
          value={eventName}
          onChangeText={setEventName}
          placeholder={t('event.eventNamePlaceholder')}
        />

        <Text style={styles.label}>{t('event.eventType')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {eventTypes.map((et) => (
            <Pressable
              key={et.id}
              style={[styles.optionChip, eventTypeId === et.id && styles.optionChipActive]}
              onPress={() => setEventTypeId(et.id)}
            >
              <Text style={[styles.optionChipText, eventTypeId === et.id && styles.optionChipTextActive]}>
                {language === 'he' ? et.name_he : et.name_ar}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <TextInput
          label={t('event.eventDate')}
          value={eventDate}
          onChangeText={setEventDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>{t('event.city')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {cities.map((city) => (
            <Pressable
              key={city.id}
              style={[styles.optionChip, cityId === city.id && styles.optionChipActive]}
              onPress={() => setCityId(city.id)}
            >
              <Text style={[styles.optionChipText, cityId === city.id && styles.optionChipTextActive]}>
                {language === 'he' ? city.name_he : city.name_ar}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <TextInput
          label={t('event.expectedGuests')}
          value={expectedGuests}
          onChangeText={setExpectedGuests}
          placeholder="300"
          keyboardType="numeric"
        />

        <TextInput
          label={t('event.totalBudget')}
          value={totalBudget}
          onChangeText={setTotalBudget}
          placeholder="80000"
          keyboardType="numeric"
        />

        <TextInput
          label={t('event.notes')}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('event.notes')}
          multiline
          numberOfLines={3}
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
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
  eventCard: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'right',
  },
  eventType: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  eventDetails: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
  },
  notesContainer: {
    marginTop: spacing.md,
  },
  notesLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  notesText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'right',
  },
  eventActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.primary[500],
  },
  deleteButton: {},
  planningStatus: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  planningTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
  },
  statusIcon: {
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  statusValue: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formContainer: {
    flex: 1,
    padding: spacing.md,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'right',
  },
  cancelText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  saveText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.primary[500],
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginEnd: spacing.sm,
  },
  optionChipActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionChipText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  optionChipTextActive: {
    color: colors.primary[700],
  },
});
