import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';

interface DemographicsCardProps {
  demographics: {
    totalVoters: number;
    avgPointsPerVoter: number;
    topVotersByPoints: Array<{
      userId: string;
      username: string;
      points: number;
    }>;
  };
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({ demographics }) => {
  const { totalVoters, avgPointsPerVoter, topVotersByPoints } = demographics;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voter Demographics</Text>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="people" size={24} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{totalVoters}</Text>
          <Text style={styles.statLabel}>Total Voters</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="star" size={24} color={colors.warning} />
          </View>
          <Text style={styles.statValue}>{avgPointsPerVoter}</Text>
          <Text style={styles.statLabel}>Avg Points</Text>
        </View>
      </View>

      {topVotersByPoints.length > 0 && (
        <View style={styles.topVoters}>
          <Text style={styles.sectionTitle}>Top Voters by Points</Text>
          {topVotersByPoints.map((voter, index) => (
            <View key={voter.userId} style={styles.voterItem}>
              <View style={styles.voterRank}>
                {index === 0 && <Ionicons name="trophy" size={18} color={colors.warning} />}
                {index === 1 && (
                  <Ionicons name="medal" size={18} color={colors.mediumGray} />
                )}
                {index === 2 && (
                  <Ionicons name="medal-outline" size={18} color="#CD7F32" />
                )}
                {index > 2 && <Text style={styles.rankText}>{index + 1}</Text>}
              </View>
              <Text style={styles.voterUsername} numberOfLines={1}>
                @{voter.username}
              </Text>
              <View style={styles.voterPoints}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={styles.pointsText}>{voter.points}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {totalVoters === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No voters yet</Text>
          <Text style={styles.emptySubtext}>
            Be patient! Votes will start coming in soon.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  topVoters: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  voterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  voterRank: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  voterUsername: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  voterPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
