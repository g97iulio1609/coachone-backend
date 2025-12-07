/**
 * User Memory AI Analyzer
 *
 * Uses AI agents to analyze user memory patterns and extract insights.
 * Called periodically or on-demand to identify patterns and generate recommendations.
 */
import { generateText } from 'ai';
import { createModel } from '@OneCoach/lib-ai-agents/utils/model-factory';
import { getModelByTier } from '@OneCoach/lib-ai-agents/core/providers/config';
import { userMemoryService } from '../user-memory.service';
// ============================================================================
// ANALYSIS PROMPTS
// ============================================================================
const ANALYSIS_SYSTEM_PROMPT = `You are an expert behavioral analyst specializing in user behavior patterns, preferences, and personalization.

Your role is to:
- Analyze user interaction history to identify meaningful patterns
- Extract insights about user preferences and behaviors
- Generate actionable recommendations based on patterns
- Identify trends and changes in user behavior over time

Guidelines:
- Focus on actionable, specific patterns (not generic observations)
- Provide confidence scores (0-1) based on evidence strength
- Include evidence/examples that support each pattern
- Generate recommendations that are practical and personalized
- Consider cross-domain patterns when relevant

Output format: JSON with patterns, insights, and recommendations.`;
/**
 * Build analysis prompt for a specific domain
 */
function buildAnalysisPrompt(userId, domain, memory, options) {
    const domainMemory = memory[domain];
    if (!domainMemory) {
        return `No memory data available for domain: ${domain}`;
    }
    const history = domainMemory.history || [];
    const existingPatterns = domainMemory.patterns || [];
    const preferences = domainMemory.preferences || {};
    let prompt = `Analyze user behavior patterns for user ${userId} in domain: ${domain}\n\n`;
    if (options?.timeframe) {
        prompt += `Timeframe: ${options.timeframe.start} to ${options.timeframe.end}\n\n`;
    }
    prompt += `Current Preferences:\n${JSON.stringify(preferences, null, 2)}\n\n`;
    prompt += `Interaction History (${history.length} items):\n`;
    const relevantHistory = options?.timeframe
        ? history.filter((item) => item.timestamp >= options.timeframe.start && item.timestamp <= options.timeframe.end)
        : history.slice(-50); // Last 50 items if no timeframe
    relevantHistory.forEach((item, index) => {
        prompt += `${index + 1}. [${item.timestamp}] ${item.type}: ${JSON.stringify(item.data)}\n`;
    });
    prompt += `\nExisting Patterns (${existingPatterns.length}):\n`;
    existingPatterns.forEach((pattern, index) => {
        prompt += `${index + 1}. ${pattern.type}: ${pattern.description} (confidence: ${pattern.confidence})\n`;
    });
    prompt += `\n\nAnalyze this data and identify:
1. New patterns not already identified
2. Updates to existing patterns (if evidence has changed)
3. Insights about user behavior and preferences
4. Actionable recommendations

Return JSON in this format:
{
  "patterns": [
    {
      "type": "PATTERN_TYPE",
      "description": "Clear description of the pattern",
      "confidence": 0.0-1.0,
      "evidence": ["example1", "example2"],
      "suggestions": ["recommendation1", "recommendation2"]
    }
  ],
  "insights": [
    {
      "category": "INSIGHT_CATEGORY",
      "insight": "Clear insight description",
      "basedOn": "What data/patterns this is based on",
      "confidence": 0.0-1.0,
      "relevance": 0.0-1.0
    }
  ]
}`;
    return prompt;
}
// ============================================================================
// PATTERN ANALYSIS
// ============================================================================
/**
 * Analyze patterns for a specific domain
 */
export async function analyzeDomainPatterns(userId, domain, options = {}, tier = 'balanced') {
    try {
        // Get current memory
        const memory = await userMemoryService.getMemory(userId, {
            domain,
            includeHistory: true,
            includePatterns: true,
            historyLimit: 200,
        });
        const domainMemory = memory[domain];
        if (!domainMemory || domainMemory.history.length < 5) {
            // Not enough data to analyze
            return { patterns: [], insights: [] };
        }
        // Build analysis prompt
        const prompt = buildAnalysisPrompt(userId, domain, memory, options);
        // Get AI model
        const modelConfig = await getModelByTier(tier);
        const apiKey = process.env.OPENROUTER_API_KEY || '';
        const model = createModel(modelConfig, apiKey);
        // Generate analysis
        const { text } = await generateText({
            model,
            prompt: `${ANALYSIS_SYSTEM_PROMPT}\n\n${prompt}`,
            temperature: 0.3, // Lower temperature for more consistent analysis
        });
        // Parse JSON response
        let analysisResult = {};
        try {
            // Try to extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0]);
            }
        }
        catch (error) {
            console.error('[Memory Analyzer] Failed to parse AI response:', error);
            console.warn('[Memory Analyzer] Raw response:', text);
            return { patterns: [], insights: [] };
        }
        // Process patterns
        const patterns = [];
        if (analysisResult.patterns) {
            for (const patternData of analysisResult.patterns) {
                if (patternData.type && patternData.description) {
                    const now = new Date().toISOString();
                    const pattern = {
                        type: patternData.type,
                        description: patternData.description,
                        confidence: patternData.confidence ?? 0.5,
                        evidence: patternData.evidence || [],
                        firstObserved: now,
                        lastObserved: now,
                        frequency: patternData.frequency ?? 1,
                        suggestions: patternData.suggestions || [],
                    };
                    // Check if similar pattern already exists
                    const existingPatterns = domainMemory.patterns || [];
                    const similarPattern = existingPatterns.find((p) => p.type === pattern.type);
                    if (similarPattern) {
                        // Update existing pattern
                        pattern.firstObserved = similarPattern.firstObserved;
                        pattern.frequency = similarPattern.frequency + 1;
                        // Update confidence based on new evidence
                        pattern.confidence = Math.min(1.0, (similarPattern.confidence + pattern.confidence) / 2);
                    }
                    patterns.push(pattern);
                }
            }
        }
        // Process insights
        const insights = [];
        if (analysisResult.insights) {
            for (const insightData of analysisResult.insights) {
                if (insightData.category && insightData.insight) {
                    const insight = {
                        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        category: insightData.category,
                        insight: insightData.insight,
                        basedOn: insightData.basedOn || 'AI analysis',
                        confidence: insightData.confidence ?? 0.5,
                        relevance: insightData.relevance ?? 0.5,
                        generatedAt: new Date().toISOString(),
                        expiresAt: insightData.expiresAt,
                    };
                    insights.push(insight);
                }
            }
        }
        // Save patterns and insights to memory
        if (patterns.length > 0) {
            // Update patterns (merge with existing)
            const currentPatterns = domainMemory.patterns || [];
            const updatedPatterns = [...currentPatterns];
            patterns.forEach((newPattern) => {
                const existingIndex = updatedPatterns.findIndex((p) => p.type === newPattern.type);
                if (existingIndex >= 0) {
                    updatedPatterns[existingIndex] = newPattern;
                }
                else {
                    updatedPatterns.push(newPattern);
                }
            });
            await userMemoryService.updateMemory(userId, {
                domain,
                updates: {
                    patterns: updatedPatterns,
                },
            });
        }
        if (insights.length > 0) {
            await userMemoryService.updateMemory(userId, {
                domain,
                updates: {
                    insights,
                },
            });
        }
        return { patterns, insights };
    }
    catch (error) {
        console.error(`[Memory Analyzer] Error analyzing ${domain} patterns:`, error);
        return { patterns: [], insights: [] };
    }
}
/**
 * Analyze patterns across all domains
 */
export async function analyzeAllDomains(userId, options = {}, tier = 'balanced') {
    const domains = [
        'workout',
        'nutrition',
        'oneagenda',
        'projects',
        'tasks',
        'habits',
        'general',
    ];
    const results = {};
    // Analyze each domain
    for (const domain of domains) {
        try {
            const result = await analyzeDomainPatterns(userId, domain, options, tier);
            if (result.patterns.length > 0 || result.insights.length > 0) {
                results[domain] = result;
            }
        }
        catch (error) {
            console.error(`[Memory Analyzer] Error analyzing ${domain}:`, error);
        }
    }
    // Update last analyzed timestamp
    await userMemoryService.updateLastAnalyzedAt(userId);
    return results;
}
/**
 * Extract cross-domain insights
 */
export async function extractCrossDomainInsights(userId, tier = 'balanced') {
    try {
        const memory = await userMemoryService.getMemory(userId, {
            includePatterns: true,
            includeInsights: true,
        });
        // Build prompt for cross-domain analysis
        let prompt = `Analyze user behavior patterns across ALL domains for user ${userId}.\n\n`;
        Object.entries(memory).forEach(([domain, domainMemory]) => {
            if (domainMemory && domainMemory.patterns.length > 0) {
                prompt += `${domain.toUpperCase()} Domain:\n`;
                domainMemory.patterns.forEach((pattern) => {
                    prompt += `- ${pattern.type}: ${pattern.description}\n`;
                });
                prompt += '\n';
            }
        });
        prompt += `\nIdentify cross-domain insights and connections. Return JSON:
{
  "insights": [
    {
      "category": "CROSS_DOMAIN_INSIGHT",
      "insight": "Description of cross-domain pattern",
      "basedOn": "Which domains/patterns this connects",
      "confidence": 0.0-1.0,
      "relevance": 0.0-1.0
    }
  ]
}`;
        // Get AI model
        const modelConfig = await getModelByTier(tier);
        const apiKey = process.env.OPENROUTER_API_KEY || '';
        const model = createModel(modelConfig, apiKey);
        // Generate analysis
        const { text } = await generateText({
            model,
            prompt: `${ANALYSIS_SYSTEM_PROMPT}\n\n${prompt}`,
            temperature: 0.3,
        });
        // Parse response
        let analysisResult = {};
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0]);
            }
        }
        catch (error) {
            console.error('[Memory Analyzer] Failed to parse cross-domain response:', error);
            return [];
        }
        // Process insights
        const insights = [];
        if (analysisResult.insights) {
            for (const insightData of analysisResult.insights) {
                if (insightData.category && insightData.insight) {
                    const insight = {
                        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        category: insightData.category,
                        insight: insightData.insight,
                        basedOn: insightData.basedOn || 'Cross-domain analysis',
                        confidence: insightData.confidence ?? 0.5,
                        relevance: insightData.relevance ?? 0.5,
                        generatedAt: new Date().toISOString(),
                    };
                    insights.push(insight);
                }
            }
        }
        // Save to general domain
        if (insights.length > 0) {
            await userMemoryService.updateMemory(userId, {
                domain: 'general',
                updates: {
                    insights,
                },
            });
        }
        return insights;
    }
    catch (error) {
        console.error('[Memory Analyzer] Error extracting cross-domain insights:', error);
        return [];
    }
}
