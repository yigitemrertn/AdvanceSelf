import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, SlideInRight, useAnimatedStyle, withSpring, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Check, ChevronRight } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { ActivityIndicator, Alert } from 'react-native';

import { AppColors, AppRadii, AppSpacing } from '../../src/theme/colors';
import { useUserStore } from '../../src/store/userStore';
import { api } from '../../src/services/api';

const { width, height } = Dimensions.get('window');

const GENDERS = [
  { id: 'Kadın', icon: '♀️' },
  { id: 'Erkek', icon: '♂️' },
];
const FACE_SHAPES = ['Oval', 'Yuvarlak', 'Kare', 'Kalp', 'Uzun'];
const BODY_SHAPES = ['Kum Saati', 'Armut', 'Elma', 'Dikdörtgen', 'Ters Üçgen'];
const STYLES = ['Minimalist', 'Klasik', 'Spor', 'Avangart', 'Vintage', 'Doğal'];

// Minimalist Vector Character
const AestheticCharacter = ({ gender, faceShape, bodyShape, styles: selectedStyles, isChanging, weight, heightValue, age }: any) => {

  const weightNum = parseInt(weight) || 65;
  const heightNum = parseInt(heightValue) || 170;
  const ageNum = parseInt(age) || 25;

  // Face Shape Logic
  let headW = 55;
  let headH = 55;
  let headR = 27.5;

  if (faceShape === 'Oval') { headH = 65; headW = 50; headR = 25; }
  else if (faceShape === 'Yuvarlak') { headW = 65; headH = 60; headR = 30; }
  else if (faceShape === 'Kare') { headW = 60; headH = 55; headR = 16; }
  else if (faceShape === 'Uzun') { headW = 50; headH = 72; headR = 20; }
  else if (faceShape === 'Kalp') { headW = 62; headH = 55; headR = 22; }

  // Age Logic
  let hairColor = gender === 'Erkek' ? '#2D3436' : '#4A2511';
  if (ageNum >= 50 && ageNum < 65) hairColor = '#9E9E9E'; // Gray hair
  if (ageNum >= 65) hairColor = '#E0E0E0'; // White hair

  let skinColor = '#FFE0C2';
  if (ageNum < 18) { headW -= 4; headH -= 4; } // smaller face for young

  // Body Dimensions Logic
  let chestW = 50;
  let bellyW = 50;

  if (weightNum > 80) bellyW = 50 + (weightNum - 80) * 1.2;
  if (weightNum < 55) bellyW = 50 - (55 - weightNum) * 0.5;
  if (bellyW > 100) bellyW = 100;
  if (bellyW < 35) bellyW = 35;

  if (bodyShape === 'Ters Üçgen') { chestW = 65; bellyW -= 5; }
  if (bodyShape === 'Armut') { bellyW += 15; chestW -= 5; }
  if (bodyShape === 'Kum Saati') { chestW += 5; bellyW -= 5; }
  
  // Height Logic
  let torsoH = 45;
  let legH = 45;
  
  if (heightNum > 175) {
    torsoH = 45 + (heightNum - 175) * 0.4;
    legH = 45 + (heightNum - 175) * 0.7;
  } else if (heightNum < 165) {
    torsoH = 45 - (165 - heightNum) * 0.4;
    legH = 45 - (165 - heightNum) * 0.6;
  }
  
  // Style Colors
  let topColor = '#7B5EF6';
  let botColor = '#1A1A2E';
  
  if (selectedStyles.includes('Spor')) { topColor = '#FF6B6B'; botColor = '#4ECDC4'; }
  else if (selectedStyles.includes('Minimalist')) { topColor = '#2D3436'; botColor = '#000000'; }
  else if (selectedStyles.includes('Vintage')) { topColor = '#D4A373'; botColor = '#8A5A44'; }
  else if (selectedStyles.includes('Doğal')) { topColor = '#81B29A'; botColor = '#E07A5F'; }
  else if (selectedStyles.includes('Avangart')) { topColor = '#9D4EDD'; botColor = '#3C096C'; }
  else if (selectedStyles.includes('Klasik')) { topColor = '#E5E5E5'; botColor = '#1D3557'; }

  let armH = torsoH + 10;

  const headStyle = useAnimatedStyle(() => ({
    width: withSpring(headW),
    height: withSpring(headH),
    borderRadius: withSpring(headR),
    backgroundColor: skinColor,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  }));

  const hairStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: -2,
    width: withSpring(headW + 4),
    height: withSpring(headH * 0.4),
    borderTopLeftRadius: withSpring(headR + 2),
    borderTopRightRadius: withSpring(headR + 2),
    backgroundColor: withTiming(hairColor),
    zIndex: 11,
  }));

  const hairBunStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: -15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: withTiming(hairColor),
    opacity: gender === 'Kadın' ? 1 : 0,
    zIndex: 9,
  }));

  const torsoTopStyle = useAnimatedStyle(() => ({
    width: withSpring(chestW),
    height: withSpring(torsoH / 2),
    backgroundColor: withTiming(topColor),
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 8,
    marginTop: -5,
  }));

  const torsoBottomStyle = useAnimatedStyle(() => ({
    width: withSpring(bellyW),
    height: withSpring(torsoH / 2 + 10),
    backgroundColor: withTiming(topColor),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 7,
    marginTop: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }));

  const armStyle = useAnimatedStyle(() => ({
    width: 14,
    height: withSpring(armH),
    backgroundColor: withTiming(topColor),
    borderRadius: 7,
    position: 'absolute',
    top: 5,
  }));

  const leftArm = useAnimatedStyle(() => ({
    left: withSpring(-10 - (chestW - 50)/2),
    transform: [{ rotate: '15deg' }]
  }));
  const rightArm = useAnimatedStyle(() => ({
    right: withSpring(-10 - (chestW - 50)/2),
    transform: [{ rotate: '-15deg' }]
  }));

  const legStyle = useAnimatedStyle(() => ({
    width: 18,
    height: withSpring(legH),
    backgroundColor: withTiming(botColor),
    borderRadius: 9,
  }));
  
  const containerStyle = useAnimatedStyle(() => ({
    alignItems: 'center',
    transform: [
      { translateY: isChanging ? withSequence(withTiming(-15, {duration: 150}), withTiming(0, {duration: 150, easing: Easing.bounce})) : withSpring(0) }
    ]
  }));

  return (
    <Animated.View style={containerStyle}>
      {isChanging && (
        <Animated.View entering={FadeInUp} style={{ position: 'absolute', right: -30, top: -10, zIndex: 20 }}>
          <Text style={{ fontSize: 24 }}>✨</Text>
        </Animated.View>
      )}

      {/* Hair Bun (Kadın) */}
      <Animated.View style={hairBunStyle} />
      
      {/* Head & Hair */}
      <View style={{ alignItems: 'center' }}>
        <Animated.View style={headStyle}>
          <Animated.View style={hairStyle} />
          {/* Face */}
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 12, zIndex: 12 }}>
            {ageNum > 55 && <View style={{position: 'absolute', top: -4, left: -2, width: 35, height: 1, backgroundColor: '#000', opacity: 0.2}}/>}
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#2D3436' }}>
              {isChanging ? 'O' : (gender === 'Kadın' ? '◡' : '•')}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#2D3436' }}>
              {isChanging ? 'O' : (gender === 'Kadın' ? '◡' : '•')}
            </Text>
          </View>
          <Text style={{ fontSize: 14, marginTop: 2, color: '#2D3436', fontWeight: 'bold', zIndex: 12 }}>
            {isChanging ? 'o' : (ageNum > 65 ? '—' : '‿')}
          </Text>
        </Animated.View>
      </View>

      {/* Torso Container */}
      <View style={{ alignItems: 'center', zIndex: 8 }}>
        <Animated.View style={[armStyle, leftArm]} />
        <Animated.View style={[armStyle, rightArm]} />
        
        <Animated.View style={torsoTopStyle} />
        <Animated.View style={torsoBottomStyle} />
      </View>

      {/* Legs */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: -8, zIndex: 6 }}>
        <Animated.View style={legStyle} />
        <Animated.View style={legStyle} />
      </View>
    </Animated.View>
  );
};



export default function SurveyScreen() {
  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState(25);
  const [heightValue, setHeightValue] = useState(170);
  const [weight, setWeight] = useState(65);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [bodyShape, setBodyShape] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  
  const [isChanging, setIsChanging] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userId } = useUserStore();
  const changeTimeout = useRef<any>(null);

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Hata", "Kullanıcı oturum açmamış.");
      return;
    }
    if (!gender || !faceShape || !bodyShape) {
      Alert.alert("Eksik Veri", "Lütfen zorunlu alanları (Cinsiyet, Yüz ve Vücut Tipi) doldurun.");
      return;
    }
    
    try {
      setLoading(true);
      const payload = {
        gender,
        age,
        height: heightValue,
        weight,
        face_shape: faceShape,
        body_shape: bodyShape,
        preferred_styles: selectedStyles
      };
      await api.profile.update(Number(userId), payload);
      
      Alert.alert("Tebrikler", "Profil bilgileriniz başarıyla kaydedildi! Şimdi devam etmek için lütfen API anahtarınızı girin.", [
        { text: "Tamam", onPress: () => router.replace('/(tabs)/profile') }
      ]);
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Profil güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const triggerReaction = () => {
    setIsChanging(true);
    if(changeTimeout.current) clearTimeout(changeTimeout.current);
    changeTimeout.current = setTimeout(() => setIsChanging(false), 800);
  };

  useEffect(() => {
    if (gender || age || heightValue || weight || faceShape || bodyShape || selectedStyles.length > 0) {
      triggerReaction();
    }
  }, [gender, age, heightValue, weight, faceShape, bodyShape, selectedStyles]);

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Graphic Area */}
      <View style={styles.characterContainer}>
        <LinearGradient
          colors={['#1E1E2E', AppColors.bgPrimary]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.platform} />
        
        <AestheticCharacter 
          gender={gender} 
          faceShape={faceShape} 
          bodyShape={bodyShape} 
          styles={selectedStyles} 
          isChanging={isChanging} 
          weight={weight}
          heightValue={heightValue}
          age={age}
        />
        
        <Animated.View entering={FadeInUp.delay(500)} style={styles.speechBubble}>
          <Text style={styles.speechText}>Beni tasarla! ✨</Text>
          <View style={styles.speechTriangle} />
        </Animated.View>
      </View>

      {/* Form Area */}
      <View style={styles.formContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInUp.delay(200)}>
            <Text style={styles.headerTitle}>Seni Tanıyalım</Text>
            <Text style={styles.headerSubtitle}>Vücut ve yüz profiline en uygun tavsiyeleri alabilmek için lütfen doldur.</Text>
          </Animated.View>

          {/* Section: Cinsiyet & Yaş */}
          <Animated.View entering={SlideInRight.delay(300)} style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cinsiyetin</Text>
              <View style={styles.optionsRow}>
                {GENDERS.map(g => (
                  <Pressable
                    key={g.id}
                    onPress={() => setGender(g.id)}
                    style={[styles.optionBtn, gender === g.id && styles.optionBtnActive]}
                  >
                    <Text style={[styles.optionIcon, gender === g.id && styles.optionTextActive]}>{g.icon}</Text>
                    <Text style={[styles.optionText, gender === g.id && styles.optionTextActive]}>{g.id}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.sliderHeader}>
                <Text style={styles.label}>Yaşın</Text>
                <Text style={styles.sliderValue}>{age}</Text>
              </View>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={10}
                maximumValue={80}
                step={1}
                value={age}
                onValueChange={setAge}
                minimumTrackTintColor={AppColors.accentViolet}
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor="#FFF"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.sliderHeader}>
                <Text style={styles.label}>Boy (cm)</Text>
                <Text style={styles.sliderValue}>{heightValue}</Text>
              </View>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={140}
                maximumValue={220}
                step={1}
                value={heightValue}
                onValueChange={setHeightValue}
                minimumTrackTintColor={AppColors.accentViolet}
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor="#FFF"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.sliderHeader}>
                <Text style={styles.label}>Kilo (kg)</Text>
                <Text style={styles.sliderValue}>{weight}</Text>
              </View>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={30}
                maximumValue={150}
                step={1}
                value={weight}
                onValueChange={setWeight}
                minimumTrackTintColor={AppColors.accentViolet}
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor="#FFF"
              />
            </View>
          </Animated.View>

          {/* Section: Fiziksel Özellikler */}
          <Animated.View entering={SlideInRight.delay(400)} style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Yüz Şeklin</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollOptions}>
                {FACE_SHAPES.map(shape => (
                  <Pressable
                    key={shape}
                    onPress={() => setFaceShape(shape)}
                    style={[styles.shapeCard, faceShape === shape && styles.shapeCardActive]}
                  >
                    <Text style={[styles.shapeText, faceShape === shape && styles.shapeTextActive]}>{shape}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vücut Tipin</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollOptions}>
                {BODY_SHAPES.map(shape => (
                  <Pressable
                    key={shape}
                    onPress={() => setBodyShape(shape)}
                    style={[styles.shapeCard, bodyShape === shape && styles.shapeCardActive]}
                  >
                    <Text style={[styles.shapeText, bodyShape === shape && styles.shapeTextActive]}>{shape}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Animated.View>

          {/* Section: Tarz */}
          <Animated.View entering={SlideInRight.delay(500)} style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Seni Yansıtan Tarz (Çoklu Seçim)</Text>
              <View style={styles.chipContainer}>
                {STYLES.map(style => {
                  const isActive = selectedStyles.includes(style);
                  return (
                    <Pressable
                      key={style}
                      onPress={() => toggleStyle(style)}
                      style={[styles.chip, isActive && styles.chipActive]}
                    >
                      {isActive && <Check size={14} color="#FFF" style={{ marginRight: 4 }} />}
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{style}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={SlideInRight.delay(600)} style={styles.submitSection}>
            <Pressable 
              onPress={handleSubmit} 
              disabled={loading}
              style={({ pressed }) => [styles.submitBtn, (pressed || loading) && { opacity: 0.8 }]}
            >
              <LinearGradient
                colors={['#7B5EF6', '#5B3FD0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>PROFİLİ KAYDET</Text>
                    <ChevronRight size={20} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.bgPrimary,
  },
  characterContainer: {
    height: height * 0.40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    zIndex: 10,
  },
  platform: {
    position: 'absolute',
    bottom: 25,
    width: 200,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 100,
    transform: [{ scaleY: 0.3 }],
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  speechBubble: {
    position: 'absolute',
    top: 60,
    right: 40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  speechText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  speechTriangle: {
    position: 'absolute',
    bottom: -6,
    left: 20,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.95)',
    transform: [{ rotate: '180deg' }],
  },
  formContainer: {
    flex: 1,
    backgroundColor: AppColors.bgSecondary,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    paddingHorizontal: AppSpacing.xl,
    paddingTop: AppSpacing.xl,
    paddingBottom: 100,
  },
  headerTitle: {
    color: AppColors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
    marginBottom: AppSpacing.lg,
  },
  section: {
    marginTop: AppSpacing.lg,
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
    fontSize: 14,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.sm,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderRadius: AppRadii.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  optionBtnActive: {
    backgroundColor: 'rgba(123, 94, 246, 0.15)',
    borderColor: AppColors.accentViolet,
  },
  optionIcon: {
    fontSize: 18,
  },
  optionText: {
    color: AppColors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  optionTextActive: {
    color: AppColors.textPrimary,
    fontWeight: '700',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sliderValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderRadius: AppRadii.lg,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 14,
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollOptions: {
    gap: AppSpacing.sm,
    paddingBottom: 4,
  },
  shapeCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderRadius: AppRadii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shapeCardActive: {
    backgroundColor: 'rgba(201, 169, 110, 0.15)',
    borderColor: AppColors.accentGold,
  },
  shapeText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  shapeTextActive: {
    color: AppColors.accentGold,
    fontWeight: '700',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    borderRadius: AppRadii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: AppColors.accentViolet,
    borderColor: AppColors.accentViolet,
  },
  chipText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  submitSection: {
    marginTop: AppSpacing.xxxl,
    marginBottom: AppSpacing.md,
  },
  submitBtn: {
    borderRadius: AppRadii.lg,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: AppSpacing.sm,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
