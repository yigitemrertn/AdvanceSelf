import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing 
} from 'react-native-reanimated';
import { Camera, Clock } from 'lucide-react-native';

import { AppColors, AppRadii, AppSpacing } from '../../src/theme/colors';
import { MockData } from '../../src/services/mockData';

export default function ScanScreen() {
  const { latestAnalysis } = MockData;
  
  // Nabız animasyonu
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <Text style={styles.headerTitle}>CİLT TARAMASI</Text>
          <Text style={styles.headerSubtitle}>Yüzünüzü çerçevenin içine hizalayın</Text>
        </Animated.View>

        {/* Camera Placeholder Area */}
        <View style={styles.cameraContainer}>
          
          <Animated.View style={[styles.pulseRing, animatedPulse]} />
          
          <View style={styles.cameraBox}>
            {/* Brackets */}
            <View style={[styles.bracket, styles.bracketTopLeft]} />
            <View style={[styles.bracket, styles.bracketTopRight]} />
            <View style={[styles.bracket, styles.bracketBottomLeft]} />
            <View style={[styles.bracket, styles.bracketBottomRight]} />
            
            <Camera color={AppColors.accentVioletLight} size={48} opacity={0.5} />
            <Text style={styles.cameraText}>Kamera Bekleniyor...</Text>
          </View>
        </View>

        {/* Info & Action */}
        <View style={styles.bottomSection}>
          <View style={styles.infoBadge}>
            <Clock size={14} color={AppColors.textSecondary} />
            <Text style={styles.infoText}>
              Son tarama: {latestAnalysis.nextScanIn} gün önce • Skor: {latestAnalysis.overallScore}
            </Text>
          </View>

          <Pressable style={({ pressed }) => [styles.scanBtn, pressed && { opacity: 0.8 }]}>
            <LinearGradient
              colors={['#7B5EF6', '#5B3FD0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scanGradient}
            >
              <Text style={styles.scanBtnText}>TARAMAYI BAŞLAT</Text>
            </LinearGradient>
          </Pressable>
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
    justifyContent: 'space-between',
    paddingVertical: AppSpacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: AppSpacing.lg,
    marginTop: AppSpacing.md,
  },
  headerTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.xl,
  },
  pulseRing: {
    position: 'absolute',
    width: 280,
    height: 380,
    borderRadius: AppRadii.xxl * 2,
    borderWidth: 2,
    borderColor: AppColors.accentViolet,
    backgroundColor: 'rgba(123, 94, 246, 0.05)',
  },
  cameraBox: {
    width: 240,
    height: 340,
    borderRadius: AppRadii.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(19, 21, 31, 0.5)',
  },
  cameraText: {
    color: AppColors.textTertiary,
    fontSize: 12,
    marginTop: AppSpacing.sm,
  },
  bracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: AppColors.accentGold,
  },
  bracketTopLeft: {
    top: -2, left: -2,
    borderTopWidth: 3, borderLeftWidth: 3,
    borderTopLeftRadius: AppRadii.xxl,
  },
  bracketTopRight: {
    top: -2, right: -2,
    borderTopWidth: 3, borderRightWidth: 3,
    borderTopRightRadius: AppRadii.xxl,
  },
  bracketBottomLeft: {
    bottom: -2, left: -2,
    borderBottomWidth: 3, borderLeftWidth: 3,
    borderBottomLeftRadius: AppRadii.xxl,
  },
  bracketBottomRight: {
    bottom: -2, right: -2,
    borderBottomWidth: 3, borderRightWidth: 3,
    borderBottomRightRadius: AppRadii.xxl,
  },
  bottomSection: {
    paddingHorizontal: AppSpacing.xl,
    paddingBottom: 80, // for tab bar
    alignItems: 'center',
    gap: AppSpacing.lg,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.bgSecondary,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 8,
    borderRadius: AppRadii.full,
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    gap: 6,
  },
  infoText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  scanBtn: {
    width: '100%',
    borderRadius: AppRadii.full,
    overflow: 'hidden',
  },
  scanGradient: {
    paddingVertical: AppSpacing.md,
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
