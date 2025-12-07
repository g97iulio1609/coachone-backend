import { createId } from '@OneCoach/lib-shared/utils/id-generator';
import { TOKEN_LIMITS, AI_REASONING_CONFIG } from '@OneCoach/constants/models';
export async function seedAIConfigs(prisma, adminUserId) {
  const configs = [
    {
      operationType: 'PLAN_GENERATION',
      model: 'CLAUDE_4_5_HAIKU',
      creditCost: 10,
      maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
      thinkingBudget: AI_REASONING_CONFIG.DEFAULT_THINKING_BUDGET,
    },
    {
      operationType: 'PLAN_GENERATION',
      model: 'CLAUDE_4_5_SONNET',
      creditCost: 20,
      maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
      thinkingBudget: AI_REASONING_CONFIG.DEFAULT_THINKING_BUDGET,
    },
    {
      operationType: 'PLAN_MODIFICATION',
      model: 'CLAUDE_4_5_HAIKU',
      creditCost: 3,
      maxTokens: TOKEN_LIMITS.DEFAULT_OUTPUT,
      thinkingBudget: AI_REASONING_CONFIG.DEFAULT_THINKING_BUDGET,
    },
    {
      operationType: 'PLAN_MODIFICATION',
      model: 'CLAUDE_4_5_SONNET',
      creditCost: 6,
      maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
      thinkingBudget: AI_REASONING_CONFIG.DEFAULT_THINKING_BUDGET,
    },
    {
      operationType: 'PLAN_RECALCULATION',
      model: 'CLAUDE_4_5_HAIKU',
      creditCost: 1,
      maxTokens: TOKEN_LIMITS.DEFAULT_OUTPUT,
      thinkingBudget: AI_REASONING_CONFIG.DEFAULT_THINKING_BUDGET,
      recalculateCreditsCost: 1,
    },
    {
      operationType: 'PLAN_RECALCULATION',
      model: 'CLAUDE_4_5_SONNET',
      creditCost: 2,
      maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
      thinkingBudget: AI_REASONING_CONFIG.DEFAULT_THINKING_BUDGET,
      recalculateCreditsCost: 2,
    },
    {
      operationType: 'GENERAL_CHAT',
      model: 'CLAUDE_4_5_HAIKU',
      creditCost: 1,
      maxTokens: TOKEN_LIMITS.DEFAULT_OUTPUT,
      thinkingBudget: AI_REASONING_CONFIG.DEFAULT_THINKING_BUDGET,
    },
    {
      operationType: 'GENERAL_CHAT',
      model: 'CLAUDE_4_5_SONNET',
      creditCost: 2,
      maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
      thinkingBudget: AI_REASONING_CONFIG.DEFAULT_THINKING_BUDGET,
    },
  ];
  for (const c of configs) {
    try {
      const existing = await prisma.ai_operation_configs.findFirst({
        where: {
          operationType: c.operationType,
          model: c.model,
        },
      });
      if (existing) {
        await prisma.ai_operation_configs.update({
          where: { id: existing.id },
          data: {
            creditCost: c.creditCost,
            maxTokens: c.maxTokens,
            thinkingBudget: c.thinkingBudget,
            ...(c.recalculateCreditsCost !== undefined && {
              recalculateCreditsCost: c.recalculateCreditsCost,
            }),
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.ai_operation_configs.create({
          data: {
            id: createId(),
            operationType: c.operationType,
            model: c.model,
            creditCost: c.creditCost,
            maxTokens: c.maxTokens,
            thinkingBudget: c.thinkingBudget,
            ...(c.recalculateCreditsCost !== undefined && {
              recalculateCreditsCost: c.recalculateCreditsCost,
            }),
            isActive: true,
            updatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      // Skip if enum values are not available in database (schema not migrated)
      if (error instanceof Error && error.message?.includes('invalid input value for enum')) {
        console.warn(
          `⚠️ Skipping AI config for ${c.operationType}/${c.model}: enum values not available in database`
        );
        continue;
      }
      throw error;
    }
  }
  const providers = [
    { provider: 'GOOGLE', label: 'Google AI Studio' },
    { provider: 'ANTHROPIC', label: 'Anthropic Claude' },
    { provider: 'OPENAI', label: 'OpenAI' },
    { provider: 'XAI', label: 'xAI Grok' },
    { provider: 'OPENROUTER', label: 'OpenRouter' },
  ];
  for (const p of providers) {
    await prisma.ai_provider_configs.upsert({
      where: { provider: p.provider },
      update: { isEnabled: false, updatedBy: adminUserId, updatedAt: new Date() },
      create: {
        id: createId(),
        provider: p.provider,
        isEnabled: false,
        defaultModel: null,
        metadata: { label: p.label },
        vercelEnvVarId: null, // API keys sono su Vercel, non nel DB
        updatedBy: adminUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
