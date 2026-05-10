import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AppColors, AppRadii, AppSpacing } from '../src/theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Şimdilik sadece Ana Sayfa'ya yönlendiriyor
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      {/* Background Blobs */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobBottomRight]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
            <Text style={styles.logoText}>LUMERA AI</Text>
            <Text style={styles.subtitle}>Cildinizin Geleceği</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-posta veya Telefon</Text>
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

            <Pressable onPress={handleLogin} style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.8 }]}>
              <LinearGradient
                colors={['#7B5EF6', '#5B3FD0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginGradient}
              >
                <Text style={styles.loginText}>Giriş Yap</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>VEYA</Text>
              <View style={styles.line} />
            </View>

            <Pressable style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.8 }]}>
              <Text style={styles.socialText}>Google ile Devam Et</Text>
            </Pressable>
            
            <Pressable style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.8 }]}>
              <Text style={styles.socialText}>Apple ile Devam Et</Text>
            </Pressable>

          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu? </Text>
            <Pressable>
              <Text style={styles.registerText}>Kayıt Ol</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: AppSpacing.xl,
    justifyContent: 'center',
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
    marginBottom: AppSpacing.xxxl,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: AppColors.textPrimary,
    letterSpacing: 2,
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
    backgroundColor: 'rgba(22, 24, 38, 0.6)',
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderRadius: AppRadii.md,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.md,
    color: AppColors.textPrimary,
    fontSize: 16,
  },
  loginBtn: {
    marginTop: AppSpacing.sm,
    borderRadius: AppRadii.md,
    overflow: 'hidden',
  },
  loginGradient: {
    paddingVertical: AppSpacing.md,
    alignItems: 'center',
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
    backgroundColor: AppColors.borderSubtle,
  },
  orText: {
    color: AppColors.textTertiary,
    paddingHorizontal: AppSpacing.md,
    fontSize: 12,
    fontWeight: '600',
  },
  socialBtn: {
    backgroundColor: AppColors.bgSecondary,
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderRadius: AppRadii.md,
    paddingVertical: AppSpacing.md,
    alignItems: 'center',
  },
  socialText: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: AppSpacing.xxxl,
  },
  footerText: {
    color: AppColors.textSecondary,
  },
  registerText: {
    color: AppColors.accentVioletLight,
    fontWeight: '700',
  },
});
