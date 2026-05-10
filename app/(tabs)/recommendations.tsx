import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import Animated, { FadeInUp, SlideInRight, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { CheckCircle2, ChevronRight, Info, Clock } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';

import { AppColors, AppRadii, AppSpacing } from '../../src/theme/colors';
import { MockData, RecommendationCategory, RecommendationPriority } from '../../src/services/mockData';
import { GlassCard } from '../../src/components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';

const FILTERS: { id: RecommendationCategory; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'hydration', label: 'Nemlendirme' },
  { id: 'pore', label: 'Gözenek' },
  { id: 'routine', label: 'Rutin' },
  { id: 'makeup', label: 'Makyaj' },
];

export default function RecommendationsScreen() {
  const [activeFilter, setActiveFilter] = useState<RecommendationCategory>('all');
  const { recommendations } = MockData;

  const filteredRecs = recommendations.filter(
    (rec) => activeFilter === 'all' || rec.category === activeFilter
  );

  const totalCount = recommendations.length;
  const completedCount = recommendations.filter(r => r.completedToday).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100) || 0;

  // Progress Bar Animation
  const progressWidth = useSharedValue(0);
  React.useEffect(() => {
    progressWidth.value = withTiming(progressPercent, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [progressPercent]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`
  }));

  const getPriorityColor = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'high': return AppColors.accentViolet;
      case 'medium': return AppColors.accentGold;
      case 'low': return AppColors.textTertiary;
      default: return AppColors.borderSubtle;
    }
  };

  const getCategoryLabel = (category: string) => {
    return FILTERS.find(f => f.id === category)?.label || category;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header & Daily Progress */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.headerTitle}>GÜNLÜK ÖNERİLER</Text>
          <Text style={styles.headerSubtitle}>Yapay Zeka Destekli Rutin Planınız</Text>

          {/* Progress Bar Container */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Günlük İlerleme</Text>
              <Text style={styles.progressValue}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <Animated.View style={[styles.progressBarFill, progressStyle]} />
            </View>
            <Text style={styles.progressSubtext}>{totalCount} öneriden {completedCount} tanesi tamamlandı</Text>
          </View>
        </Animated.View>

        {/* Filters */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <Pressable key={filter.id} onPress={() => setActiveFilter(filter.id)}>
                  <LinearGradient
                    colors={isActive ? ['#7B5EF6', '#5B3FD0'] : [AppColors.bgCard, AppColors.bgCard]}
                    style={[styles.filterBtn, !isActive && styles.filterBtnInactive]}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                      {filter.label}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* List */}
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {filteredRecs.map((rec, index) => {
            const IconComponent = (LucideIcons as any)[rec.iconName];
            const prioColor = getPriorityColor(rec.priority);

            return (
              <Animated.View key={rec.id} entering={SlideInRight.delay(200 + index * 100).springify()}>
                <GlassCard style={rec.completedToday ? styles.cardCompleted : undefined}>
                  <View style={styles.cardHeader}>
                    <View style={styles.categoryRow}>
                      <View style={[styles.iconBox, { backgroundColor: prioColor + '20' }]}>
                        {IconComponent && <IconComponent size={14} color={prioColor} />}
                      </View>
                      <Text style={[styles.categoryText, { color: prioColor }]}>
                        {getCategoryLabel(rec.category).toUpperCase()}
                      </Text>
                    </View>
                    {rec.completedToday && (
                      <View style={styles.completedBadge}>
                        <CheckCircle2 size={12} color={AppColors.bgPrimary} />
                        <Text style={styles.completedBadgeText}>Yapıldı</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.cardTitle, rec.completedToday && styles.textMuted]}>{rec.title}</Text>
                  <Text style={[styles.cardDesc, rec.completedToday && styles.textMuted]}>{rec.description}</Text>

                  {/* AI Reason & Time */}
                  <View style={styles.cardMetaBox}>
                    <View style={styles.metaRow}>
                      <Info size={14} color={AppColors.textTertiary} />
                      <Text style={styles.metaText}>Ton eşitliği puanınız düşük olduğu için önerildi.</Text>
                    </View>
                    <View style={[styles.metaRow, { marginTop: 6 }]}>
                      <Clock size={14} color={AppColors.textTertiary} />
                      <Text style={styles.metaText}>Tahmini süre: 2 dk</Text>
                    </View>
                  </View>

                  {!rec.completedToday && (
                    <Pressable style={styles.applyBtn}>
                      <Text style={styles.applyBtnText}>Uygula ve Tamamla</Text>
                      <ChevronRight size={16} color={AppColors.accentVioletLight} />
                    </Pressable>
                  )}
                </GlassCard>
              </Animated.View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.bgPrimary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: AppSpacing.lg,
    marginTop: AppSpacing.md,
    marginBottom: AppSpacing.md,
  },
  headerTitle: {
    color: AppColors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  progressSection: {
    marginTop: AppSpacing.xl,
    padding: AppSpacing.md,
    backgroundColor: 'rgba(22, 24, 38, 0.6)',
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppSpacing.sm,
  },
  progressLabel: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    color: AppColors.accentGold,
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: AppRadii.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: AppColors.accentGold,
    borderRadius: AppRadii.full,
  },
  progressSubtext: {
    color: AppColors.textTertiary,
    fontSize: 12,
    marginTop: AppSpacing.sm,
    textAlign: 'right',
  },
  filtersWrapper: {
    marginBottom: AppSpacing.md,
  },
  filtersScroll: {
    paddingHorizontal: AppSpacing.lg,
    gap: AppSpacing.sm,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: AppRadii.full,
  },
  filterBtnInactive: {
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
  },
  filterText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: AppSpacing.lg,
    paddingBottom: AppSpacing.xxl,
    gap: AppSpacing.md,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppSpacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: AppRadii.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.accentGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppRadii.xs,
    gap: 4,
  },
  completedBadgeText: {
    color: AppColors.bgPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardDesc: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: AppSpacing.sm,
  },
  textMuted: {
    color: AppColors.textTertiary,
  },
  cardMetaBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: AppSpacing.sm,
    borderRadius: AppRadii.sm,
    marginBottom: AppSpacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: AppColors.textTertiary,
    fontSize: 12,
    flex: 1,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(123, 94, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(123, 94, 246, 0.3)',
    borderRadius: AppRadii.md,
    paddingVertical: 12,
  },
  applyBtnText: {
    color: AppColors.accentVioletLight,
    fontSize: 14,
    fontWeight: '600',
  },
});
