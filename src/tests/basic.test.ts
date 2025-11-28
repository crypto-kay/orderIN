import { describe, it, expect, beforeEach, vi } from 'vitest';

// Simple test to verify test setup is working
describe('Test Setup', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true);
  });

  it('should mock localStorage', () => {
    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });

    expect(window.localStorage).toBeDefined();
    expect(typeof window.localStorage.getItem).toBe('function');
  });

  it('should mock indexedDB', () => {
    expect(window.indexedDB).toBe(true);
  });
});