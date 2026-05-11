import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { AppColors } from '../src/theme/colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBackgroundColorAsync('#ffffff00');
      NavigationBar.setBehaviorAsync('overlay-swipe');
      NavigationBar.setVisibilityAsync('hidden');
    }
    SplashScreen.hideAsync();
  }, []);

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: AppColors.bgPrimary,
      card: AppColors.bgSecondary,
      text: AppColors.textPrimary,
      border: AppColors.borderSubtle,
    },
  };

  return (
    <ThemeProvider value={CustomDarkTheme}>
      <Stack screenOptions={{ 
        headerShown: false, 
        headerShadowVisible: false,
        contentStyle: { backgroundColor: AppColors.bgPrimary, borderTopWidth: 0 }
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="task/[id]" />
        <Stack.Screen name="summary/weekly" />
        <Stack.Screen name="summary/monthly" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" translucent={true} backgroundColor="transparent" />
    </ThemeProvider>
  );
}
