import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock Web Speech API
global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  lang: '',
  rate: 1,
  pitch: 1,
  volume: 1,
})) as any;

global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  speaking: false,
  pending: false,
  paused: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
} as any;

// Mock SpeechRecognition API
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onresult = null;
  onerror = null;
  onend = null;
  onstart = null;

  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

(global as any).SpeechRecognition = MockSpeechRecognition;
(global as any).webkitSpeechRecognition = MockSpeechRecognition;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: any) => {
      store[key] = typeof value === 'string' ? value : String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});
