import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, AppRadii, AppSpacing } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showGlow?: boolean;
  glowColor?: string;
}

export const GlassCard: React.FC<Props> = ({
  children,
  style,
  showGlow = false,
  glowColor = AppColors.accentViolet,
}) => {
  return (
    <View
      style={[
        styles.container,
        showGlow && {
          borderColor: glowColor,
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
          elevation: 10,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.06)',
          'rgba(255, 255, 255, 0.02)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: AppRadii.lg,
    padding: AppSpacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden', // to keep gradient inside borders
    backgroundColor: 'rgba(22, 24, 38, 0.4)', // bgCard with opacity
  },
});
