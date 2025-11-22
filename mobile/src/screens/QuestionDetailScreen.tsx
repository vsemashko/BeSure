import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { questionApi, voteApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { colors, typography, spacing, optionColors, borderRadius } from '../theme';
import type { Question } from '../types';
import type { RootStackParamList } from '../navigation/types';
import logger from '../utils/logger';

type RouteParams = RouteProp<RootStackParamList, 'QuestionDetail'>;

export function QuestionDetailScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, [route.params.questionId]);

  const loadQuestion = async () => {
    try {
      setIsLoading(true);
      const data = await questionApi.getById(route.params.questionId);
      setQuestion(data);
      if (data.hasVoted) {
        setSelectedOption(data.userVote || null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load question');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !question) return;

    try {
      setIsVoting(true);
      const result = await voteApi.castVote({
        questionId: question.id,
        optionId: selectedOption,
      });

      // Show success message
      Alert.alert(
        'Vote Recorded!',
        `You earned ${result.pointsEarned} points! New balance: ${result.newBalance} points`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      // Reload question to show updated results
      await loadQuestion();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to cast vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleShareResults = async () => {
    if (!question) return;

    try {
      // Sort options by vote count/percentage for better readability
      const sortedOptions = [...question.options].sort((a, b) =>
        (b.percentage || 0) - (a.percentage || 0)
      );

      // Build share message
      const resultsText = sortedOptions
        .map((option, index) => {
          const percentage = (option.percentage || 0).toFixed(0);
          const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '•';
          return `${emoji} ${option.content}: ${percentage}% (${option.voteCount || 0} votes)`;
        })
        .join('\n');

      const shareMessage = `
📊 BeSure Poll Results

${question.title}

Results:
${resultsText}

Total Votes: ${question.totalVotes}
${question.isAnonymous ? '' : `Posted by: @${question.user?.username}`}

Vote on this and more at BeSure! 🎯
      `.trim();

      const result = await Share.share({
        message: shareMessage,
        title: `BeSure Poll: ${question.title}`,
      });

      if (result.action === Share.sharedAction) {
        logger.info('Results shared successfully', { questionId: question.id });
      }
    } catch (error) {
      logger.error('Failed to share results', error);
      Alert.alert('Error', 'Failed to share results. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!question) {
    return null;
  }

  const isExpired = new Date(question.expiresAt) < new Date();
  const canVote = !question.hasVoted && !isExpired && question.user?.id !== user?.id;
  const timeLeft = formatDistanceToNow(new Date(question.expiresAt), { addSuffix: true });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Question Info */}
        <Card style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View>
              {question.isAnonymous ? (
                <Text style={styles.anonymous}>Anonymous</Text>
              ) : (
                <Text style={styles.username}>@{question.user?.username}</Text>
              )}
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.timer, isExpired && styles.timerExpired]}>
                <Ionicons
                  name={isExpired ? 'close-circle' : 'time-outline'}
                  size={16}
                  color={isExpired ? colors.error : colors.mediumGray}
                />
                <Text style={[styles.timerText, isExpired && styles.timerExpiredText]}>
                  {isExpired ? 'Closed' : timeLeft}
                </Text>
              </View>
              {(question.hasVoted || isExpired) && (
                <TouchableOpacity
                  onPress={handleShareResults}
                  style={styles.shareButton}
                >
                  <Ionicons name="share-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.questionTitle}>{question.title}</Text>
          {question.description && (
            <Text style={styles.questionDescription}>{question.description}</Text>
          )}

          <View style={styles.voteCount}>
            <Ionicons name="people-outline" size={20} color={colors.mediumGray} />
            <Text style={styles.voteCountText}>
              {question.totalVotes} {question.totalVotes === 1 ? 'vote' : 'votes'}
            </Text>
          </View>
        </Card>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>
            {canVote ? 'Choose an option:' : 'Results:'}
          </Text>

          {question.options.map((option, index) => {
            const isSelected = selectedOption === option.id;
            const isUserVote = question.userVote === option.id;
            const showPercentage = question.hasVoted || isExpired;
            const percentage = option.percentage || 0;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  isUserVote && styles.optionCardUserVote,
                ]}
                onPress={() => canVote && setSelectedOption(option.id)}
                disabled={!canVote}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.optionColor,
                        { backgroundColor: optionColors[index % optionColors.length] },
                      ]}
                    />
                    <Text style={styles.optionText}>{option.content}</Text>
                  </View>

                  {showPercentage && (
                    <Text style={styles.optionPercentage}>
                      {percentage.toFixed(0)}%
                    </Text>
                  )}

                  {isUserVote && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  )}
                </View>

                {showPercentage && (
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${percentage}%`,
                          backgroundColor: optionColors[index % optionColors.length],
                        },
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Vote Button */}
        {canVote && (
          <Button
            title={selectedOption ? 'Submit Vote (+2 points)' : 'Select an option to vote'}
            onPress={handleVote}
            disabled={!selectedOption}
            loading={isVoting}
            style={styles.voteButton}
          />
        )}

        {question.hasVoted && !isExpired && (
          <View style={styles.votedBanner}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.votedText}>You've already voted on this question</Text>
          </View>
        )}

        {/* Share Results Button */}
        {(question.hasVoted || isExpired) && (
          <Button
            title="Share Results"
            onPress={handleShareResults}
            variant="secondary"
            style={styles.shareResultsButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
  },
  questionCard: {
    marginBottom: spacing.lg,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  username: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  anonymous: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mediumGray,
    fontStyle: 'italic',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  shareButton: {
    padding: spacing.xs,
  },
  timerExpired: {
    backgroundColor: colors.error + '20',
  },
  timerText: {
    fontSize: typography.fontSize.caption,
    color: colors.mediumGray,
    fontWeight: typography.fontWeight.semiBold,
  },
  timerExpiredText: {
    color: colors.error,
  },
  questionTitle: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.h1,
    marginBottom: spacing.md,
  },
  questionDescription: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.body,
    marginBottom: spacing.md,
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  voteCountText: {
    fontSize: typography.fontSize.body,
    color: colors.mediumGray,
  },
  optionsContainer: {
    marginBottom: spacing.lg,
  },
  optionsTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionCardUserVote: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  optionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionColor: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semiBold,
  },
  optionPercentage: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  voteButton: {
    marginBottom: spacing.lg,
  },
  votedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.md,
  },
  votedText: {
    fontSize: typography.fontSize.body,
    color: colors.success,
    fontWeight: typography.fontWeight.semiBold,
  },
  shareResultsButton: {
    marginTop: spacing.md,
  },
});

export default QuestionDetailScreen;
