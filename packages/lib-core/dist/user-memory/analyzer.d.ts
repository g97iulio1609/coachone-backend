/**
 * User Memory AI Analyzer
 *
 * Uses AI agents to analyze user memory patterns and extract insights.
 * Called periodically or on-demand to identify patterns and generate recommendations.
 */
import type { ModelTier } from '@OneCoach/lib-ai-agents/core/providers/types';
import type { MemoryDomain, MemoryPattern, MemoryInsight, AnalyzeMemoryOptions } from './types';
/**
 * Analyze patterns for a specific domain
 */
export declare function analyzeDomainPatterns(userId: string, domain: MemoryDomain, options?: AnalyzeMemoryOptions, tier?: ModelTier): Promise<{
    patterns: MemoryPattern[];
    insights: MemoryInsight[];
}>;
/**
 * Analyze patterns across all domains
 */
export declare function analyzeAllDomains(userId: string, options?: AnalyzeMemoryOptions, tier?: ModelTier): Promise<{
    [domain in MemoryDomain]?: {
        patterns: MemoryPattern[];
        insights: MemoryInsight[];
    };
}>;
/**
 * Extract cross-domain insights
 */
export declare function extractCrossDomainInsights(userId: string, tier?: ModelTier): Promise<MemoryInsight[]>;
