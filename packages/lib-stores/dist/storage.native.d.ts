/**
 * React Native Storage Adapter for Zustand
 *
 * Provides AsyncStorage integration for Zustand persist middleware
 * This should be imported in React Native/Expo apps instead of the default storage
 */
import type { StateStorage } from 'zustand/middleware';
/**
 * AsyncStorage adapter for Zustand persist middleware
 */
export declare const asyncStorage: StateStorage;
