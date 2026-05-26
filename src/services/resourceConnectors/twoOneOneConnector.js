import { configured, missingConfig } from './connectorUtils';

const requiredEnvVars = ['TWO_ONE_ONE_API_KEY'];

export function getTwoOneOneStatus() {
  return import.meta.env.TWO_ONE_ONE_API_KEY ? configured('twoOneOneConnector') : missingConfig('twoOneOneConnector', requiredEnvVars);
}

export async function syncTwoOneOneResources() {
  const status = getTwoOneOneStatus();
  if (!status.configured) return status;
  return {
    ...status,
    status: 'not_configured',
    message: '211 sync requires authorized regional endpoint details in addition to TWO_ONE_ONE_API_KEY.',
  };
}
