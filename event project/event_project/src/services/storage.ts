import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const LANGUAGE_KEY = '@app_language';

export const Storage = {
  async getLanguage(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(LANGUAGE_KEY);
      }
      return await SecureStore.getItemAsync(LANGUAGE_KEY);
    } catch {
      return null;
    }
  },

  async setLanguage(lang: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      } else {
        await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
      }
    } catch {
      // ignore
    }
  },
};
