import { prisma } from '../prisma';
export class AIConfigService {
    /**
     * Get configuration for a specific agent
     */
    static async getAgentConfig(agentId) {
        const config = await prisma.ai_framework_configs.findUnique({
            where: { feature: agentId },
        });
        if (!config)
            return null;
        return {
            id: config.id,
            feature: config.feature,
            isEnabled: config.isEnabled,
            config: config.config,
            description: config.description,
            updatedAt: config.updatedAt,
            updatedBy: config.updatedBy,
        };
    }
    /**
     * Check if an agent is enabled.
     * If the config doesn't exist, it defaults to FALSE (safe by default) unless auto-created.
     */
    static async isAgentEnabled(agentId) {
        const config = await this.getAgentConfig(agentId);
        return config?.isEnabled ?? false;
    }
    /**
     * Ensure an agent config exists. If not, create it with default values.
     */
    static async ensureAgentConfig(agentId, description, defaultEnabled = false) {
        const existing = await this.getAgentConfig(agentId);
        if (existing)
            return existing;
        const created = await prisma.ai_framework_configs.create({
            data: {
                feature: agentId,
                description,
                isEnabled: defaultEnabled,
            },
        });
        return {
            id: created.id,
            feature: created.feature,
            isEnabled: created.isEnabled,
            config: created.config,
            description: created.description,
            updatedAt: created.updatedAt,
            updatedBy: created.updatedBy,
        };
    }
    /**
     * Toggle an agent's enabled status
     */
    static async toggleAgent(agentId, enabled, userId) {
        // Upsert to ensure it exists if we try to toggle it
        const config = await prisma.ai_framework_configs.upsert({
            where: { feature: agentId },
            update: {
                isEnabled: enabled,
                updatedBy: userId,
            },
            create: {
                feature: agentId,
                isEnabled: enabled,
                updatedBy: userId,
                description: `Agent ${agentId}`, // Default description if creating on toggle
            },
        });
        // Log history
        await prisma.ai_framework_config_history.create({
            data: {
                feature: agentId,
                isEnabled: enabled,
                changedBy: userId || 'system',
                changeReason: 'Admin toggle',
            },
        });
        return {
            id: config.id,
            feature: config.feature,
            isEnabled: config.isEnabled,
            config: config.config,
            description: config.description,
            updatedAt: config.updatedAt,
            updatedBy: config.updatedBy,
        };
    }
    /**
     * List all agent configurations
     */
    static async listAgentConfigs() {
        const configs = await prisma.ai_framework_configs.findMany({
            orderBy: { feature: 'asc' },
        });
        return configs.map((c) => ({
            id: c.id,
            feature: c.feature,
            isEnabled: c.isEnabled,
            config: c.config,
            description: c.description,
            updatedAt: c.updatedAt,
            updatedBy: c.updatedBy,
        }));
    }
}
