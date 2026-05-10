import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors, AppRadii, AppSpacing } from '../theme/colors';

interface Props {
  label: string;
  value: number;
  unit: string;
  delta: number;
  trendUp: boolean;
}

export const MetricChip: React.FC<Props> = ({ label, value, unit, delta, trendUp }) => {
  const isStable = delta === 0;
  const trendColor = isStable
    ? AppColors.textTertiary
    : trendUp
    ? AppColors.accentVioletLight
    : AppColors.statusWarning;

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{Math.round(value)}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>

      <View style={[styles.trendBadge, { backgroundColor: trendColor + '20' }]}>
        <Text style={[styles.trendText, { color: trendColor }]}>
          {isStable ? '→' : delta > 0 ? `+${delta}` : `${delta}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.bgCard,
    borderRadius: AppRadii.sm,
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
  },
  label: {
    color: AppColors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  unit: {
    color: AppColors.textTertiary,
    fontSize: 12,
    marginLeft: 2,
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: AppRadii.xs,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
