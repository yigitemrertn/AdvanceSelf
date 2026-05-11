import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  User, Mail, Lock, Key, LogOut, ChevronRight, Shield, CheckCircle2
} from 'lucide-react-native';
import { useUserStore } from '../../src/store/userStore';
import { router } from 'expo-router';
import { AppColors, AppRadii, AppSpacing } from '../../src/theme/colors';
import { GlassCard } from '../../src/components/GlassCard';
import { api } from '../../src/services/api';

export default function SettingsScreen() {
  const { userId, logout, geminiKey, setGeminiKey } = useUserStore();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState(geminiKey || '');
  const [isSavingKey, setIsSavingKey] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        try {
          const res = await api.profile.get(userId);
          setProfile(res);
        } catch (e) {
          console.error("Could not load profile for settings:", e);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  const handleSaveApiKey = () => {
    setIsSavingKey(true);
    setTimeout(() => {
      setGeminiKey(apiKeyInput);
      setIsSavingKey(false);
      Alert.alert("Başarılı", "Gemini API Anahtarınız güvenli bir şekilde kaydedildi. Artık AI önerilerini kullanmaya başlayabilirsiniz!");
    }, 600);
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => {
          logout();
          router.replace('/');
      }},
    ]);
  };

  if (loading) {
    return (
      <View style={[st.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.accentViolet} />
      </View>
    );
  }

  return (
    <View style={st.container}>
      {/* Background Decorative Blobs */}
      <View style={[st.blob, st.blobTop]} />
      <View style={[st.blob, st.blobBot]} />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={st.header}>
          <Text style={st.headerTitle}>AYARLAR</Text>
          <Text style={st.headerSubtitle}>Hesabınızı ve AI tercihlerinizi yönetin</Text>
        </Animated.View>

        <ScrollView 
          contentContainerStyle={st.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          
          {/* Account Overview Card */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={st.section}>
            <GlassCard style={st.profileHeaderCard}>
              <View style={st.avatarCircle}>
                <Text style={st.avatarLetter}>{(profile?.full_name?.[0] || 'U').toUpperCase()}</Text>
              </View>
              <View style={st.profileInfo}>
                <Text style={st.profileName}>{profile?.full_name || 'Yükleniyor...'}</Text>
                <View style={st.emailBadge}>
                  <Mail size={12} color={AppColors.textTertiary} />
                  <Text style={st.profileEmail}>{profile?.gender?.toUpperCase() || 'ÜYE'}</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* CRITICAL: API Key Management Section */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={st.section}>
            <Text style={st.sectionTitle}>GEMINI AI ENTEGRASYONU</Text>
            <GlassCard style={st.apiCard} showGlow={!geminiKey} glowColor={AppColors.accentViolet}>
              <View style={st.apiHeader}>
                <View style={st.iconCircle}>
                  <Key size={20} color={AppColors.accentVioletLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.apiTitle}>Gemini API Anahtarı</Text>
                  <Text style={st.apiDesc}>Analizler ve öneriler için gerekli.</Text>
                </View>
              </View>
              
              <View style={st.inputContainer}>
                <TextInput
                  style={st.input}
                  value={apiKeyInput}
                  onChangeText={setApiKeyInput}
                  placeholder="AIzaSy... ile başlayan kod"
                  placeholderTextColor={AppColors.textTertiary}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <Pressable onPress={handleSaveApiKey} style={st.saveApiKeyBtn} disabled={isSavingKey}>
                <LinearGradient
                  colors={['#7B5EF6', '#5B3FD0']}
                  style={st.saveKeyGradient}
                >
                  {isSavingKey ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} color="#FFF" />
                      <Text style={st.saveKeyText}>Anahtarı Kaydet</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </GlassCard>
          </Animated.View>

          {/* Account Settings Options */}
          <Animated.View entering={FadeInUp.delay(400).springify()} style={st.section}>
            <Text style={st.sectionTitle}>GÜVENLİK VE HESAP</Text>
            <GlassCard>
              <Pressable style={st.menuItem} onPress={() => Alert.alert("Bilgi", "E-Posta değiştirme yakında aktif olacak!")}>
                <View style={[st.menuIconBox, { backgroundColor: 'rgba(123,94,246,0.1)' }]}>
                  <Shield size={18} color={AppColors.accentViolet} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.menuItemText}>Güvenlik Ayarları</Text>
                  <Text style={st.menuItemSub}>Şifre güncelleme</Text>
                </View>
                <ChevronRight size={18} color={AppColors.textTertiary} />
              </Pressable>
              
              <View style={st.divider} />

              <Pressable style={st.menuItem} onPress={() => router.push('/(tabs)/survey')}>
                <View style={[st.menuIconBox, { backgroundColor: 'rgba(79,195,247,0.1)' }]}>
                  <User size={18} color="#4FC3F7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.menuItemText}>Anket Bilgilerim</Text>
                  <Text style={st.menuItemSub}>Fiziksel profilimi güncelle</Text>
                </View>
                <ChevronRight size={18} color={AppColors.textTertiary} />
              </Pressable>
            </GlassCard>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View entering={FadeInUp.delay(500).springify()} style={st.section}>
            <Pressable onPress={handleLogout} style={st.logoutBtn}>
              <LogOut size={18} color="#FF4C8B" />
              <Text style={st.logoutBtnText}>Oturumu Kapat</Text>
            </Pressable>
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.bgPrimary,
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
  },
  blobTop: {
    top: -100,
    right: -100,
    backgroundColor: AppColors.accentViolet,
  },
  blobBot: {
    bottom: -100,
    left: -100,
    backgroundColor: '#FF4C8B',
    opacity: 0.05,
  },
  header: {
    paddingHorizontal: AppSpacing.xl,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.textPrimary,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: AppSpacing.xl,
    paddingTop: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppSpacing.lg,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(123,94,246,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.accentViolet,
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  profileInfo: {
    marginLeft: AppSpacing.lg,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: AppColors.textTertiary,
  },
  apiCard: {
    padding: AppSpacing.lg,
  },
  apiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(123,94,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  apiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  apiDesc: {
    fontSize: 12,
    color: AppColors.textTertiary,
    marginTop: 2,
  },
  inputContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    marginBottom: 16,
  },
  input: {
    color: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  saveApiKeyBtn: {
    borderRadius: AppRadii.md,
    overflow: 'hidden',
  },
  saveKeyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  saveKeyText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  menuItemSub: {
    fontSize: 12,
    color: AppColors.textTertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.borderSubtle,
    opacity: 0.5,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,76,139,0.3)',
    borderRadius: AppRadii.lg,
    backgroundColor: 'rgba(255,76,139,0.05)',
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF4C8B',
  },
});
