import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { FollowButton } from './FollowButton';
import type { UserListItem as UserListItemType } from '../api/social';

interface UserListItemProps {
  user: UserListItemType;
  showFollowButton?: boolean;
  onPress?: (userId: string) => void;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

export function UserListItem({
  user,
  showFollowButton = true,
  onPress,
  onFollowChange,
}: UserListItemProps) {
  const avatarUrl = user.profileData?.avatarUrl;
  const displayName = user.profileData?.displayName || user.username;
  const bio = user.profileData?.bio;

  const handlePress = () => {
    onPress?.(user.id);
  };

  const handleFollowChange = (isFollowing: boolean) => {
    onFollowChange?.(user.id, isFollowing);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {displayName}
            </Text>
            {user.isFollowing && (
              <View style={styles.followsBadge}>
                <Text style={styles.followsBadgeText}>Follows you</Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>@{user.username}</Text>
          {bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {bio}
            </Text>
          )}
          <View style={styles.stats}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.points}>{user.points} points</Text>
          </View>
        </View>
      </View>

      {showFollowButton && (
        <FollowButton
          userId={user.id}
          initialFollowingState={false}
          onFollowChange={handleFollowChange}
          size="small"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.lightGray,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  displayName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  followsBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  followsBadgeText: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  username: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  bio: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  points: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
});

export default UserListItem;
