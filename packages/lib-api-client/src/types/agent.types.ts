export interface AgentError {
  message: string;
  code: string;
  details?: unknown;
  recoverable?: boolean;
}

// Ruolo dell'agente (stringa libera o enum esterno)
export type AgentRole = string;
