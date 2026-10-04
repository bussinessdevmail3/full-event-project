import { Tabs } from 'expo-router';
import { Home, Compass, CalendarHeart, MessageCircle, User } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize } from '@/src/theme/tokens';
import { useI18n } from '@/src/services/i18n';
import { useAuth } from '@/src/services/auth';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  const tabBarHeight = 56 + (Platform.OS === 'android' ? Math.max(insets.bottom, 8) : insets.bottom);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontFamily: 'Rubik-Medium',
          marginTop: 2,
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          height: tabBarHeight,
          paddingBottom: insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 8 : 6),
          paddingTop: 6,
          paddingHorizontal: 0,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <Home size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.explore'),
          tabBarIcon: ({ color }) => <Compass size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="event"
        options={{
          title: t('tabs.myEvent'),
          tabBarIcon: ({ color }) => <CalendarHeart size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabs.messages'),
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
