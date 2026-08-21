'use strict';

import { strictEqual, deepStrictEqual, ok } from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

// Debounce function - same as in app.js
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

describe('debounce', () => {
  it('should delay function execution', async (t) => {
    let called = false;
    const fn = () => { called = true; };
    const debounced = debounce(fn, 100);

    debounced();
    strictEqual(called, false, 'Function should not be called immediately');

    await new Promise(resolve => setTimeout(resolve, 150));
    strictEqual(called, true, 'Function should be called after delay');
  });

  it('should reset timer on subsequent calls', async (t) => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    strictEqual(callCount, 0, 'Function should not be called during rapid invocations');

    await new Promise(resolve => setTimeout(resolve, 150));
    strictEqual(callCount, 1, 'Function should be called only once after delay');
  });

  it('should pass arguments to the debounced function', async (t) => {
    let receivedArgs = null;
    const fn = (...args) => { receivedArgs = args; };
    const debounced = debounce(fn, 50);

    debounced('a', 'b', 123);

    await new Promise(resolve => setTimeout(resolve, 100));
    deepStrictEqual(receivedArgs, ['a', 'b', 123], 'Arguments should be passed correctly');
  });

  it('should preserve this context', async (t) => {
    const obj = { value: 42 };
    let receivedThis = null;
    const fn = function() { receivedThis = this; };
    const debounced = debounce(fn, 50);

    debounced.call(obj);

    await new Promise(resolve => setTimeout(resolve, 100));
    strictEqual(receivedThis, obj, 'this context should be preserved');
  });

  it('should work with search input scenario', async (t) => {
    let searchValue = '';
    const updateSearch = (value) => { searchValue = value; };
    const debouncedSearch = debounce(updateSearch, 200);

    // Simulate rapid typing
    debouncedSearch('a');
    debouncedSearch('ap');
    debouncedSearch('app');
    debouncedSearch('appl');
    debouncedSearch('apple');

    strictEqual(searchValue, '', 'Search should not update during typing');

    await new Promise(resolve => setTimeout(resolve, 250));
    strictEqual(searchValue, 'apple', 'Search should update with final value after delay');
  });
});
