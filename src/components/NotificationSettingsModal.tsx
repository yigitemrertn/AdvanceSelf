import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, Switch, ScrollView,
} from 'react-native';
import { X, Bell, Clock, Sparkles, TrendingUp, AlertCircle } from 'lucide-react-native';
import { AppColors, AppRadii, AppSpacing } from '../theme/colors';

interface Props { visible: boolean; onClose: () => void; }

interface NotifSetting {
  id: string; icon: any; label: string; sub: string; enabled: boolean;
}

export const NotificationSettingsModal: React.FC<Props> = ({ visible, onClose }) => {
  const [settings, setSettings] = useState<NotifSetting[]>([
    { id: 'daily',     icon: Clock,       label: 'Günlük Hatırlatıcı',   sub: 'Sabah rutini ve rutin görevler',        enabled: true  },
    { id: 'analysis',  icon: TrendingUp,  label: 'Analiz Sonuçları',     sub: 'Yeni cilt analizi hazır olduğunda',     enabled: true  },
    { id: 'recommend', icon: Sparkles,    label: 'Yeni Öneriler',        sub: 'Kişiselleştirilmiş öneri bildirimleri', enabled: false },
    { id: 'report',    icon: Bell,        label: 'Haftalık Rapor',       sub: 'Her pazartesi haftalık özet',            enabled: true  },
    { id: 'warning',   icon: AlertCircle, label: 'Cilt Uyarıları',       sub: 'Kritik cilt durumu bildirimleri',       enabled: true  },
  ]);

  const toggle = (id: string) =>
    setSettings(s => s.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={st.overlay}>
        <View style={st.sheet}>
          <View style={st.header}>
            <Text style={st.title}>Bildirim Ayarları</Text>
            <Pressable onPress={onClose} style={st.closeBtn}>
              <X size={20} color={AppColors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {settings.map((s, i) => {
              const Icon = s.icon;
              return (
                <View key={s.id}>
                  <View style={st.row}>
                    <View style={[st.iconWrap, { backgroundColor: s.enabled ? 'rgba(123,94,246,0.15)' : 'rgba(255,255,255,0.05)' }]}>
                      <Icon size={18} color={s.enabled ? AppColors.accentVioletLight : AppColors.textTertiary} />
                    </View>
                    <View style={st.rowText}>
                      <Text style={st.rowLabel}>{s.label}</Text>
                      <Text style={st.rowSub}>{s.sub}</Text>
                    </View>
                    <Switch
                      value={s.enabled}
                      onValueChange={() => toggle(s.id)}
                      trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(123,94,246,0.6)' }}
                      thumbColor={s.enabled ? AppColors.accentViolet : AppColors.textTertiary}
                    />
                  </View>
                  {i < settings.length - 1 && <View style={st.divider} />}
                </View>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const st = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: AppColors.bgCardElevated, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%', paddingHorizontal: AppSpacing.md, paddingTop: AppSpacing.md },
  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: AppSpacing.lg },
  title:    { color: AppColors.textPrimary, fontSize: 18, fontWeight: '700' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: AppColors.bgCard, justifyContent: 'center', alignItems: 'center' },
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: AppSpacing.md },
  iconWrap: { width: 40, height: 40, borderRadius: AppRadii.sm, justifyContent: 'center', alignItems: 'center' },
  rowText:  { flex: 1 },
  rowLabel: { color: AppColors.textPrimary, fontSize: 14, fontWeight: '600' },
  rowSub:   { color: AppColors.textTertiary, fontSize: 11, marginTop: 2 },
  divider:  { height: 1, backgroundColor: AppColors.borderSubtle },
});
