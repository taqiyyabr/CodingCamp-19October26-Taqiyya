/**
 * Utility functions tests (task 3.1)
 * - getGreeting: Returns greeting based on hour
 * - formatTime: Formats Date to "HH:MM"
 * - formatDate: Formats Date to "YYYY-MM-DD"
 * - isValidUserName: Validates name (1-20 chars, letters/numbers/spaces only)
 */

import fc from 'fast-check';
const { getGreeting, formatTime, formatDate, isValidUserName } = require('./app.js');

// ============================================================
// Property-Based Tests
// ============================================================

// Property 1: getGreeting returns one of three valid greetings for any hour 0-23
test('Property: getGreeting returns valid greeting for any hour 0-23', () => {
  fc.assert(fc.property(fc.integer(0, 23), (hour) => {
    const greeting = getGreeting(hour);
    expect(['Good Morning', 'Good Afternoon', 'Good Evening']).toContain(greeting);
  }));
});

// Property 2: getGreeting returns correct greeting for morning hours (5-11)
test('Property: getGreeting returns Good Morning for hours 5-11', () => {
  fc.assert(fc.property(fc.integer(5, 11), (hour) => {
    expect(getGreeting(hour)).toBe('Good Morning');
  }));
});

// Property 3: getGreeting returns correct greeting for afternoon hours (12-16)
test('Property: getGreeting returns Good Afternoon for hours 12-16', () => {
  fc.assert(fc.property(fc.integer(12, 16), (hour) => {
    expect(getGreeting(hour)).toBe('Good Afternoon');
  }));
});

// Property 4: getGreeting returns correct greeting for evening hours (0-4, 17-23)
test('Property: getGreeting returns Good Evening for hours 0-4 and 17-23', () => {
  fc.assert(fc.property(fc.integer(17, 23), (hour) => {
    expect(getGreeting(hour)).toBe('Good Evening');
  }));
  
  fc.assert(fc.property(fc.integer(0, 4), (hour) => {
    expect(getGreeting(hour)).toBe('Good Evening');
  }));
});

// Property 5: formatTime always returns a string matching HH:MM pattern
test('Property: formatTime returns valid HH:MM format', () => {
  fc.assert(fc.property(fc.date(), (date) => {
    const formatted = formatTime(date);
    expect(formatted).toMatch(/^\d{2}:\d{2}$/);
  }));
});

// Property 6: formatDate always returns a string matching YYYY-MM-DD pattern
test('Property: formatDate returns valid YYYY-MM-DD format', () => {
  fc.assert(fc.property(fc.date(), (date) => {
    const formatted = formatDate(date);
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }));
});

// Property 7: isValidUserName validates 1-20 chars constraint
test('Property: isValidUserName rejects names outside 1-20 chars', () => {
  fc.assert(fc.property(fc.string(), (str) => {
    // Trimmed empty or >20 chars should be invalid
    if (str.trim().length === 0 || str.trim().length > 20) {
      expect(isValidUserName(str)).toBe(false);
    }
  }));
});

// Property 8: isValidUserName only accepts letters, numbers, and spaces
test('Property: isValidUserName rejects names with special characters', () => {
  fc.assert(fc.property(fc.string({ charset: fc.char([33, 64, 35, 36, 37, 94, 38, 42, 40, 41, 43, 61, 123, 125, 91, 93, 124, 92, 58, 59, 39, 34, 60, 62, 44, 46, 63, 47, 45]) }), (str) => {
    // These characters should make validation fail
    expect(isValidUserName('test' + str + 'user')).toBe(false);
  }));
});

// ============================================================
// Unit Tests (Edge Cases)
// ============================================================

describe('getGreeting', () => {
  test('returns Good Morning for hour 5', () => {
    expect(getGreeting(5)).toBe('Good Morning');
  });

  test('returns Good Morning for hour 11', () => {
    expect(getGreeting(11)).toBe('Good Morning');
  });

  test('returns Good Afternoon for hour 12', () => {
    expect(getGreeting(12)).toBe('Good Afternoon');
  });

  test('returns Good Afternoon for hour 16', () => {
    expect(getGreeting(16)).toBe('Good Afternoon');
  });

  test('returns Good Evening for hour 0', () => {
    expect(getGreeting(0)).toBe('Good Evening');
  });

  test('returns Good Evening for hour 4', () => {
    expect(getGreeting(4)).toBe('Good Evening');
  });

  test('returns Good Evening for hour 17', () => {
    expect(getGreeting(17)).toBe('Good Evening');
  });

  test('returns Good Evening for hour 23', () => {
    expect(getGreeting(23)).toBe('Good Evening');
  });

  test('returns correct greeting for boundary hours', () => {
    expect(getGreeting(5)).toBe('Good Morning');
    expect(getGreeting(11)).toBe('Good Morning');
    expect(getGreeting(12)).toBe('Good Afternoon');
    expect(getGreeting(16)).toBe('Good Afternoon');
    expect(getGreeting(17)).toBe('Good Evening');
    expect(getGreeting(23)).toBe('Good Evening');
    expect(getGreeting(0)).toBe('Good Evening');
  });
});

describe('formatTime', () => {
  test('formats midnight correctly', () => {
    const date = new Date('2024-01-15T00:00:00');
    expect(formatTime(date)).toBe('00:00');
  });

  test('formats noon correctly', () => {
    const date = new Date('2024-01-15T12:00:00');
    expect(formatTime(date)).toBe('12:00');
  });

  test('formats with single digit hour', () => {
    const date = new Date('2024-01-15T08:30:00');
    expect(formatTime(date)).toBe('08:30');
  });

  test('formats with single digit minute', () => {
    const date = new Date('2024-01-15T14:05:00');
    expect(formatTime(date)).toBe('14:05');
  });

  test('formats with both single digits', () => {
    const date = new Date('2024-01-15T03:07:00');
    expect(formatTime(date)).toBe('03:07');
  });

  test('formats 23:59 correctly', () => {
    const date = new Date('2024-01-15T23:59:00');
    expect(formatTime(date)).toBe('23:59');
  });
});

describe('formatDate', () => {
  test('formats January 15, 2024 correctly', () => {
    const date = new Date('2024-01-15T10:30:00');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  test('formats with single digit month', () => {
    const date = new Date('2024-05-15T10:30:00');
    expect(formatDate(date)).toBe('2024-5-15');
  });

  test('formats with single digit day', () => {
    const date = new Date('2024-01-05T10:30:00');
    expect(formatDate(date)).toBe('2024-01-5');
  });

  test('formats with both single digit month and day', () => {
    const date = new Date('2024-03-07T10:30:00');
    expect(formatDate(date)).toBe('2024-3-7');
  });

  test('formats leap year date correctly', () => {
    const date = new Date('2024-02-29T10:30:00');
    expect(formatDate(date)).toBe('2024-2-29');
  });
});

describe('isValidUserName', () => {
  test('returns true for valid simple name', () => {
    expect(isValidUserName('John')).toBe(true);
  });

  test('returns true for name with numbers', () => {
    expect(isValidUserName('John123')).toBe(true);
  });

  test('returns true for name with spaces', () => {
    expect(isValidUserName('John Doe')).toBe(true);
  });

  test('returns true for name with mixed alphanumeric and spaces', () => {
    expect(isValidUserName('User 123 Test')).toBe(true);
  });

  test('returns false for empty string', () => {
    expect(isValidUserName('')).toBe(false);
  });

  test('returns false for whitespace-only string', () => {
    expect(isValidUserName('   ')).toBe(false);
  });

  test('returns false for name starting with space', () => {
    expect(isValidUserName(' John')).toBe(true);
  });

  test('returns false for name ending with space', () => {
    expect(isValidUserName('John ')).toBe(true);
  });

  test('returns false for name with special characters', () => {
    expect(isValidUserName('John@Doe')).toBe(false);
  });

  test('returns false for name with underscore', () => {
    expect(isValidUserName('John_Doe')).toBe(false);
  });

  test('returns false for name with hyphen', () => {
    expect(isValidUserName('John-Doe')).toBe(false);
  });

  test('returns false for name with non-ASCII characters', () => {
    expect(isValidUserName('José')).toBe(false);
  });

  test('returns false for name with 21 characters', () => {
    const longName = 'A'.repeat(21);
    expect(isValidUserName(longName)).toBe(false);
  });

  test('returns true for name with exactly 20 characters', () => {
    const name20 = 'A'.repeat(20);
    expect(isValidUserName(name20)).toBe(true);
  });

  test('returns true for name with exactly 1 character', () => {
    expect(isValidUserName('A')).toBe(true);
  });

  test('returns false for null input', () => {
    expect(isValidUserName(null)).toBe(false);
  });

  test('returns false for undefined input', () => {
    expect(isValidUserName(undefined)).toBe(false);
  });

  test('returns false for number input', () => {
    expect(isValidUserName(123)).toBe(false);
  });

  test('trims whitespace before validation', () => {
    expect(isValidUserName('  John  ')).toBe(true);
  });

  test('handles very long name with valid characters but exceeds limit', () => {
    const longValid = 'A'.repeat(25);
    expect(isValidUserName(longValid)).toBe(false);
  });

  test('accepts multiple spaces within name', () => {
    expect(isValidUserName('John   Doe')).toBe(true);
  });
});

describe('isValidUserName boundary cases', () => {
  test('returns false for exactly 21 characters', () => {
    const name21 = 'A'.repeat(21);
    expect(isValidUserName(name21)).toBe(false);
  });

  test('returns true for exactly 20 characters', () => {
    const name20 = 'A'.repeat(20);
    expect(isValidUserName(name20)).toBe(true);
  });

  test('returns true for single valid character', () => {
    expect(isValidUserName('A')).toBe(true);
  });

  test('returns false for empty after trim', () => {
    expect(isValidUserName('   ')).toBe(false);
  });
});

// ============================================================
// Integration Tests (Real-world scenarios)
// ============================================================

describe('Utility functions integration', () => {
  test('greeting changes throughout the day', () => {
    const morning = getGreeting(9);
    const afternoon = getGreeting(14);
    const evening = getGreeting(20);
    
    expect(morning).toBe('Good Morning');
    expect(afternoon).toBe('Good Afternoon');
    expect(evening).toBe('Good Evening');
  });

  test('time and date formatting for current time', () => {
    const now = new Date();
    const timeStr = formatTime(now);
    const dateStr = formatDate(now);
    
    expect(timeStr).toMatch(/^\d{2}:\d{2}$/);
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('user name validation with real-world examples', () => {
    expect(isValidUserName('John Doe')).toBe(true);
    expect(isValidUserName('Jane123')).toBe(true);
    expect(isValidUserName('user name 123')).toBe(true);
    expect(isValidUserName('admin@example.com')).toBe(false);
    expect(isValidUserName('User-Name')).toBe(false);
  });
});

// ============================================================
// Timer Tests (task 4.1)
// ============================================================

const { TIMER_DURATION_SECONDS, formatTimer, tickTimer, resetTimer, setTimer } = require('./app.js');

describe('Timer constants', () => {
  test('TIMER_DURATION_SECONDS is 1500 (25 minutes)', () => {
    expect(TIMER_DURATION_SECONDS).toBe(1500);
  });
});

describe('formatTimer', () => {
  test('returns "MM:SS" format for zero seconds', () => {
    expect(formatTimer({ remainingSeconds: 0 })).toBe('00:00');
  });

  test('returns "MM:SS" format for single digit seconds', () => {
    expect(formatTimer({ remainingSeconds: 5 })).toBe('00:05');
  });

  test('returns "MM:SS" format for single digit minutes', () => {
    expect(formatTimer({ remainingSeconds: 60 })).toBe('01:00');
  });

  test('returns "MM:SS" format for two digit minutes', () => {
    expect(formatTimer({ remainingSeconds: 125 })).toBe('02:05');
  });

  test('returns "MM:SS" format for near-max value', () => {
    expect(formatTimer({ remainingSeconds: 1499 })).toBe('24:59');
  });

  test('returns "MM:SS" format for exact 25 minutes', () => {
    expect(formatTimer({ remainingSeconds: 1500 })).toBe('25:00');
  });

  test('handles state with totalTime and elapsed', () => {
    expect(formatTimer({ totalTime: 1500, elapsed: 0 })).toBe('25:00');
    expect(formatTimer({ totalTime: 1500, elapsed: 60 })).toBe('24:00');
    expect(formatTimer({ totalTime: 1500, elapsed: 1499 })).toBe('00:01');
  });
});

describe('tickTimer', () => {
  test('decrements remainingSeconds by 1 when running', () => {
    const state = { remainingSeconds: 100, isRunning: true };
    const result = tickTimer(state);
    expect(result.remainingSeconds).toBe(99);
    expect(result.isRunning).toBe(true);
  });

  test('clamps at zero and stops when remaining reaches 0', () => {
    const state = { remainingSeconds: 1, isRunning: true };
    const result1 = tickTimer(state);
    expect(result1.remainingSeconds).toBe(0);
    expect(result1.isRunning).toBe(true);
    
    const result2 = tickTimer(result1);
    expect(result2.remainingSeconds).toBe(0);
    expect(result2.isRunning).toBe(false);
  });

  test('returns unchanged state when not running', () => {
    const state = { remainingSeconds: 100, isRunning: false };
    const result = tickTimer(state);
    expect(result).toBe(state);
    expect(result.remainingSeconds).toBe(100);
    expect(result.isRunning).toBe(false);
  });

  test('does not go negative', () => {
    const state = { remainingSeconds: 0, isRunning: false };
    const result = tickTimer(state);
    expect(result.remainingSeconds).toBe(0);
  });

  test('handles state with totalTime and elapsed', () => {
    const state = { totalTime: 1500, elapsed: 0, running: true };
    const result = tickTimer(state);
    expect(result.remainingSeconds).toBe(1499);
    expect(result.isRunning).toBe(true);
  });
});

describe('resetTimer', () => {
  test('resets to initial state with 1500 seconds', () => {
    const state = { remainingSeconds: 500, isRunning: true };
    const result = resetTimer(state);
    expect(result.remainingSeconds).toBe(1500);
    expect(result.isRunning).toBe(false);
  });

  test('resets from any state to initial state', () => {
    const state = { remainingSeconds: 0, isRunning: false };
    const result = resetTimer(state);
    expect(result.remainingSeconds).toBe(1500);
    expect(result.isRunning).toBe(false);
  });
});

describe('setTimer', () => {
  test('sets timer to specified seconds', () => {
    const result = setTimer(600);
    expect(result.remainingSeconds).toBe(600);
    expect(result.isRunning).toBe(false);
  });

  test('clamps minimum at 0', () => {
    const result = setTimer(-100);
    expect(result.remainingSeconds).toBe(0);
    expect(result.isRunning).toBe(false);
  });

  test('clamps maximum at TIMER_DURATION_SECONDS', () => {
    const result = setTimer(2000);
    expect(result.remainingSeconds).toBe(1500);
    expect(result.isRunning).toBe(false);
  });
});

// ============================================================
// Property-Based Tests for Timer
// ============================================================

// Property 1: formatTimer always returns valid MM:SS format
test('Property: formatTimer returns valid MM:SS format', () => {
  fc.assert(fc.property(fc.integer(0, 1500), (seconds) => {
    const result = formatTimer({ remainingSeconds: seconds });
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  }));
});

// Property 2: tickTimer decrements by exactly 1 when running
test('Property: tickTimer decrements by exactly 1', () => {
  fc.assert(fc.property(fc.integer(1, 1500), (start) => {
    const state = { remainingSeconds: start, isRunning: true };
    const result = tickTimer(state);
    expect(result.remainingSeconds).toBe(start - 1);
  }));
});

// Property 3: tickTimer never goes negative
test('Property: tickTimer never goes negative', () => {
  fc.assert(fc.property(
    fc.record({
      remainingSeconds: fc.integer(0, 1500),
      isRunning: fc.boolean()
    }),
    (state) => {
      const result = tickTimer(state);
      expect(result.remainingSeconds).toBeGreaterThanOrEqual(0);
    }
  ));
});

// Property 4: resetTimer always returns initial state
test('Property: resetTimer always returns initial state', () => {
  fc.assert(fc.property(
    fc.record({
      remainingSeconds: fc.integer(0, 1500),
      isRunning: fc.boolean()
    }),
    (state) => {
      const result = resetTimer(state);
      expect(result.remainingSeconds).toBe(1500);
      expect(result.isRunning).toBe(false);
    }
  ));
});

// Property 5: timer format is consistent across decrement
test('Property: timer format consistency', () => {
  fc.assert(fc.property(fc.integer(0, 1500), (seconds) => {
    const formatted = formatTimer({ remainingSeconds: seconds });
    const [minutes, rest] = formatted.split(':');
    const totalSeconds = parseInt(minutes, 10) * 60 + parseInt(rest, 10);
    expect(totalSeconds).toBe(seconds);
  }));
});

// ============================================================
// Integration Tests (Real-world scenarios)
// ============================================================

describe('Timer integration', () => {
  test('timer counts down from 25:00', () => {
    let state = { remainingSeconds: 1500, isRunning: true };
    
    // Simulate 60 ticks (1 minute)
    for (let i = 0; i < 60; i++) {
      state = tickTimer(state);
    }
    
    expect(state.remainingSeconds).toBe(1440);
    expect(formatTimer(state)).toBe('24:00');
  });

  test('timer stops at zero', () => {
    let state = { remainingSeconds: 2, isRunning: true };
    
    state = tickTimer(state);
    state = tickTimer(state);
    
    expect(state.remainingSeconds).toBe(0);
    expect(state.isRunning).toBe(false);
    
    // Additional ticks should not change state
    const originalState = { ...state };
    state = tickTimer(state);
    expect(state).toStrictEqual(originalState);
  });

  test('formatTimer matches design expectations', () => {
    expect(formatTimer({ remainingSeconds: 0 })).toBe('00:00');
    expect(formatTimer({ remainingSeconds: 59 })).toBe('00:59');
    expect(formatTimer({ remainingSeconds: 60 })).toBe('01:00');
    expect(formatTimer({ remainingSeconds: 119 })).toBe('01:59');
    expect(formatTimer({ remainingSeconds: 120 })).toBe('02:00');
    expect(formatTimer({ remainingSeconds: 1499 })).toBe('24:59');
    expect(formatTimer({ remainingSeconds: 1500 })).toBe('25:00');
  });
});
    expect(formatTimer({ remainingSeconds: 1499 })).toBe('24:59');
    expect(formatTimer({ remainingSeconds: 1500 })).toBe('25:00');
  });
});

// ============================================================
// TaskList Tests (task 5.1)
// ============================================================

const { validateTaskText, isValidColor, sortTasks, createTask, addTaskToList, removeTaskFromList, editTaskInList, toggleTaskDoneInList } = require('./app.js');

// ============================================================
// Property-Based Tests for TaskList
// ============================================================

// Property 1: validateTaskText validates trimmed length between 1 and 200
test('Property: validateTaskText validates trimmed length 1-200', () => {
  fc.assert(fc.property(fc.string(), (str) => {
    const trimmed = str.trim();
    const isValid = validateTaskText(str);
    if (trimmed.length >= 1 && trimmed.length <= 200) {
      expect(isValid).toBe(true);
    } else {
      expect(isValid).toBe(false);
    }
  }));
});

// Property 2: isValidColor only returns true for red, yellow, green
test('Property: isValidColor validates color strings', () => {
  fc.assert(fc.property(fc.oneOf(fc.constant('red'), fc.constant('yellow'), fc.constant('green'), fc.string())), (color) => {
    const validColors = ['red', 'yellow', 'green'];
    const isValid = isValidColor(color);
    if (validColors.includes(color)) {
      expect(isValid).toBe(true);
    } else {
      expect(isValid).toBe(false);
    }
  });
});

// Property 3: sortTasks produces stable sorting (red, yellow, green)
test('Property: sortTasks produces stable ordering by color', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      id: fc.string(),
      text: fc.string(),
      color: fc.oneOf(fc.constant('red'), fc.constant('yellow'), fc.constant('green')),
      done: fc.boolean()
    })),
    (tasks) => {
      const sorted = sortTasks(tasks);
      
      // Check that colors are in correct order
      let lastColorIndex = -1;
      for (const task of sorted) {
        const colorIndex = ['red', 'yellow', 'green'].indexOf(task.color);
        expect(colorIndex).toBeGreaterThanOrEqual(lastColorIndex);
        lastColorIndex = colorIndex;
      }
    }
  ));
});

// Property 4: sortTasks is idempotent (applying twice gives same result)
test('Property: sortTasks is idempotent', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      id: fc.string(),
      text: fc.string(),
      color: fc.oneOf(fc.constant('red'), fc.constant('yellow'), fc.constant('green')),
      done: fc.boolean()
    })),
    (tasks) => {
      const sortedOnce = sortTasks(tasks);
      const sortedTwice = sortTasks(sortedOnce);
      expect(sortedTwice).toStrictEqual(sortedOnce);
    }
  ));
});

// Property 5: addTaskToList increases array length by 1
test('Property: addTaskToList increases length by 1', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      id: fc.string(),
      text: fc.string(),
      color: fc.oneOf(fc.constant('red'), fc.constant('yellow'), fc.constant('green')),
      done: fc.boolean()
    })),
    fc.record({
      id: fc.string(),
      text: fc.string(),
      color: fc.oneOf(fc.constant('red'), fc.constant('yellow'), fc.constant('green')),
      done: fc.boolean()
    }),
    (tasks, task) => {
      const result = addTaskToList(tasks, task);
      expect(result.length).toBe(tasks.length + 1);
    }
  ));
});

// Property 6: removeTaskFromList decreases array length by 1 when task exists
test('Property: removeTaskFromList decreases length by 1', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      id: fc.string(),
      text: fc.string(),
      color: fc.oneOf(fc.constant('red'), fc.constant('yellow'), fc.constant('green')),
      done: fc.boolean()
    })),
    fc.string(),
    (tasks, id) => {
      // Add a task with the given id
      const task = { id: id, text: 'Test', color: 'red', done: false };
      const withTask = addTaskToList(tasks, task);
      const result = removeTaskFromList(withTask, id);
      expect(result.length).toBe(tasks.length);
    }
  ));
});

// Property 7: toggleTaskDoneInList flips the done flag
test('Property: toggleTaskDoneInList flips done flag', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      id: fc.string(),
      text: fc.string(),
      color: fc.oneOf(fc.constant('red'), fc.constant('yellow'), fc.constant('green')),
      done: fc.boolean()
    })),
    fc.string(),
    (tasks, id) => {
      // Add a task with the given id
      const task = { id: id, text: 'Test', color: 'red', done: false };
      const withTask = addTaskToList(tasks, task);
      const result1 = toggleTaskDoneInList(withTask, id);
      const result2 = toggleTaskDoneInList(result1, id);
      // Toggling twice should return to original
      expect(result2).toStrictEqual(withTask);
    }
  ));
});

// Property 8: createTask generates unique ids
test('Property: createTask generates unique ids', () => {
  fc.assert(fc.property(fc.string(), fc.oneOf(fc.constant('red'), fc.constant('yellow'), fc.constant('green')), (text, color) => {
    const task1 = createTask(text, color);
    const task2 = createTask(text, color);
    expect(task1.id).not.toBe(task2.id);
  }));
});

// ============================================================
// Unit Tests (Edge Cases) for TaskList
// ============================================================

describe('validateTaskText', () => {
  test('returns true for valid text (1-200 chars)', () => {
    expect(validateTaskText('Hello')).toBe(true);
    expect(validateTaskText('A'.repeat(200))).toBe(true);
  });

  test('returns false for empty string', () => {
    expect(validateTaskText('')).toBe(false);
  });

  test('returns false for whitespace-only string', () => {
    expect(validateTaskText('   ')).toBe(false);
  });

  test('returns true for text with leading/trailing whitespace', () => {
    expect(validateTaskText('  Hello  ')).toBe(true);
  });

  test('returns false for text exceeding 200 characters', () => {
    expect(validateTaskText('A'.repeat(201))).toBe(false);
  });

  test('returns false for null input', () => {
    expect(validateTaskText(null)).toBe(false);
  });

  test('returns false for undefined input', () => {
    expect(validateTaskText(undefined)).toBe(false);
  });

  test('returns false for number input', () => {
    expect(validateTaskText(123)).toBe(false);
  });

  test('trims whitespace before validation', () => {
    expect(validateTaskText('  Hello  ')).toBe(true);
    expect(validateTaskText('     ')).toBe(false);
  });
});

describe('isValidColor', () => {
  test('returns true for red', () => {
    expect(isValidColor('red')).toBe(true);
  });

  test('returns true for yellow', () => {
    expect(isValidColor('yellow')).toBe(true);
  });

  test('returns true for green', () => {
    expect(isValidColor('green')).toBe(true);
  });

  test('returns false for blue', () => {
    expect(isValidColor('blue')).toBe(false);
  });

  test('returns false for invalid color', () => {
    expect(isValidColor('purple')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isValidColor('')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isValidColor(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isValidColor(undefined)).toBe(false);
  });

  test('returns false for number', () => {
    expect(isValidColor(123)).toBe(false);
  });

  test('case sensitive - returns false for uppercase', () => {
    expect(isValidColor('RED')).toBe(false);
  });
});

describe('sortTasks', () => {
  test('sorts tasks by color: red, yellow, green', () => {
    const tasks = [
      { id: '3', text: 'Green task', color: 'green', done: false },
      { id: '1', text: 'Red task', color: 'red', done: false },
      { id: '2', text: 'Yellow task', color: 'yellow', done: true }
    ];
    const sorted = sortTasks(tasks);
    expect(sorted[0].color).toBe('red');
    expect(sorted[1].color).toBe('yellow');
    expect(sorted[2].color).toBe('green');
  });

  test('maintains stable order within same color', () => {
    const tasks = [
      { id: '1', text: 'First red', color: 'red', done: false },
      { id: '2', text: 'Second red', color: 'red', done: true },
      { id: '3', text: 'Third red', color: 'red', done: false }
    ];
    const sorted = sortTasks(tasks);
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
    expect(sorted[2].id).toBe('3');
  });

  test('returns empty array for empty input', () => {
    expect(sortTasks([])).toStrictEqual([]);
  });

  test('returns single task unchanged', () => {
    const task = { id: '1', text: 'Task', color: 'yellow', done: false };
    expect(sortTasks([task])).toStrictEqual([task]);
  });

  test('preserves all task properties', () => {
    const tasks = [
      { id: '3', text: 'Task C', color: 'green', done: false },
      { id: '1', text: 'Task A', color: 'red', done: true }
    ];
    const sorted = sortTasks(tasks);
    expect(sorted[0].id).toBe('1');
    expect(sorted[0].text).toBe('Task A');
    expect(sorted[0].done).toBe(true);
    expect(sorted[1].id).toBe('3');
    expect(sorted[1].text).toBe('Task C');
    expect(sorted[1].done).toBe(false);
  });
});

describe('createTask', () => {
  test('returns task object with correct properties', () => {
    const task = createTask('Test task', 'red');
    expect(task).toHaveProperty('id');
    expect(task.text).toBe('Test task');
    expect(task.color).toBe('red');
    expect(task.done).toBe(false);
  });

  test('generates unique id for each task', () => {
    const task1 = createTask('Same text', 'yellow');
    const task2 = createTask('Same text', 'yellow');
    expect(task1.id).not.toBe(task2.id);
  });

  test('id is a string', () => {
    const task = createTask('Test', 'green');
    expect(typeof task.id).toBe('string');
  });

  test('preserves text exactly as provided', () => {
    const task = createTask('  Spaces  ', 'red');
    expect(task.text).toBe('  Spaces  ');
  });

  test('creates task with done: false', () => {
    const task = createTask('Task', 'yellow');
    expect(task.done).toBe(false);
  });
});

describe('addTaskToList', () => {
  test('appends task to end of array', () => {
    const tasks = [
      { id: '1', text: 'First', color: 'red', done: false }
    ];
    const newTask = { id: '2', text: 'Second', color: 'yellow', done: true };
    const result = addTaskToList(tasks, newTask);
    expect(result.length).toBe(2);
    expect(result[1]).toBe(newTask);
  });

  test('preserves original array', () => {
    const tasks = [{ id: '1', text: 'Task', color: 'red', done: false }];
    const newTask = { id: '2', text: 'New', color: 'yellow', done: true };
    const result = addTaskToList(tasks, newTask);
    expect(tasks.length).toBe(1);
    expect(result.length).toBe(2);
  });

  test('returns new array instance', () => {
    const tasks = [];
    const task = { id: '1', text: 'Task', color: 'red', done: false };
    const result = addTaskToList(tasks, task);
    expect(result).not.toBe(tasks);
  });

  test('adds task to empty array', () => {
    const task = { id: '1', text: 'First', color: 'green', done: false };
    const result = addTaskToList([], task);
    expect(result).toStrictEqual([task]);
  });

  test('maintains order of existing tasks', () => {
    const tasks = [
      { id: '1', text: 'First', color: 'red', done: false },
      { id: '2', text: 'Second', color: 'yellow', done: true }
    ];
    const newTask = { id: '3', text: 'Third', color: 'green', done: false };
    const result = addTaskToList(tasks, newTask);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });
});

describe('removeTaskFromList', () => {
  test('removes task by id', () => {
    const tasks = [
      { id: '1', text: 'First', color: 'red', done: false },
      { id: '2', text: 'Second', color: 'yellow', done: true },
      { id: '3', text: 'Third', color: 'green', done: false }
    ];
    const result = removeTaskFromList(tasks, '2');
    expect(result.length).toBe(2);
    expect(result.find(t => t.id === '2')).toBeUndefined();
  });

  test('preserves other tasks', () => {
    const tasks = [
      { id: '1', text: 'First', color: 'red', done: false },
      { id: '2', text: 'Second', color: 'yellow', done: true },
      { id: '3', text: 'Third', color: 'green', done: false }
    ];
    const result = removeTaskFromList(tasks, '2');
    expect(result.find(t => t.id === '1')).toBeDefined();
    expect(result.find(t => t.id === '3')).toBeDefined();
  });

  test('returns original array if id not found', () => {
    const tasks = [{ id: '1', text: 'Task', color: 'red', done: false }];
    const result = removeTaskFromList(tasks, 'nonexistent');
    expect(result).not.toBe(tasks);
    expect(result).toStrictEqual(tasks);
  });

  test('returns empty array for empty input', () => {
    expect(removeTaskFromList([], '1')).toStrictEqual([]);
  });

  test('removes from middle of array', () => {
    const tasks = [
      { id: '1', text: 'First', color: 'red', done: false },
      { id: '2', text: 'Second', color: 'yellow', done: true },
      { id: '3', text: 'Third', color: 'green', done: false }
    ];
    const result = removeTaskFromList(tasks, '2');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });
});

describe('editTaskInList', () => {
  test('updates text and color by id', () => {
    const tasks = [
      { id: '1', text: 'Old text', color: 'red', done: false },
      { id: '2', text: 'Second', color: 'yellow', done: true }
    ];
    const result = editTaskInList(tasks, '1', 'New text', 'green');
    expect(result[0].text).toBe('New text');
    expect(result[0].color).toBe('green');
    expect(result[0].id).toBe('1');
    expect(result[0].done).toBe(false);
  });

  test('preserves done status', () => {
    const tasks = [
      { id: '1', text: 'Task', color: 'red', done: true }
    ];
    const result = editTaskInList(tasks, '1', 'Updated', 'yellow');
    expect(result[0].done).toBe(true);
  });

  test('preserves task position', () => {
    const tasks = [
      { id: '1', text: 'First', color: 'red', done: false },
      { id: '2', text: 'Second', color: 'yellow', done: true },
      { id: '3', text: 'Third', color: 'green', done: false }
    ];
    const result = editTaskInList(tasks, '2', 'Updated', 'green');
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  test('returns original array if id not found', () => {
    const tasks = [{ id: '1', text: 'Task', color: 'red', done: false }];
    const result = editTaskInList(tasks, 'nonexistent', 'New', 'green');
    expect(result).not.toBe(tasks);
    expect(result).toStrictEqual(tasks);
  });

  test('can update to same values', () => {
    const tasks = [{ id: '1', text: 'Task', color: 'red', done: false }];
    const result = editTaskInList(tasks, '1', 'Task', 'red');
    expect(result).toStrictEqual(tasks);
  });
});

describe('toggleTaskDoneInList', () => {
  test('flips done from false to true', () => {
    const tasks = [{ id: '1', text: 'Task', color: 'red', done: false }];
    const result = toggleTaskDoneInList(tasks, '1');
    expect(result[0].done).toBe(true);
  });

  test('flips done from true to false', () => {
    const tasks = [{ id: '1', text: 'Task', color: 'red', done: true }];
    const result = toggleTaskDoneInList(tasks, '1');
    expect(result[0].done).toBe(false);
  });

  test('preserves other properties', () => {
    const tasks = [{ id: '1', text: 'Task', color: 'yellow', done: false }];
    const result = toggleTaskDoneInList(tasks, '1');
    expect(result[0].id).toBe('1');
    expect(result[0].text).toBe('Task');
    expect(result[0].color).toBe('yellow');
    expect(result[0].done).toBe(true);
  });

  test('returns original array if id not found', () => {
    const tasks = [{ id: '1', text: 'Task', color: 'red', done: false }];
    const result = toggleTaskDoneInList(tasks, 'nonexistent');
    expect(result).not.toBe(tasks);
    expect(result).toStrictEqual(tasks);
  });

  test('toggling twice returns to original', () => {
    const tasks = [{ id: '1', text: 'Task', color: 'red', done: false }];
    const result1 = toggleTaskDoneInList(tasks, '1');
    const result2 = toggleTaskDoneInList(result1, '1');
    expect(result2).toStrictEqual(tasks);
  });
});

// ============================================================
// Integration Tests (Real-world scenarios)
// ============================================================

describe('TaskList integration', () => {
  test('full task CRUD workflow', () => {
    let tasks = [];
    
    // Add tasks
    const task1 = createTask('Task 1', 'red');
    tasks = addTaskToList(tasks, task1);
    
    const task2 = createTask('Task 2', 'green');
    tasks = addTaskToList(tasks, task2);
    
    const task3 = createTask('Task 3', 'yellow');
    tasks = addTaskToList(tasks, task3);
    
    expect(tasks.length).toBe(3);
    
    // Toggle done
    tasks = toggleTaskDoneInList(tasks, task1.id);
    expect(tasks.find(t => t.id === task1.id).done).toBe(true);
    
    // Edit
    tasks = editTaskInList(tasks, task2.id, 'Updated Task 2', 'yellow');
    expect(tasks.find(t => t.id === task2.id).text).toBe('Updated Task 2');
    
    // Remove
    tasks = removeTaskFromList(tasks, task3.id);
    expect(tasks.length).toBe(2);
    
    // Sort
    const sorted = sortTasks(tasks);
    expect(sorted[0].color).toBe('red');
    expect(sorted[1].color).toBe('yellow');
  });

  test('validation rejects empty and too-long text', () => {
    expect(validateTaskText('')).toBe(false);
    expect(validateTaskText(' '.repeat(201))).toBe(false);
    expect(validateTaskText('A'.repeat(200))).toBe(true);
    expect(validateTaskText('A'.repeat(201))).toBe(false);
  });

  test('stable sort preserves insertion order within same color', () => {
    const tasks = [
      { id: '1', text: 'First red', color: 'red', done: false },
      { id: '2', text: 'Second red', color: 'red', done: false },
      { id: '3', text: 'Third red', color: 'red', done: false },
      { id: '4', text: 'First yellow', color: 'yellow', done: false }
    ];
    const sorted = sortTasks(tasks);
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
    expect(sorted[2].id).toBe('3');
    expect(sorted[3].id).toBe('4');
  });
});
