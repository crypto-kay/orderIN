import type { MenuItem } from '../types';

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Cappuccino',
    price: 4.50,
    category: 'Beverages',
    isAvailable: true,
    description: 'Classic Italian coffee drink prepared with espresso and hot milk',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Caesar Salad',
    price: 8.99,
    category: 'Salads',
    isAvailable: true,
    description: 'Fresh romaine lettuce, parmesan cheese, croutons, and Caesar dressing',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Margherita Pizza',
    price: 12.99,
    category: 'Pizza',
    isAvailable: true,
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Chocolate Cake',
    price: 6.50,
    category: 'Desserts',
    isAvailable: false,
    description: 'Rich chocolate cake with chocolate frosting',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];