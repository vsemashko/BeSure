import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { UserListItem } from '../components/UserListItem';
import socialApi, { UserListItem as UserType } from '../api/social';
import logger from '../utils/logger';

const MAX_RECENT_SEARCHES = 5;

export function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserType[]>([]);
  const [popularUsers, setPopularUsers] = useState<UserType[]>([]);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(true);

  useEffect(() => {
    loadDiscoveryData();
    loadRecentSearches();
  }, []);

  const loadDiscoveryData = async () => {
    try {
      setIsLoadingDiscovery(true);

      const [suggested, popular] = await Promise.all([
        socialApi.getSuggestedUsers(10),
        socialApi.getPopularUsers({ limit: 10 }),
      ]);

      setSuggestedUsers(suggested.users);
      setPopularUsers(popular.users);

      logger.logUserAction('view_search_discovery');
    } catch (error) {
      logger.error('Failed to load discovery data', error);
    } finally {
      setIsLoadingDiscovery(false);
    }
  };

  const loadRecentSearches = () => {
    // Recent searches are stored in memory only for this session
    // In a real app, you would use AsyncStorage or SecureStore
  };

  const saveRecentSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Add to beginning, remove duplicates, limit to max
    const updated = [
      trimmedQuery,
      ...recentSearches.filter((q) => q !== trimmedQuery),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    logger.logUserAction('clear_recent_searches');
  };

  const handleSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery || trimmedQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);

        const results = await socialApi.searchUsers(trimmedQuery, { limit: 20 });
        setSearchResults(results.users);

        saveRecentSearch(trimmedQuery);

        logger.logUserAction('search_users', {
          query: trimmedQuery,
          resultCount: results.users.length,
        });
      } catch (error) {
        logger.error('Failed to search users', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [recentSearches]
  );

  const handleSearchDebounced = useCallback(
    (query: string) => {
      setSearchQuery(query);

      // Debounce search
      const timer = setTimeout(() => {
        handleSearch(query);
      }, 300);

      return () => clearTimeout(timer);
    },
    [handleSearch]
  );

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleUserPress = (userId: string) => {
    // Navigate to user profile when implemented
    logger.logUserAction('view_user_from_search', { userId });
  };

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    // Update local state optimistically
    const updateUser = (user: UserType) =>
      user.id === userId ? { ...user, isFollowing } : user;

    setSearchResults((prev) => prev.map(updateUser));
    setSuggestedUsers((prev) => prev.map(updateUser));
    setPopularUsers((prev) => prev.map(updateUser));
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (searchQuery && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={60} color={colors.border} />
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptyText}>
            Try searching for a different username
          </Text>
        </View>
      );
    }

    if (searchResults.length > 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
          </Text>
          <FlatList
            data={searchResults}
            renderItem={({ item }) => (
              <UserListItem
                user={item}
                showFollowButton
                onPress={handleUserPress}
                onFollowChange={handleFollowChange}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      );
    }

    return null;
  };

  const renderDiscovery = () => {
    if (searchQuery) return null;

    if (isLoadingDiscovery) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return (
      <View>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearButton}>Clear</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map((query, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentSearchItem}
                onPress={() => handleRecentSearchPress(query)}
              >
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.recentSearchText}>{query}</Text>
                <Ionicons name="arrow-up-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Suggested Users */}
        {suggestedUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested for You</Text>
            <FlatList
              data={suggestedUsers}
              renderItem={({ item }) => (
                <UserListItem
                  user={item}
                  showFollowButton
                  onPress={handleUserPress}
                  onFollowChange={handleFollowChange}
                />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Popular Users */}
        {popularUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Users</Text>
            <FlatList
              data={popularUsers}
              renderItem={({ item }) => (
                <UserListItem
                  user={item}
                  showFollowButton
                  onPress={handleUserPress}
                  onFollowChange={handleFollowChange}
                />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search Bar */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearchDebounced}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <FlatList
        style={styles.content}
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View>
            {renderSearchResults()}
            {renderDiscovery()}
          </View>
        )}
        keyExtractor={(item) => item.key}
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
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    padding: 0,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  clearButton: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  recentSearchText: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
  },
});

export default SearchScreen;
