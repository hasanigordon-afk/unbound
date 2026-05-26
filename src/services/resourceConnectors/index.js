import { getAaMeetingGuideStatus } from './aaMeetingGuideConnector';
import { getCareerOneStopStatus } from './careerOneStopConnector';
import { getHudStatus } from './hudConnector';
import { getNaMeetingStatus } from './naMeetingConnector';
import { getSamhsaStatus } from './samhsaConnector';
import { getTwoOneOneStatus } from './twoOneOneConnector';
import { getVaStatus } from './vaConnector';

export function getConnectorStatuses() {
  return [
    getSamhsaStatus(),
    getTwoOneOneStatus(),
    getHudStatus(),
    getVaStatus(),
    getCareerOneStopStatus(),
    getAaMeetingGuideStatus(),
    getNaMeetingStatus(),
    {
      connectorName: 'csvImportConnector',
      configured: true,
      status: 'configured',
      message: 'CSV import is available through the admin data management page.',
    },
    {
      connectorName: 'manualAdminConnector',
      configured: true,
      status: 'configured',
      message: 'Manual admin resource creation is available.',
    },
  ];
}
