import { Buffer } from 'buffer';

// Make Buffer available globally
window.global = window;
window.Buffer = Buffer;

// Add process shim
window.process = {
  env: { NODE_DEBUG: undefined },
  version: '',
  versions: {},
  platform: '',
  nextTick: () => {},
} as any; 