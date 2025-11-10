import { create } from 'zustand';
import { logger } from '../lib/logger';
import type { MenuItem } from '../types';

// Define PouchDB types to avoid using 'any'
interface PouchDBDocument {
  _id: string;
  _rev?: string;
  [key: string]: unknown;
}

interface PouchDBAllDocsResponse {
  rows: Array<{
    doc: PouchDBDocument;
  }>;
}

interface PouchDBPutResponse {
  rev: string;
}

interface PouchDBInstance {
  allDocs: (params: { include_docs: boolean }) => Promise<PouchDBAllDocsResponse>;
  get: (id: string) => Promise<PouchDBDocument>;
  put: (doc: PouchDBDocument) => Promise<PouchDBPutResponse>;
  remove: (doc: PouchDBDocument) => Promise<PouchDBPutResponse>;
}

// Try to import PouchDB, fallback to localStorage if not available
let PouchDB: unknown = null;
let PouchDBLoadPromise: Promise<void> | null = null;

const loadPouchDB = async () => {
  if (PouchDBLoadPromise) return PouchDBLoadPromise;
  
  PouchDBLoadPromise = (async () => {
    try {
      const pouchdbModule = await import('pouchdb');
      PouchDB = pouchdbModule.default;
    } catch {
      logger.warn('PouchDB not available, falling back to localStorage');
      PouchDB = null;
    }
  })();
  
  return PouchDBLoadPromise;
};

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
      logger.error('Failed to save to localStorage:', error);
    }
  }
};

export const useMenuStore = create<MenuStore>((set, get) => {
  const loadItems = async () => {
    logger.debug('menuStore.loadItems start');
    try {
      let persisted: MenuItem[] = [];
      if (typeof window !== 'undefined' && window.indexedDB) {
        await loadPouchDB();
        if (PouchDB) {
          const db = new (PouchDB as new (name: string) => PouchDBInstance)('orderin-menu');
          const res = await db.allDocs({ include_docs: true });
          persisted = (res.rows || []).map((r) => {
            const doc = r.doc;
            // Clean PouchDB metadata and map _id to id
            const { _id, _rev, ...cleanDoc } = doc;
            // Convert date strings back to Date objects
            const menuItem = {
              id: _id,
              _rev,
              ...cleanDoc,
              createdAt: cleanDoc.createdAt ? new Date(cleanDoc.createdAt as string) : new Date(),
              updatedAt: cleanDoc.updatedAt ? new Date(cleanDoc.updatedAt as string) : new Date()
            };
            return menuItem as unknown as MenuItem;
          });
        }
      } else {
        const raw = localStorage.getItem(MENU_STORAGE_KEY);
        persisted = raw ? JSON.parse(raw) : [];
      }
      logger.debug('menuStore.loadItems persisted count', persisted.length);
      // only set items if persisted has entries OR current store is empty
      const current = get().items || [];
      if (persisted.length > 0 || current.length === 0) {
        set({ items: persisted });
      } else {
        logger.debug('menuStore.loadItems: keeping current in-memory items', current.length);
      }
      return get().items;
    } catch (err) {
      logger.error('menuStore.loadItems error', err);
      return get().items;
    }
  };

  const addItem = async (item: MenuItem): Promise<MenuItem> => {
    logger.debug('menuStore.addItem start', item);
    
    // Ensure item has an ID
    const itemWithId = { ...item, id: item.id || crypto.randomUUID() };
    
    // optimistic update
    set((s) => ({ items: [itemWithId, ...s.items] }));
    
    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        await loadPouchDB();
        if (PouchDB) {
          const db = new (PouchDB as new (name: string) => PouchDBInstance)('orderin-menu');
          const doc = { _id: itemWithId.id, ...itemWithId, updatedAt: new Date() };
          const result = await db.put(doc);
          logger.debug('PouchDB save success', itemWithId.id, result);
          
          // Update item with the _rev from PouchDB
          const updatedItem = { ...itemWithId, _rev: result.rev };
          set((s) => ({
            items: s.items.map(i => i.id === updatedItem.id ? updatedItem : i)
          }));
        } else {
          const currentItems = get().items;
          localStorageHelper.setItems(currentItems);
          logger.debug('localStorage save success', currentItems.length);
        }
      }
      logger.debug('menuStore.addItem done', itemWithId.id);
      return itemWithId;
    } catch (err) {
      logger.error('menuStore.addItem error', err);
      // Revert optimistic update on error
      set((s) => ({ items: s.items.filter(i => i.id !== itemWithId.id) }));
      
      // fallback save to localStorage if pouch errored
      try {
        const currentItems = get().items;
        localStorageHelper.setItems(currentItems);
        logger.debug('localStorage fallback success', currentItems.length);
      } catch (e) { logger.error('localStorage fallback error', e); }
      throw err;
    }
  };

  const updateItem = async (updatedItem: MenuItem): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        await loadPouchDB();
        if (PouchDB) {
          const db = new (PouchDB as new (name: string) => PouchDBInstance)('orderin-menu');
          
          try {
            // Get existing document to obtain _rev
            const existingDoc = await db.get(updatedItem.id);
            const doc = {
              ...existingDoc,
              ...updatedItem,
              updatedAt: new Date()
            };
            const result = await db.put(doc);
            logger.debug('PouchDB update success', updatedItem.id, result);
            
            // Update local state with new _rev
            const updatedWithRev = { ...updatedItem, _rev: result.rev };
            set((s) => ({
              items: s.items.map(item =>
                item.id === updatedItem.id ? updatedWithRev : item
              )
            }));
          } catch (err: unknown) {
            if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'not_found') {
              // Document doesn't exist, create it
              logger.debug('Document not found, creating instead', updatedItem.id);
              await addItem(updatedItem);
              return;
            } else if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'conflict') {
              // Conflict - retry once with latest version
              logger.debug('Conflict detected, retrying with latest version', updatedItem.id);
              const latestDoc = await db.get(updatedItem.id);
              const doc = {
                ...latestDoc,
                ...updatedItem,
                updatedAt: new Date()
              };
              const result = await db.put(doc);
              logger.debug('PouchDB conflict retry success', updatedItem.id, result);
              
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
          logger.debug('localStorage update success', updatedItem.id);
        }
      }
    } catch (error) {
      logger.error('Failed to update menu item:', error);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        await loadPouchDB();
        if (PouchDB) {
          const db = new (PouchDB as new (name: string) => PouchDBInstance)('orderin-menu');
          const doc = await db.get(id);
          await db.remove(doc);
          logger.debug('PouchDB delete success', id);
          
          // Update local state immediately
          set((s) => ({ items: s.items.filter(item => item.id !== id) }));
        } else {
          const currentItems = get().items;
          const newItems = currentItems.filter(item => item.id !== id);
          localStorageHelper.setItems(newItems);
          set({ items: newItems });
          logger.debug('localStorage delete success', id);
        }
      }
    } catch (error) {
      logger.error('Failed to delete menu item:', error);
      throw error;
    }
  };

  const toggleAvailability = async (id: string) => {
    const currentItems = get().items;
    const item = currentItems.find(item => item.id === id);
    if (item) {
      logger.debug('menuStore.toggleAvailability', id, item.isAvailable);
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