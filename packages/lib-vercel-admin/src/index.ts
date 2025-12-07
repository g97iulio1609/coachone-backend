/**
 * @onecoach/lib-vercel-admin
 *
 * Servizi per gestione Vercel admin (credentials, env vars)
 * Implementa contratti da @onecoach/contracts
 */

export * from './vercel-admin-credentials-api.service';
export * from './vercel-env-vars-api.service';

// Named exports for convenience
export {
  createEnvVar,
  getEnvVarByKey,
  updateEnvVar,
  deleteEnvVar,
  envVarExists,
  type VercelEnvironment,
  type VercelEnvVar,
} from './vercel-env-vars-api.service';
