import { Buffer } from 'buffer';

window.Buffer = Buffer;
window.process = {
  env: {
    NODE_DEBUG: undefined,
    NODE_ENV: process.env.NODE_ENV,
  },
  version: '',
  versions: {},
  platform: '',
  nextTick: () => {},
} as any; 