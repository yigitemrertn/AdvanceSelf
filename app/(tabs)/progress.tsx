import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Animated, { FadeInUp, SlideInDown, SlideInRight } from 'react-native-reanimated';
import { Calendar, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import Svg, { Path, Circle as SVGCircle, Defs, LinearGradient as SVGLinearGradient, Stop } from 'react-native-svg';

import { AppColors, AppRadii, AppSpacing } from '../../src/theme/colors';
import { GlassCard } from '../../src/components/GlassCard';
import { api } from '../../src/services/api';
import { useUserStore } from '../../src/store/userStore';
import { ActivityIndicator } from 'react-native';

export default function ProgressScreen() {
  const { userId } = useUserStore();
  const [loading, setLoading] = React.useState(true);
  const [historicalScores, setHistoricalScores] = React.useState<any[]>([]);
  const [metricChanges, setMetricChanges] = React.useState<any[]>([]);

  const [currentOverall, setCurrentOverall] = React.useState<number>(0);

  React.useEffect(() => {
    if (userId) {
      Promise.all([
        api.progress.getHistory(userId).catch(() => ({ items: [] })),
        api.analysis.getLatest(userId).catch(() => null)
      ]).then(([historyRes, latestAn]) => {
        
        // 1. Set real overall score
        if (latestAn?.facial_proportions?.overall_attractiveness_score) {
          setCurrentOverall(Math.round(latestAn.facial_proportions.overall_attractiveness_score));
        }

        // 2. Build localizable map for backend keys -> UI Labels
        const labelsMap: Record<string, string> = {
          symmetry_score: "Yüz Simetrisi",
          eye_score: "Göz Orantısı",
          nose_score: "Burun Yapısı",
          lip_score: "Dudak Dolgunluğu",
          jawline_score: "Çene Hattı Keskinliği",
          face_shape_ratio: "Yüz Şekli İndeksi"
        };

        // 3. Populate broken down current metrics from latest analysis
        if (latestAn?.facial_proportions) {
          const props = latestAn.facial_proportions;
          const mappedChanges = Object.keys(props)
            .filter(k => k !== 'source' && k !== 'landmark_count' && k !== 'overall_attractiveness_score')
            .map(k => {
              let val = props[k];
              // Normalize face_shape_ratio to percentile for display if needed, otherwise render directly.
              const isRatio = k === 'face_shape_ratio';
              return {
                id: k,
                label: labelsMap[k] || k.replace(/_/g, ' '),
                current: isRatio ? Math.round(val * 100) : Math.round(val),
                // Placeholder delta until multi history comparison is ready
                change: 0, 
                previous: isRatio ? Math.round(val * 100) : Math.round(val)
              };
            });
          setMetricChanges(mappedChanges);
        }

        // 4. Map historical graph data (overall attractiveness over time)
        // If backend didn't populate history with real score, simulate from weight or fallback
        if (historyRes?.items && historyRes.items.length > 0) {
          const mappedScores = historyRes.items.map((item: any, idx: number) => ({
            day: idx + 1,
            score: latestAn?.facial_proportions?.overall_attractiveness_score || 75
          }));
          setHistoricalScores(mappedScores);
        }
        
        setLoading(false);
      }).catch(e => {
        console.error(e);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.accentViolet} />
      </View>
    );
  }

  // Graceful fallback if no history
  if (historicalScores.length === 0) {
    historicalScores.push({ day: 1, score: currentOverall || 70 }, { day: 2, score: currentOverall || 70 });
  }

  // Çizgi Grafik Hesaplamaları (Basit Spline Simülasyonu)
  const CHART_WIDTH = 300;
  const CHART_HEIGHT = 150;
  const minScore = Math.min(...historicalScores.map(s => s.score)) - 5;
  const maxScore = Math.max(...historicalScores.map(s => s.score)) + 5;
  const range = maxScore - minScore;

  const points = historicalScores.map((data, index) => {
    const x = (index / (historicalScores.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((data.score - minScore) / range) * CHART_HEIGHT;
    return { x, y, value: data.score, day: data.day };
  });

  const pathD = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (point.x - prev.x) * 0.5;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) * 0.5;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, '');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.headerTitle}>İLERLEME</Text>
          <Text style={styles.headerSubtitle}>Tüm Zamanların Cilt Gelişiminiz</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Streak Card */}
          <Animated.View entering={SlideInDown.delay(200)} style={styles.section}>
            <GlassCard showGlow glowColor={AppColors.accentGold}>
              <View style={styles.streakRow}>
                <View style={styles.streakIconBox}>
                  <Flame size={28} color={AppColors.accentGold} />
                </View>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakTitle}>Analizlerinizi Sürdürün!</Text>
                  <Text style={styles.streakDesc}>Gelişimi görmek için her hafta analiz yapın.</Text>
                </View>
                <Calendar size={24} color={AppColors.textTertiary} />
              </View>
            </GlassCard>
          </Animated.View>

          {/* Monthly Chart */}
          <Animated.View entering={SlideInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>CİLT SKORU (AYLIK)</Text>
            <GlassCard style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Genel Performans</Text>
                <Text style={styles.chartCurrentScore}>
                  {historicalScores[historicalScores.length - 1].score} <Text style={{fontSize: 14, color: AppColors.textTertiary}}>/100</Text>
                </Text>
              </View>

              <View style={styles.svgContainer}>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 30}>
                  <Defs>
                    <SVGLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={AppColors.accentViolet} stopOpacity="0.5" />
                      <Stop offset="1" stopColor={AppColors.accentViolet} stopOpacity="0" />
                    </SVGLinearGradient>
                  </Defs>
                  {/* Fill Area */}
                  <Path d={`${pathD} L ${CHART_WIDTH},${CHART_HEIGHT} L 0,${CHART_HEIGHT} Z`} fill="url(#grad)" />
                  {/* Line */}
                  <Path d={pathD} fill="none" stroke={AppColors.accentVioletLight} strokeWidth="3" />
                  {/* Points */}
                  {points.map((p, i) => (
                    <React.Fragment key={i}>
                      <SVGCircle cx={p.x} cy={p.y} r="4" fill={AppColors.bgPrimary} stroke={AppColors.accentVioletLight} strokeWidth="2" />
                    </React.Fragment>
                  ))}
                </Svg>
                
                {/* X-Axis Labels */}
                <View style={styles.xAxis}>
                  {points.map((p, i) => (
                    <Text key={i} style={[styles.xLabel, { left: p.x - 10 }]}>{p.day}</Text>
                  ))}
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Metric Breakdowns */}
          <Animated.View entering={SlideInDown.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>METRİK KIRILIMLARI (Geçen Aya Göre)</Text>
            
            <View style={styles.metricsContainer}>
              {metricChanges.map((metric, index) => {
                const isPositive = metric.change > 0;
                const isNegative = metric.change < 0;
                const isNeutral = metric.change === 0;
                
                return (
                  <Animated.View key={metric.id} entering={SlideInRight.delay(400 + index * 100)}>
                    <GlassCard style={styles.metricCard}>
                      <View style={styles.metricHeaderRow}>
                        <Text style={styles.metricLabel}>{metric.label}</Text>
                        <View style={styles.changeBadge}>
                          {isPositive && <TrendingUp size={14} color={AppColors.statusSuccess} />}
                          {isNegative && <TrendingDown size={14} color={AppColors.statusError} />}
                          {isNeutral && <Minus size={14} color={AppColors.textTertiary} />}
                          <Text style={[
                            styles.changeText, 
                            isPositive && { color: AppColors.statusSuccess },
                            isNegative && { color: AppColors.statusError },
                          ]}>
                            {isPositive ? '+' : ''}{metric.change}%
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar for metric */}
                      <View style={styles.metricBarTrack}>
                        <Animated.View style={[styles.metricBarFill, { width: `${metric.current}%` }]} />
                      </View>
                      <View style={styles.metricValuesRow}>
                        <Text style={styles.metricScoreText}>{metric.current}/100</Text>
                        <Text style={styles.metricPrevText}>Önceki: {metric.previous}</Text>
                      </View>
                    </GlassCard>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

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
    paddingTop: AppSpacing.md,
    paddingBottom: AppSpacing.md,
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
    marginTop: 6,
  },
  scrollContent: {
    paddingHorizontal: AppSpacing.lg,
    paddingBottom: AppSpacing.xxl,
  },
  section: {
    marginTop: AppSpacing.lg,
  },
  sectionTitle: {
    color: AppColors.textTertiary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: AppSpacing.sm,
    marginLeft: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppSpacing.sm,
  },
  streakIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(201, 169, 110, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: AppSpacing.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    color: AppColors.accentGold,
    fontSize: 18,
    fontWeight: '700',
  },
  streakDesc: {
    color: AppColors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  chartCard: {
    padding: AppSpacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: AppSpacing.xl,
  },
  chartTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  chartCurrentScore: {
    color: AppColors.accentVioletLight,
    fontSize: 28,
    fontWeight: '800',
  },
  svgContainer: {
    alignItems: 'center',
    height: 180,
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    width: 300,
    height: 20,
  },
  xLabel: {
    position: 'absolute',
    color: AppColors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  metricsContainer: {
    gap: AppSpacing.md,
  },
  metricCard: {
    padding: AppSpacing.md,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppSpacing.md,
  },
  metricLabel: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppRadii.xs,
    gap: 4,
  },
  changeText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  metricBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: AppRadii.full,
    overflow: 'hidden',
    marginBottom: AppSpacing.sm,
  },
  metricBarFill: {
    height: '100%',
    backgroundColor: AppColors.accentViolet,
    borderRadius: AppRadii.full,
  },
  metricValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricScoreText: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  metricPrevText: {
    color: AppColors.textTertiary,
    fontSize: 12,
  },
});
