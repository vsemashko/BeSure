import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuthStore } from '../store/authStore';
import { questionApi, streakApi, challengeApi, topicApi } from '../api';
import { colors, typography, spacing } from '../theme';
import logger from '../utils/logger';
import type { Question } from '../types';
import type { StreakInfo } from '../api/streaks';
import type { DailyChallenges, Challenge } from '../api/challenges';
import type { UserTopicProfile } from '../api/topics';

export function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [challenges, setChallenges] = useState<DailyChallenges | null>(null);
  const [topicExpertise, setTopicExpertise] = useState<UserTopicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadMyQuestions(),
        loadStreak(),
        loadChallenges(),
        loadTopicExpertise(),
      ]);
    } catch (error) {
      logger.error('Failed to load profile data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyQuestions = async () => {
    try {
      const result = await questionApi.getMyQuestions({ limit: 10 });
      setMyQuestions(result.questions);
    } catch (error) {
      logger.error('Failed to load questions', error);
    }
  };

  const loadStreak = async () => {
    try {
      const info = await streakApi.getMyStreak();
      setStreakInfo(info);
    } catch (error) {
      logger.error('Failed to load streak', error);
    }
  };

  const loadChallenges = async () => {
    try {
      const todayChallenges = await challengeApi.getTodayChallenges();
      setChallenges(todayChallenges);
    } catch (error) {
      logger.error('Failed to load challenges', error);
    }
  };

  const loadTopicExpertise = async () => {
    try {
      const profile = await topicApi.getMyExpertise();
      setTopicExpertise(profile);
    } catch (error) {
      logger.error('Failed to load topic expertise', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile' as never)}
              style={styles.headerButton}
            >
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={20} color={colors.white} />
            <Text style={styles.pointsText}>{user?.points || 0} Points</Text>
          </View>
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatsCard
            icon="create-outline"
            label="Questions"
            value={myQuestions.length}
            color={colors.primary}
          />
          <StatsCard
            icon="people-outline"
            label="Followers"
            value="0"
            color={colors.success}
            onPress={() => navigation.navigate('Followers' as never, { userId: user?.id, username: user?.username } as never)}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            icon="person-add-outline"
            label="Following"
            value="0"
            color={colors.warning}
            onPress={() => navigation.navigate('Following' as never, { userId: user?.id, username: user?.username } as never)}
          />
          <StatsCard
            icon="checkmark-done-outline"
            label="Votes Given"
            value="-"
            color={colors.mediumGray}
          />
        </View>

        {/* Invite Friends Card */}
        <Card style={styles.inviteCard}>
          <View style={styles.inviteContent}>
            <View style={styles.inviteIcon}>
              <Text style={styles.inviteEmoji}>🎁</Text>
            </View>
            <View style={styles.inviteTextContainer}>
              <Text style={styles.inviteTitle}>Invite Friends & Earn Points!</Text>
              <Text style={styles.inviteDescription}>
                Get 10 points for every friend who joins
              </Text>
            </View>
          </View>
          <Button
            title="Invite Friends"
            onPress={() => navigation.navigate('InviteFriends' as never)}
            variant="primary"
            style={styles.inviteButton}
          />
        </Card>

        {/* Streak Card */}
        {streakInfo && (
          <Card style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <View style={styles.streakTitle}>
                <Text style={styles.streakFireEmoji}>🔥</Text>
                <Text style={styles.streakText}>Daily Streak</Text>
              </View>
              <View style={styles.streakMultiplier}>
                <Text style={styles.multiplierText}>{streakInfo.multiplier}x</Text>
              </View>
            </View>

            <View style={styles.streakStats}>
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{streakInfo.currentStreak}</Text>
                <Text style={styles.streakStatLabel}>Current Streak</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{streakInfo.longestStreak}</Text>
                <Text style={styles.streakStatLabel}>Longest Streak</Text>
              </View>
            </View>

            <Text style={styles.streakInfo}>
              Vote daily to increase your multiplier! Keep your streak going to earn up to 2.5x bonus points.
            </Text>
          </Card>
        )}

        {/* Daily Challenges */}
        {challenges && challenges.challenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Challenges</Text>
            {challenges.challenges.map((challenge: Challenge) => (
              <Card key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeTitleContainer}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  </View>
                  <View style={[styles.challengeReward, challenge.completed && styles.challengeCompleted]}>
                    <Ionicons
                      name={challenge.completed ? "checkmark-circle" : "star"}
                      size={16}
                      color={challenge.completed ? colors.success : colors.warning}
                    />
                    <Text style={[styles.challengeRewardText, challenge.completed && styles.challengeCompletedText]}>
                      +{challenge.reward}
                    </Text>
                  </View>
                </View>

                <View style={styles.challengeProgress}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {challenge.progress} / {challenge.target}
                  </Text>
                </View>
              </Card>
            ))}

            {challenges.completedCount > 0 && (
              <View style={styles.challengesSummary}>
                <Text style={styles.challengesSummaryText}>
                  {challenges.completedCount} / {challenges.challenges.length} completed •
                  +{challenges.totalReward} points earned today 🎉
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Topic Expertise */}
        {topicExpertise && topicExpertise.topExpertise.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Expertise</Text>
            <Card style={styles.expertiseCard}>
              {topicExpertise.topExpertise.map((expertise, index) => (
                <View key={expertise.topicId} style={styles.expertiseRow}>
                  <View style={styles.expertiseLeft}>
                    <Text style={styles.expertiseEmoji}>
                      {getTopicEmoji(expertise.topicName)}
                    </Text>
                    <View style={styles.expertiseInfo}>
                      <Text style={styles.expertiseTopic}>{expertise.topicName}</Text>
                      <Text style={styles.expertiseLevel}>{expertise.expertiseLevel}</Text>
                    </View>
                  </View>
                  <View style={styles.expertiseRight}>
                    <Text style={styles.expertiseVotes}>{expertise.voteCount}</Text>
                    <Text style={styles.expertiseVotesLabel}>votes</Text>
                  </View>
                </View>
              ))}
            </Card>
            <Text style={styles.expertiseHint}>
              Keep voting on topics to level up your expertise! Earn badges as you progress.
            </Text>
          </View>
        )}

        {/* My Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Questions</Text>

          {isLoading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : myQuestions.length > 0 ? (
            myQuestions.map((question) => (
              <Card key={question.id} style={styles.questionCard}>
                <Text style={styles.questionTitle} numberOfLines={2}>
                  {question.title}
                </Text>
                <View style={styles.questionFooter}>
                  <View style={styles.questionStat}>
                    <Ionicons name="people-outline" size={16} color={colors.mediumGray} />
                    <Text style={styles.questionStatText}>
                      {question.totalVotes} votes
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, styles[`status${question.status}`]]}>
                    <Text style={styles.statusText}>{question.status}</Text>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>No questions yet</Text>
              <Text style={styles.emptyText}>
                Create your first question to get help making decisions!
              </Text>
            </Card>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Notification Settings"
            onPress={() => navigation.navigate('NotificationPreferences' as never)}
            variant="secondary"
          />
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTopicEmoji(topicName: string): string {
  const emojiMap: Record<string, string> = {
    fashion: '👗',
    food: '🍕',
    travel: '✈️',
    tech: '💻',
    career: '💼',
    relationships: '💕',
    entertainment: '🎬',
    health: '💪',
    finance: '💰',
  };
  return emojiMap[topicName.toLowerCase()] || '📌';
}

function StatsCard({
  icon,
  label,
  value,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.statsCardTouchable}>
        <Card style={styles.statsCard}>{content}</Card>
      </TouchableOpacity>
    );
  }

  return <Card style={styles.statsCard}>{content}</Card>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  headerButton: {
    padding: spacing.xs,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  username: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statsCardTouchable: {
    flex: 1,
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statsValue: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statsLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  questionCard: {
    marginBottom: spacing.md,
  },
  questionTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questionStatText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mediumGray,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusactive: {
    backgroundColor: colors.success + '20',
  },
  statusclosed: {
    backgroundColor: colors.mediumGray + '20',
  },
  statusdeleted: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    marginTop: spacing.lg,
  },
  // Streak styles
  streakCard: {
    marginBottom: spacing.lg,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  streakTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakFireEmoji: {
    fontSize: 24,
  },
  streakText: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  streakMultiplier: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  multiplierText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
  },
  streakStat: {
    alignItems: 'center',
    flex: 1,
  },
  streakStatValue: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  streakStatLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  streakDivider: {
    width: 1,
    backgroundColor: colors.mediumGray,
  },
  streakInfo: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Challenge styles
  challengeCard: {
    marginBottom: spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  challengeTitleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  challengeTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.warning + '15',
    borderRadius: 12,
    height: 28,
  },
  challengeCompleted: {
    backgroundColor: colors.success + '15',
  },
  challengeRewardText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
  },
  challengeCompletedText: {
    color: colors.success,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
  challengesSummary: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.success + '10',
    borderRadius: 12,
  },
  challengesSummaryText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.success,
    textAlign: 'center',
  },
  // Topic expertise styles
  expertiseCard: {
    padding: 0,
  },
  expertiseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  expertiseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  expertiseEmoji: {
    fontSize: 28,
  },
  expertiseInfo: {
    flex: 1,
  },
  expertiseTopic: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  expertiseLevel: {
    fontSize: typography.fontSize.caption,
    color: colors.primary,
    textTransform: 'capitalize',
    fontWeight: typography.fontWeight.semiBold,
  },
  expertiseRight: {
    alignItems: 'flex-end',
  },
  expertiseVotes: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  expertiseVotesLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  expertiseHint: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Invite friends card styles
  inviteCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  inviteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  inviteIcon: {
    marginRight: spacing.md,
  },
  inviteEmoji: {
    fontSize: 40,
  },
  inviteTextContainer: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inviteDescription: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  inviteButton: {
    width: '100%',
  },
});

export default ProfileScreen;
