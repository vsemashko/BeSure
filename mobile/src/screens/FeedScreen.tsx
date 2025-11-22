import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { QuestionCard } from '../components/QuestionCard';
import { useAuthStore } from '../store/authStore';
import { questionApi } from '../api';
import socialApi from '../api/social';
import { colors, typography, spacing } from '../theme';
import logger from '../utils/logger';
import type { Question, FeedMode } from '../types';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FEED_MODES: { key: FeedMode; label: string }[] = [
  { key: 'foryou', label: 'For You' },
  { key: 'friends', label: 'Friends' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'popular', label: 'Popular' },
];

export function FeedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedMode, setSelectedMode] = useState<FeedMode>('foryou');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const loadFeed = useCallback(async (mode: FeedMode, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
        setOffset(0);
      } else {
        setIsLoading(true);
      }

      let result;

      // Use different API for friends feed
      if (mode === 'friends') {
        result = await socialApi.getFriendFeed({
          limit: 20,
          offset: refresh ? 0 : offset,
        });
        logger.logUserAction('view_friends_feed', { count: result.questions.length });
      } else {
        result = await questionApi.getFeed({
          mode,
          limit: 20,
          offset: refresh ? 0 : offset,
        });
      }

      if (refresh) {
        setQuestions(result.questions);
      } else {
        setQuestions((prev) => [...prev, ...result.questions]);
      }

      setHasMore(result.questions.length === 20);
      if (!refresh) {
        setOffset((prev) => prev + result.questions.length);
      }
    } catch (error) {
      logger.error('Failed to load feed', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [offset]);

  useEffect(() => {
    loadFeed(selectedMode, true);
  }, [selectedMode]);

  const handleRefresh = () => {
    loadFeed(selectedMode, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadFeed(selectedMode);
    }
  };

  const handleModeChange = (mode: FeedMode) => {
    setSelectedMode(mode);
    setOffset(0);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>BeSure</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{user?.points || 0} pts</Text>
        </View>
      </View>

      <View style={styles.modesContainer}>
        {FEED_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            style={[
              styles.modeButton,
              selectedMode === mode.key && styles.modeButtonActive,
            ]}
            onPress={() => handleModeChange(mode.key)}
          >
            <Text
              style={[
                styles.modeButtonText,
                selectedMode === mode.key && styles.modeButtonTextActive,
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (selectedMode === 'friends') {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>No Friend Activity</Text>
          <Text style={styles.emptyText}>
            Follow people to see their questions here!{'\n'}
            Check out the Popular tab to find interesting people.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🤔</Text>
        <Text style={styles.emptyTitle}>No questions yet</Text>
        <Text style={styles.emptyText}>
          Be the first to ask a question or check back later!
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={questions}
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={!questions.length && !isLoading ? styles.emptyContentContainer : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  pointsBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  pointsText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  modesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.white,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.huge,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
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
  loaderContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default FeedScreen;
