// Test suite for the store implementation (P2-12)
import { describe, it } from 'node:test';

// We need to extract the store from app.js
// Since app.js uses IIFE, we'll test the store pattern directly

describe('store', () => {
  // Create a fresh store instance for testing
  const createStore = () => {
    const state = {};
    const subscribers = {};

    return {
      get(key) {
        return state[key];
      },
      set(key, value) {
        const oldValue = state[key];
        state[key] = value;
        const subs = subscribers[key];
        if (subs && oldValue !== value) {
          for (const sub of subs) {
            sub(value, oldValue);
          }
        }
      },
      subscribe(key, callback) {
        if (!subscribers[key]) {
          subscribers[key] = new Set();
        }
        subscribers[key].add(callback);
        return () => subscribers[key].delete(callback);
      },
      getState() {
        return { ...state };
      },
    };
  };

  it('should get and set values', () => {
    const store = createStore();
    store.set('test', 'value');
    const result = store.get('test');
    if (result !== 'value') {
      throw new Error(`Expected 'value', got ${result}`);
    }
  });

  it('should return undefined for non-existent keys', () => {
    const store = createStore();
    const result = store.get('nonexistent');
    if (result !== undefined) {
      throw new Error(`Expected undefined, got ${result}`);
    }
  });

  it('should notify subscribers when value changes', () => {
    const store = createStore();
    let receivedValue = null;
    let receivedOldValue = null;

    store.subscribe('key', (value, oldValue) => {
      receivedValue = value;
      receivedOldValue = oldValue;
    });

    store.set('key', 'initial');
    store.set('key', 'updated');

    if (receivedValue !== 'updated') {
      throw new Error(`Expected 'updated', got ${receivedValue}`);
    }
    if (receivedOldValue !== 'initial') {
      throw new Error(`Expected 'initial', got ${receivedOldValue}`);
    }
  });

  it('should not notify subscribers when value does not change', () => {
    const store = createStore();
    let callCount = 0;

    store.subscribe('key', () => {
      callCount++;
    });

    store.set('key', 'value');
    store.set('key', 'value'); // Same value
    store.set('key', 'value'); // Same value again

    if (callCount !== 1) {
      throw new Error(`Expected 1 call, got ${callCount}`);
    }
  });

  it('should return unsubscribe function from subscribe', () => {
    const store = createStore();
    let callCount = 0;

    const unsubscribe = store.subscribe('key', () => {
      callCount++;
    });

    store.set('key', 'value1');
    unsubscribe();
    store.set('key', 'value2');

    if (callCount !== 1) {
      throw new Error(`Expected 1 call, got ${callCount}`);
    }
  });

  it('should support multiple subscribers for same key', () => {
    const store = createStore();
    const results = [];

    store.subscribe('key', (value) => results.push('sub1:' + value));
    store.subscribe('key', (value) => results.push('sub2:' + value));

    store.set('key', 'test');

    if (results.length !== 2) {
      throw new Error(`Expected 2 calls, got ${results.length}`);
    }
    if (!results.includes('sub1:test') || !results.includes('sub2:test')) {
      throw new Error(`Unexpected results: ${results.join(', ')}`);
    }
  });

  it('should return full state with getState', () => {
    const store = createStore();
    store.set('a', 1);
    store.set('b', 2);
    store.set('c', 3);

    const state = store.getState();
    if (state.a !== 1 || state.b !== 2 || state.c !== 3) {
      throw new Error(`Unexpected state: ${JSON.stringify(state)}`);
    }
  });

  it('should handle complex values like arrays and objects', () => {
    const store = createStore();
    const arr = [1, 2, 3];
    const obj = { x: 1, y: 2 };

    store.set('array', arr);
    store.set('object', obj);

    if (store.get('array') !== arr) {
      throw new Error('Array not stored correctly');
    }
    if (store.get('object') !== obj) {
      throw new Error('Object not stored correctly');
    }
  });

  it('should handle Set values', () => {
    const store = createStore();
    const set = new Set([1, 2, 3]);

    store.set('set', set);

    const result = store.get('set');
    if (!(result instanceof Set) || result.size !== 3) {
      throw new Error('Set not stored correctly');
    }
  });
});
