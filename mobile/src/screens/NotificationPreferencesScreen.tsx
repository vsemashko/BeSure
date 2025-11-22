import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Card } from '../components/Card';
import logger from '../utils/logger';

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
}

export function NotificationPreferencesScreen() {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'enabled',
      title: 'Push Notifications',
      description: 'Enable or disable all push notifications',
      icon: 'notifications',
      enabled: true,
    },
    {
      id: 'socialUpdates',
      title: 'Social Updates',
      description: 'New followers and friend activity',
      icon: 'people',
      enabled: true,
    },
    {
      id: 'questionUpdates',
      title: 'Question Updates',
      description: 'When your questions are answered',
      icon: 'checkmark-circle',
      enabled: true,
    },
    {
      id: 'newVotes',
      title: 'New Votes',
      description: 'When someone votes on your questions',
      icon: 'thumbs-up',
      enabled: true,
    },
    {
      id: 'expertiseLevelUp',
      title: 'Expertise Level Up',
      description: 'When you reach a new expertise level',
      icon: 'trophy',
      enabled: true,
    },
    {
      id: 'streakReminders',
      title: 'Streak Reminders',
      description: 'Daily reminders to maintain your streak',
      icon: 'flame',
      enabled: true,
    },
    {
      id: 'challengeReminders',
      title: 'Challenge Reminders',
      description: 'Reminders about active challenges',
      icon: 'rocket',
      enabled: true,
    },
    {
      id: 'questionExpiring',
      title: 'Question Expiring',
      description: 'When your questions are about to expire',
      icon: 'time',
      enabled: true,
    },
  ]);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);

      // TODO: Implement API call to fetch preferences
      // const response = await notificationApi.getPreferences();
      // setPreferences(response);

      logger.logUserAction('view_notification_preferences');
    } catch (error) {
      logger.error('Failed to load notification preferences', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string, value: boolean) => {
    try {
      // Optimistic update
      setPreferences((prev) =>
        prev.map((pref) => (pref.id === id ? { ...pref, enabled: value } : pref))
      );

      setIsSaving(true);

      // TODO: Implement API call to save preferences
      // await notificationApi.updatePreferences({ [id]: value });

      logger.logUserAction('update_notification_preference', {
        preference: id,
        enabled: value,
      });
    } catch (error) {
      logger.error('Failed to update notification preference', error);

      // Revert on error
      setPreferences((prev) =>
        prev.map((pref) => (pref.id === id ? { ...pref, enabled: !value } : pref))
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreference = (pref: NotificationPreference) => {
    const isDisabled = pref.id !== 'enabled' && !preferences[0].enabled;

    return (
      <View key={pref.id} style={styles.preferenceItem}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={pref.icon}
            size={24}
            color={isDisabled ? colors.mediumGray : colors.primary}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[styles.preferenceTitle, isDisabled && styles.disabledText]}
          >
            {pref.title}
          </Text>
          <Text
            style={[
              styles.preferenceDescription,
              isDisabled && styles.disabledText,
            ]}
          >
            {pref.description}
          </Text>
        </View>

        <Switch
          value={pref.enabled}
          onValueChange={(value) => handleToggle(pref.id, value)}
          trackColor={{
            false: colors.lightGray,
            true: colors.primary + '80',
          }}
          thumbColor={pref.enabled ? colors.primary : colors.white}
          disabled={isDisabled}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notification Settings</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
        <View style={styles.placeholder}>
          {isSaving && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <View style={styles.infoSection}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.info}
            />
            <Text style={styles.infoText}>
              Control which notifications you receive. Turning off push
              notifications will disable all other options.
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          {preferences.map((pref) => renderPreference(pref))}
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Changes are saved automatically
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: spacing.lg,
    padding: 0,
  },
  infoSection: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.info + '10',
    borderRadius: 8,
    margin: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.bodySmall,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  preferenceDescription: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  disabledText: {
    color: colors.mediumGray,
  },
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default NotificationPreferencesScreen;
