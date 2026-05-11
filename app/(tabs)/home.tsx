import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, SlideInRight, SlideInDown } from 'react-native-reanimated';
import { Bell, Clock, TrendingUp, ChevronRight, CheckCircle2, Circle } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';

import { AppColors, AppRadii, AppSpacing } from '../../src/theme/colors';
import { MockData } from '../../src/services/mockData';
import { SkinScoreRing } from '../../src/components/SkinScoreRing';
import { GlassCard } from '../../src/components/GlassCard';
import { MetricChip } from '../../src/components/MetricChip';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { currentUser, latestAnalysis, weeklyReport, quickActions } = MockData;

  const todayTasks = [
    { id: '1', title: 'Sabah C Vitamini', completed: true },
    { id: '2', title: '2.5 Litre Su Tüketimi', completed: false },
    { id: '3', title: 'Akşam Çift Aşamalı Temizlik', completed: false },
  ];

  return (
    <View style={styles.container}>
      {/* Background Ambient Blobs */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobBottomRight]} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingLabel}>GÜNAYDIN</Text>
              <Text style={styles.greetingName}>{currentUser.name}</Text>
              <Text style={styles.greetingQuote}>"Bugün cildiniz için harika bir gün olacak."</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.iconBtn}>
                <Bell size={20} color={AppColors.textSecondary} />
              </Pressable>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{currentUser.name[0]}{currentUser.surname[0]}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Skin Score Card */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
            <GlassCard showGlow glowColor={AppColors.accentViolet}>
              <View style={styles.scoreCardContent}>
                <SkinScoreRing score={latestAnalysis.overallScore} size={220}>
                  <View style={styles.scoreCenter}>
                    <Text style={styles.scoreLabel}>CİLT SKORU</Text>
                    <Text style={styles.scoreValue}>{latestAnalysis.overallScore}</Text>
                    <Text style={styles.scoreMax}>/ 100</Text>
                  </View>
                </SkinScoreRing>

                <Animated.View entering={FadeInUp.delay(800)} style={styles.nextScanChip}>
                  <Clock size={14} color={AppColors.accentGold} />
                  <Text style={styles.nextScanText}>
                    Sonraki Profilleme: {latestAnalysis.nextScanIn} gün
                  </Text>
                </Animated.View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HIZLI ERİŞİM</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {quickActions.map((action, index) => {
                const IconComponent = (LucideIcons as any)[action.iconName];
                const isActive = index === 0;

                return (
                  <Animated.View key={action.id} entering={SlideInRight.delay(200 + index * 100).springify()}>
                    <Pressable onPress={() => router.push('/(tabs)/survey')}>
                      <LinearGradient
                        colors={isActive ? ['#7B5EF6', '#5B3FD0'] : [AppColors.bgCard, AppColors.bgCard]}
                        style={[styles.quickActionPill, !isActive && styles.quickActionInactiveBorder]}
                      >
                        {IconComponent && <IconComponent size={16} color={isActive ? '#FFF' : AppColors.textSecondary} />}
                        <Text style={[styles.quickActionText, isActive && styles.quickActionTextActive]}>
                          {action.label}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </View>

          {/* Daily Tasks */}
          <Animated.View entering={SlideInDown.delay(300).springify()} style={styles.section}>
            <View style={styles.metricsHeader}>
              <Text style={styles.sectionTitle}>GÜNLÜK GÖREVLER</Text>
              <Text style={styles.seeAllText}>1/3 Tamamlandı</Text>
            </View>
            <View style={styles.tasksContainer}>
              {todayTasks.map((task, i) => (
                <GlassCard key={task.id} style={styles.taskCard}>
                  <Pressable style={styles.taskRow}>
                    {task.completed ? (
                      <CheckCircle2 size={20} color={AppColors.statusSuccess} />
                    ) : (
                      <Circle size={20} color={AppColors.textTertiary} />
                    )}
                    <Text style={[styles.taskTitle, task.completed && styles.taskCompleted]}>
                      {task.title}
                    </Text>
                  </Pressable>
                </GlassCard>
              ))}
            </View>
          </Animated.View>

          {/* Weekly Report Card */}
          <Animated.View entering={SlideInDown.delay(400).springify()} style={styles.section}>
            <GlassCard showGlow glowColor={AppColors.accentGold}>
              <View style={styles.reportHeader}>
                <LinearGradient colors={['#C9A96E', '#8A6F42']} style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>HAFTALIK RAPOR</Text>
                </LinearGradient>
                <ChevronRight size={16} color={AppColors.textTertiary} />
              </View>
              
              <Text style={styles.reportTitle}>Haftalık Raporun Hazır ✦</Text>
              
              <View style={styles.deltaRow}>
                <TrendingUp size={16} color={AppColors.accentVioletLight} />
                <Text style={styles.deltaText}>+{weeklyReport.scoreDelta} puan bu hafta</Text>
              </View>

              <View style={styles.highlightsContainer}>
                {weeklyReport.highlights.slice(0, 2).map((highlight, idx) => (
                  <View key={idx} style={styles.highlightRow}>
                    <View style={styles.highlightDot} />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Skin Metrics Section */}
          <View style={styles.section}>
            <View style={styles.metricsHeader}>
              <Text style={styles.sectionTitle}>METRİKLER</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {latestAnalysis.metrics.map((metric, index) => (
                <Animated.View key={metric.label} entering={SlideInRight.delay(300 + index * 100).springify()}>
                  <MetricChip
                    label={metric.label}
                    value={metric.value}
                    unit={metric.unit}
                    delta={metric.trendDelta}
                    trendUp={metric.trend === 'up'}
                  />
                </Animated.View>
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 80 }} />
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
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  blobTopLeft: {
    top: -100,
    left: -100,
    backgroundColor: AppColors.accentViolet,
  },
  blobBottomRight: {
    bottom: -50,
    right: -100,
    backgroundColor: AppColors.accentGold,
    opacity: 0.08,
  },
  scrollContent: {
    paddingVertical: AppSpacing.md,
  },
  section: {
    marginBottom: AppSpacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.md,
    marginBottom: AppSpacing.md,
  },
  greetingLabel: {
    color: AppColors.accentViolet,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  greetingName: {
    color: AppColors.textPrimary,
    fontSize: 28,
    fontWeight: '300',
  },
  greetingQuote: {
    color: AppColors.textTertiary,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: AppRadii.sm,
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    backgroundColor: AppColors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AppColors.accentVioletDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: AppColors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  scoreCardContent: {
    alignItems: 'center',
    paddingVertical: AppSpacing.md,
  },
  scoreCenter: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: AppColors.textTertiary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scoreValue: {
    color: AppColors.textPrimary,
    fontSize: 64,
    fontWeight: '800',
    marginVertical: -5,
  },
  scoreMax: {
    color: AppColors.textTertiary,
    fontSize: 14,
  },
  nextScanChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 169, 110, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.3)',
    borderRadius: AppRadii.full,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    marginTop: AppSpacing.lg,
    gap: 6,
  },
  nextScanText: {
    color: AppColors.accentGold,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    color: AppColors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingHorizontal: AppSpacing.md,
    marginBottom: AppSpacing.sm,
  },
  horizontalScroll: {
    paddingHorizontal: AppSpacing.md,
    gap: AppSpacing.sm,
  },
  quickActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 10,
    borderRadius: AppRadii.full,
    gap: 8,
  },
  quickActionInactiveBorder: {
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
  },
  quickActionText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  quickActionTextActive: {
    color: AppColors.textPrimary,
    fontWeight: '600',
  },
  tasksContainer: {
    paddingHorizontal: AppSpacing.md,
    gap: AppSpacing.sm,
  },
  taskCard: {
    padding: AppSpacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
  },
  taskTitle: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  taskCompleted: {
    color: AppColors.textTertiary,
    textDecorationLine: 'line-through',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppSpacing.md,
  },
  reportBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppRadii.xs,
  },
  reportBadgeText: {
    color: AppColors.bgPrimary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  reportTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: AppSpacing.xs,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: AppSpacing.sm,
  },
  deltaText: {
    color: AppColors.accentVioletLight,
    fontSize: 14,
  },
  highlightsContainer: {
    gap: 6,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.accentGold,
  },
  highlightText: {
    color: AppColors.textSecondary,
    fontSize: 13,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: AppSpacing.md,
  },
  seeAllText: {
    color: AppColors.accentViolet,
    fontSize: 12,
    fontWeight: '600',
  },
});
