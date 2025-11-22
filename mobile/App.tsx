import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components';
import logger from './src/utils/logger';

// Initialize Sentry
const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn;

if (SENTRY_DSN && !__DEV__) {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: false,
    tracesSampleRate: 1.0, // Adjust in production
    environment: __DEV__ ? 'development' : 'production',
  });
  logger.info('Sentry initialized');
}

function App() {
  useEffect(() => {
    logger.info('BeSure app started');
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style="auto" />
      <AppNavigator />
    </ErrorBoundary>
  );
}

// Wrap with Sentry for additional error tracking
export default __DEV__ ? App : Sentry.wrap(App);
