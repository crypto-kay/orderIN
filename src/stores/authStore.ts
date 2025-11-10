import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSchema } from '../schemas';
import type { User } from '../types';
import PouchDB from 'pouchdb';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const db = new PouchDB<User>('users');

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
    }),
    {
      name: 'auth-storage',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  ),
);