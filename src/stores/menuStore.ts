import { create } from 'zustand';
import { DEFAULT_MENU_ITEMS } from '../mocks/menuData';
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
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
  setItems: (items: MenuItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }
};

export const useMenuStore = create<MenuStore>((set, get) => {
  const loadItems = async () => {
    set({ isLoading: true });
    
    try {
      if (PouchDB) {
        // Use PouchDB if available
        const db = new PouchDB('orderin-menu');
        const result = await db.allDocs({
          include_docs: true,
          attachments: false
        });
        
        const items = result.rows.map((row: any) => row.doc as MenuItem);
        set({ items, isLoading: false });
      } else {
        // Fallback to localStorage
        const items = localStorageHelper.getItems();
        
        // Seed with mock data if empty and in development
        if (items.length === 0 && import.meta.env.MODE === 'development') {
          console.log('DEV: seeded mock menu data');
          localStorageHelper.setItems(DEFAULT_MENU_ITEMS);
          set({ items: DEFAULT_MENU_ITEMS, isLoading: false });
        } else {
          set({ items, isLoading: false });
        }
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
      set({ items: [], isLoading: false });
    }
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
    console.log("🟥 STORE ADD start", item);
    try {
      // ensure price is number
      item.price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;

      // optimistic update first to ensure UI re-render
      set((s) => ({ items: [item, ...s.items] }));

      // persist to PouchDB if available, else fallback
      if (typeof window !== 'undefined' && window.indexedDB) {
        try {
          if (PouchDB) {
            const db = new PouchDB('orderin-menu');
            await db.put({ ...item, updatedAt: new Date() });
            console.log('PouchDB save success', item.id);
          } else {
            localStorageFallbackSave([...get().items]);
          }
        } catch (pErr) {
          console.error('pouch put error', pErr);
          localStorageFallbackSave([...get().items]);
        }
      } else {
        localStorageFallbackSave([...get().items]);
      }

      console.log('🟥 STORE ADD done', item.id);
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