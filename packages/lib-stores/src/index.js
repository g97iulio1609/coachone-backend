/**
 * Zustand Stores
 *
 * Centralized state management using Zustand
 * Following SOLID principles and strong typing
 */
export { useAuthStore } from './auth.store';
export { useUIStore, useTheme, useSidebar, useWizard, useSystemThemeSync, useSystemThemeSyncNative, } from './ui.store';
export * from './ui.store';
// export * from './types/safe-types';
export * from './utils/dialog-global';
export * from './sidebar.store';
export * from './workout-builder.store';
export { lightColors, darkColors } from './ui.store';
export { useHealthStore, useHealthPermissions, useHealthSync, useHealthSummary, } from './health.store';
export { useIAPStore, useIAPProducts, useIAPSubscription, useIAPPurchase } from './iap.store';
export { useDialogStore, useDialog, useDialogState } from './dialog.store';
export { useOnboardingStore } from './onboarding.store';
export { useAdminStore } from './admin.store';
export { useHeaderActions } from './header-actions.store';
export { useNavigationStateStore } from './navigation-state.store';
export { useCopilotStore, selectCopilotIsOpen, selectCopilotWidth, selectCopilotFeatures, selectCopilotModels, selectCopilotSelectedModel, selectCopilotDisplayMode, selectCopilotIsResizing, 
// MCP Context Selectors
selectMcpContext, selectCurrentDomain, selectNutritionContext, selectWorkoutContext, selectExerciseContext, selectOneAgendaContext, selectMarketplaceContext, selectAnalyticsContext, selectCurrentAthleteId, selectActiveDomainContext, } from './copilot.store';
// Maxes Store
export { useMaxesStore, useMax, useMaxHistory, useMaxesLoading, useMaxesError, selectMaxesList, selectMaxByExerciseId, selectHistoryByExerciseId, selectSelectedMax, selectHasMaxes, selectMaxesCount, selectMaxesSortedByName, selectMaxesSortedByWeight, selectMaxesSortedByDate, } from './maxes.store';
// Realtime Store & Hooks
export { useRealtimeStore, selectRealtimeStatus, selectIsRealtimeReady, selectRealtimeError, } from './realtime.store';
export { useRealtimeSubscription, useSyncField, useRealtimeStatus, useRealtimeDebug, useRealtimeSync, useRealtimeSyncWithClient, useRealtimeSyncSingle, useMagicAnimation, useRealtimeWithMagic, } from './realtime.hooks';
export { useOneAgendaStore } from './oneagenda.store';
export { useDirectConversationsRealtime, useDirectMessagesRealtime, useDirectMessagingRealtime, useDirectConversationsSync, useDirectMessagesSync, } from './direct-messaging.hooks';
// Chat Store (SSOT per chat state)
export { useChatStore, selectConversations, selectCurrentConversationId, selectMessages, selectInput, selectIsLoading, selectIsDeleting, selectLastError, selectCurrentConversation, selectHasConversations, selectConversationsCount, selectMessageCount, } from './chat.store';
