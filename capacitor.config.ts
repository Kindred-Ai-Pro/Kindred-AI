import type { CapacitorConfig } from '@capacitor/cli';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadEnvLocal() {
  try {
    const envPath = join(__dirname, '.env.local');
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local is optional
  }
}

loadEnvLocal();

const useDevServer = process.env.CAPACITOR_USE_DEV_SERVER !== 'false';
const devServerUrl = process.env.CAPACITOR_SERVER_URL;
const productionUrl = process.env.CAPACITOR_PRODUCTION_URL;
const remoteUrl = useDevServer ? devServerUrl : productionUrl;

const config: CapacitorConfig = {
  appId: 'com.kindred.ai-journal.app',
  appName: 'Kindred AI',
  webDir: 'www',
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
  ...(remoteUrl
    ? {
        server: {
          url: remoteUrl,
          cleartext: remoteUrl.startsWith('http://'),
          allowNavigation: ['*'],
        },
      }
    : {}),
};

export default config;
