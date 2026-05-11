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

interface UserState {
  userId: number | null;
  token: string | null;
  geminiKey: string | null;
  tasks: Task[];
  setAuth: (userId: number, token: string) => void;
  setGeminiKey: (key: string) => void;
  logout: () => void;
  toggleTask: (id: string) => void;
  resetTasks: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      token: null,
      geminiKey: null,
      tasks: [
        { 
          id: '1', 
          title: 'Sabah C Vitamini', 
          completed: false, 
          time: '08:00', 
          category: 'Bakım',
          description: 'C vitamini, cildinizi aydınlatır ve serbest radikallere karşı korur.'
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
          description: 'Retinol, hücre yenilenmesini hızlandırır. Bezelye tanesi kadar ürünü kuru cilde uygulayın.'
        },
      ],
      setAuth: (userId, token) => set({ userId, token }),
      setGeminiKey: (key) => set({ geminiKey: key }),
      logout: () => set({ userId: null, token: null, geminiKey: null }),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === id ? { ...t, completed: !t.completed } : t
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
