import 'dotenv/config';

export default {
  expo: {
    name: 'BeSure',
    slug: 'besure',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#4A90E2',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.besure.app',
      newArchEnabled: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#4A90E2',
      },
      package: 'com.besure.app',
      newArchEnabled: true,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    scheme: 'besure',
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
      expoProjectId: process.env.EXPO_PROJECT_ID,
      sentryDsn: process.env.SENTRY_DSN,
      posthogApiKey: process.env.POSTHOG_API_KEY,
      posthogHost: process.env.POSTHOG_HOST || 'https://app.posthog.com',
      eas: {
        projectId: process.env.EXPO_PROJECT_ID,
      },
    },
  },
};
