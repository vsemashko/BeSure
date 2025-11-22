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

type FollowersScreenRouteProp = RouteProp<
  { Followers: { userId: string; username?: string } },
  'Followers'
>;

export function FollowersScreen() {
  const route = useRoute<FollowersScreenRouteProp>();
  const navigation = useNavigation();
  const { userId, username } = route.params;

  const [followers, setFollowers] = useState<UserListItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadFollowers();
  }, [userId]);

  const loadFollowers = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
        setOffset(0);
      } else {
        setIsLoading(true);
      }

      const currentOffset = refresh ? 0 : offset;
      const response = await socialApi.getFollowers(userId, {
        limit,
        offset: currentOffset,
      });

      if (refresh) {
        setFollowers(response.followers);
      } else {
        setFollowers([...followers, ...response.followers]);
      }

      setHasMore(response.followers.length === limit);
      setOffset(currentOffset + response.followers.length);

      logger.logUserAction('view_followers', {
        userId,
        count: response.total,
      });
    } catch (error) {
      logger.error('Failed to load followers', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadFollowers(true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadFollowers();
    }
  };

  const handleUserPress = (userId: string) => {
    // Navigate to user profile (when implemented)
    logger.logUserAction('tap_follower_profile', { userId });
  };

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    logger.logUserAction(isFollowing ? 'follow_from_list' : 'unfollow_from_list', {
      userId,
      context: 'followers_screen',
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
        <Text style={styles.emptyEmoji}>👥</Text>
        <Text style={styles.emptyTitle}>No Followers Yet</Text>
        <Text style={styles.emptyText}>
          {username ? `${username} doesn't have any followers yet` : 'No followers yet'}
        </Text>
      </Card>
    );
  };

  const renderFooter = () => {
    if (!isLoading || followers.length === 0) {
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
        <Text style={styles.title}>Followers</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading && followers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={followers}
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

export default FollowersScreen;
