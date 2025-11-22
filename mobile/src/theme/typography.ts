/**
 * Typography system for BeSure
 * Based on PRD-UXUI.md specifications (Inter font family)
 */

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System', // Will use San Francisco on iOS, Roboto on Android
    bold: 'System',
    semiBold: 'System',
  },

  // Font sizes
  fontSize: {
    display: 32,
    h1: 24,
    h2: 20,
    bodyLarge: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    display: 38,
    h1: 31,
    h2: 28,
    bodyLarge: 27,
    body: 24,
    bodySmall: 20,
    caption: 16,
  },
};

export default typography;
