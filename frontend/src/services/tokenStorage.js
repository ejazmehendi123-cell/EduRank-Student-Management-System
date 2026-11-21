import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../utils/constants';

const isWeb = Platform.OS === 'web';

export const tokenStorage = {
  async setAccessToken(token) {
    if (isWeb) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
    }
  },

  async getAccessToken() {
    if (isWeb) {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async setRefreshToken(token) {
    if (isWeb) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
    }
  },

  async getRefreshToken() {
    if (isWeb) {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setUserData(user) {
    const json = JSON.stringify(user);
    if (isWeb) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, json);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, json);
    }
  },

  async getUserData() {
    let json = null;
    if (isWeb) {
      json = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    } else {
      json = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    }
    try {
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async setTheme(themeMode) {
    if (isWeb) {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.THEME_MODE, themeMode);
    }
  },

  async getTheme() {
    if (isWeb) {
      return localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    }
    return await SecureStore.getItemAsync(STORAGE_KEYS.THEME_MODE);
  },

  async clearAll() {
    if (isWeb) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    }
  },
};

