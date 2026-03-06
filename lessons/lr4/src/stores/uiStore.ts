import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  soundEnabled: boolean;
  settingsModalOpen: boolean;
  statsModalOpen: boolean;
  toggleTheme: () => void;
  toggleSound: () => void;
  setTheme: (theme: Theme) => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  toggleSettingsModal: () => void;
  openStatsModal: () => void;
  closeStatsModal: () => void;
  toggleStatsModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      soundEnabled: true,
      settingsModalOpen: false,
      statsModalOpen: false,
      
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }));
      },
      
      toggleSound: () => {
        set((state) => ({
          soundEnabled: !state.soundEnabled
        }));
      },
      
      setTheme: (theme: Theme) => {
        set({ theme });
      },

      openSettingsModal: () => {
        set({ settingsModalOpen: true });
      },

      closeSettingsModal: () => {
        set({ settingsModalOpen: false });
      },

      toggleSettingsModal: () => {
        set((state) => ({ settingsModalOpen: !state.settingsModalOpen }));
      },

      openStatsModal: () => {
        set({ statsModalOpen: true });
      },

      closeStatsModal: () => {
        set({ statsModalOpen: false });
      },

      toggleStatsModal: () => {
        set((state) => ({ statsModalOpen: !state.statsModalOpen }));
      }
    }),
    {
      name: 'ui-storage',
      version: 1,
    }
  )
);