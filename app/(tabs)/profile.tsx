import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '../../src/theme/colors';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profil Ekranı Yakında</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: AppColors.textPrimary,
    fontSize: 18,
  },
});
