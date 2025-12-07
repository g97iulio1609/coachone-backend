import { Output, streamText, type CoreMessage } from 'ai';
import { parseJsonResponse } from '@onecoach/lib-ai-utils/json-parser';
import { createModel } from '@onecoach/lib-ai-utils/model-factory';
import type { VisionParseParams } from './types';

function base64ToDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

export async function parseWithVisionAI<T>(params: VisionParseParams<T>): Promise<T> {
  const { contentBase64, mimeType, prompt, schema, modelId, apiKey } = params;

  const modelConfig = {
    provider: 'openrouter' as const,
    model: modelId ?? 'google/gemini-1.5-flash-002',
    maxTokens: 4096,
    temperature: 0.3,
    reasoningEnabled: false,
    creditsPerRequest: 0,
  };

  const model = createModel(modelConfig, apiKey ?? process.env.OPENROUTER_API_KEY, 0.3);
  const dataUrl = base64ToDataUrl(contentBase64, mimeType);

  const messages: CoreMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image', image: dataUrl },
      ],
    },
  ];

  const result = await streamText({
    model,
    messages,
    experimental_output: Output.object({
      schema,
    }),
    temperature: 0.3,
  });

  const fullText = await result.text;
  if (!fullText || fullText.trim() === '') {
    throw new Error('AI returned empty response');
  }

  const parsed = parseJsonResponse(fullText);
  const validated = schema.parse(parsed);
  return validated;
}
