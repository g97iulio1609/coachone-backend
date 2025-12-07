/**
 * IAP Native Hooks
 *
 * Hooks for React Native/Expo that handle native IAP integration
 * Combines Zustand store + native IAP APIs + TanStack Query
 */
import type { ProductId } from '@OneCoach/lib-stores/iap.store';
/**
 * Hook to manage IAP in React Native
 * Replaces IAPProvider context
 */
export declare function useIAP(): {
    products: import("@OneCoach/lib-stores").IAPProduct[];
    subscriptionStatus: import("@OneCoach/lib-stores").SubscriptionStatus | null;
    purchaseState: import("@OneCoach/lib-stores").PurchaseState;
    error: import("@OneCoach/lib-stores").IAPError | null;
    loadProducts: () => Promise<void>;
    purchaseProduct: (productId: ProductId) => Promise<boolean>;
    restorePurchases: () => Promise<{
        success: boolean;
        purchases: {
            receipt: any;
            productId: string;
            platform: "ios" | "android";
            purchaseToken: string | undefined;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        purchases: never[];
        error: string;
    }>;
    clearError: () => void;
};
