import '@testing-library/jest-dom';

// jsdom doesn't expose TextEncoder or crypto.subtle — polyfill both from
// Node builtins so the 0G Storage SHA-256 fallback path works in tests.
const { webcrypto } = require('crypto');
const { TextEncoder, TextDecoder } = require('util');
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
if (!globalThis.TextEncoder) globalThis.TextEncoder = TextEncoder;
if (!globalThis.TextDecoder) globalThis.TextDecoder = TextDecoder;

// Stub global fetch so storage tests exercise the fallback path cleanly
// instead of throwing ReferenceError.
global.fetch = jest.fn(() => Promise.reject(new Error('fetch not available in tests')));
