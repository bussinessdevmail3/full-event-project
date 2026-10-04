import { StyleSheet, Text, View, ScrollView, Pressable, Alert, Image, Linking, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  User as UserIcon, Heart, Calendar, Bell, Globe, HelpCircle, FileText, Shield,
  LogOut, Trash2, Pencil, ChevronRight, Building, Music, X,
} from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing, shadows } from '@/src/theme/tokens';
import { useI18n } from '@/src/services/i18n';
import { useAuth } from '@/src/services/auth';
import { db } from '@/src/services/database';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { TextInput } from '@/src/components/ui/TextInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import type { AppLanguage } from '@/src/i18n/config';

export default function ProfileScreen() {
  const { t, language, isRTL, changeLang } = useI18n();
  const { user, profile, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const { data: favorites } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => db.getFavorites(user!.id),
    enabled: !!user,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => db.getNotifications(user!.id),
    enabled: !!user,
  });

  const venueFavorites = favorites?.filter((f) => f.supplier?.supplier_type_id === 'c0000000-0000-0000-0000-000000000001') || [];
  const artistFavorites = favorites?.filter((f) => f.supplier?.supplier_type_id === 'c0000000-0000-0000-0000-000000000002') || [];
  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  const handleLanguageChange = (lang: AppLanguage) => {
    changeLang(lang);
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.logout'), style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const handleSaveProfile = async () => {
    await updateProfile({ full_name: fullName, phone });
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
  };

  const [showFavorites, setShowFavorites] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const markAllNotificationsRead = useCallback(async () => {
    if (notifications) {
      for (const n of notifications.filter((n: { is_read: boolean; id: string }) => !n.is_read)) {
        await db.markNotificationRead(n.id);
      }
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  }, [notifications, queryClient, user?.id]);

  const menuItems = [
    { icon: Heart, label: t('profile.favorites'), onPress: () => setShowFavorites(true), count: favorites?.length },
    { icon: Calendar, label: t('profile.myEvents'), onPress: () => router.push('/(tabs)/event') },
    { icon: Bell, label: t('profile.notifications'), onPress: () => setShowNotifications(true), count: unreadCount, badge: true },
  ];

  const settingsItems = [
    { icon: HelpCircle, label: t('profile.helpSupport'), onPress: () => Alert.alert(t('profile.helpSupport'), t('messages.comingSoon')) },
    { icon: FileText, label: t('profile.termsOfService'), onPress: () => Alert.alert(t('profile.termsOfService'), t('messages.comingSoon')) },
    { icon: Shield, label: t('profile.privacyPolicy'), onPress: () => Alert.alert(t('profile.privacyPolicy'), t('messages.comingSoon')) },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {(profile?.full_name || '?')[0]?.toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.full_name || ''}</Text>
              <Text style={styles.profileEmail}>{profile?.email}</Text>
              {profile?.phone && <Text style={styles.profilePhone}>{profile.phone}</Text>}
            </View>
            <Pressable style={styles.editButton} onPress={() => setEditing(true)}>
              <Pencil size={16} color={colors.primary[500]} />
            </Pressable>
          </View>

          {editing && (
            <View style={styles.editForm}>
              <TextInput
                label={t('profile.fullName')}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('profile.fullName')}
              />
              <TextInput
                label={t('profile.phone')}
                value={phone}
                onChangeText={setPhone}
                placeholder="050-1234567"
                keyboardType="phone-pad"
              />
              <View style={styles.editActions}>
                <Pressable style={styles.cancelEdit} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelEditText}>{t('common.cancel')}</Text>
                </Pressable>
                <PrimaryButton title={t('common.save')} onPress={handleSaveProfile} size="sm" />
              </View>
            </View>
          )}
        </View>

        {/* Favorites preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.favorites')}</Text>
          {favorites && favorites.length > 0 ? (
            <View style={styles.favoritesPreview}>
              <View style={styles.favoriteCategory}>
                <Building size={16} color={colors.primary[500]} />
                <Text style={styles.favoriteCategoryText}>{venueFavorites.length} {t('profile.favoritesVenues')}</Text>
              </View>
              <View style={styles.favoriteCategory}>
                <Music size={16} color={colors.primary[500]} />
                <Text style={styles.favoriteCategoryText}>{artistFavorites.length} {t('profile.favoritesSingers')}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noFavoritesText}>{t('profile.noFavorites')}</Text>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Pressable
                key={index}
                style={[styles.menuItem, index === 0 && styles.menuItemFirst]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Icon size={20} color={colors.textSecondary} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.count !== undefined && item.count > 0 && (
                    <View style={[styles.menuBadge, item.badge && styles.menuBadgeError]}>
                      <Text style={styles.menuBadgeText}>{item.count}</Text>
                    </View>
                  )}
                  <ChevronRight size={18} color={colors.textMuted} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Language Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          <View style={styles.languageRow}>
            <Pressable
              style={[styles.langButton, language === 'he' && styles.langButtonActive]}
              onPress={() => handleLanguageChange('he')}
            >
              <Text style={[styles.langButtonText, language === 'he' && styles.langButtonTextActive]}>
                {t('profile.hebrew')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.langButton, language === 'ar' && styles.langButtonActive]}
              onPress={() => handleLanguageChange('ar')}
            >
              <Text style={[styles.langButtonText, language === 'ar' && styles.langButtonTextActive]}>
                {t('profile.arabic')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.menuSection}>
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Pressable
                key={index}
                style={[styles.menuItem, index === 0 && styles.menuItemFirst]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Icon size={20} color={colors.textSecondary} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
              </Pressable>
            );
          })}
        </View>

        {/* Logout & Delete */}
        <View style={styles.dangerSection}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={colors.error[500]} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Favorites Modal */}
      <Modal visible={showFavorites} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowFavorites(false)}>
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('profile.favorites')}</Text>
            <Pressable onPress={() => setShowFavorites(false)} hitSlop={8}>
              <X size={24} color={colors.text} />
            </Pressable>
          </View>
          {favorites && favorites.length > 0 ? (
            <FlatList
              data={favorites}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const name = language === 'he' ? item.supplier.business_name_he : (item.supplier.business_name_ar || item.supplier.business_name_he);
                const isVenue = item.supplier.supplier_type_id === 'c0000000-0000-0000-0000-000000000001';
                const coverMedia = item.supplier;
                return (
                  <Pressable
                    style={styles.favoriteItem}
                    onPress={() => {
                      setShowFavorites(false);
                      router.push(`/${isVenue ? 'venue' : 'artist'}/${item.supplier_id}`);
                    }}
                  >
                    <View style={styles.favoriteItemLeft}>
                      {isVenue ? <Building size={20} color={colors.primary[500]} /> : <Music size={20} color={colors.primary[500]} />}
                      <View>
                        <Text style={styles.favoriteItemName} numberOfLines={1}>{name}</Text>
                        <Text style={styles.favoriteItemType}>{isVenue ? t('home.venue') : t('home.singer')}</Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
                  </Pressable>
                );
              }}
            />
          ) : (
            <EmptyState
              icon={<Heart size={48} color={colors.textMuted} />}
              title={t('profile.noFavorites')}
              description={t('profile.noFavoritesDesc')}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={showNotifications} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowNotifications(false)}>
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('profile.notifications')}</Text>
            <View style={styles.modalHeaderRight}>
              {unreadCount > 0 && (
                <Pressable onPress={markAllNotificationsRead} hitSlop={8}>
                  <Text style={styles.markAllText}>{t('common.done')}</Text>
                </Pressable>
              )}
              <Pressable onPress={() => setShowNotifications(false)} hitSlop={8}>
                <X size={24} color={colors.text} />
              </Pressable>
            </View>
          </View>
          {notifications && notifications.length > 0 ? (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const title = language === 'he' ? item.title_he : item.title_ar;
                const body = language === 'he' ? item.body_he : item.body_ar;
                return (
                  <View style={[styles.notificationItem, !item.is_read && styles.notificationUnread]}>
                    {title && <Text style={styles.notificationTitle}>{title}</Text>}
                    {body && <Text style={styles.notificationBody}>{body}</Text>}
                  </View>
                );
              }}
            />
          ) : (
            <EmptyState
              icon={<Bell size={48} color={colors.textMuted} />}
              title={t('profile.noNotifications')}
              description={t('profile.noNotificationsDesc')}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  },
  profileCard: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'right',
  },
  profileEmail: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  profilePhone: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  editForm: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelEdit: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelEditText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  favoritesPreview: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  favoriteCategory: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    ...shadows.sm,
  },
  favoriteCategoryText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'right',
  },
  noFavoritesText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'right',
  },
  menuSection: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemFirst: {},
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuBadge: {
    backgroundColor: colors.primary[100],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeError: {
    backgroundColor: colors.error[100],
  },
  menuBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: colors.primary[700],
  },
  languageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  langButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  langButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  langButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  langButtonTextActive: {
    color: colors.primary[700],
  },
  dangerSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.error[50],
  },
  logoutText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.error[500],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'right',
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  markAllText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.primary[500],
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  favoriteItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  favoriteItemName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
  },
  favoriteItemType: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  notificationItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationUnread: {
    backgroundColor: colors.primary[50],
  },
  notificationTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
  },
  notificationBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
});
