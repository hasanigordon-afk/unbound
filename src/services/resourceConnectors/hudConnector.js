import { configured, missingConfig } from './connectorUtils';

const requiredEnvVars = ['HUD_API_KEY'];

export function getHudStatus() {
  return import.meta.env.HUD_API_KEY ? configured('hudConnector') : missingConfig('hudConnector', requiredEnvVars);
}

export async function syncHudResources() {
  const status = getHudStatus();
  if (!status.configured) return status;
  return {
    ...status,
    status: 'not_configured',
    message: 'HUD connector is ready for approved housing endpoint configuration; no fake housing data is generated.',
  };
}
