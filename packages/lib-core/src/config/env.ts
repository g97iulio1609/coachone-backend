/**
 * Config Environment Variables - Re-export from lib-config
 *
 * Re-exporta le funzioni di configurazione da @OneCoach/lib-config
 * per mantenere la compatibilità con i package che importano da @OneCoach/lib-core/config/env
 */

export {
  getAIProviderKey,
  getOpenRouterConfig,
  getAllAIProviderKeys,
  hasAnyAIProviderKey,
} from '@OneCoach/lib-config/env';
