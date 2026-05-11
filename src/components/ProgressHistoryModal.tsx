import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, TrendingUp, TrendingDown, Minus, Calendar, Award, Flame } from 'lucide-react-native';
import { AppColors, AppRadii, AppSpacing } from '../theme/colors';
import { MockData } from '../services/mockData';

interface Props { visible: boolean; onClose: () => void; }

const W = Dimensions.get('window').width - 32 - AppSpacing.md * 2;
const BAR_MAX_H = 100;

const HISTORY = [
  { month: 'Ara', score: 64 },
  { month: 'Oca', score: 68 },
  { month: 'Şub', score: 71 },
  { month: 'Mar', score: 69 },
  { month: 'Nis', score: 76 },
  { month: 'May', score: 84 },
];

const METRIC_CHANGES = [
  { label: 'Nemlendirme', prev: 65, curr: 78,  icon: TrendingUp,   color: '#4FC3F7' },
  { label: 'Gözenek',     prev: 60, curr: 62,  icon: TrendingUp,   color: '#7B5EF6' },
  { label: 'Elastikiyet', prev: 80, curr: 91,  icon: TrendingUp,   color: '#C9A96E' },
  { label: 'Ton Eşitliği',prev: 75, curr: 73,  icon: TrendingDown, color: '#FF6B9D' },
  { label: 'Parlaklık',   prev: 72, curr: 88,  icon: TrendingUp,   color: '#7B5EF6' },
];

export const ProgressHistoryModal: React.FC<Props> = ({ visible, onClose }) => {
  const [tab, setTab] = useState<'chart'|'metrics'|'streak'>('chart');
  const { monthlyProgress } = MockData;
  const maxScore = Math.max(...HISTORY.map(h => h.score));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={st.overlay}>
        <View style={st.sheet}>
          <View style={st.header}>
            <Text style={st.title}>İlerleme Geçmişi</Text>
            <Pressable onPress={onClose} style={st.closeBtn}>
              <X size={20} color={AppColors.textSecondary} />
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={st.tabs}>
            {([['chart','📊 Grafik'],['metrics','📈 Metrikler'],['streak','🔥 Seri']] as [typeof tab, string][]).map(([id,label]) => (
              <Pressable key={id} onPress={() => setTab(id)} style={[st.tab, tab === id && st.tabActive]}>
                <Text style={[st.tabText, tab === id && st.tabTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* ── CHART TAB ─────────────────────────────── */}
            {tab === 'chart' && (
              <View>
                <Text style={st.sectionTitle}>6 AYLIK CİLT SKORU</Text>
                {/* Bar Chart */}
                <View style={st.chartWrap}>
                  {HISTORY.map((h, i) => {
                    const barH = (h.score / maxScore) * BAR_MAX_H;
                    const isLast = i === HISTORY.length - 1;
                    return (
                      <View key={i} style={st.barCol}>
                        <Text style={[st.barValue, isLast && { color: AppColors.accentViolet }]}>{h.score}</Text>
                        <View style={st.barTrack}>
                          <LinearGradient
                            colors={isLast ? ['#7B5EF6','#4A3899'] : ['rgba(123,94,246,0.4)','rgba(74,56,153,0.2)']}
                            style={[st.bar, { height: barH }]}
                          />
                        </View>
                        <Text style={[st.barMonth, isLast && { color: AppColors.accentViolet, fontWeight: '700' }]}>{h.month}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Summary cards */}
                <View style={st.summaryRow}>
                  {[
                    { label: 'Başlangıç Skoru', value: '64',  color: AppColors.textTertiary },
                    { label: 'Mevcut Skor',      value: '84',  color: AppColors.accentViolet },
                    { label: 'Toplam Artış',     value: '+20', color: '#4FC3F7' },
                  ].map((s, i) => (
                    <View key={i} style={st.summaryCard}>
                      <Text style={[st.summaryVal, { color: s.color }]}>{s.value}</Text>
                      <Text style={st.summaryLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── METRICS TAB ───────────────────────────── */}
            {tab === 'metrics' && (
              <View>
                <Text style={st.sectionTitle}>METRİK DEĞİŞİMLERİ</Text>
                {METRIC_CHANGES.map(({ label, prev, curr, icon: Icon, color }, i) => {
                  const diff = curr - prev;
                  const pct = ((curr - prev) / prev * 100).toFixed(0);
                  const barW = (curr / 100) * (W - 48);
                  return (
                    <View key={i} style={st.metricCard}>
                      <View style={st.metricHeader}>
                        <View style={[st.metricIcon, { backgroundColor: color + '22' }]}>
                          <Icon size={16} color={color} />
                        </View>
                        <Text style={st.metricLabel}>{label}</Text>
                        <Text style={[st.metricDiff, { color: diff >= 0 ? '#4FC3F7' : '#FF6B9D' }]}>
                          {diff >= 0 ? '+' : ''}{diff} ({diff >= 0 ? '+' : ''}{pct}%)
                        </Text>
                      </View>
                      <View style={st.metricBarTrack}>
                        <View style={[st.metricBarFill, { width: barW, backgroundColor: color }]} />
                      </View>
                      <View style={st.metricFooter}>
                        <Text style={st.metricFooterText}>Önceki: {prev}</Text>
                        <Text style={st.metricFooterText}>Mevcut: {curr}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ── STREAK TAB ────────────────────────────── */}
            {tab === 'streak' && (
              <View>
                <Text style={st.sectionTitle}>GÜNLÜK SERİ</Text>
                {/* Big streak number */}
                <LinearGradient colors={['rgba(201,169,110,0.15)','rgba(13,15,26,0)']} style={st.streakHero}>
                  <View style={st.streakIconWrap}>
                    <Flame size={40} color={AppColors.accentGold} />
                  </View>
                  <Text style={st.streakBig}>{monthlyProgress.streakDays}</Text>
                  <Text style={st.streakLabel}>GÜN SERİSİ</Text>
                  <Text style={st.streakSub}>Harika gidiyorsunuz! Rutin uyumunuz mükemmel.</Text>
                </LinearGradient>

                {/* Week calendar */}
                <Text style={st.sectionTitle}>BU HAFTA</Text>
                <View style={st.weekRow}>
                  {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map((d, i) => {
                    const done = i < 5;
                    return (
                      <View key={i} style={[st.dayCell, done && st.dayCellDone]}>
                        <Text style={[st.dayText, done && st.dayTextDone]}>{d}</Text>
                        {done && <Flame size={12} color={AppColors.accentGold} />}
                      </View>
                    );
                  })}
                </View>

                {/* Milestones */}
                <Text style={st.sectionTitle}>BAŞARILAR</Text>
                {[
                  { label: '7 Gün Seri',  done: true,  icon: Award },
                  { label: '14 Gün Seri', done: true,  icon: Award },
                  { label: '30 Gün Seri', done: false, icon: Award },
                  { label: '60 Gün Seri', done: false, icon: Award },
                ].map(({ label, done, icon: Icon }, i) => (
                  <View key={i} style={[st.milestone, done && st.milestoneDone]}>
                    <View style={[st.milestoneIcon, { backgroundColor: done ? 'rgba(201,169,110,0.2)' : 'rgba(255,255,255,0.05)' }]}>
                      <Icon size={18} color={done ? AppColors.accentGold : AppColors.textTertiary} />
                    </View>
                    <Text style={[st.milestoneText, { color: done ? AppColors.textPrimary : AppColors.textTertiary }]}>{label}</Text>
                    {done && <Text style={st.milestoneBadge}>✓ Kazanıldı</Text>}
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const st = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:          { backgroundColor: AppColors.bgCardElevated, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', paddingHorizontal: AppSpacing.md, paddingTop: AppSpacing.md },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: AppSpacing.md },
  title:          { color: AppColors.textPrimary, fontSize: 18, fontWeight: '700' },
  closeBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: AppColors.bgCard, justifyContent: 'center', alignItems: 'center' },
  tabs:           { flexDirection: 'row', backgroundColor: AppColors.bgCard, borderRadius: AppRadii.md, padding: 4, marginBottom: AppSpacing.lg, gap: 4 },
  tab:            { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: AppRadii.sm },
  tabActive:      { backgroundColor: 'rgba(123,94,246,0.2)', borderWidth: 1, borderColor: AppColors.borderViolet },
  tabText:        { color: AppColors.textTertiary, fontSize: 11, fontWeight: '600' },
  tabTextActive:  { color: AppColors.accentViolet },
  sectionTitle:   { color: AppColors.textTertiary, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: AppSpacing.md },

  // Chart
  chartWrap:      { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: AppSpacing.lg, height: BAR_MAX_H + 50 },
  barCol:         { flex: 1, alignItems: 'center', gap: 6 },
  barTrack:       { width: 28, height: BAR_MAX_H, justifyContent: 'flex-end', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: AppRadii.sm, overflow: 'hidden' },
  bar:            { width: '100%', borderRadius: AppRadii.sm },
  barValue:       { color: AppColors.textSecondary, fontSize: 11, fontWeight: '700' },
  barMonth:       { color: AppColors.textTertiary, fontSize: 10 },
  summaryRow:     { flexDirection: 'row', gap: AppSpacing.sm, marginBottom: AppSpacing.lg },
  summaryCard:    { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: AppRadii.md, padding: AppSpacing.md, alignItems: 'center', borderWidth: 1, borderColor: AppColors.borderSubtle },
  summaryVal:     { fontSize: 20, fontWeight: '800' },
  summaryLabel:   { color: AppColors.textTertiary, fontSize: 10, marginTop: 4, textAlign: 'center' },

  // Metrics
  metricCard:     { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: AppRadii.md, padding: AppSpacing.md, marginBottom: AppSpacing.sm, borderWidth: 1, borderColor: AppColors.borderSubtle },
  metricHeader:   { flexDirection: 'row', alignItems: 'center', gap: AppSpacing.sm, marginBottom: 10 },
  metricIcon:     { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  metricLabel:    { flex: 1, color: AppColors.textPrimary, fontSize: 14, fontWeight: '600' },
  metricDiff:     { fontSize: 12, fontWeight: '700' },
  metricBarTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: AppRadii.full, overflow: 'hidden', marginBottom: 6 },
  metricBarFill:  { height: '100%', borderRadius: AppRadii.full },
  metricFooter:   { flexDirection: 'row', justifyContent: 'space-between' },
  metricFooterText:{ color: AppColors.textTertiary, fontSize: 11 },

  // Streak
  streakHero:     { borderRadius: AppRadii.xl, padding: AppSpacing.xl, alignItems: 'center', marginBottom: AppSpacing.lg },
  streakIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(201,169,110,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: AppSpacing.md },
  streakBig:      { color: AppColors.accentGold, fontSize: 64, fontWeight: '900', lineHeight: 68 },
  streakLabel:    { color: AppColors.textTertiary, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  streakSub:      { color: AppColors.textSecondary, fontSize: 13, textAlign: 'center' },
  weekRow:        { flexDirection: 'row', gap: 6, marginBottom: AppSpacing.lg },
  dayCell:        { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: AppRadii.sm, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: AppColors.borderSubtle },
  dayCellDone:    { backgroundColor: 'rgba(201,169,110,0.1)', borderColor: 'rgba(201,169,110,0.4)' },
  dayText:        { color: AppColors.textTertiary, fontSize: 10 },
  dayTextDone:    { color: AppColors.accentGold, fontWeight: '700' },
  milestone:      { flexDirection: 'row', alignItems: 'center', gap: AppSpacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: AppColors.borderSubtle },
  milestoneDone:  {},
  milestoneIcon:  { width: 36, height: 36, borderRadius: AppRadii.sm, justifyContent: 'center', alignItems: 'center' },
  milestoneText:  { flex: 1, fontSize: 14, fontWeight: '600' },
  milestoneBadge: { color: AppColors.accentGold, fontSize: 11, fontWeight: '700' },
});
