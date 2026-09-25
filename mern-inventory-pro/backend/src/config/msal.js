const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || 'mock-azure-client-id',
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || 'common'}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET || 'mock-azure-client-secret',
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message) {
        // MSAL logging callback
      },
      piiLoggingEnabled: false,
      logLevel: 3,
    }
  }
};

module.exports = { msalConfig };
