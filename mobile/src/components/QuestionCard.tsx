import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { Card } from './Card';
import { colors, typography, spacing, borderRadius } from '../theme';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onPress: () => void;
}

export function QuestionCard({ question, onPress }: QuestionCardProps) {
  const timeLeft = formatDistanceToNow(new Date(question.expiresAt), { addSuffix: true });
  const isExpiringSoon = new Date(question.expiresAt).getTime() - Date.now() < 3600000; // < 1 hour

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            {question.isAnonymous ? (
              <Text style={styles.anonymous}>Anonymous</Text>
            ) : (
              <Text style={styles.username}>@{question.user?.username}</Text>
            )}
          </View>
          <View style={[styles.timer, isExpiringSoon && styles.timerUrgent]}>
            <Ionicons
              name="time-outline"
              size={14}
              color={isExpiringSoon ? colors.error : colors.mediumGray}
            />
            <Text style={[styles.timerText, isExpiringSoon && styles.timerTextUrgent]}>
              {timeLeft}
            </Text>
          </View>
        </View>

        {/* Question Title */}
        <Text style={styles.title} numberOfLines={3}>
          {question.title}
        </Text>

        {/* Options Preview */}
        <View style={styles.optionsPreview}>
          {question.options.slice(0, 2).map((option, _index) => (
            <View key={option.id} style={styles.optionPreview}>
              <Text style={styles.optionText} numberOfLines={1}>
                {option.content}
              </Text>
            </View>
          ))}
          {question.options.length > 2 && (
            <Text style={styles.moreOptions}>
              +{question.options.length - 2} more
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.voteCount}>
            <Ionicons name="people-outline" size={16} color={colors.mediumGray} />
            <Text style={styles.voteCountText}>
              {question.totalVotes} {question.totalVotes === 1 ? 'vote' : 'votes'}
            </Text>
          </View>
          {question.hasVoted && (
            <View style={styles.votedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.votedText}>Voted</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  authorInfo: {
    flex: 1,
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
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  timerUrgent: {
    backgroundColor: colors.error + '20',
  },
  timerText: {
    fontSize: typography.fontSize.caption,
    color: colors.mediumGray,
    fontWeight: typography.fontWeight.semiBold,
  },
  timerTextUrgent: {
    color: colors.error,
  },
  title: {
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.bodyLarge,
    marginBottom: spacing.md,
  },
  optionsPreview: {
    marginBottom: spacing.md,
  },
  optionPreview: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  optionText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  moreOptions: {
    fontSize: typography.fontSize.caption,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteCountText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mediumGray,
  },
  votedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  votedText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.success,
    fontWeight: typography.fontWeight.semiBold,
  },
});

export default QuestionCard;
