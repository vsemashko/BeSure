import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiClient } from '../api';
import { NOTIFICATION_CHANNEL_ID, NOTIFICATION_VIBRATION_PATTERN } from '../constants';
import logger from '../utils/logger';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPreferences {
  enabled: boolean;
  streakReminders: boolean;
  challengeReminders: boolean;
  questionExpiring: boolean;
  newVotes: boolean;
  expertiseLevelUp: boolean;
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Register for push notifications and get Expo push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      logger.warn('Push notifications only work on physical devices');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.warn('Failed to get push token - permission not granted');
      return null;
    }

    // Get Expo project ID from environment
    const expoProjectId = Constants.expoConfig?.extra?.expoProjectId;
    if (!expoProjectId) {
      logger.error('Expo project ID not configured in environment');
      return null;
    }

    // Get push token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: expoProjectId,
    });

    this.expoPushToken = token.data;

    // Android specific channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: NOTIFICATION_CHANNEL_ID,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: NOTIFICATION_VIBRATION_PATTERN,
        lightColor: '#4A90E2',
      });
    }

    logger.info('Push notification token registered successfully');
    return token.data;
  }

  /**
   * Send token to backend for storage
   */
  async savePushToken(token: string): Promise<void> {
    try {
      await apiClient.post('/notifications/token', {
        token,
        platform: Platform.OS,
      });
      logger.info('Push token saved successfully');
    } catch (error) {
      logger.error('Failed to save push token', error);
    }
  }

  /**
   * Remove token from backend
   */
  async removePushToken(): Promise<void> {
    if (!this.expoPushToken) return;

    try {
      await apiClient.delete('/notifications/token', {
        data: { token: this.expoPushToken },
      });
      this.expoPushToken = null;
      logger.info('Push token removed successfully');
    } catch (error) {
      logger.error('Failed to remove push token', error);
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      await apiClient.put('/notifications/preferences', preferences);
      logger.info('Notification preferences updated');
    } catch (error) {
      logger.error('Failed to update preferences', error);
    }
  }

  /**
   * Get current notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get<{ data: NotificationPreferences }>('/notifications/preferences');
      return response.data;
    } catch (error) {
      logger.error('Failed to get preferences', error);
      return {
        enabled: true,
        streakReminders: true,
        challengeReminders: true,
        questionExpiring: true,
        newVotes: true,
        expertiseLevelUp: true,
      };
    }
  }

  /**
   * Schedule local notification (doesn't require server)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null means show immediately
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response (tap) listener
   */
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}

export default new NotificationService();
