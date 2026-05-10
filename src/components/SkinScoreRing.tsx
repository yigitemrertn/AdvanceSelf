import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { AppColors } from '../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export const SkinScoreRing: React.FC<Props> = ({
  score,
  maxScore = 100,
  size = 220,
  strokeWidth = 10,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / maxScore, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [score, maxScore]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - progress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#5B3FD0" />
            <Stop offset="40%" stopColor="#7B5EF6" />
            <Stop offset="75%" stopColor="#9B82F8" />
            <Stop offset="100%" stopColor={AppColors.accentGold} />
          </LinearGradient>
        </Defs>
        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={AppColors.borderSubtle}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children}
    </View>
  );
};
