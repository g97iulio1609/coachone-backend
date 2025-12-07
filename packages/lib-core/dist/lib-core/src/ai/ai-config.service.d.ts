export interface AgentConfig {
    id: string;
    feature: string;
    isEnabled: boolean;
    config: unknown;
    description: string | null;
    updatedAt: Date;
    updatedBy: string | null;
}
export declare class AIConfigService {
    /**
     * Get configuration for a specific agent
     */
    static getAgentConfig(agentId: string): Promise<AgentConfig | null>;
    /**
     * Check if an agent is enabled.
     * If the config doesn't exist, it defaults to FALSE (safe by default) unless auto-created.
     */
    static isAgentEnabled(agentId: string): Promise<boolean>;
    /**
     * Ensure an agent config exists. If not, create it with default values.
     */
    static ensureAgentConfig(agentId: string, description: string, defaultEnabled?: boolean): Promise<AgentConfig>;
    /**
     * Toggle an agent's enabled status
     */
    static toggleAgent(agentId: string, enabled: boolean, userId?: string): Promise<AgentConfig>;
    /**
     * List all agent configurations
     */
    static listAgentConfigs(): Promise<AgentConfig[]>;
}
