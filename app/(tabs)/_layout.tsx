import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { AppColors, AppRadii } from '../../src/theme/colors';
import { Home, ClipboardList, Sparkles, UserCircle, Activity } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: AppColors.bgSecondary,
          borderTopColor: AppColors.borderSubtle,
          height: 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          position: 'absolute',
          elevation: 0,
        },
        tabBarActiveTintColor: AppColors.accentViolet,
        tabBarInactiveTintColor: AppColors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'ANA SAYFA',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Home color={color} size={22} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="survey"
        options={{
          title: 'ANKET',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <ClipboardList color={color} size={22} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'İLERLEME',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Activity color={color} size={22} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{
          title: 'ÖNERİLER',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Sparkles color={color} size={22} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFİL',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <UserCircle color={color} size={22} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 8,
    borderRadius: AppRadii.full,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(123, 94, 246, 0.15)',
  },
});
