import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable,
  TextInput, Alert, Modal, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User, Mail, Phone, Calendar, MapPin, Edit3, Camera, Trash2,
  Shield, Star, Award, TrendingUp, ChevronRight,
  Bell, LogOut, Heart, Droplets, Sparkles, Check, X, Crown,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { AppColors, AppRadii, AppSpacing } from '../../src/theme/colors';
import { GlassCard } from '../../src/components/GlassCard';
import { MockData } from '../../src/services/mockData';
import { NotificationSettingsModal } from '../../src/components/NotificationSettingsModal';
import { SecurityModal } from '../../src/components/SecurityModal';
import { PremiumModal } from '../../src/components/PremiumModal';
import { ProgressHistoryModal } from '../../src/components/ProgressHistoryModal';

const STORAGE_PHOTO_KEY = '@lumera_profile_photo';
const STORAGE_PROFILE_KEY = '@lumera_profile_data';

interface UserProfile {
  name: string; surname: string; email: string; phone: string;
  birthDate: string; location: string; skinType: string; bio: string;
}

const SKIN_TYPES = ['Normal', 'Yağlı', 'Kuru', 'Kombine', 'Hassas'];

const BADGES = [
  { id: '1', icon: Star,     label: 'Premium',     color: '#C9A96E' },
  { id: '2', icon: Award,    label: '14 Gün Seri', color: '#7B5EF6' },
  { id: '3', icon: Heart,    label: 'Rutin Uzmanı',color: '#FF6B9D' },
  { id: '4', icon: Droplets, label: 'Nemli Cilt',  color: '#4FC3F7' },
];

const STATS = [
  { label: 'Cilt Skoru', value: '84',  suffix: '/100', color: AppColors.accentViolet },
  { label: 'Seri',       value: '14',  suffix: ' gün', color: AppColors.accentGold   },
  { label: 'Analiz',     value: '42',  suffix: ' kez', color: '#FF6B9D'              },
  { label: 'Öneri',      value: '120', suffix: ' adet',color: '#4FC3F7'              },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ uri: string | null; name: string; surname: string; size: number }> = ({ uri, name, surname, size }) => {
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <LinearGradient colors={['#7B5EF6','#4A3899']} style={{ width: size, height: size, borderRadius: size / 2, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFF', fontSize: size * 0.3, fontWeight: '700' }}>{name[0]}{surname[0]}</Text>
    </LinearGradient>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal: React.FC<{
  visible: boolean; profile: UserProfile;
  onSave: (p: UserProfile) => void; onClose: () => void;
}> = ({ visible, profile, onSave, onClose }) => {
  const [draft, setDraft] = useState<UserProfile>(profile);
  const set = (key: keyof UserProfile) => (val: string) => setDraft(p => ({ ...p, [key]: val }));

  const fields: { key: keyof UserProfile; label: string; placeholder: string; icon: any }[] = [
    { key: 'name',      label: 'Ad',          placeholder: 'Adınız',              icon: User     },
    { key: 'surname',   label: 'Soyad',       placeholder: 'Soyadınız',           icon: User     },
    { key: 'email',     label: 'E-posta',     placeholder: 'ornek@email.com',     icon: Mail     },
    { key: 'phone',     label: 'Telefon',     placeholder: '+90 5XX XXX XX XX',   icon: Phone    },
    { key: 'birthDate', label: 'Doğum Tarihi',placeholder: 'GG/AA/YYYY',          icon: Calendar },
    { key: 'location',  label: 'Konum',       placeholder: 'Şehir, Ülke',         icon: MapPin   },
    { key: 'bio',       label: 'Hakkımda',    placeholder: 'Kendinizi tanıtın...', icon: Edit3   },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={st.overlay}>
        <View style={st.sheet}>
          <View style={st.modalHeader}>
            <Text style={st.modalTitle}>Profili Düzenle</Text>
            <Pressable onPress={onClose} style={st.closeBtn}><X size={20} color={AppColors.textSecondary} /></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={st.inputLabel}>Cilt Tipi</Text>
            <View style={st.chipRow}>
              {SKIN_TYPES.map(t => (
                <Pressable key={t} onPress={() => setDraft(p => ({ ...p, skinType: t }))}
                  style={[st.chip, draft.skinType === t && st.chipActive]}>
                  <Text style={[st.chipText, draft.skinType === t && st.chipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            {fields.map(({ key, label, placeholder, icon: Icon }) => (
              <View key={key} style={st.inputGroup}>
                <Text style={st.inputLabel}>{label}</Text>
                <View style={st.inputWrapper}>
                  <Icon size={16} color={AppColors.textTertiary} />
                  <TextInput
                    style={st.textInput}
                    value={draft[key]} onChangeText={set(key)}
                    placeholder={placeholder} placeholderTextColor={AppColors.textTertiary}
                    multiline={key === 'bio'} numberOfLines={key === 'bio' ? 3 : 1}
                  />
                </View>
              </View>
            ))}
            <Pressable onPress={() => { onSave(draft); onClose(); }} style={st.saveBtn}>
              <LinearGradient colors={['#7B5EF6','#5B3FD0']} style={st.saveGradient}>
                <Check size={18} color="#FFF" />
                <Text style={st.saveText}>Kaydet</Text>
              </LinearGradient>
            </Pressable>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { currentUser } = MockData;
  const defaultProfile: UserProfile = {
    name: currentUser.name, surname: currentUser.surname,
    email: currentUser.email, phone: '+90 532 000 00 00',
    birthDate: '15/03/1998', location: 'İstanbul, Türkiye',
    skinType: 'Kombine',
    bio: 'Cilt bakımı ve kişisel gelişim tutkunu. Lumera ile her gün kendimi geliştiriyorum.',
  };

  const [profile, setProfile]     = useState<UserProfile>(defaultProfile);
  const [photoUri, setPhotoUri]   = useState<string | null>(null);
  const [editVisible, setEdit]    = useState(false);
  const [notifVisible, setNotif]  = useState(false);
  const [secVisible, setSec]      = useState(false);
  const [premVisible, setPrem]    = useState(false);
  const [progVisible, setProg]    = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const photo = await AsyncStorage.getItem(STORAGE_PHOTO_KEY);
        if (photo) setPhotoUri(photo);
        const saved = await AsyncStorage.getItem(STORAGE_PROFILE_KEY);
        if (saved) setProfile(JSON.parse(saved));
      } catch (_) {}
    })();
  }, []);

  // Save profile helper
  const saveProfile = async (p: UserProfile) => {
    setProfile(p);
    try { await AsyncStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(p)); } catch (_) {}
  };

  // Photo picker
  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri iznine ihtiyaç var.'); return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      try { await AsyncStorage.setItem(STORAGE_PHOTO_KEY, uri); } catch (_) {}
    }
  };

  // Remove photo
  const removePhoto = () => {
    Alert.alert('Fotoğrafı Kaldır', 'Profil fotoğrafınız silinecek. Emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Kaldır', style: 'destructive', onPress: async () => {
        setPhotoUri(null);
        try { await AsyncStorage.removeItem(STORAGE_PHOTO_KEY); } catch (_) {}
      }},
    ]);
  };

  // Logout
  const handleLogout = () =>
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => router.replace('/') },
    ]);

  const MENU = [
    { icon: Bell,       label: 'Bildirim Ayarları',    sub: 'Hatırlatıcılar ve uyarılar',  onPress: () => setNotif(true) },
    { icon: Shield,     label: 'Gizlilik ve Güvenlik', sub: 'Şifre ve e-posta değiştir',   onPress: () => setSec(true)   },
    { icon: Crown,      label: 'Premium Planım',       sub: 'Abonelik ve avantajlar',       onPress: () => setPrem(true)  },
    { icon: TrendingUp, label: 'İlerleme Geçmişi',    sub: 'Analizler, metrikler, seri',   onPress: () => setProg(true)  },
  ];

  return (
    <View style={st.container}>
      <View style={[st.blob, st.blobTop]} />
      <View style={[st.blob, st.blobBot]} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

          {/* ── HERO ─────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(50).springify()} style={st.hero}>
            <LinearGradient colors={['rgba(123,94,246,0.18)','rgba(13,15,26,0)']} style={st.heroBg} />
            <View style={st.avatarWrap}>
              <View style={st.avatarRing}>
                <Avatar uri={photoUri} name={profile.name} surname={profile.surname} size={96} />
              </View>
              <Pressable onPress={pickPhoto} style={st.cameraBtn}>
                <Camera size={15} color="#FFF" />
              </Pressable>
            </View>

            {/* Photo actions */}
            <View style={st.photoActions}>
              <Pressable onPress={pickPhoto} style={st.photoActionBtn}>
                <Camera size={13} color={AppColors.accentViolet} />
                <Text style={st.photoActionText}>Fotoğraf Ekle</Text>
              </Pressable>
              {photoUri && (
                <Pressable onPress={removePhoto} style={[st.photoActionBtn, st.photoActionDanger]}>
                  <Trash2 size={13} color="#FF4C8B" />
                  <Text style={[st.photoActionText, { color: '#FF4C8B' }]}>Kaldır</Text>
                </Pressable>
              )}
            </View>

            <Text style={st.heroName}>{profile.name} {profile.surname}</Text>
            <View style={st.tierBadge}>
              <LinearGradient colors={['#C9A96E','#8A6F42']} style={st.tierGradient}>
                <Star size={10} color="#0D0F1A" />
                <Text style={st.tierText}>PREMIUM</Text>
              </LinearGradient>
            </View>
            <Text style={st.heroBio}>{profile.bio}</Text>
            <Pressable onPress={() => setEdit(true)} style={st.editBtn}>
              <Edit3 size={14} color={AppColors.accentViolet} />
              <Text style={st.editBtnText}>Profili Düzenle</Text>
            </Pressable>
          </Animated.View>

          {/* ── STATS ────────────────────────────────── */}
          <Animated.View entering={FadeInUp.delay(150).springify()} style={st.statsRow}>
            {STATS.map((s, i) => (
              <GlassCard key={i} style={st.statCard}>
                <Text style={[st.statVal, { color: s.color }]}>{s.value}
                  <Text style={st.statSuffix}>{s.suffix}</Text>
                </Text>
                <Text style={st.statLabel}>{s.label}</Text>
              </GlassCard>
            ))}
          </Animated.View>

          {/* ── BADGES ───────────────────────────────── */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={st.section}>
            <Text style={st.sectionTitle}>ROZETLERİM</Text>
            <View style={st.badgesRow}>
              {BADGES.map((b, i) => (
                <Animated.View key={b.id} entering={ZoomIn.delay(200 + i * 80).springify()}>
                  <GlassCard style={st.badgeCard}>
                    <View style={[st.badgeIcon, { backgroundColor: b.color + '22' }]}>
                      <b.icon size={22} color={b.color} />
                    </View>
                    <Text style={st.badgeLabel}>{b.label}</Text>
                  </GlassCard>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* ── PERSONAL INFO ────────────────────────── */}
          <Animated.View entering={FadeInUp.delay(250).springify()} style={st.section}>
            <Text style={st.sectionTitle}>KİŞİSEL BİLGİLER</Text>
            <GlassCard>
              {[
                { icon: Mail,     label: 'E-posta',      value: profile.email     },
                { icon: Phone,    label: 'Telefon',      value: profile.phone     },
                { icon: Calendar, label: 'Doğum Tarihi', value: profile.birthDate },
                { icon: MapPin,   label: 'Konum',        value: profile.location  },
                { icon: Droplets, label: 'Cilt Tipi',    value: profile.skinType  },
              ].map(({ icon: Icon, label, value }, i, arr) => (
                <View key={label}>
                  <View style={st.infoRow}>
                    <View style={st.infoIconWrap}><Icon size={16} color={AppColors.accentViolet} /></View>
                    <View style={st.infoText}>
                      <Text style={st.infoLabel}>{label}</Text>
                      <Text style={st.infoValue}>{value}</Text>
                    </View>
                  </View>
                  {i < arr.length - 1 && <View style={st.divider} />}
                </View>
              ))}
            </GlassCard>
          </Animated.View>

          {/* ── MENU ─────────────────────────────────── */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={st.section}>
            <Text style={st.sectionTitle}>AYARLAR</Text>
            <GlassCard>
              {MENU.map(({ icon: Icon, label, sub, onPress }, i, arr) => (
                <View key={label}>
                  <Pressable onPress={onPress} style={st.menuRow}>
                    <View style={st.menuIconWrap}><Icon size={18} color={AppColors.accentVioletLight} /></View>
                    <View style={st.menuText}>
                      <Text style={st.menuLabel}>{label}</Text>
                      <Text style={st.menuSub}>{sub}</Text>
                    </View>
                    <ChevronRight size={16} color={AppColors.textTertiary} />
                  </Pressable>
                  {i < arr.length - 1 && <View style={st.divider} />}
                </View>
              ))}
            </GlassCard>
          </Animated.View>

          {/* ── LOGOUT ───────────────────────────────── */}
          <Animated.View entering={FadeInUp.delay(350).springify()} style={st.section}>
            <Pressable onPress={handleLogout} style={st.logoutBtn}>
              <LogOut size={16} color="#FF4C8B" />
              <Text style={st.logoutText}>Çıkış Yap</Text>
            </Pressable>
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      <EditModal visible={editVisible} profile={profile} onSave={saveProfile} onClose={() => setEdit(false)} />
      <NotificationSettingsModal visible={notifVisible} onClose={() => setNotif(false)} />
      <SecurityModal visible={secVisible} currentEmail={profile.email}
        onSave={email => saveProfile({ ...profile, email })} onClose={() => setSec(false)} />
      <PremiumModal visible={premVisible} onClose={() => setPrem(false)} />
      <ProgressHistoryModal visible={progVisible} onClose={() => setProg(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  container:      { flex: 1, backgroundColor: AppColors.bgPrimary },
  blob:           { position: 'absolute', width: 320, height: 320, borderRadius: 160, opacity: 0.12 },
  blobTop:        { top: -120, left: -80, backgroundColor: AppColors.accentViolet },
  blobBot:        { bottom: -80, right: -100, backgroundColor: AppColors.accentGold, opacity: 0.06 },
  scroll:         { paddingTop: AppSpacing.md },
  hero:           { alignItems: 'center', paddingHorizontal: AppSpacing.md, paddingBottom: AppSpacing.lg, position: 'relative' },
  heroBg:         { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  avatarWrap:     { position: 'relative', marginBottom: AppSpacing.sm },
  avatarRing:     { padding: 3, borderRadius: 54, borderWidth: 2, borderColor: AppColors.accentViolet },
  cameraBtn:      { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: AppColors.accentViolet, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: AppColors.bgPrimary },
  photoActions:   { flexDirection: 'row', gap: 8, marginBottom: AppSpacing.sm },
  photoActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: AppRadii.full, borderWidth: 1, borderColor: AppColors.borderViolet, backgroundColor: 'rgba(123,94,246,0.08)' },
  photoActionDanger:{ borderColor: 'rgba(255,76,139,0.35)', backgroundColor: 'rgba(255,76,139,0.08)' },
  photoActionText:{ color: AppColors.accentViolet, fontSize: 11, fontWeight: '600' },
  heroName:       { color: AppColors.textPrimary, fontSize: 26, fontWeight: '700', marginBottom: 6 },
  tierBadge:      { marginBottom: AppSpacing.sm },
  tierGradient:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: AppRadii.full },
  tierText:       { color: '#0D0F1A', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  heroBio:        { color: AppColors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 300, marginBottom: AppSpacing.md },
  editBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: AppColors.borderViolet, borderRadius: AppRadii.full, paddingHorizontal: 16, paddingVertical: 8 },
  editBtnText:    { color: AppColors.accentViolet, fontSize: 13, fontWeight: '600' },
  statsRow:       { flexDirection: 'row', paddingHorizontal: AppSpacing.md, gap: AppSpacing.sm, marginBottom: AppSpacing.lg },
  statCard:       { flex: 1, alignItems: 'center', paddingVertical: AppSpacing.md, paddingHorizontal: 4 },
  statVal:        { fontSize: 20, fontWeight: '800' },
  statSuffix:     { fontSize: 10, fontWeight: '500', color: AppColors.textTertiary },
  statLabel:      { color: AppColors.textTertiary, fontSize: 9, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  section:        { paddingHorizontal: AppSpacing.md, marginBottom: AppSpacing.lg },
  sectionTitle:   { color: AppColors.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: AppSpacing.sm },
  badgesRow:      { flexDirection: 'row', gap: AppSpacing.sm },
  badgeCard:      { flex: 1, alignItems: 'center', paddingVertical: AppSpacing.md, gap: 6 },
  badgeIcon:      { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  badgeLabel:     { color: AppColors.textSecondary, fontSize: 9, fontWeight: '600', textAlign: 'center' },
  infoRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: AppSpacing.sm, gap: AppSpacing.md },
  infoIconWrap:   { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(123,94,246,0.12)', justifyContent: 'center', alignItems: 'center' },
  infoText:       { flex: 1 },
  infoLabel:      { color: AppColors.textTertiary, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  infoValue:      { color: AppColors.textPrimary, fontSize: 14, fontWeight: '500', marginTop: 2 },
  divider:        { height: 1, backgroundColor: AppColors.borderSubtle, marginVertical: 2 },
  menuRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: AppSpacing.md },
  menuIconWrap:   { width: 36, height: 36, borderRadius: AppRadii.sm, backgroundColor: 'rgba(123,94,246,0.1)', justifyContent: 'center', alignItems: 'center' },
  menuText:       { flex: 1 },
  menuLabel:      { color: AppColors.textPrimary, fontSize: 14, fontWeight: '600' },
  menuSub:        { color: AppColors.textTertiary, fontSize: 11, marginTop: 1 },
  logoutBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,76,139,0.3)', borderRadius: AppRadii.lg, paddingVertical: 14 },
  logoutText:     { color: '#FF4C8B', fontSize: 14, fontWeight: '700' },
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:          { backgroundColor: AppColors.bgCardElevated, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', paddingHorizontal: AppSpacing.md, paddingTop: AppSpacing.md },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: AppSpacing.md },
  modalTitle:     { color: AppColors.textPrimary, fontSize: 18, fontWeight: '700' },
  closeBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: AppColors.bgCard, justifyContent: 'center', alignItems: 'center' },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: AppSpacing.md },
  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: AppRadii.full, borderWidth: 1, borderColor: AppColors.borderSubtle, backgroundColor: AppColors.bgCard },
  chipActive:     { borderColor: AppColors.accentViolet, backgroundColor: 'rgba(123,94,246,0.15)' },
  chipText:       { color: AppColors.textSecondary, fontSize: 13 },
  chipTextActive: { color: AppColors.accentVioletLight, fontWeight: '600' },
  inputGroup:     { marginBottom: AppSpacing.md },
  inputLabel:     { color: AppColors.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  inputWrapper:   { flexDirection: 'row', alignItems: 'center', backgroundColor: AppColors.bgCard, borderRadius: AppRadii.md, borderWidth: 1, borderColor: AppColors.borderSubtle, paddingHorizontal: AppSpacing.md, gap: AppSpacing.sm },
  textInput:      { flex: 1, color: AppColors.textPrimary, fontSize: 14, paddingVertical: 12 },
  saveBtn:        { borderRadius: AppRadii.md, overflow: 'hidden', marginTop: AppSpacing.md },
  saveGradient:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  saveText:       { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
