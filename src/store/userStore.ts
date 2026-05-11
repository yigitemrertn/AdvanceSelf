import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  time: string;
  category: string;
  description: string;
}

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  photoUri: string | null;
}

interface UserState {
  profile: UserProfile;
  tasks: Task[];
  updateProfile: (profile: Partial<UserProfile>) => void;
  toggleTask: (id: string) => void;
  resetTasks: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        name: 'Elena Kovač',
        email: 'elena.kovac@lumera.ai',
        bio: 'Cilt bakımı ve kişisel gelişim tutkunu. Lumera ile her gün kendimi geliştiriyorum.',
        photoUri: null,
      },
      tasks: [
        { 
          id: '1', 
          title: 'Sabah C Vitamini', 
          completed: false, 
          time: '08:00', 
          category: 'Bakım',
          description: 'C vitamini, cildinizi aydınlatır ve serbest radikallere karşı korur. Temizlenmiş cilde 3-4 damla uygulayın ve güneş kremi ile kilitleyin.'
        },
        { 
          id: '2', 
          title: 'Güneş Kremi Uygula', 
          completed: false, 
          time: '09:00', 
          category: 'Koruma',
          description: 'Güneşin UV ışınları yaşlanmanın %80 nedenidir. İki parmak kuralı ile tüm yüzünüze ve boynunuza uygulayın.'
        },
        { 
          id: '3', 
          title: 'Akşam Retinol', 
          completed: false, 
          time: '21:00', 
          category: 'Yenileme',
          description: 'Retinol, hücre yenilenmesini hızlandırır. Bezelye tanesi kadar ürünü kuru cilde uygulayın. Başlangıçta haftada 2-3 gece kullanın.'
        },
      ],
      updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === id ? { ...t, completed: true } : t
        ),
      })),
      resetTasks: () => set((state) => ({
        tasks: state.tasks.map(t => ({ ...t, completed: false }))
      })),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
