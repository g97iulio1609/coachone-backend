/**
 * Feature flags lightweight resolver.
 * Usa variabili d'ambiente: se esiste ed è truthy ('true'|'1'), ritorna true.
 */
export async function decide(flag: string): Promise<boolean> {
  const envName = flag;
  const raw = process.env[envName];
  if (raw === undefined) return false;
  return raw === 'true' || raw === '1';
}

export const getAllFlags = async () => {
  return {};
};
