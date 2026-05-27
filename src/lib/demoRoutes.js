export const publicDemoPaths = [
  '/pilotdemo',
  '/facilitypilotdashboard',
  '/pilotclientintake',
  '/pilottreatmentplan',
  '/participantmessages',
  '/aftercareplanview',
  '/positiveprogresshub',
];

export const isPublicDemoPath = (pathname = '') => publicDemoPaths.includes(pathname.toLowerCase());

export const hasBase44AppId = (appId) => Boolean(appId && appId !== 'null' && appId !== 'undefined');
