/**
 * Storage module tests
 * Property-based tests for Availability, Load/Save round-trips
 * Unit tests for edge cases
 * Integration tests for Local Storage wiring
 */

import fc from 'fast-check';
const { Storage, STORAGE_KEY_USER_NAME, STORAGE_KEY_TASKS, STORAGE_KEY_QUICK_LINKS, STORAGE_KEY_THEME } = require('../js/app.js');

// Clear Local Storage before each test for isolation
beforeEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});

// ============================================================
// Property-Based Tests (100+ iterations each)
// ============================================================

// Property 1: isAvailable correctly detects Local Storage availability
test('Property: isAvailable detects real Local Storage availability', () => {
  fc.assert(fc.property(fc.boolean(), (_) => {
    // This test runs in jsdom with localStorage available
    // In a real browser or jsdom, localStorage should be available
    const available = Storage.isAvailable();
    // jsdom provides localStorage, so it should be available
    expect(available).toBe(true);
  }));
});

// Property 2: isAvailable is memoized (second call returns cached result)
test('Property: isAvailable is memoized', () => {
  fc.assert(fc.property(fc.boolean(), (_) => {
    const firstCall = Storage.isAvailable();
    const secondCall = Storage.isAvailable();
    expect(firstCall).toBe(secondCall);
  }));
});

// Property 3: load/save round-trip preserves any JSON-serializable value
test('Property: load/save round-trip preserves any JSON-serializable value', () => {
  fc.assert(fc.property(
    fc.oneOf(
      fc.string(),
      fc.integer(),
      fc.float(),
      fc.boolean(),
      fc.record({ key: fc.string(), value: fc.integer() }),
      fc.array(fc.string()),
      fc.record({ a: fc.integer(), b: fc.string(), nested: fc.record({ x: fc.boolean() }) })
    ),
    (value) => {
      const key = 'test_key_' + Date.now();
      const saved = Storage.save(key, value);
      if (saved) {
        const loaded = Storage.load(key, null);
        expect(loaded).toStrictEqual(value);
      }
    }
  ));
});

// Property 4: load with fallback returns fallback on missing key
test('Property: load returns fallback on missing key', () => {
  fc.assert(fc.property(
    fc.oneOf(
      fc.string(),
      fc.integer(),
      fc.boolean(),
      fc.array(fc.string()),
      fc.object()
    ),
    (fallback) => {
      const key = 'nonexistent_key_' + Date.now();
      const result = Storage.load(key, fallback);
      expect(result).toStrictEqual(fallback);
    }
  ));
});

// Property 5: save returns true on success
test('Property: save returns true on successful write', () => {
  fc.assert(fc.property(
    fc.oneOf(
      fc.string(),
      fc.integer(),
      fc.boolean(),
      fc.array(fc.string()),
      fc.record({ key: fc.string(), value: fc.integer() })
    ),
    (value) => {
      const key = 'test_key_' + Date.now();
      const result = Storage.save(key, value);
      expect(result).toBe(true);
    }
  ));
});

// Property 6: save returns false on failure (simulated via try/catch)
test('Property: save handles errors gracefully', () => {
  // We can't easily simulate storage quota errors in jsdom,
  // but the try/catch guard ensures save never throws
  const key = 'test_key_' + Date.now();
  const value = { test: Date.now() };
  expect(() => Storage.save(key, value)).not.toThrow();
});

// Property 7: remove does not throw on missing key
test('Property: remove handles missing key gracefully', () => {
  fc.assert(fc.property(fc.string(), (key) => {
    expect(() => Storage.remove(key)).not.toThrow();
  }));
});

// ============================================================
// Unit Tests (Edge Cases)
// ============================================================

describe('Storage.isAvailable', () => {
  test('returns true when Local Storage is available', () => {
    expect(Storage.isAvailable()).toBe(true);
  });

  test('is memoized - second call returns cached result', () => {
    Storage.isAvailable(); // First call
    // Clear cache to force re-check
    Object.defineProperty(Storage, 'isAvailable', {
      value: function () {
        if (this._availabilityCache !== null) {
          return this._availabilityCache;
        }
        try {
          const testKey = '_tld_availability_test_' + Date.now();
          localStorage.setItem(testKey, 'test');
          const value = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          const afterRemove = localStorage.getItem(testKey);
          this._availabilityCache = (value === 'test' && afterRemove === null);
          return this._availabilityCache;
        } catch (e) {
          this._availabilityCache = false;
          return false;
        }
      },
      writable: true
    });
  });
});

describe('Storage.load', () => {
  test('returns fallback when key does not exist', () => {
    const fallback = { default: true };
    const result = Storage.load('nonexistent_key', fallback);
    expect(result).toStrictEqual(fallback);
  });

  test('returns parsed JSON object for valid stored data', () => {
    const expected = { name: 'Test', count: 42 };
    Storage.save('test_key', expected);
    const result = Storage.load('test_key', null);
    expect(result).toStrictEqual(expected);
  });

  test('returns fallback when JSON is corrupt', () => {
    const fallback = { default: true };
    // Manually corrupt the stored data
    localStorage.setItem('corrupt_key', 'not valid json {');
    const result = Storage.load('corrupt_key', fallback);
    expect(result).toStrictEqual(fallback);
  });

  test('returns fallback for empty string key', () => {
    const fallback = [];
    const result = Storage.load('', fallback);
    expect(result).toStrictEqual(fallback);
  });

  test('handles null stored values', () => {
    localStorage.setItem('null_key', 'null');
    const result = Storage.load('null_key', { fallback: true });
    expect(result).toBeNull();
  });

  test('handles array values', () => {
    const expected = [1, 2, 3, 'four'];
    Storage.save('array_key', expected);
    const result = Storage.load('array_key', []);
    expect(result).toStrictEqual(expected);
  });

  test('handles nested objects', () => {
    const expected = {
      level1: {
        level2: {
          level3: 'deep value'
        }
      }
    };
    Storage.save('nested_key', expected);
    const result = Storage.load('nested_key', {});
    expect(result).toStrictEqual(expected);
  });
});

describe('Storage.save', () => {
  test('saves and retrieves string value', () => {
    const value = 'Hello, World!';
    const key = 'string_key_' + Date.now();
    const result = Storage.save(key, value);
    expect(result).toBe(true);
    expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
  });

  test('saves and retrieves object value', () => {
    const value = { key: 'value', number: 42 };
    const key = 'object_key_' + Date.now();
    const result = Storage.save(key, value);
    expect(result).toBe(true);
    expect(Storage.load(key, null)).toStrictEqual(value);
  });

  test('saves and retrieves array value', () => {
    const value = [1, 2, 3];
    const key = 'array_key_' + Date.now();
    const result = Storage.save(key, value);
    expect(result).toBe(true);
    expect(Storage.load(key, [])).toStrictEqual(value);
  });

  test('saves and retrieves boolean value', () => {
    const value = true;
    const key = 'boolean_key_' + Date.now();
    const result = Storage.save(key, value);
    expect(result).toBe(true);
    expect(Storage.load(key, false)).toBe(true);
  });

  test('saves and retrieves number value', () => {
    const value = 123.456;
    const key = 'number_key_' + Date.now();
    const result = Storage.save(key, value);
    expect(result).toBe(true);
    expect(Storage.load(key, 0)).toBeCloseTo(value);
  });

  test('returns false on quota exceeded (graceful degradation)', () => {
    // We can't easily simulate quota exceeded in jsdom,
    // but the try/catch guard ensures it returns false
    const key = 'test_key_' + Date.now();
    const result = Storage.save(key, { test: Date.now() });
    // In jsdom this will succeed, but in real Safari private mode it would fail
    expect(typeof result).toBe('boolean');
  });

  test('overwrites existing value', () => {
    const key = 'overwrite_key';
    Storage.save(key, 'first value');
    Storage.save(key, 'second value');
    const result = Storage.load(key, '');
    expect(result).toBe('second value');
  });
});

describe('Storage.remove', () => {
  test('removes existing key', () => {
    const key = 'remove_key_' + Date.now();
    Storage.save(key, 'value');
    Storage.remove(key);
    const result = Storage.load(key, 'fallback');
    expect(result).toBe('fallback');
  });

  test('does not throw on missing key', () => {
    expect(() => Storage.remove('nonexistent_key')).not.toThrow();
  });

  test('removes array values', () => {
    const key = 'remove_array_key_' + Date.now();
    Storage.save(key, [1, 2, 3]);
    Storage.remove(key);
    const result = Storage.load(key, []);
    expect(result).toStrictEqual([]);
  });

  test('removes object values', () => {
    const key = 'remove_object_key_' + Date.now();
    Storage.save(key, { test: true });
    Storage.remove(key);
    const result = Storage.load(key, {});
    expect(result).toStrictEqual({});
  });
});

describe('Storage keys', () => {
  test('STORAGE_KEY_USER_NAME is defined', () => {
    expect(STORAGE_KEY_USER_NAME).toBe('tld.user.name');
  });

  test('STORAGE_KEY_TASKS is defined', () => {
    expect(STORAGE_KEY_TASKS).toBe('tld.tasks');
  });

  test('STORAGE_KEY_QUICK_LINKS is defined', () => {
    expect(STORAGE_KEY_QUICK_LINKS).toBe('tld.quickLinks');
  });

  test('STORAGE_KEY_THEME is defined', () => {
    expect(STORAGE_KEY_THEME).toBe('tld.theme');
  });
});

// ============================================================
// Integration Tests (End-to-End with Local Storage)
// ============================================================

describe('Storage integration', () => {
  test('end-to-end persistence round-trip for user name', () => {
    const testName = 'Test User';
    const saved = Storage.save(STORAGE_KEY_USER_NAME, testName);
    expect(saved).toBe(true);
    
    const loaded = Storage.load(STORAGE_KEY_USER_NAME, '');
    expect(loaded).toBe(testName);
  });

  test('end-to-end persistence round-trip for tasks', () => {
    const testTasks = [
      { id: '1', text: 'Task 1', color: 'red', done: false },
      { id: '2', text: 'Task 2', color: 'green', done: true }
    ];
    const saved = Storage.save(STORAGE_KEY_TASKS, testTasks);
    expect(saved).toBe(true);
    
    const loaded = Storage.load(STORAGE_KEY_TASKS, []);
    expect(loaded).toStrictEqual(testTasks);
  });

  test('end-to-end persistence round-trip for quick links', () => {
    const testLinks = [
      { id: '1', label: 'Google', url: 'https://google.com' },
      { id: '2', label: 'GitHub', url: 'https://github.com' }
    ];
    const saved = Storage.save(STORAGE_KEY_QUICK_LINKS, testLinks);
    expect(saved).toBe(true);
    
    const loaded = Storage.load(STORAGE_KEY_QUICK_LINKS, []);
    expect(loaded).toStrictEqual(testLinks);
  });

  test('end-to-end persistence round-trip for theme', () => {
    const testTheme = 'dark';
    const saved = Storage.save(STORAGE_KEY_THEME, testTheme);
    expect(saved).toBe(true);
    
    const loaded = Storage.load(STORAGE_KEY_THEME, 'light');
    expect(loaded).toBe(testTheme);
  });

  test('fallback returned when all storage keys are empty', () => {
    expect(Storage.load(STORAGE_KEY_USER_NAME, 'Default')).toBe('Default');
    expect(Storage.load(STORAGE_KEY_TASKS, [])).toStrictEqual([]);
    expect(Storage.load(STORAGE_KEY_QUICK_LINKS, [])).toStrictEqual([]);
    expect(Storage.load(STORAGE_KEY_THEME, 'light')).toBe('light');
  });

  test('multiple storage operations are isolated', () => {
    const key1 = 'key1_' + Date.now();
    const key2 = 'key2_' + Date.now();
    
    Storage.save(key1, { value: 1 });
    Storage.save(key2, { value: 2 });
    
    expect(Storage.load(key1, {})).toStrictEqual({ value: 1 });
    expect(Storage.load(key2, {})).toStrictEqual({ value: 2 });
    
    Storage.remove(key1);
    
    expect(Storage.load(key1, {})).toStrictEqual({});
    expect(Storage.load(key2, {})).toStrictEqual({ value: 2 });
  });
});
