import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  Pressable, Modal, Alert,
} from 'react-native';
import Animated, {
  FadeInUp, SlideInRight,
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import {
  CheckCircle2, Clock, Info, ChevronRight, X,
  Droplets, Aperture, Palette, Moon, Sun, Eye, Star,
  TrendingUp, Flame, AlertCircle, BookOpen, Zap,
} from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, AppRadii, AppSpacing } from '../../src/theme/colors';
import { MockData, RecommendationCategory, Recommendation } from '../../src/services/mockData';
import { GlassCard } from '../../src/components/GlassCard';

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTERS: { id: RecommendationCategory; label: string; icon: any }[] = [
  { id: 'all',       label: 'Tümü',        icon: Star     },
  { id: 'hydration', label: 'Nemlendirme', icon: Droplets },
  { id: 'pore',      label: 'Gözenek',     icon: Aperture },
  { id: 'routine',   label: 'Rutin',       icon: Moon     },
  { id: 'makeup',    label: 'Makyaj',      icon: Palette  },
];

// ─── AI reason map ────────────────────────────────────────────────────────────
const AI_REASONS: Record<string, string> = {
  rec_001: 'Ton eşitliği puanınız 73/100. C vitamini bu skoru +8 puan artırabilir.',
  rec_002: 'Gözenek sıkılığınız son haftada stabil. Kil maskesi ilerlemeyi hızlandırır.',
  rec_003: 'Mevcut cilt tipiniz (Kombine) için bu fondöten formülü optimize edildi.',
  rec_004: 'Elastikiyet skoru 91 — retinol ile bu rekoru koruyabilirsiniz.',
  rec_005: 'Nemlendirme skoru 78. Hedef: 85+. Hiyalüronik asit en hızlı yol.',
  rec_006: 'UV maruziyeti yaşlanmayı %80 hızlandırır. SPF 50+ kritik öncelik.',
  rec_007: 'Son analizde göz çevresi skoru 61/100 olarak belirlendi.',
  rec_008: 'BHA gözenek içi yağ birikimini çözer. Haftalık 3x uygulama önerilir.',
};

const TIMES: Record<string, string> = {
  rec_001: '1 dk', rec_002: '15 dk', rec_003: '3 dk',
  rec_004: '2 dk', rec_005: '1 dk', rec_006: '1 dk',
  rec_007: '2 dk', rec_008: '5 dk',
};

const STEPS: Record<string, string[]> = {
  rec_001: ['Yüzünüzü temizleyin', 'Birkaç damla C vitamini serumu alın', 'Nazikçe masaj yaparak uygulayın', 'Güneş kremi ile kilitleyin'],
  rec_002: ['Yüzünüzü ıslatın', 'Kil maskesini ince tabaka halinde sürün', '10-15 dakika bekleyin', 'Soğuk suyla durulayın'],
  rec_003: ['Nemlendiricini uygula', 'Fondöteni süngerle uygula', 'Alın ve T-bölgesinde ince kat bırak'],
  rec_004: ['Gece rutininin son adımı olarak uygula', 'Bezelye tanesi kadar kullan', 'Göz çevresine sürme'],
  rec_005: ['Temiz cilde uygula', 'Nemliyken kullan (en etkili yol)', 'Nemlendiricin ile kilitle'],
  rec_006: ['Sabah rutinenin son adımı', 'Yüz + boyun + ellere uygula', 'Her 2 saatte bir yenile'],
  rec_007: ['Göz kremini parmak ucuyla al', 'Göz altına nazikçe vur vur uygula', 'Sabah & akşam kullan'],
  rec_008: ['Yüzünüzü temizleyin', 'Pamukla BHA tonik uygulayın', '10 dakika bekleyin', 'Nemlendirici uygulayın'],
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal: React.FC<{
  rec: Recommendation | null;
  onClose: () => void;
  onComplete: (id: string) => void;
}> = ({ rec, onClose, onComplete }) => {
  if (!rec) return null;
  const Icon = (LucideIcons as any)[rec.iconName] || Star;
  const prioColors: Record<string, string> = { high: AppColors.accentViolet, medium: AppColors.accentGold, low: AppColors.textTertiary };
  const color = prioColors[rec.priority];
  const steps = STEPS[rec.id] || [];
  const reason = AI_REASONS[rec.id] || '';
  const time = TIMES[rec.id] || '2 dk';

  return (
    <Modal visible={!!rec} animationType="slide" transparent>
      <View style={st.overlay}>
        <View style={st.detailSheet}>
          {/* Header */}
          <View style={st.detailTop}>
            <LinearGradient colors={[color + '30', 'transparent']} style={st.detailTopBg} />
            <View style={[st.detailIconBig, { backgroundColor: color + '25' }]}>
              <Icon size={32} color={color} />
            </View>
            <Pressable onPress={onClose} style={st.closeBtn}><X size={20} color={AppColors.textSecondary} /></Pressable>
          </View>

          <ScrollView style={{ padding: AppSpacing.md }} showsVerticalScrollIndicator={false}>
            <View style={st.prioRow}>
              <View style={[st.prioBadge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
                <Text style={[st.prioText, { color }]}>
                  {rec.priority === 'high' ? '🔴 Yüksek Öncelik' : rec.priority === 'medium' ? '🟡 Orta Öncelik' : '🟢 Düşük Öncelik'}
                </Text>
              </View>
              <View style={st.timeChip}>
                <Clock size={12} color={AppColors.textTertiary} />
                <Text style={st.timeText}>{time}</Text>
              </View>
            </View>

            <Text style={st.detailTitle}>{rec.title}</Text>
            <Text style={st.detailDesc}>{rec.description}</Text>

            {/* AI Analysis box */}
            <View style={st.aiBox}>
              <View style={st.aiBoxHeader}>
                <Zap size={14} color={AppColors.accentViolet} />
                <Text style={st.aiBoxTitle}>AI Analizi</Text>
              </View>
              <Text style={st.aiBoxText}>{reason}</Text>
            </View>

            {/* Steps */}
            {steps.length > 0 && (
              <>
                <View style={st.stepsHeader}>
                  <BookOpen size={14} color={AppColors.accentGold} />
                  <Text style={st.stepsTitle}>Uygulama Adımları</Text>
                </View>
                {steps.map((s, i) => (
                  <View key={i} style={st.stepRow}>
                    <View style={st.stepNum}><Text style={st.stepNumText}>{i + 1}</Text></View>
                    <Text style={st.stepText}>{s}</Text>
                  </View>
                ))}
              </>
            )}

            {/* CTA */}
            {!rec.completedToday && (
              <Pressable onPress={() => { onComplete(rec.id); onClose(); }} style={st.completeCta}>
                <LinearGradient colors={['#7B5EF6', '#5B3FD0']} style={st.completeCtaGradient}>
                  <CheckCircle2 size={18} color="#FFF" />
                  <Text style={st.completeCtaText}>Tamamlandı Olarak İşaretle</Text>
                </LinearGradient>
              </Pressable>
            )}
            {rec.completedToday && (
              <View style={st.doneBox}>
                <CheckCircle2 size={20} color={AppColors.accentGold} />
                <Text style={st.doneText}>Bu öneri bugün tamamlandı!</Text>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RecommendationsScreen() {
  const [activeFilter, setActiveFilter] = useState<RecommendationCategory>('all');
  const [recs, setRecs] = useState(MockData.recommendations);
  const [selected, setSelected] = useState<Recommendation | null>(null);

  const filtered = activeFilter === 'all' ? recs : recs.filter(r => r.category === activeFilter);
  const total = recs.length;
  const completed = recs.filter(r => r.completedToday).length;
  const pct = Math.round((completed / total) * 100);

  const progressWidth = useSharedValue(0);
  React.useEffect(() => {
    progressWidth.value = withTiming(pct, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [pct]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value}%` as any }));

  const markDone = (id: string) => {
    setRecs(prev => prev.map(r => r.id === id ? { ...r, completedToday: true } : r));
  };

  const prioColor = (p: string) =>
    p === 'high' ? AppColors.accentViolet : p === 'medium' ? AppColors.accentGold : AppColors.textTertiary;

  const catLabel = (c: string) => FILTERS.find(f => f.id === c)?.label || c;

  return (
    <View style={st.container}>
      <View style={[st.blob, st.blobTop]} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ 
            paddingBottom: 120, 
            maxWidth: 600, 
            alignSelf: 'center', 
            width: '100%' 
          }}
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(80)} style={[st.header, { paddingTop: 60 }]}>
            <View>
              <Text style={st.headerTitle}>GÜNLÜK ÖNERİLER</Text>
              <Text style={st.headerSub}>Yapay Zeka Destekli Rutin Planınız</Text>
            </View>
            <View style={st.headerBadge}>
              <Flame size={14} color={AppColors.accentGold} />
              <Text style={st.headerBadgeText}>14 gün</Text>
            </View>
          </Animated.View>

        {/* Progress card */}
        <Animated.View entering={FadeInUp.delay(150)} style={st.progressCard}>
          <View style={st.progressTop}>
            <View>
              <Text style={st.progressLabel}>Günlük İlerleme</Text>
              <Text style={st.progressSub}>{completed}/{total} tamamlandı</Text>
            </View>
            <Text style={st.progressPct}>{pct}%</Text>
          </View>
          <View style={st.progressTrack}>
            <Animated.View style={[st.progressFill, progressStyle]} />
          </View>
          {/* Mini stat row */}
          <View style={st.miniStats}>
            {[
              { label: 'Nemlendirme', val: '78%', color: '#4FC3F7' },
              { label: 'Gözenek',     val: '62%', color: AppColors.accentViolet },
              { label: 'Ton Eşitliği',val: '73%', color: AppColors.accentGold  },
              { label: 'Parlaklık',   val: '88%', color: '#FF6B9D'              },
            ].map((s, i) => (
              <View key={i} style={st.miniStat}>
                <Text style={[st.miniStatVal, { color: s.color }]}>{s.val}</Text>
                <Text style={st.miniStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.filtersRow} 
          style={{ marginBottom: AppSpacing.md, flexGrow: 0 }}
        >
          {FILTERS.map(f => {
            const active = activeFilter === f.id;
            const FIcon = f.icon;
            return (
              <Pressable key={f.id} onPress={() => setActiveFilter(f.id)}>
                <LinearGradient
                  colors={active ? ['#7B5EF6', '#5B3FD0'] : [AppColors.bgCard, AppColors.bgCard]}
                  style={[st.filterBtn, !active && st.filterInactive]}
                >
                  <FIcon size={13} color={active ? '#FFF' : AppColors.textSecondary} />
                  <Text style={[st.filterText, active && { color: '#FFF', fontWeight: '700' }]}>{f.label}</Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* List */}
        <View style={st.list}>
          {filtered.map((rec, idx) => {
            const IconC = (LucideIcons as any)[rec.iconName];
            const color = prioColor(rec.priority);
            return (
              <Animated.View key={rec.id} entering={SlideInRight.delay(100 + idx * 80).springify()}>
                <GlassCard style={[st.card, rec.completedToday && st.cardDone]}>
                  {/* Card header */}
                  <View style={st.cardHead}>
                    <View style={[st.cardIconBox, { backgroundColor: color + '20' }]}>
                      {IconC && <IconC size={16} color={color} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[st.catText, { color }]}>{catLabel(rec.category).toUpperCase()}</Text>
                    </View>
                    {rec.completedToday ? (
                      <View style={st.doneBadge}>
                        <CheckCircle2 size={12} color={AppColors.bgPrimary} />
                        <Text style={st.doneBadgeText}>Yapıldı</Text>
                      </View>
                    ) : (
                      <View style={[st.prioBadgeSmall, { backgroundColor: color + '20' }]}>
                        <Text style={[st.prioBadgeSmallText, { color }]}>
                          {rec.priority === 'high' ? 'Yüksek' : rec.priority === 'medium' ? 'Orta' : 'Düşük'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[st.cardTitle, rec.completedToday && { color: AppColors.textTertiary }]}>
                    {rec.title}
                  </Text>
                  <Text style={[st.cardDesc, rec.completedToday && { color: AppColors.textTertiary }]}>
                    {rec.description}
                  </Text>

                  {/* Meta */}
                  <View style={st.metaBox}>
                    <View style={st.metaRow}>
                      <Info size={13} color={AppColors.accentViolet} />
                      <Text style={st.metaText}>{AI_REASONS[rec.id]}</Text>
                    </View>
                    <View style={[st.metaRow, { marginTop: 5 }]}>
                      <Clock size={13} color={AppColors.textTertiary} />
                      <Text style={st.metaText}>Tahmini süre: {TIMES[rec.id]}</Text>
                    </View>
                  </View>

                  {/* Buttons */}
                  <View style={st.btnRow}>
                    <Pressable onPress={() => setSelected(rec)} style={st.detailBtn}>
                      <BookOpen size={14} color={AppColors.textSecondary} />
                      <Text style={st.detailBtnText}>Detaylar</Text>
                    </Pressable>
                    {!rec.completedToday && (
                      <Pressable onPress={() => markDone(rec.id)} style={st.doneBtn}>
                        <LinearGradient colors={['#7B5EF6', '#5B3FD0']} style={st.doneBtnGrad}>
                          <CheckCircle2 size={14} color="#FFF" />
                          <Text style={st.doneBtnText}>Tamamla</Text>
                        </LinearGradient>
                      </Pressable>
                    )}
                  </View>
                </GlassCard>
              </Animated.View>
            );
          })}
        </View>
        </ScrollView>
      </SafeAreaView>

      <DetailModal rec={selected} onClose={() => setSelected(null)} onComplete={markDone} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  container:        { flex: 1, backgroundColor: AppColors.bgPrimary },
  blob:             { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.12 },
  blobTop:          { top: -100, right: -80, backgroundColor: AppColors.accentViolet },

  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: AppSpacing.lg, paddingTop: AppSpacing.md, marginBottom: AppSpacing.md },
  headerTitle:      { color: AppColors.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: 1.5 },
  headerSub:        { color: AppColors.textSecondary, fontSize: 12, marginTop: 3 },
  headerBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(201,169,110,0.15)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.35)', borderRadius: AppRadii.full, paddingHorizontal: 10, paddingVertical: 5 },
  headerBadgeText:  { color: AppColors.accentGold, fontSize: 12, fontWeight: '700' },

  progressCard:     { marginHorizontal: AppSpacing.lg, marginBottom: AppSpacing.md, backgroundColor: 'rgba(22,24,38,0.7)', borderRadius: AppRadii.xl, padding: AppSpacing.md, borderWidth: 1, borderColor: AppColors.borderSubtle },
  progressTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: AppSpacing.sm },
  progressLabel:    { color: AppColors.textPrimary, fontSize: 14, fontWeight: '700' },
  progressSub:      { color: AppColors.textTertiary, fontSize: 12, marginTop: 2 },
  progressPct:      { color: AppColors.accentGold, fontSize: 28, fontWeight: '900' },
  progressTrack:    { height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: AppRadii.full, overflow: 'hidden', marginBottom: AppSpacing.md },
  progressFill:     { height: '100%', backgroundColor: AppColors.accentGold, borderRadius: AppRadii.full },
  miniStats:        { flexDirection: 'row', justifyContent: 'space-between' },
  miniStat:         { alignItems: 'center' },
  miniStatVal:      { fontSize: 15, fontWeight: '800' },
  miniStatLabel:    { color: AppColors.textTertiary, fontSize: 9, marginTop: 2 },

  filtersRow:       { paddingHorizontal: AppSpacing.lg, gap: 8, paddingBottom: AppSpacing.md },
  filterBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: AppRadii.full },
  filterInactive:   { borderWidth: 1, borderColor: AppColors.borderSubtle },
  filterText:       { color: AppColors.textSecondary, fontSize: 13 },

  list:             { paddingHorizontal: AppSpacing.lg, gap: AppSpacing.md },
  card:             { gap: 6 },
  cardDone:         { opacity: 0.55 },
  cardHead:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardIconBox:      { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  catText:          { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  doneBadge:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: AppColors.accentGold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: AppRadii.xs },
  doneBadgeText:    { color: AppColors.bgPrimary, fontSize: 10, fontWeight: '700' },
  prioBadgeSmall:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: AppRadii.xs },
  prioBadgeSmallText:{ fontSize: 10, fontWeight: '700' },
  cardTitle:        { color: AppColors.textPrimary, fontSize: 16, fontWeight: '700' },
  cardDesc:         { color: AppColors.textSecondary, fontSize: 13, lineHeight: 18 },
  metaBox:          { backgroundColor: 'rgba(123,94,246,0.06)', borderRadius: AppRadii.sm, padding: AppSpacing.sm, borderWidth: 1, borderColor: 'rgba(123,94,246,0.15)' },
  metaRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  metaText:         { color: AppColors.textTertiary, fontSize: 12, flex: 1, lineHeight: 16 },
  btnRow:           { flexDirection: 'row', gap: 8, marginTop: 4 },
  detailBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: AppRadii.md, borderWidth: 1, borderColor: AppColors.borderSubtle, backgroundColor: 'rgba(255,255,255,0.03)' },
  detailBtnText:    { color: AppColors.textSecondary, fontSize: 13, fontWeight: '600' },
  doneBtn:          { flex: 2, borderRadius: AppRadii.md, overflow: 'hidden' },
  doneBtnGrad:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  doneBtnText:      { color: '#FFF', fontSize: 13, fontWeight: '700' },

  // Detail modal
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  detailSheet:      { backgroundColor: AppColors.bgCardElevated, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' },
  detailTop:        { height: 100, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  detailTopBg:      { ...StyleSheet.absoluteFillObject, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  detailIconBig:    { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  closeBtn:         { position: 'absolute', top: 14, right: 16, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  prioRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: AppSpacing.sm },
  prioBadge:        { borderRadius: AppRadii.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  prioText:         { fontSize: 12, fontWeight: '700' },
  timeChip:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: AppRadii.full, paddingHorizontal: 10, paddingVertical: 4 },
  timeText:         { color: AppColors.textTertiary, fontSize: 12 },
  detailTitle:      { color: AppColors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 6 },
  detailDesc:       { color: AppColors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: AppSpacing.md },
  aiBox:            { backgroundColor: 'rgba(123,94,246,0.08)', borderRadius: AppRadii.lg, padding: AppSpacing.md, borderWidth: 1, borderColor: 'rgba(123,94,246,0.2)', marginBottom: AppSpacing.lg },
  aiBoxHeader:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiBoxTitle:       { color: AppColors.accentVioletLight, fontSize: 13, fontWeight: '700' },
  aiBoxText:        { color: AppColors.textSecondary, fontSize: 13, lineHeight: 20 },
  stepsHeader:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: AppSpacing.md },
  stepsTitle:       { color: AppColors.accentGold, fontSize: 13, fontWeight: '700' },
  stepRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  stepNum:          { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(123,94,246,0.2)', justifyContent: 'center', alignItems: 'center' },
  stepNumText:      { color: AppColors.accentVioletLight, fontSize: 12, fontWeight: '800' },
  stepText:         { color: AppColors.textPrimary, fontSize: 14, flex: 1, lineHeight: 20 },
  completeCta:      { borderRadius: AppRadii.lg, overflow: 'hidden', marginTop: AppSpacing.lg },
  completeCtaGradient:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  completeCtaText:  { color: '#FFF', fontSize: 15, fontWeight: '800' },
  doneBox:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: AppSpacing.md, backgroundColor: 'rgba(201,169,110,0.1)', borderRadius: AppRadii.lg, marginTop: AppSpacing.lg, borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)' },
  doneText:         { color: AppColors.accentGold, fontSize: 14, fontWeight: '700' },
});
