import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Star, Check, Zap, Shield, Sparkles, Crown, ChevronRight } from 'lucide-react-native';
import { AppColors, AppRadii, AppSpacing } from '../theme/colors';

interface Props { visible: boolean; onClose: () => void; }

const FEATURES = [
  { icon: Sparkles, text: 'Sınırsız AI cilt analizi'           },
  { icon: Zap,      text: 'Anlık kişiselleştirilmiş öneriler'  },
  { icon: Shield,   text: 'Haftalık detaylı cilt raporu'       },
  { icon: Star,     text: 'Öncelikli müşteri desteği'          },
  { icon: Crown,    text: 'Özel içerik ve rutinler'            },
  { icon: Check,    text: 'Reklamsız deneyim'                  },
];

const PLANS = [
  { id: 'monthly',  label: 'Aylık',  price: '₺149', sub: '/ay',     badge: null,         colors: ['#1C1E2E','#1C1E2E'] as [string,string] },
  { id: 'yearly',   label: 'Yıllık', price: '₺999', sub: '/yıl',    badge: '%44 Tasarruf',colors: ['#7B5EF6','#4A3899'] as [string,string] },
  { id: 'lifetime', label: 'Ömür Boyu',price:'₺2499',sub:' tek seferlik',badge:'En İyi Değer',colors:['#C9A96E','#8A6F42'] as [string,string] },
];

export const PremiumModal: React.FC<Props> = ({ visible, onClose }) => {
  const [selected, setSelected] = React.useState('yearly');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={st.overlay}>
        <View style={st.sheet}>
          <View style={st.header}>
            <View>
              <Text style={st.title}>Premium'a Geç</Text>
              <Text style={st.subtitle}>Cildinizi AI ile dönüştürün</Text>
            </View>
            <Pressable onPress={onClose} style={st.closeBtn}>
              <X size={20} color={AppColors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Crown hero */}
            <LinearGradient colors={['rgba(123,94,246,0.15)','rgba(201,169,110,0.05)']} style={st.hero}>
              <View style={st.crownWrap}>
                <Crown size={40} color={AppColors.accentGold} />
              </View>
              <Text style={st.heroTitle}>LUMERA PRİMUM</Text>
              <Text style={st.heroSub}>Yapay zeka destekli kişisel cilt koçunuz</Text>
            </LinearGradient>

            {/* Features */}
            <Text style={st.sectionTitle}>NELER KAZANIRSINIZ?</Text>
            <View style={st.featureList}>
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <View key={i} style={st.featureRow}>
                  <View style={st.featureIcon}>
                    <Icon size={16} color={AppColors.accentVioletLight} />
                  </View>
                  <Text style={st.featureText}>{text}</Text>
                </View>
              ))}
            </View>

            {/* Plans */}
            <Text style={st.sectionTitle}>PLAN SEÇİN</Text>
            {PLANS.map(plan => (
              <Pressable key={plan.id} onPress={() => setSelected(plan.id)}>
                <LinearGradient
                  colors={selected === plan.id ? plan.colors : ['rgba(22,24,38,0.8)','rgba(22,24,38,0.8)']}
                  style={[st.planCard, selected === plan.id && st.planCardActive]}
                >
                  <View style={st.planLeft}>
                    <Text style={[st.planLabel, selected === plan.id && { color: '#FFF' }]}>{plan.label}</Text>
                    {plan.badge && (
                      <View style={st.planBadge}>
                        <Text style={st.planBadgeText}>{plan.badge}</Text>
                      </View>
                    )}
                  </View>
                  <View style={st.planRight}>
                    <Text style={[st.planPrice, selected === plan.id && { color: '#FFF' }]}>{plan.price}</Text>
                    <Text style={[st.planSub, selected === plan.id && { color: 'rgba(255,255,255,0.6)' }]}>{plan.sub}</Text>
                  </View>
                  {selected === plan.id && (
                    <View style={st.checkMark}><Check size={14} color="#FFF" /></View>
                  )}
                </LinearGradient>
              </Pressable>
            ))}

            {/* CTA */}
            <Pressable style={st.ctaBtn}>
              <LinearGradient colors={['#7B5EF6','#5B3FD0']} style={st.ctaGradient}>
                <Crown size={18} color="#FFF" />
                <Text style={st.ctaText}>Premium'u Başlat</Text>
                <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            </Pressable>
            <Text style={st.terms}>İstediğiniz zaman iptal edebilirsiniz. Gizlilik Politikası geçerlidir.</Text>
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
  header:         { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: AppSpacing.md },
  title:          { color: AppColors.textPrimary, fontSize: 20, fontWeight: '800' },
  subtitle:       { color: AppColors.textTertiary, fontSize: 13, marginTop: 2 },
  closeBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: AppColors.bgCard, justifyContent: 'center', alignItems: 'center' },
  hero:           { borderRadius: AppRadii.xl, padding: AppSpacing.lg, alignItems: 'center', marginBottom: AppSpacing.lg },
  crownWrap:      { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(201,169,110,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: AppSpacing.md },
  heroTitle:      { color: AppColors.accentGold, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  heroSub:        { color: AppColors.textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center' },
  sectionTitle:   { color: AppColors.textTertiary, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: AppSpacing.sm },
  featureList:    { marginBottom: AppSpacing.lg, gap: 10 },
  featureRow:     { flexDirection: 'row', alignItems: 'center', gap: AppSpacing.md },
  featureIcon:    { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(123,94,246,0.1)', justifyContent: 'center', alignItems: 'center' },
  featureText:    { color: AppColors.textPrimary, fontSize: 14, flex: 1 },
  planCard:       { borderRadius: AppRadii.lg, borderWidth: 1, borderColor: AppColors.borderSubtle, padding: AppSpacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: AppSpacing.sm },
  planCardActive: { borderColor: 'transparent' },
  planLeft:       { flex: 1 },
  planLabel:      { color: AppColors.textSecondary, fontSize: 15, fontWeight: '700' },
  planBadge:      { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: AppRadii.full, marginTop: 4, alignSelf: 'flex-start' },
  planBadgeText:  { color: '#FFF', fontSize: 10, fontWeight: '700' },
  planRight:      { alignItems: 'flex-end' },
  planPrice:      { color: AppColors.textSecondary, fontSize: 20, fontWeight: '800' },
  planSub:        { color: AppColors.textTertiary, fontSize: 11 },
  checkMark:      { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  ctaBtn:         { borderRadius: AppRadii.lg, overflow: 'hidden', marginTop: AppSpacing.md },
  ctaGradient:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  ctaText:        { color: '#FFF', fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center' },
  terms:          { color: AppColors.textTertiary, fontSize: 11, textAlign: 'center', marginTop: AppSpacing.md },
});
