import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Alert, ActivityIndicator } from 'react-native';
import { api } from '../src/services/api';
import { useUserStore } from '../src/store/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { AppColors, AppSpacing } from '../src/theme/colors';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const setAuth = useUserStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.auth.register({ email, password, full_name: name });
      if (response && response.access_token) {
        setAuth(response.user_id, response.access_token);
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      Alert.alert('Kayıt Başarısız', error.message || 'Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Blobs */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobBottomRight]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={AppColors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
            <Text style={styles.titleText}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>Güzellik yolculuğuna başla</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput
                style={styles.input}
                placeholder="Adınız Soyadınız"
                placeholderTextColor={AppColors.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                placeholderTextColor={AppColors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={AppColors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Pressable onPress={handleSignup} style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.8 }]}>
              <LinearGradient
                colors={['#7B5EF6', '#5B3FD0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginText}>Kayıt Ol</Text>
                )}
              </LinearGradient>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>VEYA</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialContainer}>
              <Pressable style={({ pressed }) => [styles.socialBtn, styles.googleBtn, pressed && styles.pressedBtn]}>
                <AntDesign name="google" size={20} color="#000" />
                <Text style={styles.googleText}>Google</Text>
              </Pressable>
              
              <Pressable style={({ pressed }) => [styles.socialBtn, styles.appleBtn, pressed && styles.pressedBtn]}>
                <AntDesign name="apple" size={20} color="#FFF" />
                <Text style={styles.appleText}>Apple</Text>
              </Pressable>
            </View>

          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.registerText}>Giriş Yap</Text>
            </Pressable>
          </Animated.View>
        </View>
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
  headerBar: {
    paddingHorizontal: AppSpacing.xl,
    paddingTop: AppSpacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: AppSpacing.xl,
    justifyContent: 'center',
    paddingBottom: AppSpacing.xxxl,
  },
  blob: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.15,
    filter: 'blur(40px)',
  },
  blobTopLeft: {
    top: -100,
    left: -150,
    backgroundColor: AppColors.accentViolet,
  },
  blobBottomRight: {
    bottom: -150,
    right: -100,
    backgroundColor: AppColors.accentGold,
    opacity: 0.1,
  },
  header: {
    alignItems: 'center',
    marginBottom: AppSpacing.xl,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.textPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.accentVioletLight,
    marginTop: 8,
    letterSpacing: 1,
  },
  form: {
    gap: AppSpacing.lg,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.md,
    color: AppColors.textPrimary,
    fontSize: 16,
    height: 56,
  },
  loginBtn: {
    marginTop: AppSpacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7B5EF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  loginText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: AppSpacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  orText: {
    color: AppColors.textTertiary,
    paddingHorizontal: AppSpacing.md,
    fontSize: 12,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    height: 56,
    gap: 10,
  },
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
  },
  appleBtn: {
    backgroundColor: '#111111',
    borderColor: '#333333',
  },
  googleText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
  appleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  pressedBtn: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: AppSpacing.xl,
  },
  footerText: {
    color: AppColors.textSecondary,
  },
  registerText: {
    color: AppColors.accentVioletLight,
    fontWeight: '700',
  },
});
