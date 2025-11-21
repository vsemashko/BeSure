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
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuthStore } from '../store/authStore';
import { questionApi } from '../api';
import { colors, typography, spacing } from '../theme';
import type { Question } from '../types';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyQuestions();
  }, []);

  const loadMyQuestions = async () => {
    try {
      setIsLoading(true);
      const result = await questionApi.getMyQuestions({ limit: 10 });
      setMyQuestions(result.questions);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
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
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
          </TouchableOpacity>
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
            icon="checkmark-done-outline"
            label="Votes Given"
            value="-"
            color={colors.success}
          />
        </View>

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
            title="Logout"
            onPress={handleLogout}
            variant="danger"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card style={styles.statsCard}>
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </Card>
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
});

export default ProfileScreen;
