import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { referralApi } from '../api';
import type { ReferralStats, ReferralCodeResponse, ReferredUser } from '../api/referral';
import { colors, typography, spacing } from '../theme';
import logger from '../utils/logger';

export function InviteFriendsScreen() {
  const navigation = useNavigation();

  const [referralCode, setReferralCode] = useState<ReferralCodeResponse | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const [codeData, statsData, usersData] = await Promise.all([
        referralApi.getReferralCode(),
        referralApi.getReferralStats(),
        referralApi.getReferredUsers(50),
      ]);

      setReferralCode(codeData);
      setStats(statsData);
      setReferredUsers(usersData.referredUsers);

      logger.logUserAction('view_invite_friends', {
        totalReferrals: statsData.totalReferrals,
      });
    } catch (error: any) {
      logger.error('Failed to load referral data', error);
      Alert.alert('Error', error.message || 'Failed to load referral data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadReferralData();
  };

  const handleCopyCode = async () => {
    if (!referralCode) return;

    try {
      await Clipboard.setStringAsync(referralCode.referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
      logger.logUserAction('copy_referral_code', {
        code: referralCode.referralCode,
      });
    } catch (error) {
      logger.error('Failed to copy referral code', error);
      Alert.alert('Error', 'Failed to copy referral code');
    }
  };

  const handleShareInvite = async () => {
    if (!referralCode) return;

    try {
      const message = `Join me on BeSure! Use my referral code "${referralCode.referralCode}" when you sign up.\n\n${referralCode.shareUrl}`;

      await Share.share({
        message,
        title: 'Join BeSure',
      });

      logger.logUserAction('share_referral', {
        code: referralCode.referralCode,
      });
    } catch (error: any) {
      logger.error('Failed to share referral', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Invite Friends</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Intro Card */}
        <Card style={styles.introCard}>
          <Text style={styles.introEmoji}>🎁</Text>
          <Text style={styles.introTitle}>Earn +10 Points Per Referral!</Text>
          <Text style={styles.introText}>
            Invite your friends to BeSure and earn 10 points when they create their first
            question. The more friends you invite, the more points you earn!
          </Text>
        </Card>

        {/* Referral Code Card */}
        <Card style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <TouchableOpacity
            style={styles.codeContainer}
            onPress={handleCopyCode}
            activeOpacity={0.7}
          >
            <Text style={styles.codeText}>{referralCode?.referralCode}</Text>
            <Ionicons name="copy-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.codeHint}>Tap to copy</Text>

          <Button
            title="Share Invite Link"
            onPress={handleShareInvite}
            style={styles.shareButton}
          />
        </Card>

        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={28} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.totalReferrals}</Text>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={28} color={colors.success} />
              </View>
              <Text style={styles.statValue}>{stats.successfulReferrals}</Text>
              <Text style={styles.statLabel}>Successful</Text>
            </Card>
          </View>
        )}

        {stats && (
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={28} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>{stats.pendingReferrals}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="star" size={28} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>{stats.totalPointsEarned}</Text>
              <Text style={styles.statLabel}>Points Earned</Text>
            </Card>
          </View>
        )}

        {/* Referred Users List */}
        {referredUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friends You Invited</Text>
            {referredUsers.map((user, index) => (
              <Card key={index} style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>@{user.username}</Text>
                  <Text style={styles.userJoinedDate}>
                    Joined {new Date(user.joinedAt).toLocaleDateString()}
                  </Text>
                </View>
                {user.pointsAwarded ? (
                  <View style={styles.rewardedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    <Text style={styles.rewardedText}>+10</Text>
                  </View>
                ) : (
                  <View style={styles.pendingBadge}>
                    <Ionicons name="time-outline" size={20} color={colors.warning} />
                    <Text style={styles.pendingText}>Pending</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* Empty State */}
        {referredUsers.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>No Referrals Yet</Text>
            <Text style={styles.emptyText}>
              Start inviting friends to earn points! Share your referral code with friends and
              family to get started.
            </Text>
          </Card>
        )}

        {/* How It Works */}
        <Card style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How It Works</Text>
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Share your referral code or invite link with friends
            </Text>
          </View>
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Your friend signs up using your referral code
            </Text>
          </View>
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              When they create their first question, you earn 10 points!
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  introCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  introEmoji: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  introText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  codeLabel: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  codeText: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  shareButton: {
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  statIconContainer: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userAvatarText: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userJoinedDate: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  rewardedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  rewardedText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.warning,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    marginBottom: spacing.lg,
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
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  howItWorksCard: {
    marginBottom: spacing.lg,
  },
  howItWorksTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    lineHeight: 22,
    paddingTop: 2,
  },
});

export default InviteFriendsScreen;
