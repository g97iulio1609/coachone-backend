/**
 * useChatCore Hook
 *
 * Hook principale per la gestione della chat con AI SDK v6.
 * SSOT per Chat e Copilot, usa useChat nativo + DefaultChatTransport.
 *
 * PRINCIPI:
 * - KISS: Niente wrapper, usa AI SDK direttamente
 * - SOLID: Single Responsibility - solo logica chat AI
 * - DRY: Logica comune per Chat e Copilot
 *
 * USAGE:
 * ```tsx
 * const { messages, sendMessage, input, setInput } = useChatCore({
 *   body: { domain: 'nutrition' },
 * });
 *
 * // Render messages
 * messages.map(msg =>
 *   msg.parts.map(part =>
 *     part.type === 'text' ? <p>{part.text}</p> : null
 *   )
 * )
 *
 * // Send message
 * <form onSubmit={e => { e.preventDefault(); sendMessage({ text: input }); setInput(''); }}>
 * ```
 */

'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useChat as useAIChat } from '@ai-sdk/react';
import type { ChatStatus, UseChatCoreOptions, UseChatCoreResult, UIMessage } from '../types';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_API = '/api/chat';

// ============================================================================
// Logging
// ============================================================================

// Logging disabled for performance - enable only for debugging
// const DEBUG = process.env.NODE_ENV === 'development';

function log(_message: string, _data?: unknown) {
  // Disabled for streaming performance
}

function logError(message: string, error?: unknown) {
  console.error(`🔴 [useChatCore] ${message}`, error);
}

// ============================================================================
// Status Mapping
// ============================================================================

function mapAISdkStatus(aiStatus: 'submitted' | 'streaming' | 'ready' | 'error'): ChatStatus {
  return aiStatus;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook principale per la gestione della chat.
 * Usa AI SDK v6 useChat con DefaultChatTransport.
 */
export function useChatCore(options: UseChatCoreOptions = {}): UseChatCoreResult {
  const {
    api = DEFAULT_API,
    conversationId: initialConversationId = null,
    initialMessages = [],
    model,
    systemPrompt,
    body: staticBody = {},
    onMessage,
    onError,
    onConversationCreated,
    onFinish,
    enabled = true,
  } = options;

  // Local state
  const [input, setInputLocal] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);

  // Refs for stable callbacks
  const callbacksRef = useRef({ onMessage, onError, onConversationCreated, onFinish });
  callbacksRef.current = { onMessage, onError, onConversationCreated, onFinish };

  // Track processed messages
  const lastProcessedMessageIdRef = useRef<string | null>(null);

  log('Hook initialized', {
    api,
    conversationId: initialConversationId,
    initialMessagesCount: initialMessages.length,
    hasModel: !!model,
    hasSystemPrompt: !!systemPrompt,
  });

  // Prepare body for useChat - this will be sent with each request
  // Following AI SDK v6 pattern: useChat() without custom transport
  // The body is passed to sendMessage() options
  const requestBody = useMemo(() => {
    return {
      ...staticBody,
      model,
      systemPrompt,
      conversationId,
    };
  }, [model, systemPrompt, staticBody, conversationId]);

  // Convert legacy initialMessages to AI SDK v6 format
  const aiInitialMessages = useMemo<UIMessage[]>(() => {
    if (!initialMessages.length) return [];

    return initialMessages.map((m: any) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant' | 'system',
      parts: [{ type: 'text' as const, text: m.content }],
    }));
  }, [initialMessages]);

  // AI SDK v6 useChat - following official pattern from AI Elements examples
  // https://ai-sdk.dev/elements/examples/chatbot
  // No custom transport needed - useChat handles it automatically
  const chatConfig: Parameters<typeof useAIChat>[0] = {
    api,
    // Only pass id if conversationId exists (don't pass undefined)
    ...(conversationId ? { id: conversationId } : {}),
    credentials: 'include' as RequestCredentials, // Include cookies for auth
    // Only pass initialMessages if they exist
    ...(aiInitialMessages.length > 0 ? { initialMessages: aiInitialMessages } : {}),
    // Throttle UI updates per migliorare fluidità streaming in tempo reale
    // Riduce re-render eccessivi durante lo streaming rapido
    experimental_throttle: 30, // 30ms = ~33 FPS, bilancio ottimale tra fluidità e performance
    // Prepare request body - include static body params
    experimental_prepareRequestBody: ({ messages }) => {
      return {
        messages,
        ...requestBody,
      };
    },
    // Handle streaming data parts - minimal processing for performance
    onData: (_dataPart: unknown) => {
      // No logging during streaming for performance
    },
    onFinish: ({ message }: { message: UIMessage }) => {
      log('Message finished', { messageId: message.id, role: message.role });

      // Extract conversationId from response headers (if new conversation)
      // This is handled by the API via x-conversation-id header
      callbacksRef.current.onFinish?.();
    },
    onError: (error: Error) => {
      logError('Chat error', error);
      callbacksRef.current.onError?.(error);
    },
  };

  const {
    messages: aiMessages,
    setMessages: aiSetMessages,
    sendMessage: aiSendMessage,
    status: aiStatus,
    error: aiError,
    stop: aiStop,
  } = useAIChat(chatConfig);

  // Cast messages (they're compatible)
  const messages = aiMessages as UIMessage[];

  // Log messages changes - solo per nuovi messaggi, non durante streaming
  useEffect(() => {
    log('Messages updated', { count: messages.length });

    // Process new messages for callbacks
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.id !== lastProcessedMessageIdRef.current) {
      lastProcessedMessageIdRef.current = lastMessage.id;
      log('New message processed', { id: lastMessage.id, role: lastMessage.role });
      callbacksRef.current.onMessage?.(lastMessage);
    }
  }, [messages]);

  // Map status
  const status = mapAISdkStatus(aiStatus);
  const isLoading = status === 'submitted' || status === 'streaming';

  // Log status changes
  useEffect(() => {
    log('Status changed', { status, isLoading });
  }, [status, isLoading]);

  // Send message handler
  const sendMessage = useCallback(
    async (sendOptions?: { text?: string }) => {
      const messageText = sendOptions?.text ?? input;

      if (!messageText.trim()) {
        log('Empty message, skipping');
        return;
      }

      if (!enabled) {
        log('Chat disabled, skipping');
        return;
      }

      log('Sending message', { text: messageText.slice(0, 50) });

      // Clear input immediately
      setInputLocal('');

      try {
        // Use AI SDK v6 sendMessage following official pattern
        // Pass body in options (like in AI Elements chatbot example)
        await aiSendMessage(
          { text: messageText },
          {
            body: requestBody,
          }
        );

        log('Message sent successfully');
      } catch (error) {
        logError('Failed to send message', error);
        throw error;
      }
    },
    [input, enabled, aiSendMessage, requestBody]
  );

  // setInput wrapper
  const setInput = useCallback((value: string) => {
    setInputLocal(value);
  }, []);

  // Reset handler
  const reset = useCallback(() => {
    log('Resetting chat');
    aiSetMessages([]);
    setInputLocal('');
    setConversationId(null);
    lastProcessedMessageIdRef.current = null;
  }, [aiSetMessages]);

  // setMessages wrapper
  const setMessagesWrapper = useCallback(
    (newMessages: UIMessage[]) => {
      log('Setting messages', { count: newMessages.length });
      aiSetMessages(newMessages as Parameters<typeof aiSetMessages>[0]);
    },
    [aiSetMessages]
  );

  // Reload handler - re-send last user message
  const reload = useCallback(async () => {
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (!lastUserMessage) {
      log('No user message to reload');
      return;
    }

    const textPart = lastUserMessage.parts.find((p: any) => p.type === 'text');
    const text = textPart && 'text' in textPart ? (textPart as { text: string }).text : '';

    if (!text) {
      log('No text content in last user message');
      return;
    }

    log('Reloading last message', { text: text.slice(0, 50) });

    // Remove last assistant message
    const messagesWithoutLastAssistant = messages.filter((m, i) => {
      const isLastAssistant = m.role === 'assistant' && i === messages.length - 1;
      return !isLastAssistant;
    });

    aiSetMessages(messagesWithoutLastAssistant as Parameters<typeof aiSetMessages>[0]);

    // Re-send the message
    await aiSendMessage({ text });
  }, [messages, aiSetMessages, aiSendMessage]);

  return {
    messages,
    input,
    setInput,
    sendMessage,
    setMessages: setMessagesWrapper,
    status,
    isLoading,
    error: aiError || null,
    stop: aiStop,
    reload,
    reset,
    conversationId,
  };
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook pre-configurato per Copilot (floating window).
 */
export function useCopilotChatCore(options: Omit<UseChatCoreOptions, 'api'> = {}) {
  log('useCopilotChatCore initialized');
  return useChatCore({
    ...options,
    api: '/api/chat',
  });
}

/**
 * Hook pre-configurato per Chat principale.
 */
export function useMainChatCore(options: Omit<UseChatCoreOptions, 'api'> = {}) {
  log('useMainChatCore initialized');
  return useChatCore({
    ...options,
    api: '/api/chat',
  });
}
