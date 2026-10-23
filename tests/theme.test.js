/**
 * Theme pure logic tests (task 7.1)
 * - isValidTheme: Validates theme is "light" or "dark"
 * - toggleTheme: Flips theme between "light" and "dark"
 * - DEFAULT_THEME: Default value is "light"
 */

import fc from 'fast-check';
const { isValidTheme, toggleTheme, DEFAULT_THEME } = require('../js/app.js');

// ============================================================
// Property-Based Tests
// ============================================================

// Property 1: isValidTheme returns true only for "light" and "dark"
test('Property: isValidTheme returns true only for valid themes', () => {
  fc.assert(fc.property(
    fc.oneOf(fc.constant('light'), fc.constant('dark'), fc.string()),
    (theme) => {
      const result = isValidTheme(theme);
      if (theme === 'light' || theme === 'dark') {
        expect(result).toBe(true);
      } else {
        expect(result).toBe(false);
      }
    }
  ));
});

// Property 2: toggleTheme always returns the opposite of valid themes
test('Property: toggleTheme flips light <-> dark', () => {
  fc.assert(fc.property(
    fc.oneOf(fc.constant('light'), fc.constant('dark')),
    (theme) => {
      const result = toggleTheme(theme);
      expect(result).toBe(theme === 'light' ? 'dark' : 'light');
    }
  ));
});

// Property 3: toggleTheme is its own inverse (applying twice returns original)
test('Property: toggleTheme is involution (toggle(toggle(x)) === x)', () => {
  fc.assert(fc.property(
    fc.oneOf(fc.constant('light'), fc.constant('dark')),
    (theme) => {
      const firstToggle = toggleTheme(theme);
      const secondToggle = toggleTheme(firstToggle);
      expect(secondToggle).toBe(theme);
    }
  ));
});

// Property 4: toggleTheme is commutative with itself
test('Property: toggleTheme commutes with itself', () => {
  fc.assert(fc.property(
    fc.oneOf(fc.constant('light'), fc.constant('dark')),
    (theme) => {
      // toggle(light) = dark, toggle(dark) = light
      // So toggle(toggle(light)) = toggle(dark) = light (original)
      const result1 = toggleTheme(toggleTheme(theme));
      expect(result1).toBe(theme);
    }
  ));
});

// ============================================================
// Unit Tests (Edge Cases)
// ============================================================

describe('DEFAULT_THEME', () => {
  test('is defined and is "light"', () => {
    expect(DEFAULT_THEME).toBe('light');
  });
});

describe('isValidTheme', () => {
  test('returns true for "light"', () => {
    expect(isValidTheme('light')).toBe(true);
  });

  test('returns true for "dark"', () => {
    expect(isValidTheme('dark')).toBe(true);
  });

  test('returns false for empty string', () => {
    expect(isValidTheme('')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isValidTheme(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isValidTheme(undefined)).toBe(false);
  });

  test('returns false for number', () => {
    expect(isValidTheme(123)).toBe(false);
  });

  test('returns false for object', () => {
    expect(isValidTheme({})).toBe(false);
  });

  test('returns false for array', () => {
    expect(isValidTheme([])).toBe(false);
  });

  test('returns false for "Light" (case sensitive)', () => {
    expect(isValidTheme('Light')).toBe(false);
  });

  test('returns false for "Dark" (case sensitive)', () => {
    expect(isValidTheme('Dark')).toBe(false);
  });

  test('returns false for "light " (with trailing space)', () => {
    expect(isValidTheme('light ')).toBe(false);
  });

  test('returns false for " dark" (with leading space)', () => {
    expect(isValidTheme(' dark')).toBe(false);
  });

  test('returns false for "blue"', () => {
    expect(isValidTheme('blue')).toBe(false);
  });

  test('returns false for "green"', () => {
    expect(isValidTheme('green')).toBe(false);
  });

  test('returns false for random string', () => {
    expect(isValidTheme('random')).toBe(false);
  });

  test('returns false for boolean true', () => {
    expect(isValidTheme(true)).toBe(false);
  });

  test('returns false for boolean false', () => {
    expect(isValidTheme(false)).toBe(false);
  });
});

describe('toggleTheme', () => {
  test('returns "dark" for "light"', () => {
    expect(toggleTheme('light')).toBe('dark');
  });

  test('returns "light" for "dark"', () => {
    expect(toggleTheme('dark')).toBe('light');
  });

  test('does not modify original theme value', () => {
    const original = 'light';
    toggleTheme(original);
    expect(original).toBe('light');
  });

  test('is consistent - same input always gives same output', () => {
    expect(toggleTheme('light')).toBe('dark');
    expect(toggleTheme('light')).toBe('dark');
    expect(toggleTheme('dark')).toBe('light');
    expect(toggleTheme('dark')).toBe('light');
  });

  test('handles invalid input gracefully (returns opposite of invalid, but that is not guaranteed)', () => {
    // For invalid inputs, behavior is not specified in requirements
    // Just ensure it doesn't throw
    expect(() => toggleTheme(null)).not.toThrow();
    expect(() => toggleTheme(undefined)).not.toThrow();
    expect(() => toggleTheme(123)).not.toThrow();
    expect(() => toggleTheme('')).not.toThrow();
  });

  test('round-trip for "light": light -> dark -> light', () => {
    expect(toggleTheme(toggleTheme('light'))).toBe('light');
  });

  test('round-trip for "dark": dark -> light -> dark', () => {
    expect(toggleTheme(toggleTheme('dark'))).toBe('dark');
  });
});

// ============================================================
// Integration Tests (Real-world scenarios)
// ============================================================

describe('Theme integration', () => {
  test('full theme workflow: validate then toggle', () => {
    // Valid theme
    expect(isValidTheme('light')).toBe(true);
    expect(toggleTheme('light')).toBe('dark');
    
    // After toggle, validate again
    expect(isValidTheme('dark')).toBe(true);
    expect(toggleTheme('dark')).toBe('light');
  });

  test('invalid theme cannot be toggled (validation first)', () => {
    // Always validate before toggling
    expect(isValidTheme('blue')).toBe(false);
    
    // Don't toggle invalid themes in production
    // This test just ensures toggle doesn't crash on invalid input
    expect(() => toggleTheme('blue')).not.toThrow();
  });

  test('theme persistence workflow', () => {
    // User sets theme to dark
    let currentTheme = 'dark';
    expect(isValidTheme(currentTheme)).toBe(true);
    
    // User toggles to light
    currentTheme = toggleTheme(currentTheme);
    expect(currentTheme).toBe('light');
    
    // User can toggle back
    currentTheme = toggleTheme(currentTheme);
    expect(currentTheme).toBe('dark');
  });
});
