import { configured, missingConfig } from './connectorUtils';

const requiredEnvVars = ['VA_API_KEY'];

export function getVaStatus() {
  return import.meta.env.VA_API_KEY ? configured('vaConnector') : missingConfig('vaConnector', requiredEnvVars);
}

export async function syncVaResources() {
  const status = getVaStatus();
  if (!status.configured) return status;
  return {
    ...status,
    status: 'not_configured',
    message: 'VA connector requires approved VA API endpoint configuration before sync can run.',
  };
}
