import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Generic LanguageModel type that works with all AI SDK providers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LanguageModel = any;

export interface ModelConfig {
  provider: string;
  model: string;
}

// Options are passed to streamText/generateText, not model constructor in AI SDK Core
interface CustomModelOptions {
  maxTokens?: number;
  temperature?: number;
}

export function createCustomModel(
  config: ModelConfig,
  _options: CustomModelOptions = {}, // Unused in model creation
  apiKey?: string
): LanguageModel {
  switch (config.provider) {
    case 'google':
      const google = createGoogleGenerativeAI({ apiKey });
      return google(config.model);
    case 'anthropic':
      const anthropic = createAnthropic({ apiKey });
      return anthropic(config.model);
    case 'openai':
      const openai = createOpenAI({ apiKey });
      return openai(config.model);
    case 'xai':
      const xai = createXai({ apiKey });
      return xai(config.model);
    case 'openrouter':
      const openrouter = createOpenRouter({ apiKey });
      return openrouter(config.model);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

export function getModelByTier(tier: 'fast' | 'balanced' | 'quality'): ModelConfig {
  switch (tier) {
    case 'fast':
      return { provider: 'google', model: 'gemini-2.0-flash-001' };
    case 'balanced':
      return { provider: 'anthropic', model: 'claude-3-5-haiku-latest' };
    case 'quality':
      return { provider: 'anthropic', model: 'claude-3-5-sonnet-latest' };
    default:
      return { provider: 'google', model: 'gemini-2.0-flash-001' };
  }
}
