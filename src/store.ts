import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatwootAccount, ViewType } from './types';

interface AppState {
  accounts: ChatwootAccount[];
  activeAccountId: string | null;
  currentView: ViewType;
  corsProxy: string;
  
  addAccount: (account: ChatwootAccount) => void;
  removeAccount: (id: string) => void;
  setActiveAccount: (id: string | null) => void;
  setCurrentView: (view: ViewType) => void;
  setCorsProxy: (proxy: string) => void;
  getActiveAccount: () => ChatwootAccount | null;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      activeAccountId: null,
      currentView: 'accounts',
      corsProxy: '',

      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, account],
        })),

      removeAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          activeAccountId: state.activeAccountId === id ? null : state.activeAccountId,
        })),

      setActiveAccount: (id) => set({ activeAccountId: id }),

      setCurrentView: (view) => set({ currentView: view }),

      setCorsProxy: (proxy) => set({ corsProxy: proxy }),

      getActiveAccount: () => {
        const state = get();
        return state.accounts.find((a) => a.id === state.activeAccountId) || null;
      },
    }),
    {
      name: 'chatwoot-manager-storage',
    }
  )
);
