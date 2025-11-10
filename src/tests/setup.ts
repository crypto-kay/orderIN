import { beforeEach, vi } from 'vitest';

// Mock PouchDB for all tests
const mockPouchDB = {
  put: vi.fn(),
  get: vi.fn(),
  remove: vi.fn(),
  allDocs: vi.fn()
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

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});