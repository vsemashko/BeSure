import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import analyticsApi from '../api/analytics';
import type { QuestionInsights } from '../api/analytics';
import { VoteChart, TimelineGraph, DemographicsCard } from '../components';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import logger from '../utils/logger';
import type { RootStackParamList } from '../navigation/types';

type QuestionInsightsRouteProp = RouteProp<RootStackParamList, 'QuestionInsights'>;

export const QuestionInsightsScreen: React.FC = () => {
  const route = useRoute<QuestionInsightsRouteProp>();
  const { questionId } = route.params;

  const [insights, setInsights] = useState<QuestionInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setError(null);
      const data = await analyticsApi.getQuestionInsights(questionId);
      setInsights(data);
      logger.logUserAction('view_question_insights', { questionId });
    } catch (err: any) {
      logger.error('Failed to fetch question insights', err);
      setError(err.message || 'Failed to load insights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [questionId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsights();
  };

  const handleExport = async () => {
    try {
      logger.logUserAction('export_question_insights', { questionId });
      // For now, just show a message. Full export implementation would generate CSV/PDF
      Alert.alert(
        'Export Data',
        'Export functionality will generate a CSV file with all voting data and statistics.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      logger.error('Failed to export insights', err);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!insights) return;

    try {
      const message = `Check out my question insights!\n\n📊 Total Votes: ${insights.totalVotes}\n👀 Views: ${insights.totalViews}\n📈 Engagement Rate: ${insights.engagementRate}%\n\n${insights.votesByOption.length > 0 ? `🏆 Top Option: ${insights.votesByOption[0].content} (${insights.votesByOption[0].percentage.toFixed(1)}%)` : ''}`;

      await Share.share({
        message,
      });

      logger.logUserAction('share_question_insights', { questionId });
    } catch (err: any) {
      logger.error('Failed to share insights', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }

  if (error || !insights) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="analytics-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.errorTitle}>Unable to load insights</Text>
        <Text style={styles.errorText}>{error || 'Question not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchInsights}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const expiresAt = new Date(insights.expiresAt);
  const isActive = insights.status === 'active' && expiresAt > new Date();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header with key metrics */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-done" size={24} color={colors.success} />
            <Text style={styles.metricValue}>{insights.totalVotes}</Text>
            <Text style={styles.metricLabel}>Total Votes</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="eye" size={24} color={colors.info} />
            <Text style={styles.metricValue}>{insights.totalViews}</Text>
            <Text style={styles.metricLabel}>Views</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={24} color={colors.primary} />
            <Text style={styles.metricValue}>{insights.engagementRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Engagement</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons
              name={isActive ? 'time' : 'checkmark-circle'}
              size={24}
              color={isActive ? colors.warning : colors.mediumGray}
            />
            <Text style={[styles.metricValue, { fontSize: 14 }]}>
              {isActive ? 'Active' : 'Closed'}
            </Text>
            <Text style={styles.metricLabel}>Status</Text>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
          <Ionicons name="download" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Vote Chart */}
      {insights.votesByOption.length > 0 && (
        <VoteChart votesByOption={insights.votesByOption} />
      )}

      {/* Timeline Graph */}
      {insights.timeBasedTrends.length > 0 && (
        <TimelineGraph timeBasedTrends={insights.timeBasedTrends} />
      )}

      {/* Demographics */}
      <DemographicsCard demographics={insights.voterDemographics} />

      {/* Additional Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Question Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>
            {new Date(insights.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Expires</Text>
          <Text style={styles.infoValue}>
            {new Date(insights.expiresAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Options</Text>
          <Text style={styles.infoValue}>{insights.votesByOption.length}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    gap: spacing.sm,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});
