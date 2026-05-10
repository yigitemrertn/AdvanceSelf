import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { Camera, Check, ChevronRight } from 'lucide-react-native';

import { AppColors, AppRadii, AppSpacing } from '../../src/theme/colors';
import { GlassCard } from '../../src/components/GlassCard';

const GENDERS = ['Kadın', 'Erkek', 'Belirtmek İstemiyorum'];
const FACE_SHAPES = ['Oval', 'Yuvarlak', 'Kare', 'Kalp', 'Uzun'];
const BODY_SHAPES = ['Kum Saati', 'Armut', 'Elma', 'Dikdörtgen', 'Ters Üçgen'];
const STYLES = ['Minimalist', 'Klasik', 'Spor', 'Avangart', 'Vintage', 'Doğal'];

export default function SurveyScreen() {
  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [bodyShape, setBodyShape] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.headerTitle}>PROFİL ANALİZİ</Text>
          <Text style={styles.headerSubtitle}>Yapay zekanın sizi daha iyi tanıması için bilgilerinizi tamamlayın.</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Section: Temel Bilgiler */}
          <Animated.View entering={SlideInRight.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>TEMEL BİLGİLER</Text>
            
            <GlassCard style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cinsiyet</Text>
                <View style={styles.optionsRow}>
                  {GENDERS.map(g => (
                    <Pressable
                      key={g}
                      onPress={() => setGender(g)}
                      style={[styles.optionBtn, gender === g && styles.optionBtnActive]}
                    >
                      <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>{g}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yaş</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: 25"
                  placeholderTextColor={AppColors.textTertiary}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Boy (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="170"
                    placeholderTextColor={AppColors.textTertiary}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                  />
                </View>
                <View style={{ width: AppSpacing.md }} />
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Kilo (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="65"
                    placeholderTextColor={AppColors.textTertiary}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Section: Fiziksel Özellikler */}
          <Animated.View entering={SlideInRight.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>FİZİKSEL ÖZELLİKLER</Text>
            
            <GlassCard style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yüz Şekli</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollOptions}>
                  {FACE_SHAPES.map(shape => (
                    <Pressable
                      key={shape}
                      onPress={() => setFaceShape(shape)}
                      style={[styles.shapeCard, faceShape === shape && styles.shapeCardActive]}
                    >
                      <View style={styles.shapeIconPlaceholder} />
                      <Text style={[styles.shapeText, faceShape === shape && styles.shapeTextActive]}>{shape}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vücut Tipi</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollOptions}>
                  {BODY_SHAPES.map(shape => (
                    <Pressable
                      key={shape}
                      onPress={() => setBodyShape(shape)}
                      style={[styles.shapeCard, bodyShape === shape && styles.shapeCardActive]}
                    >
                      <View style={[styles.shapeIconPlaceholder, { borderRadius: 4 }]} />
                      <Text style={[styles.shapeText, bodyShape === shape && styles.shapeTextActive]}>{shape}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Section: Tarz & Görsel */}
          <Animated.View entering={SlideInRight.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>TARZ VE GÖRSEL</Text>
            
            <GlassCard style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tercih Edilen Tarz (Çoklu Seçim)</Text>
                <View style={styles.chipContainer}>
                  {STYLES.map(style => {
                    const isActive = selectedStyles.includes(style);
                    return (
                      <Pressable
                        key={style}
                        onPress={() => toggleStyle(style)}
                        style={[styles.chip, isActive && styles.chipActive]}
                      >
                        {isActive && <Check size={12} color="#FFF" style={{ marginRight: 4 }} />}
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{style}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yüz Fotoğrafı (Zorunlu Değil)</Text>
                <Pressable style={styles.photoUploadBox}>
                  <Camera size={32} color={AppColors.accentVioletLight} opacity={0.7} />
                  <Text style={styles.uploadText}>Fotoğraf Çek veya Yükle</Text>
                  <Text style={styles.uploadSubtext}>Yüz analizi için net bir fotoğraf gereklidir.</Text>
                </Pressable>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={SlideInRight.delay(500)} style={styles.submitSection}>
            <Pressable style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.8 }]}>
              <LinearGradient
                colors={['#7B5EF6', '#5B3FD0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitBtnText}>ANALİZİ BAŞLAT</Text>
                <ChevronRight size={20} color="#FFF" />
              </LinearGradient>
            </Pressable>
          </Animated.View>

        </ScrollView>
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
  header: {
    paddingHorizontal: AppSpacing.lg,
    paddingTop: AppSpacing.md,
    paddingBottom: AppSpacing.md,
  },
  headerTitle: {
    color: AppColors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: AppSpacing.lg,
    paddingBottom: 100, // For tab bar
  },
  section: {
    marginTop: AppSpacing.lg,
  },
  sectionTitle: {
    color: AppColors.textTertiary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: AppSpacing.sm,
    marginLeft: 4,
  },
  card: {
    padding: AppSpacing.lg,
    gap: AppSpacing.xl,
  },
  inputGroup: {
    gap: AppSpacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.sm,
  },
  optionBtn: {
    backgroundColor: 'rgba(22, 24, 38, 0.6)',
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderRadius: AppRadii.md,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
  },
  optionBtnActive: {
    backgroundColor: 'rgba(123, 94, 246, 0.15)',
    borderColor: AppColors.accentViolet,
  },
  optionText: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
  optionTextActive: {
    color: AppColors.textPrimary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(22, 24, 38, 0.6)',
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderRadius: AppRadii.md,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 12,
    color: AppColors.textPrimary,
    fontSize: 16,
  },
  scrollOptions: {
    gap: AppSpacing.sm,
    paddingBottom: 4,
  },
  shapeCard: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(22, 24, 38, 0.6)',
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderRadius: AppRadii.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppSpacing.sm,
  },
  shapeCardActive: {
    backgroundColor: 'rgba(201, 169, 110, 0.15)',
    borderColor: AppColors.accentGold,
  },
  shapeIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.textTertiary,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  shapeText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  shapeTextActive: {
    color: AppColors.accentGold,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 24, 38, 0.6)',
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderRadius: AppRadii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: AppColors.accentViolet,
    borderColor: AppColors.accentViolet,
  },
  chipText: {
    color: AppColors.textSecondary,
    fontSize: 13,
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  photoUploadBox: {
    height: 120,
    backgroundColor: 'rgba(22, 24, 38, 0.4)',
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderStyle: 'dashed',
    borderRadius: AppRadii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: AppSpacing.sm,
  },
  uploadSubtext: {
    color: AppColors.textTertiary,
    fontSize: 12,
    marginTop: 4,
  },
  submitSection: {
    marginTop: AppSpacing.xl,
    marginBottom: AppSpacing.md,
  },
  submitBtn: {
    borderRadius: AppRadii.full,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: AppSpacing.sm,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
