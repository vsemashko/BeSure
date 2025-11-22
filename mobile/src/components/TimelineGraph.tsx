import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';

interface TimelineGraphProps {
  timeBasedTrends: Array<{
    timestamp: string;
    cumulativeVotes: number;
  }>;
}

const screenWidth = Dimensions.get('window').width;

export const TimelineGraph: React.FC<TimelineGraphProps> = ({ timeBasedTrends }) => {
  if (timeBasedTrends.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Voting Timeline</Text>
        <Text style={styles.emptyText}>No vote data available yet</Text>
      </View>
    );
  }

  // Sample data points to avoid overcrowding the chart
  const sampleSize = Math.min(timeBasedTrends.length, 8);
  const step = Math.max(1, Math.floor(timeBasedTrends.length / sampleSize));
  const sampledData = timeBasedTrends.filter((_, index) => index % step === 0);

  // Prepare data for the chart
  const labels = sampledData.map((point, index) => {
    if (index === 0 || index === sampledData.length - 1) {
      const date = new Date(point.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return '';
  });

  const data = sampledData.map((point) => point.cumulativeVotes);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voting Timeline</Text>
      <Text style={styles.subtitle}>Cumulative votes over time</Text>

      <LineChart
        data={{
          labels,
          datasets: [
            {
              data,
            },
          ],
        }}
        width={screenWidth - spacing.xl * 2}
        height={220}
        chartConfig={{
          backgroundColor: colors.white,
          backgroundGradientFrom: colors.white,
          backgroundGradientTo: colors.white,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
          style: {
            borderRadius: borderRadius.lg,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.border,
            strokeWidth: 1,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.primary,
          },
        }}
        bezier
        style={styles.chart}
      />

      <View style={styles.insights}>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>First Vote</Text>
          <Text style={styles.insightValue}>
            {new Date(timeBasedTrends[0].timestamp).toLocaleString()}
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Latest Vote</Text>
          <Text style={styles.insightValue}>
            {new Date(
              timeBasedTrends[timeBasedTrends.length - 1].timestamp
            ).toLocaleString()}
          </Text>
        </View>
      </View>
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.lg,
    marginVertical: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  insights: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  insightValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
});
