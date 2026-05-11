import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, TrendingUp, Droplets, Sparkles, Award } from 'lucide-react-native';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { AppColors, AppSpacing, AppRadii } from '../../src/theme/colors';
import { GlassCard } from '../../src/components/GlassCard';

const { width } = Dimensions.get('window');

export default function WeeklySummary() {
  return (
    <View style={st.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={st.header}>
          <Pressable onPress={() => router.back()} style={st.backBtn}>
            <ChevronLeft size={24} color={AppColors.textPrimary} />
          </Pressable>
          <Text style={st.headerTitle}>Haftalık Özet</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.delay(100)}>
            <LinearGradient colors={['#7B5EF6', '#5B3FD0']} style={st.heroCard}>
              <Text style={st.heroLabel}>Haftalık Skor Artışı</Text>
              <Text style={st.heroValue}>+12%</Text>
              <Text style={st.heroSub}>Harika bir ilerleme kaydettiniz!</Text>
            </LinearGradient>
          </Animated.View>

          <View style={st.section}>
            <Text style={st.sectionTitle}>Öne Çıkan Metrikler</Text>
            <View style={st.metricsGrid}>
              <GlassCard style={st.metricCard}>
                <Droplets size={20} color="#4FC3F7" />
                <Text style={st.metricLabel}>Nemlilik</Text>
                <Text style={st.metricValue}>%78</Text>
                <Text style={st.metricTrend}>+5%</Text>
              </GlassCard>
              <GlassCard style={st.metricCard}>
                <Sparkles size={20} color={AppColors.accentGold} />
                <Text style={st.metricLabel}>Parlaklık</Text>
                <Text style={st.metricValue}>%84</Text>
                <Text style={st.metricTrend}>+8%</Text>
              </GlassCard>
            </View>
          </View>

          <View style={st.section}>
            <Text style={st.sectionTitle}>Yapay Zeka Analizi</Text>
            <GlassCard style={st.aiCard}>
              <Text style={st.aiText}>
                Bu hafta rutinlerinize %90 sadık kaldınız. C vitaminini sabahları düzenli kullanmanız, cilt tonunuzdaki eşitsizliği gözle görülür şekilde azalttı. Gelecek hafta gözenek sıkılaştırmaya odaklanacağız.
              </Text>
            </GlassCard>
          </View>

          <View style={st.section}>
            <Text style={st.sectionTitle}>Kazanılan Rozetler</Text>
            <View style={st.badgeRow}>
              <View style={st.badge}>
                <Award size={32} color={AppColors.accentGold} />
                <Text style={st.badgeLabel}>7 Gün Seri</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: AppSpacing.md, paddingTop: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: AppColors.textPrimary, fontSize: 18, fontWeight: '700' },
  scroll: { padding: AppSpacing.lg, gap: AppSpacing.xl, maxWidth: 600, alignSelf: 'center', width: '100%' },
  heroCard: { padding: 24, borderRadius: 24, alignItems: 'center', gap: 8 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  heroValue: { color: '#FFF', fontSize: 48, fontWeight: '900' },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500' },
  section: { gap: AppSpacing.md },
  sectionTitle: { color: AppColors.textPrimary, fontSize: 16, fontWeight: '700' },
  metricsGrid: { flexDirection: 'row', gap: 12 },
  metricCard: { flex: 1, padding: 16, gap: 4, alignItems: 'center' },
  metricLabel: { color: AppColors.textTertiary, fontSize: 12 },
  metricValue: { color: AppColors.textPrimary, fontSize: 20, fontWeight: '800' },
  metricTrend: { color: '#4ADE80', fontSize: 12, fontWeight: '700' },
  aiCard: { padding: 20 },
  aiText: { color: AppColors.textSecondary, fontSize: 14, lineHeight: 22 },
  badgeRow: { flexDirection: 'row', gap: AppSpacing.md },
  badge: { alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 20, width: 100 },
  badgeLabel: { color: AppColors.textTertiary, fontSize: 10, textAlign: 'center', fontWeight: '700' },
});
