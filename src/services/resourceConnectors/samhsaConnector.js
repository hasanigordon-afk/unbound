import { configured, missingConfig } from './connectorUtils';

const requiredEnvVars = ['SAMHSA_API_KEY'];

export function getSamhsaStatus() {
  return import.meta.env.SAMHSA_API_KEY ? configured('samhsaConnector') : missingConfig('samhsaConnector', requiredEnvVars);
}

export async function syncSamhsaResources() {
  const status = getSamhsaStatus();
  if (!status.configured) return status;
  return {
    ...status,
    status: 'not_configured',
    message: 'SAMHSA sync is wired for credential-gated access. Add the approved endpoint URL and response mapper before running production sync.',
  };
}
