import { Platform } from 'react-native';

const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8081/api/v1' : 'http://localhost:8081/api/v1';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;

export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
};

export const TRANSACTION_TYPES = {
  AWARD: 'AWARD',
  ADJUSTMENT: 'ADJUSTMENT',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sms_access_token',
  REFRESH_TOKEN: 'sms_refresh_token',
  USER_DATA: 'sms_user_data',
  THEME_MODE: 'sms_theme_mode',
};
