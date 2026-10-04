import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { I18nManager, Platform, View, Text, StyleSheet, Pressable } from 'react-native';
import i18n from 'i18next';
import { loadSavedLanguage, changeLanguage, AppLanguage } from '../i18n/config';

// Force RTL immediately at module initialization
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface I18nContextType {
  language: AppLanguage;
  isRTL: boolean;
  changeLang: (lang: AppLanguage) => Promise<void>;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(
    (i18n.language as AppLanguage) || 'he'
  );
  const [isRTL, setIsRTL] = useState(true);
  const [ready, setReady] = useState(false);
  const [showRTLReloadNotice, setShowRTLReloadNotice] = useState(false);

  useEffect(() => {
    (async () => {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);

      const lang = await loadSavedLanguage();
      setLanguage(lang);
      setIsRTL(true);

      // On iOS, if native layout hasn't restarted with RTL yet (e.g. in Expo Go on first run)
      if (Platform.OS === 'ios' && !I18nManager.isRTL) {
        setShowRTLReloadNotice(true);
      }
      setReady(true);
    })();
  }, []);

  const changeLang = useCallback(async (lang: AppLanguage) => {
    await changeLanguage(lang);
    setLanguage(lang);
    setIsRTL(true);
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);

  const t = useCallback((key: string, options?: Record<string, unknown>) => {
    return i18n.t(key, options) as string;
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ language, isRTL, changeLang, t }}>
      {showRTLReloadNotice && (
        <View style={noticeStyles.banner}>
          <Text style={noticeStyles.text}>
            {language === 'ar'
              ? 'يرجى إعادة تحميل التطبيق (Reload في Expo) لتفعيل واجهة RTL بالكامل على iPhone'
              : 'נא לטעון מחדש את האפליקציה (Reload ב-Expo) להחלת תצוגת RTL מלאה באייפון'}
          </Text>
          <Pressable onPress={() => setShowRTLReloadNotice(false)} style={noticeStyles.closeBtn} hitSlop={8}>
            <Text style={noticeStyles.closeText}>✕</Text>
          </Pressable>
        </View>
      )}
      {children}
    </I18nContext.Provider>
  );
}

const noticeStyles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    zIndex: 99999,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  text: {
    flex: 1,
    fontFamily: 'Rubik-Medium',
    fontSize: 12,
    color: '#92400E',
    textAlign: 'right',
  },
  closeBtn: {
    padding: 6,
    marginStart: 8,
  },
  
  
  closeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
  },
});

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
