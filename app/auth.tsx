import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User as UserIcon, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { colors, fontFamily, fontSize, spacing, radius } from '@/src/theme/tokens';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { TextInput } from '@/src/components/ui/TextInput';
import { useAuth } from '@/src/services/auth';
import { useI18n } from '@/src/services/i18n';

export default function AuthScreen() {
  const { t } = useI18n();
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    if (mode === 'register' && (!fullName || !phone)) {
      setError(t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: authError } = await signIn(email, password);
        if (authError) {
          setError(t(authError));
        } else {
          router.replace('/(tabs)');
        }
      } else {
        const { error: authError } = await signUp(email, password, fullName, phone);
        if (authError) {
          setError(t(authError));
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch {
      setError(t('auth.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{t('app.name')}</Text>
          </View>
          <Text style={styles.welcomeTitle}>
            {mode === 'login' ? t('auth.welcome') : t('auth.createAccount')}
          </Text>
          <Text style={styles.welcomeDesc}>
            {mode === 'login' ? t('auth.welcomeDesc') : t('auth.createAccountDesc')}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === 'register' && (
            <TextInput
              label={t('auth.fullName')}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('auth.fullName')}
              icon={<UserIcon size={20} color={colors.textMuted} />}
            />
          )}
          <TextInput
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            icon={<Mail size={20} color={colors.textMuted} />}
          />
          {mode === 'register' && (
            <TextInput
              label={t('auth.phone')}
              value={phone}
              onChangeText={setPhone}
              placeholder="050-1234567"
              keyboardType="phone-pad"
              icon={<Phone size={20} color={colors.textMuted} />}
            />
          )}
          <TextInput
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="******"
            secureTextEntry
            icon={<Lock size={20} color={colors.textMuted} />}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <PrimaryButton
            title={mode === 'login' ? t('auth.login') : t('auth.register')}
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            style={styles.submitButton}
          />

          <Pressable
            style={styles.switchMode}
            onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
          >
            <Text style={styles.switchModeText}>
              {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
              <Text style={styles.switchModeLink}>
                {mode === 'login' ? t('auth.signUp') : t('auth.signIn')}
              </Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  welcomeTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  welcomeDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.error[500],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  switchMode: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  switchModeText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  switchModeLink: {
    fontFamily: fontFamily.semibold,
    color: colors.primary[500],
  },
});
