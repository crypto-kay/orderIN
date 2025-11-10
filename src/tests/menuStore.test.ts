import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock PouchDB before importing the store
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

// Mock crypto.randomUUID for tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-12345')
  },
  writable: true
});

// Mock logger to avoid console output in tests
vi.mock('../lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Import after mocking
import { useMenuStore } from '../stores/menuStore';
import type { MenuItem } from '../types';

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
      const store = useMenuStore.getState();
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

      const result = await store.addItem(newItem);

      expect(mockPouchDB.put).toHaveBeenCalledWith({
        _id: 'test-item-1',
        ...newItem,
        updatedAt: expect.any(Date)
      });
      expect(result).toEqual(newItem);
    });

    it('should handle optimistic updates correctly', async () => {
      const store = useMenuStore.getState();
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

      // Item should be added optimistically
      const promise = store.addItem(newItem);
      const items = useMenuStore.getState().items;
      expect(items).toContainEqual(newItem);

      await promise;
    });
  });

  describe('updateItem', () => {
    it('should update existing item with _rev', async () => {
      const store = useMenuStore.getState();
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

      await store.updateItem(updatedItem);

      expect(mockPouchDB.get).toHaveBeenCalledWith('test-item-1');
      expect(mockPouchDB.put).toHaveBeenCalledWith({
        _id: 'test-item-1',
        _rev: '1-rev',
        ...updatedItem,
        updatedAt: expect.any(Date)
      });
    });

    it('should handle conflict by retrying with latest version', async () => {
      const store = useMenuStore.getState();

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

      await store.updateItem(updatedItem);

      expect(mockPouchDB.put).toHaveBeenCalledTimes(2);
      expect(mockPouchDB.get).toHaveBeenCalledTimes(2); // Initial get + retry get
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle availability correctly', async () => {
      const store = useMenuStore.getState();

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

      await store.addItem(initialItem);

      // Toggle availability
      await store.toggleAvailability('test-item-1');

      const items = useMenuStore.getState().items;
      const toggledItem = items.find(item => item.id === 'test-item-1');

      expect(toggledItem?.isAvailable).toBe(false);
      expect(mockPouchDB.put).toHaveBeenCalledTimes(2); // Initial add + update
    });
  });
});