import { missingConfig } from './connectorUtils';

const requiredEnvVars = ['NA_MEETING_FEED_URL'];

export function getNaMeetingStatus() {
  const feedUrl = import.meta.env.NA_MEETING_FEED_URL;
  return feedUrl
    ? { connectorName: 'naMeetingConnector', configured: true, status: 'configured', message: 'NA regional feed URL is configured.' }
    : missingConfig('naMeetingConnector', requiredEnvVars);
}

export async function syncNaMeetingFeed() {
  const status = getNaMeetingStatus();
  if (!status.configured) return status;
  return {
    ...status,
    status: 'not_configured',
    message: 'NA sync supports official/regional feeds or admin CSV import; no restricted source is scraped.',
  };
}
