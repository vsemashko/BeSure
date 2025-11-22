import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { UserListItem } from '../components/UserListItem';
import { Card } from '../components/Card';
import socialApi from '../api/social';
import type { UserListItem as UserListItemType } from '../api/social';
import { colors, typography, spacing } from '../theme';
import logger from '../utils/logger';

type FollowingScreenRouteProp = RouteProp<
  { Following: { userId: string; username?: string } },
  'Following'
>;

export function FollowingScreen() {
  const route = useRoute<FollowingScreenRouteProp>();
  const navigation = useNavigation();
  const { userId, username } = route.params;

  const [following, setFollowing] = useState<UserListItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  const loadFollowing = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
        setOffset(0);
      } else {
        setIsLoading(true);
      }

      const currentOffset = refresh ? 0 : offset;
      const response = await socialApi.getFollowing(userId, {
        limit,
        offset: currentOffset,
      });

      if (refresh) {
        setFollowing(response.following);
      } else {
        setFollowing([...following, ...response.following]);
      }

      setHasMore(response.following.length === limit);
      setOffset(currentOffset + response.following.length);

      logger.logUserAction('view_following', {
        userId,
        count: response.total,
      });
    } catch (error) {
      logger.error('Failed to load following', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadFollowing(true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadFollowing();
    }
  };

  const handleUserPress = (userId: string) => {
    logger.logUserAction('tap_following_profile', { userId });
  };

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    // Update local state optimistically
    if (!isFollowing) {
      setFollowing(following.filter((user) => user.id !== userId));
    }

    logger.logUserAction(isFollowing ? 'follow_from_list' : 'unfollow_from_list', {
      userId,
      context: 'following_screen',
    });
  };

  const renderItem = ({ item }: { item: UserListItemType }) => (
    <UserListItem
      user={item}
      onPress={handleUserPress}
      onFollowChange={handleFollowChange}
      showFollowButton={true}
    />
  );

  const renderEmpty = () => {
    if (isLoading) {
      return null;
    }

    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={styles.emptyTitle}>Not Following Anyone Yet</Text>
        <Text style={styles.emptyText}>
          {username
            ? `${username} isn't following anyone yet`
            : 'Start following people to see their questions here!'}
        </Text>
      </Card>
    );
  };

  const renderFooter = () => {
    if (!isLoading || following.length === 0) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

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
        <Text style={styles.title}>Following</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading && following.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={following}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxxl,
    marginTop: spacing.xxxl,
    marginHorizontal: spacing.lg,
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
});

export default FollowingScreen;
