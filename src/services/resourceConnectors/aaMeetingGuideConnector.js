import { missingConfig } from './connectorUtils';

const requiredEnvVars = ['AA_MEETING_GUIDE_FEED_URL'];

export function getAaMeetingGuideStatus() {
  const feedUrl = import.meta.env.AA_MEETING_GUIDE_FEED_URL;
  return feedUrl
    ? { connectorName: 'aaMeetingGuideConnector', configured: true, status: 'configured', message: 'AA Meeting Guide feed URL is configured.' }
    : missingConfig('aaMeetingGuideConnector', requiredEnvVars);
}

export async function syncAaMeetingGuideFeed() {
  const status = getAaMeetingGuideStatus();
  if (!status.configured) return status;
  return {
    ...status,
    status: 'not_configured',
    message: 'AA Meeting Guide sync requires feed response mapping for the configured regional feed.',
  };
}
