import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, SlideInRight, SlideInDown, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Bell, TrendingUp, ChevronRight, CheckCircle2, Circle, Sparkles, Activity, Droplets, Sun, Wind } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';

import { AppColors, AppSpacing } from '../../src/theme/colors';
import { MockData } from '../../src/services/mockData';
import { GlassCard } from '../../src/components/GlassCard';
import { router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';

const { width, height } = Dimensions.get('window');

// Floating Animation Helper
const FloatingView = ({ children, delay = 0 }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withRepeat(
            withSequence(
              withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
              withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default function HomeScreen() {
  const { tasks, toggleTask } = useUserStore();
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <View style={styles.container}>
      {/* Dynamic Ambient Background */}
      <View style={[styles.bgBlob, styles.bgBlob1]} />
      <View style={[styles.bgBlob, styles.bgBlob2]} />
      <View style={[styles.bgBlob, styles.bgBlob3]} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).springify()} style={[styles.header, { paddingTop: 60 }]}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greetingLabel}>GÜNAYDIN, {MockData.currentUser.name.toUpperCase()}</Text>
              <Text style={styles.greetingTitle}>Cildin harika{'\n'}görünüyor ✨</Text>
            </View>
            <Pressable style={styles.notificationBtn}>
              <View style={styles.notificationDot} />
              <Bell size={22} color={AppColors.textPrimary} />
            </Pressable>
          </Animated.View>

          {/* Hero Score Card */}
          <Animated.View entering={FadeInDown.delay(200).springify().damping(12)}>
            <Pressable style={styles.heroCardContainer} onPress={() => router.push('/(tabs)/progress')}>
              <LinearGradient
                colors={['rgba(123, 94, 246, 0.95)', 'rgba(91, 63, 208, 0.85)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                {/* Inner Decor */}
                <View style={styles.heroDecorCircle1} />
                <View style={styles.heroDecorCircle2} />
                
                <View style={styles.heroTopRow}>
                  <View style={styles.heroBadge}>
                    <Sparkles size={14} color="#FFF" />
                    <Text style={styles.heroBadgeText}>Genel Cilt Skoru</Text>
                  </View>
                  <View style={styles.trendBadge}>
                    <TrendingUp size={14} color="#4ADE80" />
                    <Text style={styles.trendText}>+2 Puan</Text>
                  </View>
                </View>

                <View style={styles.heroMainContent}>
                  <FloatingView>
                    <Text style={styles.heroScore}>{latestAnalysis.overallScore}</Text>
                  </FloatingView>
                  <View style={styles.heroScoreDetails}>
                    <Text style={styles.heroMaxScore}>/100</Text>
                    <Text style={styles.heroStatus}>Mükemmel Durum</Text>
                  </View>
                </View>

                <View style={styles.heroFooter}>
                  <View style={styles.heroProgressBg}>
                    <Animated.View entering={SlideInRight.delay(800).springify()} style={[styles.heroProgressFill, { width: `${latestAnalysis.overallScore}%` }]} />
                  </View>
                  <Text style={styles.nextScanText}>Sonraki Profilleme: {latestAnalysis.nextScanIn} gün</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Quick Actions (Cards instead of pills) */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
              <Pressable><Text style={styles.seeAllText}>Düzenle</Text></Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {quickActions.map((action, index) => {
                const IconComponent = (LucideIcons as any)[action.iconName] || Activity;
                const isActive = activeAction === action.id;

                return (
                  <Animated.View key={action.id} entering={SlideInRight.delay(300 + index * 100).springify()}>
                    <Pressable 
                      onPress={() => {
                        setActiveAction(action.id);
                        if(index === 0) router.push('/(tabs)/survey');
                      }}
                    >
                      <LinearGradient
                        colors={isActive ? ['#7B5EF6', '#5B3FD0'] : ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
                        style={[styles.actionCard, !isActive && styles.actionCardInactive]}
                      >
                        <View style={[styles.actionIconWrapper, isActive ? styles.iconActive : styles.iconInactive]}>
                          <IconComponent size={24} color={isActive ? '#7B5EF6' : AppColors.textPrimary} />
                        </View>
                        <Text style={[styles.actionText, isActive && styles.actionTextActive]}>{action.label}</Text>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Daily Tasks (Modernized) */}
          <Animated.View entering={SlideInDown.delay(400).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Günün Görevleri</Text>
              <View style={styles.taskProgressBadge}>
                <Text style={styles.taskProgressText}>{completedCount}/{totalCount} Tamamlandı</Text>
              </View>
            </View>
            <View style={styles.tasksContainer}>
              {tasks.map((task, i) => {
                const TaskIcon = i === 0 ? Sun : i === 1 ? Droplets : Wind;
                return (
                  <Animated.View key={task.id} entering={FadeInDown.delay(400 + i * 100).springify()}>
                    <Pressable 
                      onPress={() => router.push(`/task/${task.id}`)}
                      style={[styles.taskItem, task.completed && styles.taskItemCompleted]}
                    >
                      <View style={styles.taskIconContainer}>
                        <TaskIcon size={20} color={task.completed ? AppColors.statusSuccess : AppColors.accentVioletLight} />
                      </View>
                      <View style={styles.taskInfo}>
                        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
                        <Text style={styles.taskTime}>{task.time}</Text>
                      </View>
                      <Pressable 
                        onPress={() => !task.completed && toggleTask(task.id)} 
                        style={styles.checkButton}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={24} color={AppColors.statusSuccess} />
                        ) : (
                          <Circle size={24} color={AppColors.borderSubtle} />
                        )}
                      </Pressable>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

          {/* Weekly Report (Rich Card) */}
          <Animated.View entering={SlideInDown.delay(500).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Analiz Raporu</Text>
            </View>
            <View style={{ gap: 12, paddingHorizontal: AppSpacing.lg }}>
              <Pressable onPress={() => router.push('/summary/weekly')}>
                <GlassCard style={styles.reportCard}>
                  <View style={styles.reportRow}>
                    <View style={styles.reportIconWrapper}>
                      <Sparkles size={24} color={AppColors.accentGold} />
                    </View>
                    <View style={styles.reportContent}>
                      <Text style={styles.reportTitle}>Haftalık Cilt Özeti</Text>
                      <Text style={styles.reportDesc}>Nem dengeniz %15 arttı. Rutininiz işe yarıyor!</Text>
                    </View>
                    <ChevronRight size={20} color={AppColors.textTertiary} />
                  </View>
                </GlassCard>
              </Pressable>

              <Pressable onPress={() => router.push('/summary/monthly')}>
                <GlassCard style={[styles.reportCard, { marginTop: 0 }]}>
                  <View style={styles.reportRow}>
                    <View style={[styles.reportIconWrapper, { backgroundColor: 'rgba(123,94,246,0.15)' }]}>
                      <Activity size={24} color={AppColors.accentViolet} />
                    </View>
                    <View style={styles.reportContent}>
                      <Text style={styles.reportTitle}>Aylık Gelişim Raporu</Text>
                      <Text style={styles.reportDesc}>30 günlük değişim grafiği hazır.</Text>
                    </View>
                    <ChevronRight size={20} color={AppColors.textTertiary} />
                  </View>
                </GlassCard>
              </Pressable>
            </View>
          </Animated.View>

          {/* Skin Metrics Section */}
          <Animated.View entering={FadeInUp.delay(600).springify()} style={[styles.section, { marginBottom: 100 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cilt Metrikleri</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {latestAnalysis.metrics.map((metric, index) => (
                <Animated.View key={metric.label} entering={SlideInRight.delay(500 + index * 100).springify()}>
                  <GlassCard style={styles.metricCard}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <View style={styles.metricValueRow}>
                      <Text style={styles.metricValue}>{metric.value}</Text>
                      <Text style={styles.metricUnit}>{metric.unit}</Text>
                    </View>
                    <View style={[styles.metricTrend, metric.trend === 'up' ? styles.trendUp : styles.trendDown]}>
                      <Text style={[styles.metricTrendText, metric.trend === 'up' ? styles.trendUpText : styles.trendDownText]}>
                        {metric.trend === 'up' ? '+' : ''}{metric.trendDelta}
                      </Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>

      {/* Celebration Overlay */}
      {allDone && (
        <Animated.View 
          entering={FadeInUp.springify()} 
          style={styles.celebrationOverlay}
        >
          <LinearGradient
            colors={['#7B5EF6', '#5B3FD0']}
            style={styles.celebrationGradient}
          >
            <Sparkles size={32} color="#FFF" />
            <Text style={styles.celebrationText}>Harika! Tüm görevler tamamlandı!</Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.bgPrimary,
  },
  bgBlob: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.12,
  },
  bgBlob1: {
    top: -150,
    left: -100,
    backgroundColor: '#7B5EF6',
  },
  bgBlob2: {
    top: '30%',
    right: -200,
    backgroundColor: '#FF3366',
    opacity: 0.08,
  },
  bgBlob3: {
    bottom: -100,
    left: -50,
    backgroundColor: '#00C2FF',
    opacity: 0.08,
  },
  scrollContent: {
    paddingVertical: AppSpacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.lg,
    marginBottom: AppSpacing.xl,
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingLabel: {
    color: AppColors.textTertiary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  greetingTitle: {
    color: AppColors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3366',
    zIndex: 2,
  },
  heroCardContainer: {
    marginHorizontal: AppSpacing.lg,
    borderRadius: 28,
    shadowColor: '#7B5EF6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
    marginBottom: AppSpacing.xl,
  },
  heroGradient: {
    padding: AppSpacing.xl,
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 220,
    justifyContent: 'space-between',
  },
  heroDecorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -50,
    right: -50,
  },
  heroDecorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -50,
    left: -20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '700',
  },
  heroMainContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 20,
    zIndex: 1,
  },
  heroScore: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 80,
    letterSpacing: -2,
  },
  heroScoreDetails: {
    marginLeft: 12,
    marginBottom: 12,
  },
  heroMaxScore: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: '600',
  },
  heroStatus: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  heroFooter: {
    marginTop: 20,
    zIndex: 1,
  },
  heroProgressBg: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  nextScanText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: AppSpacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.lg,
    marginBottom: AppSpacing.md,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    color: AppColors.accentVioletLight,
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: AppSpacing.lg,
    gap: 16,
  },
  actionCard: {
    width: 110,
    height: 130,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },
  actionCardInactive: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: '#FFF',
  },
  iconInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  actionTextActive: {
    color: '#FFF',
  },
  taskProgressBadge: {
    backgroundColor: 'rgba(123, 94, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  taskProgressText: {
    color: AppColors.accentVioletLight,
    fontSize: 12,
    fontWeight: '700',
  },
  tasksContainer: {
    paddingHorizontal: AppSpacing.lg,
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 20,
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: AppColors.textTertiary,
  },
  taskTime: {
    color: AppColors.textTertiary,
    fontSize: 13,
  },
  checkButton: {
    padding: 4,
  },
  reportCard: {
    padding: 20,
    borderRadius: 24,
    marginHorizontal: AppSpacing.lg,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(201, 169, 110, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  reportDesc: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  metricCard: {
    width: 140,
    padding: 16,
    borderRadius: 20,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  metricLabel: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  metricValue: {
    color: AppColors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  metricUnit: {
    color: AppColors.textTertiary,
    fontSize: 14,
    marginLeft: 4,
    marginBottom: 4,
  },
  metricTrend: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendUp: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  trendDown: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
  },
  metricTrendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trendUpText: {
    color: '#4ADE80',
  },
  trendDownText: {
    color: '#FF3366',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: height * 0.3,
    left: AppSpacing.xl,
    right: AppSpacing.xl,
    zIndex: 100,
    elevation: 100,
  },
  celebrationGradient: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#7B5EF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  celebrationText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
