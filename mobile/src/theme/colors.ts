/**
 * Color palette for BeSure
 * Based on PRD-UXUI.md specifications
 */

export const colors = {
  // Primary colors
  primary: '#4A90E2',
  primaryDark: '#2C3E50',
  primaryLight: '#ECF4FB',

  // Option colors (for voting)
  optionA: '#FF6B6B', // Coral
  optionB: '#4ECDC4', // Teal
  optionC: '#A77BCA', // Purple
  optionD: '#FFA07A', // Orange
  optionE: '#51CF66', // Green
  optionF: '#FFD93D', // Yellow

  // Semantic colors
  success: '#51CF66',
  warning: '#FFB82E',
  error: '#FF6B6B',
  info: '#4A90E2',

  // Neutral colors
  black: '#000000',
  darkGray: '#2C3E50',
  mediumGray: '#95A5A6',
  lightGray: '#E8E8E8',
  background: '#F7F9FB',
  white: '#FFFFFF',

  // Text colors
  textPrimary: '#2C3E50',
  textSecondary: '#95A5A6',
  textLight: '#FFFFFF',

  // UI elements
  border: '#E8E8E8',
  divider: '#E8E8E8',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export const optionColors = [
  colors.optionA,
  colors.optionB,
  colors.optionC,
  colors.optionD,
  colors.optionE,
  colors.optionF,
];

export default colors;
