export const lightTheme = {
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#eeeeee',
  borderLight: '#f0f0f0',
  primary: '#007AFF',
  danger: '#FF3B30',
  success: '#81C784',
  inputBg: '#f9f9f9',
  inputBorder: '#ddd',
};

export const darkTheme = {
  background: '#1a1a1a',
  surface: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#cccccc',
  textTertiary: '#999999',
  border: '#3a3a3a',
  borderLight: '#333333',
  primary: '#0A84FF',
  danger: '#FF453A',
  success: '#81C784',
  inputBg: '#1a1a1a',
  inputBorder: '#444444',
};

export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};
