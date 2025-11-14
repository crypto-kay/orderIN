import PouchDB from 'pouchdb';
import { create } from 'zustand';
import type { Table } from '../types/Table';

interface TableStore {
  tables: Table[];
  loading: boolean;
  error: string | null;
  updatingId: string | null;
  loadTables: () => Promise<void>;
  addTable: (table: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTable: (id: string, updates: Partial<Table>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  regenerateQR: (id: string) => Promise<void>;
  setTables: (tables: Table[]) => void;
}

const db = new PouchDB<Table>('tables');

export const useTableStore = create<TableStore>((set, get) => ({
  tables: [],
  loading: false,
  error: null,
  updatingId: null,

  loadTables: async () => {
    set({ loading: true, error: null });
    try {
      const result = await db.allDocs({
        include_docs: true,
        descending: true,
      });
      const tables = result.rows.map(row => row.doc as Table);
      set({ tables, loading: false });
      if (process.env.NODE_ENV !== 'production') {
        console.log('📦 TABLES_LOADED', tables.length);
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ LOAD_TABLES_ERROR', error);
      }
      set({ error: 'Failed to load tables', loading: false });
    }
  },

  addTable: async (tableData) => {
    const now = new Date().toISOString();
    const tableId = `TABLE-${Date.now()}`;
    const newTable: Table = {
      ...tableData,
      id: tableId,
      _id: tableId, // Ensure _id matches id for PouchDB consistency
      createdAt: now,
      updatedAt: now,
    };

    set({ loading: true, error: null });
    try {
      // Use db.put() instead of db.post() to set custom _id
      const response = await db.put(newTable);
      const currentTables = get().tables;
      set({
        tables: [{ ...newTable, _rev: response.rev }, ...currentTables],
        loading: false
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log('🟦 TABLE_CREATED', newTable.id);
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ ADD_TABLE_ERROR', error);
      }
      set({ error: 'Failed to create table', loading: false });
    }
  },

  updateTable: async (id: string, updates: Partial<Table>) => {
    set({ updatingId: id, loading: true, error: null });

    const currentTables = get().tables;
    const originalTable = currentTables.find(table => table.id === id);

    if (!originalTable) {
      set({ error: 'Table not found', loading: false, updatingId: null });
      return;
    }

    // Optimistic UI update
    const optimisticTable: Table = {
      ...originalTable,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    set({
      tables: currentTables.map(table =>
        table.id === id ? optimisticTable : table
      )
    });

    const tryUpdate = async (attempt: number): Promise<void> => {
      try {
        // Use proper _id for PouchDB lookup
        const key = originalTable._id ?? id;
        const latestDoc = await db.get(key);
        if (process.env.NODE_ENV !== 'production') {
          console.log(`📝 UPDATE_ATTEMPT_${attempt}: using _id=${key}, _rev=${latestDoc._rev}`);
        }

        const updatedTable: Table = {
          ...latestDoc,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const response = await db.put(updatedTable);

        // Success - update local state with new _rev
        set({
          tables: get().tables.map(table =>
            table.id === id ? { ...updatedTable, _rev: response.rev } : table
          ),
          loading: false,
          updatingId: null,
        });

        if (process.env.NODE_ENV !== 'production') {
          console.log(`🟩 UPDATE_SUCCESS (new _rev: ${response.rev})`);
        }

      } catch (error: unknown) {
        if (error && typeof error === 'object') {
          const errorObj = error as { name?: string; status?: number };

          if ((errorObj.name === 'not_found' || errorObj.status === 404) && attempt === 1) {
            if (process.env.NODE_ENV !== 'production') {
              console.log('🟨 NOT_FOUND: searching allDocs for table...');
            }
            // Search allDocs to find correct _id
            const allDocs = await db.allDocs({ include_docs: true });
            const foundDoc = allDocs.rows.find(row => row.doc?.id === id);
            if (foundDoc?.doc) {
              const retryKey = foundDoc.doc._id;
              const latestDoc = await db.get(retryKey);
              const updatedTable: Table = {
                ...latestDoc,
                ...updates,
                updatedAt: new Date().toISOString(),
              };
              const response = await db.put(updatedTable);
              set({
                tables: get().tables.map(table =>
                  table.id === id ? { ...updatedTable, _rev: response.rev } : table
                ),
                loading: false,
                updatingId: null,
              });
              if (process.env.NODE_ENV !== 'production') {
                console.log(`🟩 UPDATE_SUCCESS after fallback (new _rev: ${response.rev})`);
              }
              return;
            }
          } else if (errorObj.name === 'conflict' && attempt === 1) {
            if (process.env.NODE_ENV !== 'production') {
              console.log('🟨 CONFLICT_DETECTED, retrying...');
            }
            // Brief backoff before retry
            await new Promise(resolve => setTimeout(resolve, 100));
            return tryUpdate(2);
          }
        }

        // Failed after retry or different error - revert optimistic update
        if (process.env.NODE_ENV !== 'production') {
          console.error('🟥 UPDATE_FAILED_AFTER_RETRY', error);
        }

        set({
          tables: currentTables, // Revert to original state
          error: 'Failed to update table',
          loading: false,
          updatingId: null,
        });
      }
    };

    tryUpdate(1);
  },

  deleteTable: async (id: string) => {
    set({ loading: true, error: null });

    const currentTables = get().tables;
    const tableToDelete = currentTables.find(table => table.id === id);

    if (!tableToDelete) {
      set({ error: 'Table not found', loading: false });
      return;
    }

    try {
      // Use proper _id for PouchDB lookup
      const key = tableToDelete._id ?? id;
      const doc = await db.get(key);
      await db.remove(doc);

      // Update local state
      set({
        tables: currentTables.filter(table => table.id !== id),
        loading: false,
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('🗑️ TABLE_DELETED', id);
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ DELETE_TABLE_ERROR', error);
      }
      set({ error: 'Failed to delete table', loading: false });
    }
  },

  // Generate QR code using qrcode library
  // This generates both QR URL and SVG for table ordering
  regenerateQR: async (id: string) => {
    set({ updatingId: id, loading: true, error: null });

    const currentTables = get().tables;
    const table = currentTables.find(t => t.id === id);

    if (!table) {
      set({ error: 'Table not found', loading: false, updatingId: null });
      return;
    }

    try {
      const { createQrSvgForTable } = await import('../lib/qr');

      // Generate QR code SVG and URL
      const qrSvg = await createQrSvgForTable(table);
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const qrUrl = `${base}/order?tableId=${encodeURIComponent(table.id)}`;

      const updatedTable = {
        ...table,
        qrUrl,
        qrSvg,
        updatedAt: new Date().toISOString(),
      };

      // Update with QR codes
      await db.put({
        ...updatedTable,
        _id: table._id || id,
      });

      set({
        tables: currentTables.map(t => t.id === id ? updatedTable : t),
        loading: false,
        updatingId: null,
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('🟩 QR_REGENERATED', id);
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ QR_GENERATE_ERROR', error);
      }
      set({ error: 'Failed to generate QR code', loading: false, updatingId: null });
    }
  },

  setTables: (tables: Table[]) => {
    set({ tables });
  },
}));