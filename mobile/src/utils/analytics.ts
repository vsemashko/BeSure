import PostHog from 'posthog-react-native';
import * as Application from 'expo-application';
import * as Localization from 'expo-localization';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import logger from './logger';

/**
 * PostHog Analytics Provider for React Native
 * Tracks user behavior and product metrics
 */
class AnalyticsProvider {
  private client: PostHog | null = null;
  private enabled: boolean = false;
  private currentUserId: string | null = null;

  /**
   * Initialize PostHog
   */
  async initialize(): Promise<void> {
    const apiKey = Constants.expoConfig?.extra?.posthogApiKey as string | undefined;
    const host = (Constants.expoConfig?.extra?.posthogHost as string | undefined) || 'https://app.posthog.com';

    if (!apiKey) {
      logger.info('ℹ️  PostHog API key not configured - analytics disabled');
      return;
    }

    try {
      // Use direct constructor instead of initAsync for better type support
      this.client = new PostHog(apiKey, {
        host,
      });

      this.enabled = true;
      logger.info(`✓ PostHog analytics initialized (${host})`);

      // Set super properties (sent with every event)
      const locales = Localization.getLocales();
      const calendars = Localization.getCalendars();

      this.client.register({
        app_version: Application.nativeApplicationVersion || 'unknown',
        app_build: Application.nativeBuildVersion || 'unknown',
        platform: Platform.OS,
        platform_version: String(Platform.Version),
        locale: locales[0]?.languageTag || 'unknown',
        timezone: calendars[0]?.timeZone || 'unknown',
      });
    } catch (error) {
      logger.error('Failed to initialize PostHog:', error);
    }
  }

  /**
   * Track an event
   */
  track(event: string, properties?: Record<string, string | number | boolean | null>): void {
    if (!this.enabled || !this.client) return;

    try {
      this.client.capture(event, properties);
      logger.debug(`[Analytics] ${event}`, properties);
    } catch (error) {
      logger.error('PostHog track error:', error);
    }
  }

  /**
   * Identify a user
   */
  identify(userId: string, properties?: Record<string, string | number | boolean | null>): void {
    if (!this.enabled || !this.client) return;

    try {
      this.client.identify(userId, properties);
      this.currentUserId = userId;
      logger.debug(`[Analytics] User identified: ${userId}`);
    } catch (error) {
      logger.error('PostHog identify error:', error);
    }
  }

  /**
   * Track screen view
   */
  screen(screenName: string, properties?: Record<string, string | number | boolean | null>): void {
    this.track('$screen', {
      $screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Reset user (on logout)
   */
  reset(): void {
    if (!this.enabled || !this.client) return;

    try {
      this.client.reset();
      this.currentUserId = null;
      logger.debug('[Analytics] User reset');
    } catch (error) {
      logger.error('PostHog reset error:', error);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, string | number | boolean | null>): void {
    if (!this.enabled || !this.client || !this.currentUserId) return;

    try {
      this.client.identify(this.currentUserId, properties);
    } catch (error) {
      logger.error('PostHog setUserProperties error:', error);
    }
  }

  /**
   * Get feature flag value
   */
  async getFeatureFlag(key: string): Promise<boolean | string | undefined> {
    if (!this.enabled || !this.client) return undefined;

    try {
      const result = await this.client.getFeatureFlag(key);
      return result ?? undefined;
    } catch (error) {
      logger.error('PostHog getFeatureFlag error:', error);
      return undefined;
    }
  }

  /**
   * Check if feature flag is enabled
   */
  async isFeatureEnabled(key: string): Promise<boolean> {
    if (!this.enabled || !this.client) return false;

    try {
      const result = await this.client.isFeatureEnabled(key);
      return result ?? false;
    } catch (error) {
      logger.error('PostHog isFeatureEnabled error:', error);
      return false;
    }
  }

  // Convenience methods for common events

  trackSignup(method: string, properties?: Record<string, string | number | boolean | null>): void {
    this.track('user_signed_up', {
      method,
      ...properties,
    });
  }

  trackLogin(method: string): void {
    this.track('user_logged_in', {
      method,
    });
  }

  trackLogout(): void {
    this.track('user_logged_out');
    this.reset();
  }

  trackQuestionCreated(questionId: string, properties: {
    optionCount: number;
    privacyLevel: string;
    isAnonymous: boolean;
    isUrgent: boolean;
    hasImages: boolean;
  }): void {
    this.track('question_created', {
      question_id: questionId,
      option_count: properties.optionCount,
      privacy_level: properties.privacyLevel,
      is_anonymous: properties.isAnonymous,
      is_urgent: properties.isUrgent,
      has_images: properties.hasImages,
    });
  }

  trackVote(questionId: string, optionId: string): void {
    this.track('vote_cast', {
      question_id: questionId,
      option_id: optionId,
    });
  }

  trackQuestionViewed(questionId: string): void {
    this.track('question_viewed', {
      question_id: questionId,
    });
  }

  trackProfileViewed(userId: string): void {
    this.track('profile_viewed', {
      viewed_user_id: userId,
    });
  }

  trackShare(type: string, itemId: string): void {
    this.track('content_shared', {
      type,
      item_id: itemId,
    });
  }

  trackSearch(query: string, results: number): void {
    this.track('search_performed', {
      query,
      results_count: results,
    });
  }

  trackError(error: string, context?: Record<string, string | number | boolean | null>): void {
    this.track('error_occurred', {
      error_message: error,
      ...context,
    });
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const analytics = new AnalyticsProvider();
export default analytics;
