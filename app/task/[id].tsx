import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Clock, Info, CheckCircle2, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useUserStore } from '../../src/store/userStore';
import { AppColors, AppSpacing, AppRadii } from '../../src/theme/colors';
import { GlassCard } from '../../src/components/GlassCard';

const { width } = Dimensions.get('window');

export default function TaskDetail() {
  const { id } = useLocalSearchParams();
  const { tasks, toggleTask } = useUserStore();
  const task = tasks.find(t => t.id === id);

  if (!task) return null;

  return (
    <View style={st.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={st.header}>
          <Pressable onPress={() => router.back()} style={st.backBtn}>
            <ChevronLeft size={24} color={AppColors.textPrimary} />
          </Pressable>
          <Text style={st.headerTitle}>Görev Detayı</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.delay(100)}>
            <GlassCard style={st.mainCard}>
              <View style={st.catBadge}>
                <Text style={st.catText}>{task.category.toUpperCase()}</Text>
              </View>
              <Text style={st.title}>{task.title}</Text>
              <View style={st.timeRow}>
                <Clock size={16} color={AppColors.textTertiary} />
                <Text style={st.timeText}>{task.time}</Text>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)} style={st.section}>
            <View style={st.sectionHeader}>
              <Info size={18} color={AppColors.accentViolet} />
              <Text style={st.sectionTitle}>Nasıl Uygulanır?</Text>
            </View>
            <GlassCard style={st.contentCard}>
              <Text style={st.description}>{task.description}</Text>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)} style={st.section}>
            <View style={st.sectionHeader}>
              <AlertCircle size={18} color={AppColors.accentGold} />
              <Text style={st.sectionTitle}>Önemli İpuçları</Text>
            </View>
            <View style={st.tipRow}>
              <View style={st.tipDot} />
              <Text style={st.tipText}>Uygulama öncesi cildinizin tamamen temiz olduğundan emin olun.</Text>
            </View>
            <View style={st.tipRow}>
              <View style={st.tipDot} />
              <Text style={st.tipText}>Ürünü dairesel hareketlerle masaj yaparak yedirin.</Text>
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={st.footer}>
          <Pressable 
            onPress={() => {
              if (!task.completed) {
                toggleTask(task.id);
                router.back();
              }
            }}
            disabled={task.completed}
            style={[st.completeBtn, task.completed && st.disabledBtn]}
          >
            <LinearGradient
              colors={task.completed ? ['#333', '#222'] : ['#7B5EF6', '#5B3FD0']}
              style={st.btnGradient}
            >
              <CheckCircle2 size={20} color="#FFF" />
              <Text style={st.btnText}>{task.completed ? 'TAMAMLANDI' : 'TAMAMLA'}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: AppSpacing.md, paddingTop: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: AppColors.textPrimary, fontSize: 18, fontWeight: '700' },
  scroll: { padding: AppSpacing.lg, maxWidth: 600, alignSelf: 'center', width: '100%' },
  mainCard: { padding: 24, alignItems: 'center', gap: 12 },
  catBadge: { backgroundColor: 'rgba(123,94,246,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: AppRadii.full },
  catText: { color: AppColors.accentVioletLight, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: AppColors.textPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { color: AppColors.textTertiary, fontSize: 14, fontWeight: '600' },
  section: { marginTop: AppSpacing.xl, gap: AppSpacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: AppColors.textPrimary, fontSize: 16, fontWeight: '700' },
  contentCard: { padding: 20 },
  description: { color: AppColors.textSecondary, fontSize: 15, lineHeight: 24 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: AppColors.accentGold, marginTop: 8 },
  tipText: { color: AppColors.textSecondary, fontSize: 14, flex: 1, lineHeight: 20 },
  footer: { padding: AppSpacing.lg, backgroundColor: AppColors.bgPrimary },
  completeBtn: { borderRadius: AppRadii.lg, overflow: 'hidden' },
  disabledBtn: { opacity: 0.5 },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
