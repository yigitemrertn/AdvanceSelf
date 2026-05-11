import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, Calendar, TrendingUp, BarChart3, Star } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AppColors, AppSpacing, AppRadii } from '../../src/theme/colors';
import { GlassCard } from '../../src/components/GlassCard';

const { width } = Dimensions.get('window');

export default function MonthlySummary() {
  return (
    <View style={st.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={st.header}>
          <Pressable onPress={() => router.back()} style={st.backBtn}>
            <ChevronLeft size={24} color={AppColors.textPrimary} />
          </Pressable>
          <Text style={st.headerTitle}>Aylık Gelişim</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.delay(100)}>
            <GlassCard style={st.mainCard}>
              <View style={st.monthHeader}>
                <Calendar size={20} color={AppColors.accentViolet} />
                <Text style={st.monthName}>Mayıs 2024</Text>
              </View>
              <Text style={st.mainScore}>84</Text>
              <Text style={st.mainLabel}>Ortalama Cilt Skoru</Text>
            </GlassCard>
          </Animated.View>

          <View style={st.section}>
            <Text style={st.sectionTitle}>30 Günlük Değişim</Text>
            <GlassCard style={st.chartCard}>
              <View style={st.chartPlaceholder}>
                <BarChart3 size={48} color="rgba(123,94,246,0.3)" />
                <Text style={st.chartText}>Gelişim grafiği verileri işleniyor...</Text>
              </View>
            </GlassCard>
          </View>

          <View style={st.section}>
            <Text style={st.sectionTitle}>Aylık Başarılar</Text>
            <View style={st.achievementGrid}>
              <View style={st.achieveCard}>
                <Star size={24} color={AppColors.accentGold} />
                <Text style={st.achieveTitle}>İstikrar Şampiyonu</Text>
                <Text style={st.achieveDesc}>30 gün kesintisiz rutin.</Text>
              </View>
            </View>
          </View>

          <View style={st.section}>
            <Text style={st.sectionTitle}>Uzun Vadeli Tavsiye</Text>
            <GlassCard style={st.adviceCard}>
              <Text style={st.adviceText}>
                Geçtiğimiz aya göre nem oranınızı %22 oranında korumayı başardınız. Cildiniz artık retinol tedavisine tam uyum sağladı. Önümüzdeki ay anti-aging etkisini artırmak için peptit içeren serumları rutininize ekleyebiliriz.
              </Text>
            </GlassCard>
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
  mainCard: { padding: 32, alignItems: 'center', gap: 8 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  monthName: { color: AppColors.textSecondary, fontSize: 16, fontWeight: '600' },
  mainScore: { color: AppColors.accentGold, fontSize: 64, fontWeight: '900' },
  mainLabel: { color: AppColors.textTertiary, fontSize: 14, fontWeight: '600' },
  section: { gap: AppSpacing.md },
  sectionTitle: { color: AppColors.textPrimary, fontSize: 16, fontWeight: '700' },
  chartCard: { height: 200, justifyContent: 'center', alignItems: 'center' },
  chartPlaceholder: { alignItems: 'center', gap: 12 },
  chartText: { color: AppColors.textTertiary, fontSize: 12 },
  achievementGrid: { gap: 12 },
  achieveCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 24, alignItems: 'center', gap: 8 },
  achieveTitle: { color: AppColors.textPrimary, fontSize: 16, fontWeight: '700' },
  achieveDesc: { color: AppColors.textSecondary, fontSize: 12 },
  adviceCard: { padding: 20 },
  adviceText: { color: AppColors.textSecondary, fontSize: 14, lineHeight: 22 },
});
