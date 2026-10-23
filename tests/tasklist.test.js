/**
 * TaskList DOM tests (task 12.1)
 * - TaskList module: init, add, edit, toggleDone, remove, sort, render, load, persist
 * - TaskList pure logic: validateTaskText, isValidColor, sortTasks, createTask, etc.
 * - Integration tests: Storage wiring, DOM rendering
 */

import fc from 'fast-check';
const { TaskList, Storage, STORAGE_KEY_TASKS, validateTaskText, isValidColor, sortTasks, createTask, addTaskToList, removeTaskFromList, editTaskInList, toggleTaskDoneInList } = require('../js/app.js');

// Clear Local Storage before each test for isolation
beforeEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});

// ============================================================
// TaskList DOM Module Tests
// ============================================================

describe('TaskList init', () => {
  test('caches DOM nodes on init', () => {
    // Create a mock DOM
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text" maxlength="200">
          <select id="task-color">
            <option value="red">Red</option>
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
          </select>
          <button type="submit">Add task</button>
        </form>
        <button id="task-sort" type="button">Sort by color</button>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    expect(TaskList.root).toBe(root);
    expect(TaskList.taskForm).not.toBeNull();
    expect(TaskList.taskTextInput).not.toBeNull();
    expect(TaskList.taskColorSelect).not.toBeNull();
    expect(TaskList.taskList).not.toBeNull();
    expect(TaskList.taskError).not.toBeNull();
  });

  test('wires add form on init', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text" value="Test task">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    // Mock Storage to return true
    const originalIsAvailable = Storage.isAvailable;
    Storage.isAvailable = () => true;
    
    // Mock TaskList.load to prevent storage operations
    TaskList.load = jest.fn();
    
    TaskList.init(root);
    
    expect(TaskList.load).toHaveBeenCalled();
    
    Storage.isAvailable = originalIsAvailable;
  });

  test('returns early if Storage is not available', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    
    const originalIsAvailable = Storage.isAvailable;
    Storage.isAvailable = () => false;
    
    // This should not throw
    TaskList.init(root);
    
    // Nodes should not be cached
    expect(TaskList.root).toBeNull();
    
    Storage.isAvailable = originalIsAvailable;
  });
});

describe('TaskList add', () => {
  test('adds valid task and renders', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    // Add a valid task
    TaskList.add('Test task', 'red');
    
    expect(TaskList.tasks.length).toBe(1);
    expect(TaskList.tasks[0].text).toBe('Test task');
    expect(TaskList.tasks[0].color).toBe('red');
    expect(TaskList.tasks[0].done).toBe(false);
  });

  test('shows error for invalid task text (empty)', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    // Add empty task
    TaskList.add('', 'red');
    
    expect(TaskList.tasks.length).toBe(0);
    expect(TaskList.taskError.textContent).toContain('Task text must be between 1 and 200 characters');
  });

  test('shows error for invalid task text (>200 chars)', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    // Add task with >200 chars
    const longText = 'A'.repeat(201);
    TaskList.add(longText, 'red');
    
    expect(TaskList.tasks.length).toBe(0);
    expect(TaskList.taskError.textContent).toContain('Task text must be between 1 and 200 characters');
  });

  test('trims whitespace from task text', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('  Test task  ', 'red');
    
    expect(TaskList.tasks[0].text).toBe('Test task');
  });

  test('persists after add', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Test task', 'red');
    
    // Verify persisted
    const stored = Storage.load(STORAGE_KEY_TASKS, []);
    expect(stored.length).toBe(1);
    expect(stored[0].text).toBe('Test task');
  });
});

describe('TaskList edit', () => {
  test('edits existing task', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    // Add a task first
    TaskList.add('Original text', 'red');
    const taskId = TaskList.tasks[0].id;
    
    // Edit the task
    TaskList.edit(taskId, 'Updated text', 'yellow');
    
    expect(TaskList.tasks[0].text).toBe('Updated text');
    expect(TaskList.tasks[0].color).toBe('yellow');
    expect(TaskList.tasks[0].id).toBe(taskId); // ID preserved
  });

  test('persists after edit', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Original text', 'red');
    const taskId = TaskList.tasks[0].id;
    
    TaskList.edit(taskId, 'Updated text', 'yellow');
    
    const stored = Storage.load(STORAGE_KEY_TASKS, []);
    expect(stored[0].text).toBe('Updated text');
  });
});

describe('TaskList toggleDone', () => {
  test('toggles done status', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Test task', 'red');
    const taskId = TaskList.tasks[0].id;
    
    // Initially not done
    expect(TaskList.tasks[0].done).toBe(false);
    
    // Toggle to done
    TaskList.toggleDone(taskId);
    expect(TaskList.tasks[0].done).toBe(true);
    
    // Toggle back to not done
    TaskList.toggleDone(taskId);
    expect(TaskList.tasks[0].done).toBe(false);
  });

  test('persists after toggle', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Test task', 'red');
    const taskId = TaskList.tasks[0].id;
    
    TaskList.toggleDone(taskId);
    
    const stored = Storage.load(STORAGE_KEY_TASKS, []);
    expect(stored[0].done).toBe(true);
  });
});

describe('TaskList remove', () => {
  test('removes task by id', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Task 1', 'red');
    TaskList.add('Task 2', 'yellow');
    TaskList.add('Task 3', 'green');
    
    const idToRemove = TaskList.tasks[1].id;
    
    TaskList.remove(idToRemove);
    
    expect(TaskList.tasks.length).toBe(2);
    expect(TaskList.tasks.find(t => t.id === idToRemove)).toBeUndefined();
  });

  test('persists after remove', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Task 1', 'red');
    TaskList.add('Task 2', 'yellow');
    
    const idToRemove = TaskList.tasks[0].id;
    TaskList.remove(idToRemove);
    
    const stored = Storage.load(STORAGE_KEY_TASKS, []);
    expect(stored.length).toBe(1);
    expect(stored[0].id).not.toBe(idToRemove);
  });
});

describe('TaskList sort', () => {
  test('sorts tasks by color (red, yellow, green)', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Green task', 'green');
    TaskList.add('Red task', 'red');
    TaskList.add('Yellow task', 'yellow');
    
    TaskList.sort();
    
    expect(TaskList.tasks[0].color).toBe('red');
    expect(TaskList.tasks[1].color).toBe('yellow');
    expect(TaskList.tasks[2].color).toBe('green');
  });

  test('maintains stable order within same color', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('First red', 'red');
    TaskList.add('Second red', 'red');
    TaskList.add('Third red', 'red');
    
    TaskList.sort();
    
    expect(TaskList.tasks[0].text).toBe('First red');
    expect(TaskList.tasks[1].text).toBe('Second red');
    expect(TaskList.tasks[2].text).toBe('Third red');
  });

  test('persists after sort', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Green task', 'green');
    TaskList.add('Red task', 'red');
    
    TaskList.sort();
    
    const stored = Storage.load(STORAGE_KEY_TASKS, []);
    expect(stored[0].color).toBe('red');
    expect(stored[1].color).toBe('green');
  });
});

describe('TaskList render', () => {
  test('renders empty list when no tasks', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.render();
    
    expect(TaskList.taskList.innerHTML).toBe('');
  });

  test('renders tasks with color indicator', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Test task', 'red');
    TaskList.render();
    
    const li = TaskList.taskList.querySelector('li');
    expect(li).not.toBeNull();
    expect(li.dataset.color).toBe('red');
  });

  test('renders done task with strikethrough', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Test task', 'red');
    TaskList.toggleDone(TaskList.tasks[0].id);
    TaskList.render();
    
    const textSpan = TaskList.taskList.querySelector('.task-item__text');
    expect(textSpan.style.textDecoration).toBe('line-through');
  });
});

describe('TaskList load', () => {
  test('loads tasks from Storage', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    // Pre-populate Storage
    const tasks = [
      { id: '1', text: 'Loaded task', color: 'red', done: true }
    ];
    Storage.save(STORAGE_KEY_TASKS, tasks);
    
    // Re-init to trigger load
    TaskList.load();
    
    expect(TaskList.tasks.length).toBe(1);
    expect(TaskList.tasks[0].text).toBe('Loaded task');
    expect(TaskList.tasks[0].done).toBe(true);
  });

  test('uses empty array when Storage is missing', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    // Storage is empty
    expect(Storage.load(STORAGE_KEY_TASKS, [])).toStrictEqual([]);
    
    TaskList.load();
    
    expect(TaskList.tasks).toStrictEqual([]);
  });

  test('uses empty array when Storage is corrupt', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    // Corrupt Storage data
    localStorage.setItem(STORAGE_KEY_TASKS, 'not valid json');
    
    TaskList.load();
    
    expect(TaskList.tasks).toStrictEqual([]);
  });
});

describe('TaskList persist', () => {
  test('saves tasks to Storage', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Test task', 'red');
    
    const stored = Storage.load(STORAGE_KEY_TASKS, []);
    expect(stored.length).toBe(1);
  });

  test('shows error on save failure', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    // Mock Storage.save to fail
    const originalSave = Storage.save;
    Storage.save = (key, value) => false;
    
    TaskList.add('Test task', 'red');
    
    expect(TaskList.taskError.textContent).toContain('Failed to save tasks');
    
    Storage.save = originalSave;
  });
});

// ============================================================
// TaskList Pure Logic Tests (from task 5.1)
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

  test('is idempotent', () => {
    const tasks = [
      { id: '3', text: 'Green', color: 'green', done: false },
      { id: '1', text: 'Red', color: 'red', done: false },
      { id: '2', text: 'Yellow', color: 'yellow', done: false }
    ];
    const sortedOnce = sortTasks(tasks);
    const sortedTwice = sortTasks(sortedOnce);
    expect(sortedOnce).toStrictEqual(sortedTwice);
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
});

describe('addTaskToList', () => {
  test('appends task to end of array', () => {
    const tasks = [{ id: '1', text: 'First', color: 'red', done: false }];
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
});

describe('removeTaskFromList', () => {
  test('removes task by id', () => {
    const tasks = [
      { id: '1', text: 'First', color: 'red', done: false },
      { id: '2', text: 'Second', color: 'yellow', done: true }
    ];
    const result = removeTaskFromList(tasks, '2');
    expect(result.length).toBe(1);
    expect(result.find(t => t.id === '2')).toBeUndefined();
  });

  test('returns new array instance', () => {
    const tasks = [{ id: '1', text: 'Task', color: 'red', done: false }];
    const result = removeTaskFromList(tasks, '1');
    expect(result).not.toBe(tasks);
  });
});

describe('editTaskInList', () => {
  test('updates task while preserving id', () => {
    const originalTask = { id: '1', text: 'Old', color: 'red', done: false };
    const tasks = [originalTask];
    const result = editTaskInList(tasks, '1', 'New', 'yellow');
    
    expect(result[0].id).toBe('1');
    expect(result[0].text).toBe('New');
    expect(result[0].color).toBe('yellow');
    expect(result[0].done).toBe(false); // Preserved
  });
});

describe('toggleTaskDoneInList', () => {
  test('flips done status', () => {
    const task = { id: '1', text: 'Task', color: 'red', done: false };
    const tasks = [task];
    const result1 = toggleTaskDoneInList(tasks, '1');
    const result2 = toggleTaskDoneInList(result1, '1');
    
    expect(result1[0].done).toBe(true);
    expect(result2[0].done).toBe(false);
  });
});

// ============================================================
// Integration Tests (Storage Wiring)
// ============================================================

describe('TaskList integration', () => {
  test('full CRUD workflow', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    // Create
    TaskList.add('Task 1', 'red');
    const taskId = TaskList.tasks[0].id;
    
    // Read (via load)
    TaskList.load();
    expect(TaskList.tasks.length).toBe(1);
    
    // Update
    TaskList.edit(taskId, 'Updated task', 'yellow');
    expect(TaskList.tasks[0].text).toBe('Updated task');
    
    // Delete
    TaskList.remove(taskId);
    expect(TaskList.tasks.length).toBe(0);
  });

  test('sort workflow', () => {
    const doc = new DOMParser().parseFromString(
      `<section id="task-section">
        <form id="task-form">
          <input id="task-text" type="text">
          <select id="task-color"><option value="red">Red</option></select>
          <button type="submit">Add task</button>
        </form>
        <ul id="task-list"></ul>
        <p id="task-error" role="status" aria-live="polite"></p>
      </section>`,
      'text/html'
    );
    
    const root = doc.querySelector('#task-section');
    TaskList.init(root);
    
    TaskList.add('Green task', 'green');
    TaskList.add('Red task', 'red');
    TaskList.add('Yellow task', 'yellow');
    
    // Before sort
    expect(TaskList.tasks[0].color).toBe('green');
    
    TaskList.sort();
    
    // After sort
    expect(TaskList.tasks[0].color).toBe('red');
    expect(TaskList.tasks[1].color).toBe('yellow');
    expect(TaskList.tasks[2].color).toBe('green');
  });
});
