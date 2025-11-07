import { create } from 'zustand';
import type { MenuItem } from '../types';

// Try to import PouchDB, fallback to localStorage if not available
let PouchDB: any;
try {
  PouchDB = (await import('pouchdb')).default;
} catch (error) {
  console.warn('PouchDB not available, falling back to localStorage');
  PouchDB = null;
}

interface MenuStore {
  items: MenuItem[];
  isLoading: boolean;
  loadItems: () => Promise<void>;
  addItem: (item: MenuItem) => Promise<void>;
  updateItem: (item: MenuItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'orderin-menu-items';

// Simple localStorage fallback
const localStorageHelper = {
  getItems: (): MenuItem[] => {
    try {
      const stored = localStorage.getItem(MENU_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
  setItems: (items: MenuItem[]) => {
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }
};

export const MENU_STORAGE_KEY = 'orderin-menu-items';

export const useMenuStore = create<MenuStore>((set, get) => {
  const loadItems = async () => {
    console.log('menuStore.loadItems start');
    set({ isLoading: true });
    
    try {
      let persisted: MenuItem[] = [];
      if (typeof window !== 'undefined' && window.indexedDB && PouchDB) {
        // Use PouchDB if available
        const db = new PouchDB('orderin-menu');
        const result = await db.allDocs({
          include_docs: true,
          attachments: false
        });
        
        persisted = (result.rows || []).map((r: any) => {
          const doc = r.doc as any;
          // map _id to id if needed
          return { id: doc._id ?? doc.id, ...doc } as MenuItem;
        });
        console.log('menuStore.loadItems PouchDB success', persisted.length);
      } else {
        // Fallback to localStorage
        persisted = localStorageHelper.getItems();
        console.log('menuStore.loadItems localStorage success', persisted.length);
      }
      
      // only set items if persisted has entries OR current store is empty
      const current = get().items || [];
      if (persisted.length > 0 || current.length === 0) {
        set({ items: persisted, isLoading: false });
      } else {
        console.log('menuStore.loadItems: keeping current in-memory items', current.length);
      }
    } catch (error) {
      console.error('menuStore.loadItems error', error);
      set({ items: [], isLoading: false });
    }
    return get().items;
  };

  const localStorageFallbackSave = (items: MenuItem[]) => {
    try {
      localStorageHelper.setItems(items);
      console.log('localStorageFallbackSave success', items.length);
    } catch (error) {
      console.error('localStorageFallbackSave error', error);
    }
  };

  const addItem = async (item: MenuItem) => {
    console.log('menuStore.addItem start', item);
    try {
      // ensure price is number
      item.price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      
      // persist to PouchDB if available, else fallback
      if (typeof window !== 'undefined' && window.indexedDB && PouchDB) {
        try {
          const db = new PouchDB('orderin-menu');
          // Use _id field to avoid PouchDB missing_id error
          await db.put({ _id: item.id, ...item, updatedAt: new Date() });
          console.log('PouchDB save success', item.id);
        } catch (pErr) {
          console.error('pouch put error', pErr);
          // fallback to localStorage if pouch errored
          localStorageHelper.setItems([...get().items, item]);
          console.log('localStorage fallback success', get().items.length);
        }
      } else {
        localStorageHelper.setItems([...get().items, item]);
        console.log('localStorage save success', get().items.length);
      }
      
      console.log('menuStore.addItem done', item.id);
      return item;
    } catch (err) {
      console.error('menuStore.addItem error', err);
      // revert optimistic update if needed
      set(s => ({ items: s.items.filter(i => i.id !== item.id) }));
      throw err;
    }
  };

  const updateItem = async (updatedItem: MenuItem) => {
    try {
      if (PouchDB) {
        const db = new PouchDB('orderin-menu');
        await db.put({ ...updatedItem, updatedAt: new Date() });
        await loadItems();
      } else {
        const currentItems = get().items;
        const newItems = currentItems.map(item => 
          item.id === updatedItem.id 
            ? { ...updatedItem, updatedAt: new Date() }
            : item
        );
        localStorageHelper.setItems(newItems);
        set({ items: newItems });
      }
    } catch (error) {
      console.error('Failed to update menu item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      if (PouchDB) {
        const db = new PouchDB('orderin-menu');
        const doc = await db.get(id);
        await db.remove(doc);
        await loadItems();
      } else {
        const currentItems = get().items;
        const newItems = currentItems.filter(item => item.id !== id);
        localStorageHelper.setItems(newItems);
        set({ items: newItems });
      }
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const toggleAvailability = async (id: string) => {
    const currentItems = get().items;
    const item = currentItems.find(item => item.id === id);
    if (item) {
      await updateItem({ ...item, isAvailable: !item.isAvailable });
    }
  };

  return {
    items: [],
    isLoading: false,
    loadItems,
    addItem,
    updateItem,
    deleteItem,
    toggleAvailability
  };
});