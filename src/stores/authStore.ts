import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSchema } from '../schemas';
import type { User } from '../types';
// DEV: demo credentials for local dev only — remove before production
import { devUser } from '../mocks/devAuth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Mock users for development
const mockUsers: User[] = [
  {
    id: 'admin-001',
    username: 'admin',
    role: 'admin',
    pin: '1234',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'staff-001',
    username: 'staff',
    role: 'staff',
    pin: '1234',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'kitchen-001',
    username: 'kitchen',
    role: 'kitchen',
    pin: '1234',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // DEV: add demo user in development only
  ...(import.meta.env.MODE === 'development' ? [devUser] : []),
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get /* unused param placeholder */) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, pin: string): Promise<boolean> => {
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const foundUser = mockUsers.find(
            user => user.username === username && user.pin === pin
          );

          if (foundUser) {
            const validatedUser = UserSchema.parse(foundUser);
            set({ user: validatedUser, isAuthenticated: true });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (user: User) => {
        const validatedUser = UserSchema.parse(user);
        set({ user: validatedUser });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);