/**
 * MedLink Mobile Unified Design System Theme
 * Healthcare-focused design system with Teal primary identity.
 *
 * All color tokens match the authoritative values in ui-kit/src/styles.css.
 * Fonts: Manrope (400–800). Headings use weight 700, letterSpacing -0.02em scaled.
 */

export const colors = {
  // Brand - Teal Primary
  primary: '#16A89C',
  primaryDark: '#0E746C',
  primaryLight: '#E6F7F5',
  primaryContainer: '#D8F6F3',
  primaryForeground: '#FFFFFF',

  // Secondary Teal / Mint
  secondary: '#3DBDB3',
  secondaryDark: '#2A938B',
  secondaryLight: '#EEF9F8',
  secondaryForeground: '#17252F',

  // Accent
  accent: '#69D2CA',
  accentForeground: '#17252F',

  // Background & Surfaces
  background: '#F7FBFB',
  backgroundDark: '#101B22',
  surface: '#FFFFFF',
  surfaceDark: '#18262E',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#F1F7F7',
  container: '#DDF0F0',
  card: '#FFFFFF',
  cardForeground: '#17252F',
  popover: '#FFFFFF',
  popoverForeground: '#17252F',

  // Text & Content
  foreground: '#17252F',
  textPrimary: '#17252F',
  textSecondary: '#475569',
  textMuted: '#6B7280',
  muted: '#F2F5F6',
  mutedForeground: '#6B7280',

  // Borders & Dividers
  border: '#D7E4E5',
  borderLight: '#EBF2F2',
  borderDark: 'rgba(255, 255, 255, 0.1)',
  input: '#D7E4E5',
  ring: '#16A89C',

  // Status & Semantics (authoritative values from styles.css)
  success: '#1F7A44',
  successLight: '#DCFCE7',
  successDark: '#15803D',
  warning: '#B5570A',
  warningLight: '#FEF3C7',
  warningDark: '#92400E',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  errorDark: '#B91C1C',
  emergency: '#D64545',
  emergencyDark: '#A72A22',
  emergencyLight: '#FDE8E8',
  emergencyForeground: '#FFFFFF',
  critical: '#A72A22',
  destructive: '#D64545',
  destructiveForeground: '#FFFFFF',
  info: '#2D5772',
  infoLight: '#EFF6FF',
  infoDark: '#1D4ED8',

  // Charts
  chart1: '#16A89C',
  chart2: '#3DBDB3',
  chart3: '#D64545',
  chart4: '#B5570A',
  chart5: '#2D5772',

  // Primitives
  white: '#FFFFFF',
  black: '#17252F',
  transparent: 'transparent',
} as const;

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  pill: 999,
} as const;

export const shadows = {
  none: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  sm: {
    shadowColor: '#17252F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  /** Card shadow — 0 8px 24px rgba(23,37,47,0.05) */
  shadowCard: {
    shadowColor: '#17252F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
  },
  shadowElevated: {
    shadowColor: '#17252F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  /** Dialog shadow — 0 12px 30px rgba(23,37,47,0.08) */
  shadowDialog: {
    shadowColor: '#17252F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },
  /** Nav bar shadow — 0 12px 28px rgba(23,37,47,0.10) */
  shadowNav: {
    shadowColor: '#17252F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 6,
  },
  /** Primary float shadow — 0 20px 50px rgba(22,168,156,0.25) */
  shadowFloat: {
    shadowColor: '#16A89C',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 10,
  },
  /** Fan/center button teal glow — 0 10px 22px rgba(22,168,156,0.4) */
  shadowFanButton: {
    shadowColor: '#16A89C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 8,
  },
  /** SOS fan button red glow — 0 10px 22px rgba(214,69,69,0.4) */
  shadowSosFanButton: {
    shadowColor: '#D64545',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 8,
  },
  shadowEmergency: {
    shadowColor: '#D64545',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
} as const;

export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
} as const;

export const typography = {
  display: {
    fontFamily: fonts.bold,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
    color: colors.textPrimary,
  },
  h1: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.48,
    color: colors.textPrimary,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  h3: {
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.34,
    color: colors.textPrimary,
  },
  bodyLarge: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
  button: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    color: colors.primaryForeground,
  },
} as const;

/** Gradient configs for use with expo-linear-gradient */
export const gradients = {
  primary: {
    colors: ['#3DBDB3', '#16A89C'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  emergency: {
    colors: ['#E2564C', '#D64545'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  fonts,
  typography,
  gradients,
} as const;

export type Theme = typeof theme;
export default theme;
