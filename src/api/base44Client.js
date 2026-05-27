import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { hasBase44AppId } from '@/lib/demoRoutes';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const demoEntity = {
  list: async () => [],
  filter: async () => [],
  create: async (payload = {}) => ({ ...payload, id: `demo-${Date.now()}` }),
  update: async (id, payload = {}) => ({ ...payload, id }),
  delete: async () => ({}),
  subscribe: () => () => {},
};

const demoBase44 = {
  auth: {
    me: async () => {
      throw new Error('Base44 app ID is not configured for local demo mode.');
    },
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: new Proxy({}, { get: () => demoEntity }),
  functions: {
    invoke: async () => ({ data: {} }),
  },
  connectors: {
    connectAppUser: async () => '',
  },
  integrations: {
    Core: {
      InvokeLLM: async () => ({ response: '' }),
    },
  },
  appLogs: {
    logUserInApp: async () => {},
  },
};

//Create a client with authentication required
export const base44 = hasBase44AppId(appId) ? createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
}) : demoBase44;
