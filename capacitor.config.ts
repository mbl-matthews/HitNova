import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.mrmatthews.nova',
  appName: 'hitster-nova',
  webDir: 'dist',
  server: {
    hostname: "localhost",
    cleartext: true,
  }
};

export default config;
