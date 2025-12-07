/**
 * IAP Store
 *
 * Manages UI state for in-app purchases
 * Replaces IAPContext with Zustand store
 * Business logic (API calls, purchase operations) is in TanStack Query hooks
 */

'use client';

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

/**
 * Product ID type
 */
export type ProductId = string;

/**
 * IAP Product interface
 */
export interface IAPProduct {
  productId: ProductId;
  price: string;
  currency: string;
  localizedPrice: string;
  title: string;
  description: string;
  subscriptionPeriod?: 'monthly' | 'yearly';
}

/**
 * Subscription Status interface
 * Compatible with IAP context types
 */
export interface SubscriptionStatus {
  isActive: boolean;
  productId: ProductId | null;
  expirationDate: number | null; // timestamp
  isInTrialPeriod: boolean;
  willAutoRenew: boolean;
  platform: 'ios' | 'android' | null;
}

/**
 * Purchase State type
 */
export type PurchaseState =
  | 'idle'
  | 'loading-products'
  | 'products-loaded'
  | 'purchasing'
  | 'verifying'
  | 'completed'
  | 'error';

/**
 * IAP Error interface
 */
export interface IAPError {
  code: string;
  message: string;
  userCancelled?: boolean;
}

/**
 * IAP state interface
 */
export interface IAPState {
  products: IAPProduct[];
  subscriptionStatus: SubscriptionStatus | null;
  purchaseState: PurchaseState;
  error: IAPError | null;
}

/**
 * IAP actions interface
 */
export interface IAPActions {
  setProducts: (products: IAPProduct[]) => void;
  setSubscriptionStatus: (status: SubscriptionStatus | null) => void;
  setPurchaseState: (state: PurchaseState) => void;
  setError: (error: IAPError | null) => void;
  clearError: () => void;
}

/**
 * Combined store type
 */
export type IAPStore = IAPState & IAPActions;

/**
 * Initial state
 */
const initialState: IAPState = {
  products: [],
  subscriptionStatus: null,
  purchaseState: 'idle',
  error: null,
};

/**
 * IAP Store
 */
export const useIAPStore = create<IAPStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setProducts: (products) => set({ products }),

        setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),

        setPurchaseState: (state) => set({ purchaseState: state }),

        setError: (error) => set({ error }),

        clearError: () =>
          set((state) => ({
            error: null,
            purchaseState: state.purchaseState === 'error' ? 'idle' : state.purchaseState,
          })),
      }),
      {
        name: 'iap-storage',
        storage: createJSONStorage(() => {
          if (typeof window !== 'undefined') {
            return localStorage;
          }
          // For React Native, this will be replaced by AsyncStorage in the app
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }),
        partialize: (state) => ({
          subscriptionStatus: state.subscriptionStatus,
          // Don't persist runtime state
          purchaseState: 'idle',
          error: null,
        }),
      }
    ),
    {
      name: 'IAPStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector hooks for better performance
 */
export const useIAPProducts = () =>
  useIAPStore((state) => ({
    products: state.products,
    setProducts: state.setProducts,
  }));

export const useIAPSubscription = () =>
  useIAPStore((state) => ({
    subscriptionStatus: state.subscriptionStatus,
    setSubscriptionStatus: state.setSubscriptionStatus,
  }));

export const useIAPPurchase = () =>
  useIAPStore((state) => ({
    purchaseState: state.purchaseState,
    setPurchaseState: state.setPurchaseState,
    error: state.error,
    setError: state.setError,
    clearError: state.clearError,
  }));
