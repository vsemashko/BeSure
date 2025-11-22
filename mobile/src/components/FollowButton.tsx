import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import socialApi from '../api/social';
import logger from '../utils/logger';

interface FollowButtonProps {
  userId: string;
  initialFollowingState: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showIcon?: boolean;
}

export function FollowButton({
  userId,
  initialFollowingState,
  onFollowChange,
  size = 'medium',
  style,
  showIcon = false,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowingState);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      setIsLoading(true);

      // Optimistic update
      const previousState = isFollowing;
      setIsFollowing(!isFollowing);

      logger.logUserAction(isFollowing ? 'unfollow_user' : 'follow_user', {
        targetUserId: userId,
      });

      if (isFollowing) {
        await socialApi.unfollowUser(userId);
      } else {
        await socialApi.followUser(userId);
      }

      // Notify parent component
      onFollowChange?.(!previousState);
    } catch (error) {
      // Revert on error
      setIsFollowing(isFollowing);
      logger.error('Failed to toggle follow', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyles = [
    styles.button,
    styles[size],
    isFollowing ? styles.following : styles.follow,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    isFollowing ? styles.followingText : styles.followText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? colors.primary : colors.white}
        />
      ) : (
        <>
          {showIcon && (
            <Ionicons
              name={isFollowing ? 'checkmark' : 'person-add'}
              size={size === 'small' ? 14 : size === 'large' ? 20 : 16}
              color={isFollowing ? colors.primary : colors.white}
              style={styles.icon}
            />
          )}
          <Text style={textStyles}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },

  // Sizes
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 80,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 100,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minWidth: 120,
  },

  // States
  follow: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  following: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },

  // Text
  text: {
    fontWeight: typography.fontWeight.semiBold,
  },
  smallText: {
    fontSize: typography.fontSize.caption,
  },
  mediumText: {
    fontSize: typography.fontSize.bodySmall,
  },
  largeText: {
    fontSize: typography.fontSize.body,
  },
  followText: {
    color: colors.white,
  },
  followingText: {
    color: colors.primary,
  },

  icon: {
    marginRight: spacing.xs,
  },
});

export default FollowButton;
