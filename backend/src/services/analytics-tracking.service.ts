import { PostHog } from 'posthog-node';
import logger from '../utils/logger';

/**
 * PostHog Analytics Service
 * Tracks user behavior and product metrics
 */
class AnalyticsService {
  private client: PostHog | null = null;
  private enabled: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize PostHog client
   */
  private initialize(): void {
    const apiKey = process.env.POSTHOG_API_KEY;
    const host = process.env.POSTHOG_HOST || 'https://app.posthog.com';

    if (!apiKey) {
      logger.info('ℹ️  PostHog API key not configured - analytics disabled');
      return;
    }

    try {
      this.client = new PostHog(apiKey, {
        host,
        flushAt: 20, // Flush after 20 events
        flushInterval: 10000, // Flush every 10 seconds
      });

      this.enabled = true;
      logger.info(`✓ PostHog analytics initialized (${host})`);
    } catch (error) {
      logger.error('Failed to initialize PostHog:', error);
    }
  }

  /**
   * Track an event
   * @param userId - User ID
   * @param event - Event name
   * @param properties - Event properties
   */
  track(userId: string, event: string, properties?: Record<string, unknown>): void {
    if (!this.enabled || !this.client) return;

    try {
      this.client.capture({
        distinctId: userId,
        event,
        properties: {
          ...properties,
          $lib: 'posthog-node',
          $lib_version: '3.x',
        },
      });
    } catch (error) {
      logger.error('PostHog track error:', error);
    }
  }

  /**
   * Identify a user
   * @param userId - User ID
   * @param properties - User properties
   */
  identify(userId: string, properties?: Record<string, unknown>): void {
    if (!this.enabled || !this.client) return;

    try {
      this.client.identify({
        distinctId: userId,
        properties,
      });
    } catch (error) {
      logger.error('PostHog identify error:', error);
    }
  }

  /**
   * Track a page view
   * @param userId - User ID
   * @param path - Page path
   * @param properties - Additional properties
   */
  page(userId: string, path: string, properties?: Record<string, unknown>): void {
    this.track(userId, '$pageview', {
      $current_url: path,
      ...properties,
    });
  }

  /**
   * Set user properties
   * @param userId - User ID
   * @param properties - Properties to set
   */
  set(userId: string, properties: Record<string, unknown>): void {
    if (!this.enabled || !this.client) return;

    try {
      this.client.identify({
        distinctId: userId,
        properties: {
          $set: properties,
        },
      });
    } catch (error) {
      logger.error('PostHog set error:', error);
    }
  }

  /**
   * Set user properties once (won't overwrite existing)
   * @param userId - User ID
   * @param properties - Properties to set once
   */
  setOnce(userId: string, properties: Record<string, unknown>): void {
    if (!this.enabled || !this.client) return;

    try {
      this.client.identify({
        distinctId: userId,
        properties: {
          $set_once: properties,
        },
      });
    } catch (error) {
      logger.error('PostHog setOnce error:', error);
    }
  }

  /**
   * Create an alias for a user
   * @param userId - New user ID
   * @param previousId - Previous user ID (e.g., anonymous ID)
   */
  alias(userId: string, previousId: string): void {
    if (!this.enabled || !this.client) return;

    try {
      this.client.alias({
        distinctId: userId,
        alias: previousId,
      });
    } catch (error) {
      logger.error('PostHog alias error:', error);
    }
  }

  /**
   * Track user signup
   * @param userId - User ID
   * @param properties - Signup properties
   */
  trackSignup(userId: string, properties?: Record<string, unknown>): void {
    this.track(userId, 'user_signed_up', {
      ...properties,
      $set: {
        signup_date: new Date().toISOString(),
      },
    });
  }

  /**
   * Track user login
   * @param userId - User ID
   */
  trackLogin(userId: string): void {
    this.track(userId, 'user_logged_in', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track question created
   * @param userId - User ID
   * @param questionId - Question ID
   * @param properties - Question properties
   */
  trackQuestionCreated(
    userId: string,
    questionId: string,
    properties: {
      optionCount: number;
      privacyLevel: string;
      isAnonymous: boolean;
      isUrgent: boolean;
      hasImages: boolean;
      expiresIn?: number;
    }
  ): void {
    this.track(userId, 'question_created', {
      question_id: questionId,
      ...properties,
    });
  }

  /**
   * Track vote cast
   * @param userId - User ID
   * @param questionId - Question ID
   * @param properties - Vote properties
   */
  trackVote(
    userId: string,
    questionId: string,
    properties?: {
      optionId: string;
      questionOwnerId?: string;
      pointsEarned?: number;
    }
  ): void {
    this.track(userId, 'vote_cast', {
      question_id: questionId,
      ...properties,
    });
  }

  /**
   * Track points transaction
   * @param userId - User ID
   * @param type - Transaction type
   * @param amount - Point amount
   * @param balance - New balance
   */
  trackPoints(
    userId: string,
    type: 'earned' | 'spent',
    amount: number,
    balance: number
  ): void {
    this.track(userId, `points_${type}`, {
      amount,
      balance,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Flush all pending events
   * Call this before shutting down the server
   */
  async flush(): Promise<void> {
    if (!this.enabled || !this.client) return;

    try {
      await this.client.shutdown();
      logger.info('PostHog analytics flushed');
    } catch (error) {
      logger.error('PostHog flush error:', error);
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();
export default analytics;
