import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { CheckCircle2, ChevronRight } from 'lucide-react-native';
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

  const completedCount = recommendations.filter(r => r.completedToday).length;

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
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.headerTitle}>ÖNERİLER</Text>
          <Text style={styles.headerSubtitle}>Sizin için yapay zeka tarafından hazırlandı</Text>
        </Animated.View>

        {/* Progress Summary */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.summaryContainer}>
          <GlassCard showGlow glowColor={AppColors.accentGold}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryTitle}>Bugün {completedCount} öneri tamamlandı</Text>
                <Text style={styles.summarySubtitle}>Günlük rutininizi harika ilerletiyorsunuz!</Text>
              </View>
              <CheckCircle2 size={32} color={AppColors.accentGold} />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Filters */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {FILTERS.map((filter, index) => {
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
              <Animated.View key={rec.id} entering={SlideInRight.delay(200 + index * 100).springify()} style={styles.cardWrapper}>
                <GlassCard>
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
                        <Text style={styles.completedText}>Yapıldı</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardTitle}>{rec.title}</Text>
                  <Text style={styles.cardDesc}>{rec.description}</Text>

                  {!rec.completedToday && (
                    <Pressable style={styles.applyBtn}>
                      <Text style={styles.applyBtnText}>Uygula</Text>
                      <ChevronRight size={14} color={AppColors.accentVioletLight} />
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
  summaryContainer: {
    paddingHorizontal: AppSpacing.lg,
    marginBottom: AppSpacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  summarySubtitle: {
    color: AppColors.textSecondary,
    fontSize: 13,
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
  cardWrapper: {
    // for animation
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
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: AppRadii.xs,
    gap: 4,
  },
  completedText: {
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
    marginBottom: AppSpacing.md,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderSubtle,
    paddingTop: AppSpacing.sm,
  },
  applyBtnText: {
    color: AppColors.accentVioletLight,
    fontSize: 13,
    fontWeight: '600',
  },
});
