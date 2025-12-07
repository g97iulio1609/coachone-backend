/**
 * React Native Storage Adapter for Zustand
 *
 * Provides AsyncStorage integration for Zustand persist middleware
 * This should be imported in React Native/Expo apps instead of the default storage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
/**
 * AsyncStorage adapter for Zustand persist middleware
 */
export const asyncStorage = {
    getItem: async (name) => {
        return await AsyncStorage.getItem(name);
    },
    setItem: async (name, value) => {
        await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name) => {
        await AsyncStorage.removeItem(name);
    },
};
