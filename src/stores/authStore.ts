import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, pin: string): Promise<boolean> => {
        try {
          // For demo purposes, check against hardcoded credentials
          // In production, this would validate against a secure backend
          const demoUsers = [
            { username: 'admin', pin: '1234', role: 'admin' as const },
            { username: 'staff', pin: '1234', role: 'staff' as const },
            { username: 'kitchen', pin: '1234', role: 'kitchen' as const },
          ];

          const demoUser = demoUsers.find(u => u.username === username && u.pin === pin);

          if (demoUser) {
            const user: User = {
              id: `user-${demoUser.username}`,
              username: demoUser.username,
              role: demoUser.role,
              pin: demoUser.pin,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            set({ user, isAuthenticated: true });
            return true;
          }

          return false;
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Login error:', error);
          }
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (updatedUser: User) => {
        set({ user: updatedUser });
      },
    }),
    {
      name: 'auth-storage',
      storage: typeof window !== 'undefined' ? {
        getItem: (name) => {
          const item = window.localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          window.localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          window.localStorage.removeItem(name);
        }
      } : undefined,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        login: state.login,
        logout: state.logout,
        updateUser: state.updateUser,
      }),
    }
  ),
);