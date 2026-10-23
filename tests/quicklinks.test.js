/**
 * QuickLinks pure logic tests (task 6.1)
 * - validateQuickLink: Validates label and URL format
 * - createQuickLink: Creates QuickLink object with generated id
 * - addLinkToSet: Appends link to array
 * - removeLinkFromSet: Removes link by id from array
 */

import fc from 'fast-check';
const { validateQuickLink, createQuickLink, addLinkToSet, removeLinkFromSet } = require('../js/app.js');

// ============================================================
// Property-Based Tests
// ============================================================

// Property 1: validateQuickLink returns valid=true only for non-empty label and http(s) URL
test('Property: validateQuickLink validates label and URL format', () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1 }),
    fc.oneOf(
      fc.stringMatching(/^https?:\/\//),
      fc.constantFrom('http://example.com', 'https://example.com')
    ),
    (label, url) => {
      const result = validateQuickLink(label, url);
      expect(result.valid).toBe(true);
    }
  ));
});

// Property 2: validateQuickLink rejects empty label
test('Property: validateQuickLink rejects empty label', () => {
  fc.assert(fc.property(
    fc.string(),
    fc.stringMatching(/^https?:\/\//),
    (url) => {
      const result = validateQuickLink('', url);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Label');
    }
  ));
});

// Property 3: validateQuickLink rejects empty URL
test('Property: validateQuickLink rejects empty URL', () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1 }),
    (label) => {
      const result = validateQuickLink(label, '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('URL');
    }
  ));
});

// Property 4: validateQuickLink rejects non-http(s) URLs
test('Property: validateQuickLink rejects non-http(s) URLs', () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1 }),
    fc.string({ maxLength: 100, blacklistedChars: 'http' }),
    (label, url) => {
      const invalidUrl = url.trim() === '' ? 'ftp://example.com' : url;
      if (!invalidUrl.startsWith('http://') && !invalidUrl.startsWith('https://')) {
        const result = validateQuickLink(label, invalidUrl);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('http://');
      }
    }
  ));
});

// Property 5: validateQuickLink trims whitespace from inputs
test('Property: validateQuickLink trims whitespace', () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1, maxLength: 50 }),
    fc.stringMatching(/^https?:\/\//),
    (label, url) => {
      const spacedLabel = '  ' + label + '  ';
      const spacedUrl = '  ' + url + '  ';
      const result = validateQuickLink(spacedLabel, spacedUrl);
      expect(result.valid).toBe(true);
    }
  ));
});

// Property 6: createQuickLink generates unique ids
test('Property: createQuickLink generates unique ids', () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1 }),
    fc.stringMatching(/^https?:\/\//),
    (label, url) => {
      const link1 = createQuickLink(label, url);
      const link2 = createQuickLink(label, url);
      expect(link1.id).not.toBe(link2.id);
    }
  ));
});

// Property 7: addLinkToSet increases array length by 1
test('Property: addLinkToSet increases length by 1', () => {
  fc.assert(fc.property(
    fc.array(
      fc.record({
        id: fc.string(),
        label: fc.string({ minLength: 1 }),
        url: fc.stringMatching(/^https?:\/\//)
      })
    ),
    fc.record({
      id: fc.string(),
      label: fc.string({ minLength: 1 }),
      url: fc.stringMatching(/^https?:\/\//)
    }),
    (links, link) => {
      const result = addLinkToSet(links, link);
      expect(result.length).toBe(links.length + 1);
    }
  ));
});

// Property 8: removeLinkFromSet decreases array length by 1 when link exists
test('Property: removeLinkFromSet decreases length by 1', () => {
  fc.assert(fc.property(
    fc.array(
      fc.record({
        id: fc.string(),
        label: fc.string({ minLength: 1 }),
        url: fc.stringMatching(/^https?:\/\//)
      })
    ),
    fc.string(),
    (links, id) => {
      // Create a link with the given id
      const link = { id: id, label: 'Test', url: 'https://example.com' };
      const withLink = addLinkToSet(links, link);
      const result = removeLinkFromSet(withLink, id);
      expect(result.length).toBe(links.length);
    }
  ));
});

// ============================================================
// Unit Tests (Edge Cases)
// ============================================================

describe('validateQuickLink', () => {
  test('returns valid=true for valid input', () => {
    const result = validateQuickLink('Google', 'https://google.com');
    expect(result).toEqual({ valid: true });
  });

  test('returns valid=true for http URL', () => {
    const result = validateQuickLink('Example', 'http://example.com');
    expect(result).toEqual({ valid: true });
  });

  test('returns valid=false for empty label', () => {
    const result = validateQuickLink('', 'https://example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Label cannot be empty');
  });

  test('returns valid=false for whitespace-only label', () => {
    const result = validateQuickLink('   ', 'https://example.com');
    expect(result.valid).toBe(false);
  });

  test('returns valid=false for empty URL', () => {
    const result = validateQuickLink('Example', '');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL cannot be empty');
  });

  test('returns valid=false for whitespace-only URL', () => {
    const result = validateQuickLink('Example', '   ');
    expect(result.valid).toBe(false);
  });

  test('returns valid=false for URL without protocol', () => {
    const result = validateQuickLink('Example', 'example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL must start with http:// or https://');
  });

  test('returns valid=false for ftp URL', () => {
    const result = validateQuickLink('Example', 'ftp://example.com');
    expect(result.valid).toBe(false);
  });

  test('returns valid=false for mailto URL', () => {
    const result = validateQuickLink('Example', 'mailto:test@example.com');
    expect(result.valid).toBe(false);
  });

  test('trims whitespace from label and URL', () => {
    const result = validateQuickLink('  Google  ', '  https://google.com  ');
    expect(result.valid).toBe(true);
  });

  test('returns error for label that is not a string', () => {
    const result = validateQuickLink(null, 'https://example.com');
    expect(result.valid).toBe(false);
  });

  test('returns error for URL that is not a string', () => {
    const result = validateQuickLink('Example', 123);
    expect(result.valid).toBe(false);
  });

  test('handles label starting with space', () => {
    const result = validateQuickLink(' Google', 'https://example.com');
    expect(result.valid).toBe(true);
  });

  test('handles URL with leading space but no protocol', () => {
    const result = validateQuickLink('Example', ' example.com');
    expect(result.valid).toBe(false);
  });

  test('handles URL with trailing space but valid protocol', () => {
    const result = validateQuickLink('Example', 'https://example.com ');
    expect(result.valid).toBe(true);
  });
});

describe('createQuickLink', () => {
  test('returns object with id, label, and url', () => {
    const link = createQuickLink('Google', 'https://google.com');
    expect(link).toHaveProperty('id');
    expect(link.label).toBe('Google');
    expect(link.url).toBe('https://google.com');
  });

  test('trims whitespace from label and url', () => {
    const link = createQuickLink('  Google  ', '  https://google.com  ');
    expect(link.label).toBe('Google');
    expect(link.url).toBe('https://google.com');
  });

  test('generates unique id for each call', () => {
    const link1 = createQuickLink('Same', 'https://same.com');
    const link2 = createQuickLink('Same', 'https://same.com');
    expect(link1.id).not.toBe(link2.id);
  });

  test('id is a string', () => {
    const link = createQuickLink('Test', 'https://test.com');
    expect(typeof link.id).toBe('string');
  });

  test('id format is UUID or timestamp-based', () => {
    const link = createQuickLink('Test', 'https://test.com');
    // UUID format or link_timestamp_random
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(link.id);
    const isTimestamp = /^link_\d+_\d+$/.test(link.id);
    expect(isUUID || isTimestamp).toBe(true);
  });
});

describe('addLinkToSet', () => {
  test('appends link to end of array', () => {
    const links = [{ id: '1', label: 'First', url: 'https://first.com' }];
    const newLink = { id: '2', label: 'Second', url: 'https://second.com' };
    const result = addLinkToSet(links, newLink);
    expect(result.length).toBe(2);
    expect(result[1]).toBe(newLink);
  });

  test('preserves original array', () => {
    const links = [{ id: '1', label: 'First', url: 'https://first.com' }];
    const newLink = { id: '2', label: 'Second', url: 'https://second.com' };
    const result = addLinkToSet(links, newLink);
    expect(links.length).toBe(1);
    expect(result.length).toBe(2);
  });

  test('returns new array instance', () => {
    const links = [];
    const link = { id: '1', label: 'Test', url: 'https://test.com' };
    const result = addLinkToSet(links, link);
    expect(result).not.toBe(links);
  });

  test('adds link to empty array', () => {
    const link = { id: '1', label: 'First', url: 'https://first.com' };
    const result = addLinkToSet([], link);
    expect(result).toStrictEqual([link]);
  });

  test('maintains order of existing links', () => {
    const links = [
      { id: '1', label: 'First', url: 'https://first.com' },
      { id: '2', label: 'Second', url: 'https://second.com' }
    ];
    const newLink = { id: '3', label: 'Third', url: 'https://third.com' };
    const result = addLinkToSet(links, newLink);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });
});

describe('removeLinkFromSet', () => {
  test('removes link by id', () => {
    const links = [
      { id: '1', label: 'First', url: 'https://first.com' },
      { id: '2', label: 'Second', url: 'https://second.com' },
      { id: '3', label: 'Third', url: 'https://third.com' }
    ];
    const result = removeLinkFromSet(links, '2');
    expect(result.length).toBe(2);
    expect(result.find(l => l.id === '2')).toBeUndefined();
  });

  test('preserves other links', () => {
    const original = [
      { id: '1', label: 'First', url: 'https://first.com' },
      { id: '2', label: 'Second', url: 'https://second.com' }
    ];
    const result = removeLinkFromSet(original, '1');
    expect(result[0]).toEqual(original[1]);
  });

  test('returns new array instance', () => {
    const links = [{ id: '1', label: 'Test', url: 'https://test.com' }];
    const result = removeLinkFromSet(links, '1');
    expect(result).not.toBe(links);
  });

  test('handles removing from single-item array', () => {
    const links = [{ id: '1', label: 'Only', url: 'https://only.com' }];
    const result = removeLinkFromSet(links, '1');
    expect(result).toStrictEqual([]);
  });

  test('returns empty array for empty input', () => {
    expect(removeLinkFromSet([], '1')).toStrictEqual([]);
  });

  test('ignores non-existent id', () => {
    const original = [{ id: '1', label: 'Test', url: 'https://test.com' }];
    const result = removeLinkFromSet(original, 'nonexistent');
    expect(result).toStrictEqual(original);
  });

  test('preserves order of remaining links', () => {
    const links = [
      { id: '1', label: 'First', url: 'https://first.com' },
      { id: '2', label: 'Second', url: 'https://second.com' },
      { id: '3', label: 'Third', url: 'https://third.com' }
    ];
    const result = removeLinkFromSet(links, '2');
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });
});

// ============================================================
// Integration Tests (Real-world scenarios)
// ============================================================

describe('QuickLinks integration', () => {
  test('full workflow: add and remove links', () => {
    // Create valid links
    const link1 = createQuickLink('Google', 'https://google.com');
    const link2 = createQuickLink('GitHub', 'https://github.com');
    
    // Build array
    let links = addLinkToSet([], link1);
    links = addLinkToSet(links, link2);
    
    expect(links.length).toBe(2);
    expect(links[0].label).toBe('Google');
    expect(links[1].label).toBe('GitHub');
    
    // Remove one link
    links = removeLinkFromSet(links, link1.id);
    expect(links.length).toBe(1);
    expect(links[0].label).toBe('GitHub');
  });

  test('validation workflow with invalid inputs', () => {
    // Empty label
    expect(validateQuickLink('', 'https://example.com').valid).toBe(false);
    
    // Empty URL
    expect(validateQuickLink('Example', '').valid).toBe(false);
    
    // Invalid protocol
    expect(validateQuickLink('Example', 'ftp://example.com').valid).toBe(false);
    
    // Valid input
    expect(validateQuickLink('Example', 'https://example.com').valid).toBe(true);
  });

  test('multiple links maintain unique ids', () => {
    const links = [];
    for (let i = 0; i < 5; i++) {
      const link = createQuickLink(`Link ${i}`, `https://link${i}.com`);
      links.push(link);
    }
    
    // All ids should be unique
    const ids = links.map(l => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);
  });
});
