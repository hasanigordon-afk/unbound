import { configured, missingConfig } from './connectorUtils';

const requiredEnvVars = ['CAREERONESTOP_USER_ID', 'CAREERONESTOP_API_KEY'];

export function getCareerOneStopStatus() {
  return import.meta.env.CAREERONESTOP_USER_ID && import.meta.env.CAREERONESTOP_API_KEY
    ? configured('careerOneStopConnector')
    : missingConfig('careerOneStopConnector', requiredEnvVars);
}

export async function syncCareerOneStopResources() {
  const status = getCareerOneStopStatus();
  if (!status.configured) return status;
  return {
    ...status,
    status: 'not_configured',
    message: 'CareerOneStop connector is credential-aware; endpoint-specific workforce mappings still need to be enabled by an admin.',
  };
}
