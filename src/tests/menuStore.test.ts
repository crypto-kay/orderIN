import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMenuStore } from '../stores/menuStore';
import type { MenuItem } from '../types';

// Mock PouchDB for testing
const mockPouchDB = {
  put: vi.fn().mockResolvedValue({ id: 'test-id', rev: '1-rev' }),
  get: vi.fn().mockResolvedValue({ _id: 'test-id', _rev: '1-rev', name: 'Test Item' }),
  remove: vi.fn().mockResolvedValue({ id: 'test-id', rev: '1-rev' }),
  allDocs: vi.fn().mockResolvedValue({
    rows: [
      { doc: { _id: 'test-id', _rev: '1-rev', name: 'Test Item', price: 10, category: 'Test', isAvailable: true } }
    ]
  })
};

// Mock window.indexedDB
Object.defineProperty(window, 'indexedDB', {
  value: true,
  writable: true
});

// Mock PouchDB module
vi.mock('pouchdb', () => ({
  default: vi.fn(() => mockPouchDB)
}));

describe('menuStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useMenuStore.setState({
      items: [],
      isLoading: false
    });
    vi.clearAllMocks();
  });

  describe('addItem', () => {
    it('should create a new item with _id and return _rev', async () => {
      const { addItem } = useMenuStore.getState();
      const newItem: MenuItem = {
        id: 'test-item-1',
        name: 'Test Item',
        price: 10,
        category: 'Test',
        isAvailable: true,
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await addItem(newItem);

      expect(mockPouchDB.put).toHaveBeenCalledWith({
        _id: 'test-item-1',
        ...newItem,
        updatedAt: expect.any(Date)
      });
      expect(result).toEqual(newItem);
    });

    it('should update existing item instead of creating duplicate', async () => {
      const { addItem, updateItem } = useMenuStore.getState();
      
      // Add initial item
      const existingItem: MenuItem = {
        id: 'test-item-1',
        name: 'Test Item',
        price: 10,
        category: 'Test',
        isAvailable: true,
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addItem(existingItem);
      
      // Try to add same item again
      const duplicateItem = { ...existingItem, price: 15 };
      const result = await addItem(duplicateItem);

      // Should call updateItem instead of creating duplicate
      expect(mockPouchDB.put).toHaveBeenCalledTimes(2); // Once for initial add, once for update
      expect(result).toEqual(duplicateItem);
    });
  });

  describe('updateItem', () => {
    it('should update existing item with _rev', async () => {
      const { updateItem } = useMenuStore.getState();
      const updatedItem: MenuItem = {
        id: 'test-item-1',
        name: 'Updated Item',
        price: 15,
        category: 'Updated',
        isAvailable: false,
        description: 'Updated description',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await updateItem(updatedItem);

      expect(mockPouchDB.get).toHaveBeenCalledWith('test-item-1');
      expect(mockPouchDB.put).toHaveBeenCalledWith({
        _id: 'test-item-1',
        _rev: '1-rev',
        ...updatedItem,
        updatedAt: expect.any(Date)
      });
    });

    it('should handle conflict by retrying with latest version', async () => {
      const { updateItem } = useMenuStore.getState();
      
      // Mock conflict on first put, success on second
      mockPouchDB.put
        .mockRejectedValueOnce({ name: 'conflict', message: 'Document update conflict' })
        .mockResolvedValueOnce({ id: 'test-item-1', rev: '2-rev' });

      const updatedItem: MenuItem = {
        id: 'test-item-1',
        name: 'Updated Item',
        price: 15,
        category: 'Updated',
        isAvailable: false,
        description: 'Updated description',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await updateItem(updatedItem);

      expect(mockPouchDB.put).toHaveBeenCalledTimes(2);
      expect(mockPouchDB.get).toHaveBeenCalledTimes(2); // Initial get + retry get
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle availability without creating duplicate', async () => {
      const { toggleAvailability, addItem } = useMenuStore.getState();
      
      // Add initial item
      const initialItem: MenuItem = {
        id: 'test-item-1',
        name: 'Test Item',
        price: 10,
        category: 'Test',
        isAvailable: true,
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addItem(initialItem);
      
      // Toggle availability
      await toggleAvailability('test-item-1');
      
      const items = useMenuStore.getState().items;
      const toggledItem = items.find(item => item.id === 'test-item-1');
      
      expect(toggledItem?.isAvailable).toBe(false);
      expect(mockPouchDB.put).toHaveBeenCalledTimes(2); // Initial add + update
    });
  });
});