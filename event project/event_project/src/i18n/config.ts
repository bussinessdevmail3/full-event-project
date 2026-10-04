import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';
import { Storage } from '../services/storage';

import he from '../translations/he.json';
import ar from '../translations/ar.json';

export type AppLanguage = 'he' | 'ar';

// Force RTL immediately at the top level so iOS native runtime registers it before view hierarchy renders
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const locales = getLocales();
const deviceLanguage = locales[0]?.languageCode;
const defaultLang: AppLanguage = deviceLanguage === 'ar' ? 'ar' : 'he';

i18n.use(initReactI18next).init({
  resources: {
    he: { translation: he },
    ar: { translation: ar },
  },
  lng: defaultLang,
  fallbackLng: 'he',
  interpolation: {
    escapeValue: false,
  },
});

export async function loadSavedLanguage(): Promise<AppLanguage> {
  const savedLang = await Storage.getLanguage();
  if (savedLang === 'ar' || savedLang === 'he') {
    await i18n.changeLanguage(savedLang);
    return savedLang as AppLanguage;
  }
  return defaultLang;
}

export async function changeLanguage(lang: AppLanguage) {
  await i18n.changeLanguage(lang);
  await Storage.setLanguage(lang);
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export function isRTL(lang?: string): boolean {
  return true; // Both supported languages ('he' and 'ar') are RTL
}

export function getCurrentLanguage(): AppLanguage {
  return (i18n.language as AppLanguage) || 'he';
}

export default i18n;
