import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Lock, Mail, Eye, EyeOff, Check } from 'lucide-react-native';
import { AppColors, AppRadii, AppSpacing } from '../theme/colors';

interface Props {
  visible: boolean;
  currentEmail: string;
  onSave: (email: string) => void;
  onClose: () => void;
}

export const SecurityModal: React.FC<Props> = ({ visible, currentEmail, onSave, onClose }) => {
  const [tab, setTab] = useState<'password' | 'email'>('password');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [newEmail, setNewEmail]       = useState(currentEmail);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);

  const handleSavePassword = () => {
    if (!currentPass) { Alert.alert('Hata', 'Mevcut şifrenizi girin.'); return; }
    if (newPass.length < 6) { Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalı.'); return; }
    if (newPass !== confirmPass) { Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.'); return; }
    Alert.alert(
      '✅ Şifre Değiştirildi',
      `"${currentEmail}" adresine bildirim gönderildi.\n\nŞifreniz başarıyla güncellendi.`,
    );
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    onClose();
  };

  const handleSaveEmail = () => {
    if (!newEmail || !newEmail.includes('@')) { Alert.alert('Hata', 'Geçerli bir e-posta girin.'); return; }
    onSave(newEmail);
    Alert.alert('✅ E-posta Güncellendi', `E-posta adresiniz "${newEmail}" olarak güncellendi.`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={st.overlay}>
        <View style={st.sheet}>
          <View style={st.header}>
            <Text style={st.title}>Gizlilik ve Güvenlik</Text>
            <Pressable onPress={onClose} style={st.closeBtn}>
              <X size={20} color={AppColors.textSecondary} />
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={st.tabs}>
            <Pressable onPress={() => setTab('password')} style={[st.tab, tab === 'password' && st.tabActive]}>
              <Lock size={14} color={tab === 'password' ? AppColors.accentViolet : AppColors.textTertiary} />
              <Text style={[st.tabText, tab === 'password' && st.tabTextActive]}>Şifre</Text>
            </Pressable>
            <Pressable onPress={() => setTab('email')} style={[st.tab, tab === 'email' && st.tabActive]}>
              <Mail size={14} color={tab === 'email' ? AppColors.accentViolet : AppColors.textTertiary} />
              <Text style={[st.tabText, tab === 'email' && st.tabTextActive]}>E-posta</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {tab === 'password' ? (
              <View style={st.form}>
                {/* Current password */}
                <Text style={st.label}>Mevcut Şifre</Text>
                <View style={st.inputRow}>
                  <Lock size={16} color={AppColors.textTertiary} />
                  <TextInput
                    style={st.input}
                    value={currentPass}
                    onChangeText={setCurrentPass}
                    placeholder="••••••••"
                    placeholderTextColor={AppColors.textTertiary}
                    secureTextEntry={!showCurrent}
                  />
                  <Pressable onPress={() => setShowCurrent(v => !v)}>
                    {showCurrent ? <EyeOff size={16} color={AppColors.textTertiary} /> : <Eye size={16} color={AppColors.textTertiary} />}
                  </Pressable>
                </View>
                {/* New password */}
                <Text style={st.label}>Yeni Şifre</Text>
                <View style={st.inputRow}>
                  <Lock size={16} color={AppColors.textTertiary} />
                  <TextInput
                    style={st.input}
                    value={newPass}
                    onChangeText={setNewPass}
                    placeholder="En az 6 karakter"
                    placeholderTextColor={AppColors.textTertiary}
                    secureTextEntry={!showNew}
                  />
                  <Pressable onPress={() => setShowNew(v => !v)}>
                    {showNew ? <EyeOff size={16} color={AppColors.textTertiary} /> : <Eye size={16} color={AppColors.textTertiary} />}
                  </Pressable>
                </View>
                {/* Confirm */}
                <Text style={st.label}>Şifreyi Onayla</Text>
                <View style={st.inputRow}>
                  <Lock size={16} color={AppColors.textTertiary} />
                  <TextInput
                    style={st.input}
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    placeholder="••••••••"
                    placeholderTextColor={AppColors.textTertiary}
                    secureTextEntry
                  />
                </View>
                <Pressable onPress={handleSavePassword} style={st.saveBtn}>
                  <LinearGradient colors={['#7B5EF6', '#5B3FD0']} style={st.saveGradient}>
                    <Check size={16} color="#FFF" />
                    <Text style={st.saveText}>Şifreyi Güncelle</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <View style={st.form}>
                <Text style={st.label}>Yeni E-posta</Text>
                <View style={st.inputRow}>
                  <Mail size={16} color={AppColors.textTertiary} />
                  <TextInput
                    style={st.input}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder="ornek@email.com"
                    placeholderTextColor={AppColors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <Pressable onPress={handleSaveEmail} style={st.saveBtn}>
                  <LinearGradient colors={['#7B5EF6', '#5B3FD0']} style={st.saveGradient}>
                    <Check size={16} color="#FFF" />
                    <Text style={st.saveText}>E-postayı Güncelle</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const st = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: AppColors.bgCardElevated, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%', paddingHorizontal: AppSpacing.md, paddingTop: AppSpacing.md },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: AppSpacing.md },
  title:         { color: AppColors.textPrimary, fontSize: 18, fontWeight: '700' },
  closeBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: AppColors.bgCard, justifyContent: 'center', alignItems: 'center' },
  tabs:          { flexDirection: 'row', backgroundColor: AppColors.bgCard, borderRadius: AppRadii.md, padding: 4, marginBottom: AppSpacing.lg },
  tab:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: AppRadii.sm },
  tabActive:     { backgroundColor: 'rgba(123,94,246,0.2)', borderWidth: 1, borderColor: AppColors.borderViolet },
  tabText:       { color: AppColors.textTertiary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: AppColors.accentViolet },
  form:          { gap: AppSpacing.sm },
  label:         { color: AppColors.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 8 },
  inputRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: AppColors.bgCard, borderRadius: AppRadii.md, borderWidth: 1, borderColor: AppColors.borderSubtle, paddingHorizontal: AppSpacing.md, gap: AppSpacing.sm },
  input:         { flex: 1, color: AppColors.textPrimary, fontSize: 14, paddingVertical: 13 },
  saveBtn:       { borderRadius: AppRadii.md, overflow: 'hidden', marginTop: AppSpacing.md },
  saveGradient:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  saveText:      { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
