import { Platform } from 'react-native';

export const colors = {
  primary: {
    50: '#fef7ee',
    100: '#fce8d5',
    200: '#f9ccaa',
    300: '#f5a874',
    400: '#f08342',
    500: '#ec6520',
    600: '#d45018',
    700: '#a83d15',
    800: '#833217',
    900: '#6b2b16',
  },
  secondary: {
    50: '#f0f9f4',
    100: '#dcf0e3',
    200: '#bbe1c9',
    300: '#8bcaa6',
    400: '#5aad82',
    500: '#379163',
    600: '#28754f',
    700: '#225d42',
    800: '#1d4a37',
    900: '#193e2f',
  },
  accent: {
    50: '#fff8ed',
    100: '#ffeed4',
    200: '#ffd9a8',
    300: '#ffbe72',
    400: '#ff9b3d',
    500: '#ff7d18',
    600: '#e85f0c',
    700: '#c0470c',
    800: '#993a13',
    900: '#7d3213',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  white: '#ffffff',
  black: '#000000',
  background: '#fafafa',
  surface: '#ffffff',
  text: '#18181b',
  textSecondary: '#71717a',
  textMuted: '#a1a1aa',
  border: '#e4e4e7',
  overlay: 'rgba(0,0,0,0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const fontFamily = {
  regular: 'Rubik-Regular',
  medium: 'Rubik-Medium',
  semibold: 'Rubik-SemiBold',
  bold: 'Rubik-Bold',
};

export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    android: { elevation: 1 },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    android: { elevation: 3 },
    default: {},
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    android: { elevation: 5 },
    default: {},
  }),
  xl: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 },
    android: { elevation: 8 },
    default: {},
  }),
};

export const layout = {
  tabBarHeight: 60,
  headerHeight: 56,
  cardWidth: (width: number) => (width - spacing.md * 3) / 2,
  maxContentWidth: 448,
};

export const animation = {
  fast: 200,
  normal: 300,
  slow: 500,
};
