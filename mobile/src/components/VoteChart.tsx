import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { colors, optionColors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';

interface VoteChartProps {
  votesByOption: Array<{
    content: string;
    voteCount: number;
    percentage: number;
  }>;
}

const screenWidth = Dimensions.get('window').width;

export const VoteChart: React.FC<VoteChartProps> = ({ votesByOption }) => {
  // Prepare data for the chart
  const labels = votesByOption.map((option, index) => `Option ${index + 1}`);
  const data = votesByOption.map((option) => option.voteCount);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Votes by Option</Text>

      <BarChart
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
        yAxisLabel=""
        yAxisSuffix=""
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
          propsForLabels: {
            fontSize: 12,
          },
        }}
        style={styles.chart}
        showValuesOnTopOfBars
      />

      <View style={styles.legend}>
        {votesByOption.map((option, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: optionColors[index % optionColors.length] },
              ]}
            />
            <View style={styles.legendText}>
              <Text style={styles.optionContent} numberOfLines={1}>
                {option.content}
              </Text>
              <Text style={styles.optionStats}>
                {option.voteCount} votes ({option.percentage.toFixed(1)}%)
              </Text>
            </View>
          </View>
        ))}
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
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.lg,
    marginVertical: spacing.md,
  },
  legend: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    flex: 1,
  },
  optionContent: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  optionStats: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
