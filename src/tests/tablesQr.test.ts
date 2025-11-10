import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock PouchDB
const mockPouchDB = {
  put: vi.fn().mockResolvedValue({ rev: '1-rev' }),
  get: vi.fn().mockResolvedValue({
    _id: 'TABLE-123',
    _rev: '1-rev',
    id: 'TABLE-123',
    name: 'Test Table',
    number: '1',
    status: 'available',
    createdAt: '2023-01-01T00:00:00.000Z',
  }),
  remove: vi.fn().mockResolvedValue({ ok: true }),
  allDocs: vi.fn().mockResolvedValue({
    rows: [
      {
        doc: {
          _id: 'TABLE-123',
          _rev: '1-rev',
          id: 'TABLE-123',
          name: 'Test Table',
          number: '1',
          status: 'available',
          createdAt: '2023-01-01T00:00:00.000Z',
        }
      }
    ]
  }),
};

vi.mock('pouchdb', () => mockPouchDB);

// Mock DOM for canvas tests
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
        toBlob: vi.fn((callback) => {
          callback(new Blob(['test'], { type: 'image/png' }));
        }),
      }),
    }),
    createElementNS: vi.fn(),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
});

// Mock URL and Blob
global.URL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
} as any;

global.Blob = vi.fn(() => new Blob(['test'], { type: 'image/png' }));

describe('QR utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createQrSvgForTable', () => {
    it('should generate SVG with table ID and ordering URL', () => {
      const { createQrSvgForTable } = require('../../lib/qr');
      const table = {
        id: 'TABLE-123',
        name: 'Test Table',
        number: '1',
      };

      const svg = createQrSvgForTable(table, 'https://orderin.local');

      expect(svg).toContain('Table TABLE-123');
      expect(svg).toContain('Scan to order');
      expect(svg).toContain('https://orderin.local/t/TABLE-123');
    });
  });

  describe('svgToPngBlob', () => {
    it('should convert SVG to PNG blob when canvas is available', async () => {
      const { svgToPngBlob } = require('../../lib/qr');
      const svg = '<svg>test</svg>';
      
      const blob = await svgToPngBlob(svg, 200, 200);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should throw error when canvas is not available', async () => {
      const { svgToPngBlob } = require('../../lib/qr');
      const originalDocument = global.document;
      
      // Mock no canvas support
      global.document = undefined as any;

      const { svgToPngBlob } = require('../../lib/qr');
      const svg = '<svg>test</svg>';
      
      await expect(svgToPngBlob(svg)).rejects.toThrow('Canvas not available in this environment');
      
      // Restore document
      global.document = originalDocument;
    });
  });
});