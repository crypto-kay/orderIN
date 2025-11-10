import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock PouchDB before importing the store
const mockPouchDB = {
  put: vi.fn().mockResolvedValue({ id: 'test-order-id', rev: '1-rev' }),
  get: vi.fn().mockResolvedValue({ 
    _id: 'test-order-id', 
    _rev: '1-rev', 
    id: 'ORD-1234567890',
    status: 'Pending',
    items: [],
    total: 0,
    createdAt: '2023-01-01T00:00:00.000Z'
  }),
  remove: vi.fn().mockResolvedValue({ id: 'test-order-id', rev: '1-rev' }),
  allDocs: vi.fn().mockResolvedValue({
    rows: []
  }),
  post: vi.fn().mockResolvedValue({ id: 'test-order-id', rev: '1-rev' })
};

// Mock PouchDB module
vi.mock('pouchdb', () => ({
  default: vi.fn(() => mockPouchDB)
}));

// Import after mocking
import { useOrderStore } from '../stores/orderStore';
import type { Order } from '../types/Order';

describe('orderStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useOrderStore.setState({
      orders: [],
      loading: false,
      error: null,
      updatingId: null
    });
    vi.clearAllMocks();
  });

  describe('addOrder', () => {
    it('should create a new order with correct structure', async () => {
      const store = useOrderStore.getState();
      const orderData = {
        items: [{ id: 'item1', name: 'Test Item', price: 10, quantity: 2 }],
        total: 20,
        status: 'Pending' as const,
      };

      await store.addOrder(orderData);

      expect(mockPouchDB.post).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: expect.stringMatching(/^ORD-\d+$/),
          ...orderData,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );

      const orders = useOrderStore.getState().orders;
      expect(orders).toHaveLength(1);
      expect(orders[0]).toMatchObject(orderData);
      expect(orders[0].id).toMatch(/^ORD-\d+$/);
    });
  });

  describe('updateOrder', () => {
    it('should update order status from Pending to Preparing', async () => {
      const store = useOrderStore.getState();
      const orderId = 'ORD-1234567890';
      
      // Set up initial order
      const initialOrder: Order = {
        id: orderId,
        items: [{ id: 'item1', name: 'Test Item', price: 10, quantity: 2 }],
        total: 20,
        status: 'Pending',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      store.setOrders([initialOrder]);

      // Update status to Preparing
      await store.updateOrder(orderId, { status: 'Preparing' });

      expect(mockPouchDB.get).toHaveBeenCalledWith(orderId);
      expect(mockPouchDB.put).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: orderId,
          status: 'Preparing',
          updatedAt: expect.any(String),
        })
      );

      const orders = useOrderStore.getState().orders;
      const updatedOrder = orders.find(o => o.id === orderId);
      expect(updatedOrder?.status).toBe('Preparing');
    });

    it('should update order status from Preparing to Served', async () => {
      const store = useOrderStore.getState();
      const orderId = 'ORD-1234567890';
      
      // Set up initial order
      const initialOrder: Order = {
        id: orderId,
        items: [{ id: 'item1', name: 'Test Item', price: 10, quantity: 2 }],
        total: 20,
        status: 'Preparing',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      store.setOrders([initialOrder]);

      // Update status to Served
      await store.updateOrder(orderId, { status: 'Served' });

      expect(mockPouchDB.get).toHaveBeenCalledWith(orderId);
      expect(mockPouchDB.put).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: orderId,
          status: 'Served',
          updatedAt: expect.any(String),
        })
      );

      const orders = useOrderStore.getState().orders;
      const updatedOrder = orders.find(o => o.id === orderId);
      expect(updatedOrder?.status).toBe('Served');
    });

    it('should handle conflict and retry with latest version', async () => {
      const store = useOrderStore.getState();
      const orderId = 'ORD-1234567890';
      
      // Mock conflict on first put, success on second
      mockPouchDB.put
        .mockRejectedValueOnce({ name: 'conflict', message: 'Document update conflict' })
        .mockResolvedValueOnce({ id: orderId, rev: '2-rev' });

      // Mock get to return latest doc on retry
      mockPouchDB.get
        .mockResolvedValueOnce({ 
          _id: orderId, 
          _rev: '1-rev', 
          id: orderId,
          status: 'Preparing',
          items: [],
          total: 0,
          createdAt: '2023-01-01T00:00:00.000Z'
        })
        .mockResolvedValueOnce({ 
          _id: orderId, 
          _rev: '2-rev', 
          id: orderId,
          status: 'Preparing',
          items: [],
          total: 0,
          createdAt: '2023-01-01T00:00:00.000Z'
        });

      const initialOrder: Order = {
        id: orderId,
        items: [{ id: 'item1', name: 'Test Item', price: 10, quantity: 2 }],
        total: 20,
        status: 'Preparing',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      store.setOrders([initialOrder]);

      // Update status to Served
      await store.updateOrder(orderId, { status: 'Served' });

      expect(mockPouchDB.put).toHaveBeenCalledTimes(2);
      expect(mockPouchDB.get).toHaveBeenCalledTimes(2);
    });

    it('should set updatingId during update and clear it after', async () => {
      const store = useOrderStore.getState();
      const orderId = 'ORD-1234567890';
      
      const initialOrder: Order = {
        id: orderId,
        items: [{ id: 'item1', name: 'Test Item', price: 10, quantity: 2 }],
        total: 20,
        status: 'Pending',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      store.setOrders([initialOrder]);

      // Start update (but don't await)
      const updatePromise = store.updateOrder(orderId, { status: 'Preparing' });
      
      // Should have updatingId set
      expect(useOrderStore.getState().updatingId).toBe(orderId);

      await updatePromise;
      
      // Should have updatingId cleared
      expect(useOrderStore.getState().updatingId).toBe(null);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order and update local state', async () => {
      const store = useOrderStore.getState();
      const orderId = 'ORD-1234567890';
      
      const initialOrder: Order = {
        id: orderId,
        items: [{ id: 'item1', name: 'Test Item', price: 10, quantity: 2 }],
        total: 20,
        status: 'Served',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      store.setOrders([initialOrder]);

      await store.deleteOrder(orderId);

      expect(mockPouchDB.get).toHaveBeenCalledWith(orderId);
      expect(mockPouchDB.remove).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: orderId,
        })
      );

      const orders = useOrderStore.getState().orders;
      expect(orders).toHaveLength(0);
    });
  });

  describe('item removal restrictions', () => {
    it('should block item removal when order status is Preparing', async () => {
      const store = useOrderStore.getState();
      const orderId = 'ORD-1234567890';
      
      // Set up order in Preparing status with items
      const preparingOrder: Order = {
        id: orderId,
        _id: orderId,
        items: [
          { id: 'item1', name: 'Test Item 1', price: 10, quantity: 2 },
          { id: 'item2', name: 'Test Item 2', price: 15, quantity: 1 }
        ],
        total: 35,
        status: 'Preparing',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      store.setOrders([preparingOrder]);

      // Attempt to update with removed items
      const updateWithRemovedItems = {
        items: [
          { id: 'item1', name: 'Test Item 1', price: 10, quantity: 2 }
          // item2 removed
        ],
        total: 20,
      };

      await store.updateOrder(orderId, updateWithRemovedItems);

      // Should have error and not update the order
      const state = useOrderStore.getState();
      expect(state.error).toBe('Cannot remove items while order is being prepared');
      expect(state.updatingId).toBe(null);
      
      // Order should remain unchanged
      const finalOrder = state.orders.find(o => o.id === orderId);
      expect(finalOrder?.items).toHaveLength(2);
    });

    it('should allow item additions when order status is Preparing', async () => {
      const store = useOrderStore.getState();
      const orderId = 'ORD-1234567890';
      
      // Set up order in Preparing status
      const preparingOrder: Order = {
        id: orderId,
        _id: orderId,
        items: [
          { id: 'item1', name: 'Test Item 1', price: 10, quantity: 2 }
        ],
        total: 20,
        status: 'Preparing',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      store.setOrders([preparingOrder]);

      // Add new item
      const updateWithAddedItem = {
        items: [
          { id: 'item1', name: 'Test Item 1', price: 10, quantity: 2 },
          { id: 'item2', name: 'Test Item 2', price: 15, quantity: 1 }
        ],
        total: 35,
      };

      await store.updateOrder(orderId, updateWithAddedItem);

      // Should succeed
      const state = useOrderStore.getState();
      expect(state.error).toBe(null);
      expect(state.updatingId).toBe(null);
      
      // Order should have new item
      const finalOrder = state.orders.find(o => o.id === orderId);
      expect(finalOrder?.items).toHaveLength(2);
    });
  });
});