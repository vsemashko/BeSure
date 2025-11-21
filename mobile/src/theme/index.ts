import colors, { optionColors } from './colors';
import typography from './typography';
import spacing, { borderRadius } from './spacing';

export const theme = {
  colors,
  optionColors,
  typography,
  spacing,
  borderRadius,

  // Shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;

export { colors, optionColors, typography, spacing, borderRadius };
export default theme;
