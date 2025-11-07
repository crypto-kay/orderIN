// DEV: demo credentials for local dev only — remove before production
import type { User } from '../types';

export const devUser: User = {
  id: '00000000-0000-0000-0000-000000000000',
  username: 'admin@orderin.test',
  role: 'admin',
  pin: 'password',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};