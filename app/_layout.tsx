import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Enforce RTL globally before rendering any native layouts
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik';
import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { I18nProvider } from '@/src/services/i18n';
import { AuthProvider } from '@/src/services/auth';
import { QueryProvider } from '@/src/services/query';
import { SearchProvider } from '@/src/services/search-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Rubik-Regular': Rubik_400Regular,
    'Rubik-Medium': Rubik_500Medium,
    'Rubik-SemiBold': Rubik_600SemiBold,
    'Rubik-Bold': Rubik_700Bold,
    'Cairo-Regular': Cairo_400Regular,
    'Cairo-SemiBold': Cairo_600SemiBold,
    'Cairo-Bold': Cairo_700Bold,
  });

  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      setI18nReady(true);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !i18nReady) {
    return null;
  }

  return (
    <I18nProvider>
      <QueryProvider>
        <AuthProvider>
          <SearchProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="venue/[id]" />
              <Stack.Screen name="artist/[id]" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </SearchProvider>
        </AuthProvider>
      </QueryProvider>
    </I18nProvider>
  );
}
