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
  loadItems: () => Promise<MenuItem[]>;
  addItem: (item: MenuItem) => Promise<MenuItem>;
  updateItem: (item: MenuItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
}

export const MENU_STORAGE_KEY = 'orderin-menu-items';

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

export const useMenuStore = create<MenuStore>((set, get) => {
  const loadItems = async () => {
    console.log('menuStore.loadItems start');
    try {
      let persisted: MenuItem[] = [];
      if (typeof window !== 'undefined' && window.indexedDB && PouchDB) {
        const db = new PouchDB('orderin-menu');
        const res = await db.allDocs({ include_docs: true });
        persisted = (res.rows || []).map((r: any) => {
          const doc = r.doc as any;
          // Clean PouchDB metadata and map _id to id
          const { _id, _rev, ...cleanDoc } = doc;
          return { id: _id, _rev, ...cleanDoc } as MenuItem;
        });
      } else {
        const raw = localStorage.getItem(MENU_STORAGE_KEY);
        persisted = raw ? JSON.parse(raw) : [];
      }
      console.log('menuStore.loadItems persisted count', persisted.length);
      // only set items if persisted has entries OR current store is empty
      const current = get().items || [];
      if (persisted.length > 0 || current.length === 0) {
        set({ items: persisted });
      } else {
        console.log('menuStore.loadItems: keeping current in-memory items', current.length);
      }
      return get().items;
    } catch (err) {
      console.error('menuStore.loadItems error', err);
      return get().items;
    }
  };

  const addItem = async (item: MenuItem): Promise<MenuItem> => {
    console.log('menuStore.addItem start', item);
    
    // Check if item already exists (prevent duplicates)
    const existing = get().items.find(i => i.id === item.id);
    if (existing) {
      console.log('Item already exists, updating instead', item.id);
      await updateItem(item);
      return item;
    }
    
    // Ensure item has an ID
    const itemWithId = { ...item, id: item.id || crypto.randomUUID() };
    
    // optimistic update
    set((s) => ({ items: [itemWithId, ...s.items] }));
    
    try {
      if (typeof window !== 'undefined' && window.indexedDB && PouchDB) {
        const db = new PouchDB('orderin-menu');
        const doc = { _id: itemWithId.id, ...itemWithId, updatedAt: new Date() };
        const result = await db.put(doc);
        console.log('PouchDB save success', itemWithId.id, result);
        
        // Update the item with the _rev from PouchDB
        const updatedItem = { ...itemWithId, _rev: result.rev };
        set((s) => ({
          items: s.items.map(i => i.id === updatedItem.id ? updatedItem : i)
        }));
      } else {
        const currentItems = get().items;
        localStorageHelper.setItems(currentItems);
        console.log('localStorage save success', currentItems.length);
      }
      console.log('menuStore.addItem done', itemWithId.id);
      return itemWithId;
    } catch (err) {
      console.error('menuStore.addItem error', err);
      // Revert optimistic update on error
      set((s) => ({ items: s.items.filter(i => i.id !== itemWithId.id) }));
      
      // fallback save to localStorage if pouch errored
      try {
        const currentItems = get().items;
        localStorageHelper.setItems(currentItems);
        console.log('localStorage fallback success', currentItems.length);
      } catch (e) { console.error('localStorage fallback error', e); }
      throw err;
    }
  };

  const updateItem = async (updatedItem: MenuItem): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.indexedDB && PouchDB) {
        const db = new PouchDB('orderin-menu');
        
        try {
          // Get existing document to obtain _rev
          const existingDoc = await db.get(updatedItem.id);
          const doc = {
            ...existingDoc,
            ...updatedItem,
            updatedAt: new Date()
          };
          const result = await db.put(doc);
          console.log('PouchDB update success', updatedItem.id, result);
          
          // Update local state with new _rev
          const updatedWithRev = { ...updatedItem, _rev: result.rev };
          set((s) => ({
            items: s.items.map(item =>
              item.id === updatedItem.id ? updatedWithRev : item
            )
          }));
        } catch (err: any) {
          if (err.name === 'not_found') {
            // Document doesn't exist, create it
            console.log('Document not found, creating instead', updatedItem.id);
            await addItem(updatedItem);
            return;
          } else if (err.name === 'conflict') {
            // Conflict - retry once with latest version
            console.log('Conflict detected, retrying with latest version', updatedItem.id);
            const latestDoc = await db.get(updatedItem.id);
            const doc = {
              ...latestDoc,
              ...updatedItem,
              updatedAt: new Date()
            };
            const result = await db.put(doc);
            console.log('PouchDB conflict retry success', updatedItem.id, result);
            
            const updatedWithRev = { ...updatedItem, _rev: result.rev };
            set((s) => ({
              items: s.items.map(item =>
                item.id === updatedItem.id ? updatedWithRev : item
              )
            }));
          } else {
            throw err;
          }
        }
      } else {
        // localStorage fallback
        const currentItems = get().items;
        const newItems = currentItems.map(item =>
          item.id === updatedItem.id
            ? { ...updatedItem, updatedAt: new Date() }
            : item
        );
        localStorageHelper.setItems(newItems);
        set({ items: newItems });
        console.log('localStorage update success', updatedItem.id);
      }
    } catch (error) {
      console.error('Failed to update menu item:', error);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      if (typeof window !== 'undefined' && window.indexedDB && PouchDB) {
        const db = new PouchDB('orderin-menu');
        const doc = await db.get(id);
        await db.remove(doc);
        console.log('PouchDB delete success', id);
        
        // Update local state immediately
        set((s) => ({ items: s.items.filter(item => item.id !== id) }));
      } else {
        const currentItems = get().items;
        const newItems = currentItems.filter(item => item.id !== id);
        localStorageHelper.setItems(newItems);
        set({ items: newItems });
        console.log('localStorage delete success', id);
      }
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      throw error;
    }
  };

  const toggleAvailability = async (id: string) => {
    const currentItems = get().items;
    const item = currentItems.find(item => item.id === id);
    if (item) {
      console.log('menuStore.toggleAvailability', id, item.isAvailable);
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