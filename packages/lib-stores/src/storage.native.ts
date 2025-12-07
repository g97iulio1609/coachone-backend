/**
 * React Native Storage Adapter for Zustand
 *
 * Provides AsyncStorage integration for Zustand persist middleware
 * This should be imported in React Native/Expo apps instead of the default storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

/**
 * AsyncStorage adapter for Zustand persist middleware
 */
export const asyncStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};
