import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import prisma from '../config/database';
import logger from '../utils/logger';

// Create Expo SDK client
const expo = new Expo();

interface PushNotificationData {
  userId: string;
  title: string;
  body: string;
  data?: any;
}

interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  streakReminders: boolean;
  challengeReminders: boolean;
  questionExpiring: boolean;
  newVotes: boolean;
  expertiseLevelUp: boolean;
}

class NotificationService {
  /**
   * Save or update user's push token
   */
  async savePushToken(userId: string, token: string, platform: string): Promise<void> {
    // Validate token
    if (!Expo.isExpoPushToken(token)) {
      throw new Error(`Push token ${token} is not a valid Expo push token`);
    }

    // Store in user's profile data
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileData: {
          pushToken: token,
          pushPlatform: platform,
          pushTokenUpdatedAt: new Date(),
        } as any,
      },
    });

    logger.info(`Saved push token for user ${userId}`);
  }

  /**
   * Remove user's push token
   */
  async removePushToken(userId: string, _token: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileData: {
          pushToken: null,
        } as any,
      },
    });

    logger.info(`Removed push token for user ${userId}`);
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const prefs = (user?.preferences as any) || {};

    return {
      userId,
      enabled: prefs.notificationsEnabled !== false,
      streakReminders: prefs.streakReminders !== false,
      challengeReminders: prefs.challengeReminders !== false,
      questionExpiring: prefs.questionExpiring !== false,
      newVotes: prefs.newVotes !== false,
      expertiseLevelUp: prefs.expertiseLevelUp !== false,
    };
  }

  /**
   * Update user's notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const currentPrefs = (user?.preferences as any) || {};

    await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: {
          ...currentPrefs,
          notificationsEnabled: preferences.enabled ?? currentPrefs.notificationsEnabled,
          streakReminders: preferences.streakReminders ?? currentPrefs.streakReminders,
          challengeReminders: preferences.challengeReminders ?? currentPrefs.challengeReminders,
          questionExpiring: preferences.questionExpiring ?? currentPrefs.questionExpiring,
          newVotes: preferences.newVotes ?? currentPrefs.newVotes,
          expertiseLevelUp: preferences.expertiseLevelUp ?? currentPrefs.expertiseLevelUp,
        } as any,
      },
    });

    logger.info(`Updated notification preferences for user ${userId}`);
  }

  /**
   * Send push notification to a single user
   */
  async sendPushNotification(data: PushNotificationData): Promise<void> {
    const { userId, title, body, data: notificationData } = data;

    // Get user's push token and preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileData: true,
        preferences: true,
      },
    });

    if (!user) {
      logger.warn(`User ${userId} not found`);
      return;
    }

    const profileData = user.profileData as any;
    const preferences = user.preferences as any;

    // Check if notifications are enabled
    if (preferences?.notificationsEnabled === false) {
      logger.debug(`Notifications disabled for user ${userId}`);
      return;
    }

    const pushToken = profileData?.pushToken;
    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
      logger.debug(`No valid push token for user ${userId}`);
      return;
    }

    // Construct message
    const message: ExpoPushMessage = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: notificationData,
      priority: 'high',
    };

    try {
      const chunks = expo.chunkPushNotifications([message]);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      logger.info(`Sent push notification to user ${userId}: ${title}`);
    } catch (error) {
      logger.error(`Failed to send push notification to user ${userId}:`, error);
    }
  }

  /**
   * Send bulk push notifications
   */
  async sendBulkPushNotifications(notifications: PushNotificationData[]): Promise<void> {
    for (const notification of notifications) {
      await this.sendPushNotification(notification);
    }
  }

  /**
   * Notify user about streak at risk
   */
  async sendStreakReminderNotification(userId: string, streakDays: number): Promise<void> {
    const prefs = await this.getPreferences(userId);
    if (!prefs.streakReminders) return;

    await this.sendPushNotification({
      userId,
      title: '🔥 Don\'t lose your streak!',
      body: `You have a ${streakDays}-day streak. Vote today to keep it going!`,
      data: { type: 'streak_reminder', streakDays },
    });
  }

  /**
   * Notify user about daily challenges
   */
  async sendChallengeReminderNotification(userId: string): Promise<void> {
    const prefs = await this.getPreferences(userId);
    if (!prefs.challengeReminders) return;

    await this.sendPushNotification({
      userId,
      title: '🎯 Daily challenges are waiting!',
      body: 'Complete today\'s challenges to earn bonus points.',
      data: { type: 'challenge_reminder' },
    });
  }

  /**
   * Notify user about question expiring soon
   */
  async sendQuestionExpiringNotification(
    userId: string,
    questionId: string,
    questionTitle: string,
    hoursLeft: number
  ): Promise<void> {
    const prefs = await this.getPreferences(userId);
    if (!prefs.questionExpiring) return;

    await this.sendPushNotification({
      userId,
      title: '⏰ Your question is expiring soon',
      body: `"${questionTitle}" expires in ${hoursLeft} hours with votes.`,
      data: { type: 'question_expiring', questionId },
    });
  }

  /**
   * Notify user about new votes on their question
   */
  async sendNewVoteNotification(
    userId: string,
    questionId: string,
    questionTitle: string,
    voteCount: number
  ): Promise<void> {
    const prefs = await this.getPreferences(userId);
    if (!prefs.newVotes) return;

    await this.sendPushNotification({
      userId,
      title: '👥 New votes on your question!',
      body: `"${questionTitle}" now has ${voteCount} votes.`,
      data: { type: 'new_vote', questionId },
    });
  }

  /**
   * Notify user about expertise level up
   */
  async sendExpertiseLevelUpNotification(
    userId: string,
    topicName: string,
    level: string
  ): Promise<void> {
    const prefs = await this.getPreferences(userId);
    if (!prefs.expertiseLevelUp) return;

    await this.sendPushNotification({
      userId,
      title: `🎓 You're now ${level} in ${topicName}!`,
      body: `Keep voting to reach the next level.`,
      data: { type: 'expertise_level_up', topicName, level },
    });
  }
}

export default new NotificationService();
