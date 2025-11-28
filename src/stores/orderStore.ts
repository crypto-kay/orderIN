import PouchDB from 'pouchdb';
import { create } from 'zustand';
import type { Order } from '../types/Order';

interface OrderStore {
  orders: Order[];
  loading: boolean;
  error: string | null;
  updatingId: string | null;
  loadOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  setOrders: (orders: Order[]) => void;
}

const db = new PouchDB<Order>('orders');

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  updatingId: null,

  loadOrders: async () => {
    set({ loading: true, error: null });
    try {
      const result = await db.allDocs({
        include_docs: true,
        descending: true,
      });
      const orders = result.rows.map(row => row.doc as Order);
      set({ orders, loading: false });
      if (process.env.NODE_ENV !== 'production') {
        console.log('📦 ORDERS_LOADED', orders.length);
      }
    } catch (error: unknown) {
      console.error('❌ LOAD_ORDERS_ERROR', error);
      set({ error: 'Failed to load orders', loading: false });
    }
  },

  addOrder: async (orderData) => {
    const now = new Date().toISOString();
    const orderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      _id: orderId, // Ensure _id matches id for PouchDB consistency
      createdAt: now,
      updatedAt: now,
    };

    set({ loading: true, error: null });
    try {
      // Use db.put() instead of db.post() to set custom _id
      const response = await db.put(newOrder);
      const currentOrders = get().orders;
      set({
        orders: [{ ...newOrder, _rev: response.rev }, ...currentOrders],
        loading: false
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log('🟦 ORDER_CREATED', newOrder.id);
      }
    } catch (error: unknown) {
      console.error('❌ ADD_ORDER_ERROR', error);
      set({ error: 'Failed to create order', loading: false });
    }
  },

  updateOrder: async (id: string, updates: Partial<Order>) => {
    set({ updatingId: id, loading: true, error: null });

    const currentOrders = get().orders;
    const originalOrder = currentOrders.find(order => order.id === id);

    if (!originalOrder) {
      set({ error: 'Order not found', loading: false, updatingId: null });
      return;
    }

    // Optimistic UI update
    const optimisticOrder: Order = {
      ...originalOrder,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Block item removal if order is being prepared
    if (originalOrder.status === 'Preparing' && updates.items) {
      const currentItems = originalOrder.items || [];
      const newItems = updates.items || [];
      
      // Check if any items were removed
      const removedItems = currentItems.filter(currentItem => 
        !newItems.some(newItem => newItem.id === currentItem.id)
      );
      
      if (removedItems.length > 0) {
        console.warn('🟨 BLOCKED_REMOVE_WHILE_PREPARING', { orderId: id, removedItems: removedItems.map(i => i.id) });
        set({ error: 'Cannot remove items while order is being prepared', loading: false, updatingId: null });
        return;
      }
    }

    set({
      orders: currentOrders.map(order =>
        order.id === id ? optimisticOrder : order
      )
    });

    const tryUpdate = async (attempt: number): Promise<void> => {
      try {
        // Use proper _id for PouchDB lookup
        const key = originalOrder._id ?? id;
        const latestDoc = await db.get(key);
        console.log(`📝 UPDATE_ATTEMPT_${attempt}: using _id=${key}, _rev=${latestDoc._rev}`);

        const updatedOrder: Order = {
          ...latestDoc,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const response = await db.put(updatedOrder);

        // Success - update local state with new _rev
        set({
          orders: get().orders.map(order =>
            order.id === id ? { ...updatedOrder, _rev: response.rev } : order
          ),
          loading: false,
          updatingId: null,
        });

        console.log(`🟩 UPDATE_SUCCESS (new _rev: ${response.rev})`);

      } catch (error: unknown) {
        if (error && typeof error === 'object') {
          const errorObj = error as { name?: string; status?: number };

          if ((errorObj.name === 'not_found' || errorObj.status === 404) && attempt === 1) {
            console.log('🟨 NOT_FOUND: searching allDocs for order...');
            // Search allDocs to find correct _id
            const allDocs = await db.allDocs({ include_docs: true });
            const foundDoc = allDocs.rows.find(row => row.doc?.id === id);
            if (foundDoc?.doc) {
              const retryKey = foundDoc.doc._id;
              const latestDoc = await db.get(retryKey);
              const updatedOrder: Order = {
                ...latestDoc,
                ...updates,
                updatedAt: new Date().toISOString(),
              };
              const response = await db.put(updatedOrder);
              set({
                orders: get().orders.map(order =>
                  order.id === id ? { ...updatedOrder, _rev: response.rev } : order
                ),
                loading: false,
                updatingId: null,
              });
              console.log(`🟩 UPDATE_SUCCESS after fallback (new _rev: ${response.rev})`);
              return;
            }
          } else if (errorObj.name === 'conflict' && attempt === 1) {
            console.log('🟨 CONFLICT_DETECTED, retrying...');
            // Brief backoff before retry
            await new Promise(resolve => setTimeout(resolve, 100));
            return tryUpdate(2);
          }
        }

        // Failed after retry or different error - revert optimistic update
        console.error('🟥 UPDATE_FAILED_AFTER_RETRY', error);

        set({
          orders: currentOrders, // Revert to original state
          error: 'Failed to update order',
          loading: false,
          updatingId: null,
        });
      }
    };

    tryUpdate(1);
  },

  deleteOrder: async (id: string) => {
    set({ loading: true, error: null });

    const currentOrders = get().orders;
    const orderToDelete = currentOrders.find(order => order.id === id);

    if (!orderToDelete) {
      set({ error: 'Order not found', loading: false });
      return;
    }

    try {
      // Use proper _id for PouchDB lookup
      const key = orderToDelete._id ?? id;
      const doc = await db.get(key);
      await db.remove(doc);

      // Update local state
      set({
        orders: currentOrders.filter(order => order.id !== id),
        loading: false,
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('🗑️ ORDER_DELETED', id);
      }
    } catch (error: unknown) {
      console.error('❌ DELETE_ORDER_ERROR', error);
      set({ error: 'Failed to delete order', loading: false });
    }
  },

  setOrders: (orders: Order[]) => {
    set({ orders });
  },
}));