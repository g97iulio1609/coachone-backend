/**
 * Unified Chat Provider
 *
 * React Context provider che unifica Chat e Copilot:
 * - Gestione feature flags da admin
 * - Screen context automatico
 * - Model selection
 * - User credits/role
 *
 * PRINCIPI: KISS, SOLID, DRY
 */

'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type {
  UnifiedChatContextValue,
  UnifiedChatProviderProps,
  ScreenContextData,
} from '../types/unified-chat';
import { DEFAULT_CHAT_FEATURES } from '../types/unified-chat';

// ============================================================================
// Context
// ============================================================================

const UnifiedChatContext = createContext<UnifiedChatContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

/**
 * UnifiedChatProvider - Context provider globale per Chat unificata
 *
 * Fornisce:
 * - Feature flags da admin config
 * - Modelli AI disponibili
 * - Screen context corrente
 * - User info (role, credits)
 * - Open state per sidebar/floating
 */
export function UnifiedChatProvider({
  children,
  userId,
  userRole = 'USER',
  userCredits = 0,
  features = DEFAULT_CHAT_FEATURES,
  models = [],
  defaultModel = null,
  initialContext,
}: UnifiedChatProviderProps) {
  // State
  const [selectedModel, setSelectedModelState] = useState<string | null>(
    defaultModel?.id || models[0]?.id || null
  );
  const [screenContext, setScreenContextState] = useState<ScreenContextData | null>(
    initialContext || null
  );
  const [isOpen, setIsOpenState] = useState(false);

  // Actions
  const setSelectedModel = useCallback((modelId: string) => {
    setSelectedModelState(modelId);
  }, []);

  const setScreenContext = useCallback((context: ScreenContextData | null) => {
    setScreenContextState(context);
  }, []);

  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open);
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpenState((prev) => !prev);
  }, []);

  // Memoize context value
  const contextValue = useMemo<UnifiedChatContextValue>(
    () => ({
      // State
      userId,
      userRole,
      userCredits,
      features,
      models,
      defaultModel,
      selectedModel,
      screenContext,
      isOpen,
      // Actions
      setSelectedModel,
      setScreenContext,
      setIsOpen,
      toggleOpen,
    }),
    [
      userId,
      userRole,
      userCredits,
      features,
      models,
      defaultModel,
      selectedModel,
      screenContext,
      isOpen,
      setSelectedModel,
      setScreenContext,
      setIsOpen,
      toggleOpen,
    ]
  );

  return <UnifiedChatContext.Provider value={contextValue}>{children}</UnifiedChatContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * useUnifiedChatContext - Access UnifiedChat context
 *
 * @throws Error if used outside UnifiedChatProvider
 */
export function useUnifiedChatContext(): UnifiedChatContextValue {
  const context = useContext(UnifiedChatContext);
  if (!context) {
    throw new Error('useUnifiedChatContext must be used within UnifiedChatProvider');
  }
  return context;
}

/**
 * useUnifiedChatContextSafe - Access UnifiedChat context without throwing
 *
 * Returns null if outside provider (useful for optional contexts)
 */
export function useUnifiedChatContextSafe(): UnifiedChatContextValue | null {
  return useContext(UnifiedChatContext);
}
