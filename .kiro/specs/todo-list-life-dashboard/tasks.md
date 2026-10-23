# Implementation Plan: To-do List Life Dashboard

## Overview

The implementation builds a client-side single-page dashboard from plain HTML, one CSS file, and one vanilla JavaScript file. The JavaScript file is a single IIFE with internal modules: a Storage layer, four feature components (Greeting, Timer, TaskList, QuickLinks), a Theme manager, and a bootstrap initializer. Pure logic functions are isolated from DOM code and exported via a CommonJS guard so the same source file feeds both the browser app and a fast-check + Vitest + jsdom test suite.

The implementation proceeds in phases: project structure and test harness, Storage layer, pure logic functions with property tests (grouped by component), DOM-dependent component modules, Theme module, bootstrap wiring, and finally integration and smoke tests. Each phase builds on the previous one, and every piece of code is integrated — there is no orphaned code.

## Tasks

- [x] 1. Set up project structure and test harness
  - [x] 1.1 Create index.html with component containers
    - Create the page structure with semantic containers for Greeting, Timer, TaskList, QuickLinks, and Theme toggle
    - Reference exactly one stylesheet in `css/` and one script in `js/`
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 1.2 Create css/styles.css with layout, components, and light/dark theme custom properties
    - Define CSS custom properties for colors, spacing, and typography on `:root` and `[data-theme="dark"]`
    - Style all four component containers, the theme toggle button, and interactive controls with visually distinct boundaries
    - Ensure headings render larger than body text and text is legible against backgrounds in both themes
    - _Requirements: 6.1, 6.2, 6.7, 6.8, 9.1_

  - [x] 1.3 Create package.json with devDependencies and Vitest configuration
    - Add fast-check, vitest, and jsdom as devDependencies (test-only; not shipped to the browser)
    - Configure Vitest to use the jsdom environment
    - _Requirements: 9.3_

  - [x] 1.4 Create js/app.js scaffold with IIFE wrapper and CommonJS export guard
    - Wrap all code in an IIFE; add `if (typeof document !== 'undefined')` guard for DOM init and `if (typeof module !== 'undefined') module.exports = {...}` guard for pure-logic exports
    - Add empty stubs for Storage, Greeting, Timer, TaskList, QuickLinks, Theme, and Bootstrap modules
    - _Requirements: 9.2, 9.3_

- [x] 2. Implement Storage layer
  - [x] 2.1 Implement Storage module with availability detection, load, save, and remove
    - Implement `isAvailable()` with a memoized real test write/remove in try/catch (handles Safari private mode)
    - Implement `load(key, fallback)` with JSON.parse and fallback on miss or parse error
    - Implement `save(key, value)` with JSON.stringify in try/catch, returning boolean success
    - Implement `remove(key)` with try/catch
    - Define storage keys: `tld.user.name`, `tld.tasks`, `tld.quickLinks`, `tld.theme`
    - Export Storage functions for testing via the CommonJS guard
    - _Requirements: 4.1, 4.5, 4.6, 6.9_


- [x] 3. Implement Greeting pure logic and property tests
  - [x] 3.1 Implement getGreeting, formatTime, formatDate, isValidUserName
    - `getGreeting(hour)`: return "Good morning" for 5-11, "Good afternoon" for 12-16, "Good evening" for 0-4 and 17-23
    - `formatTime(date)`: return "h:mm AM/PM" in 12-hour format
    - `formatDate(date)`: return "Weekday, Month Day" with full names
    - `isValidUserName(name)`: return true if trimmed name is non-empty and length is at most 50
    - Export all functions via the CommonJS guard
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.10_

- [x] 4. Implement Timer pure logic and property tests
  - [x] 4.1 Implement formatTimer, tickTimer, resetTimer
    - Define `TIMER_DURATION_SECONDS = 1500`
    - `formatTimer(seconds)`: return "MM:SS" with two-digit minutes and seconds
    - `tickTimer(state)`: decrement remainingSeconds by 1, clamp at 0, set isRunning to false at 0
    - `resetTimer(state)`: return `{ remainingSeconds: 1500, isRunning: false }`
    - Export all functions via the CommonJS guard
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

- [x] 5. Implement TaskList pure logic and property tests
  - [x] 5.1 Implement validateTaskText, isValidColor, sortTasks, and array mutation helpers
    - `validateTaskText(text)`: return true if trimmed length is between 1 and 200 inclusive
    - `isValidColor(color)`: return true only for "red", "yellow", "green"
    - `sortTasks(tasks)`: return new array sorted red then yellow then green, stable within color, idempotent
    - `createTask(text, color)`: return a Task object with a generated id (crypto.randomUUID with Date.now fallback)
    - `addTaskToList(tasks, task)`: return new array with task appended
    - `removeTaskFromList(tasks, id)`: return new array without the task matching id
    - `editTaskInList(tasks, id, text, color)`: return new array with updated text and color, preserving id, done, and position
    - `toggleTaskDoneInList(tasks, id)`: return new array with done flipped for the matching task, preserving everything else
    - Export all functions via the CommonJS guard
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_


- [x] 6. Implement QuickLinks pure logic and property tests
  - [x] 6.1 Implement validateQuickLink and array mutation helpers
    - `validateQuickLink(label, url)`: return `{ valid, error? }`; invalid if label is empty, url is empty, or url does not start with http:// or https://
    - `createQuickLink(label, url)`: return a QuickLink object with a generated id
    - `addLinkToSet(links, link)`: return new array with link appended
    - `removeLinkFromSet(links, id)`: return new array without the link matching id
    - Export all functions via the CommonJS guard
    - _Requirements: 5.1, 5.3, 5.4_


- [x] 7. Implement Theme pure logic and property tests
  - [x] 7.1 Implement isValidTheme and toggleTheme
    - `isValidTheme(theme)`: return true only for "light" or "dark"
    - `toggleTheme(theme)`: return "dark" if theme is "light", "light" if theme is "dark"
    - Define `DEFAULT_THEME = "light"`
    - Export functions via the CommonJS guard
    - _Requirements: 6.1, 6.2, 6.3, 6.6_

- [x] 8. Implement serialization helpers and round-trip property tests
  - [x] 8.1 Implement serialize/deserialize helpers for tasks, quick links, theme, and user name
    - Implement `serializeTasks(tasks)` / `deserializeTasks(json)` for Task array round-trips
    - Implement `serializeQuickLinks(links)` / `deserializeQuickLinks(json)` for QuickLink array round-trips
    - Implement `serializeTheme(theme)` / `deserializeTheme(json)` for Theme round-trips
    - User name round-trip uses Storage save and load directly (string value)
    - Export all helpers via the CommonJS guard
    - _Requirements: 1.7, 1.8, 4.1, 4.2, 4.4, 5.5, 5.6, 5.7, 6.4, 6.5_


- [x] 9. Checkpoint - Verify pure logic and property tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Greeting DOM module
  - [x] 10.1 Implement Greeting module (init, render, setName) with clock interval and name editing
    - `init(root)`: cache DOM nodes, start a 1-second interval to update the clock, wire the name edit form
    - `render()`: update time (formatTime), date (formatDate), greeting (getGreeting based on current hour), and name display
    - `setName(name)`: validate with isValidUserName; if valid, save to Storage and re-render; if empty, do not save (silent no-op)
    - Load saved name from Storage on init; if none, display greeting without a name
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_


- [x] 11. Implement Timer DOM module
  - [x] 11.1 Implement Timer module (init, start, stop, reset, render) with setInterval and completion indicator
    - `init(root)`: cache DOM nodes, set initial state to 25:00 stopped
    - `start()`: begin or continue countdown via setInterval at 1 second; guard against duplicate intervals
    - `stop()`: clear interval, keep remaining time
    - `reset()`: clear interval, set remaining to 1500
    - `render()`: update MM:SS display (formatTimer); show visible completion indicator when remaining is 0
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 12. Implement TaskList DOM module
  - [x] 12.1 Implement TaskList module (init, add, edit, toggleDone, remove, sort, render, load, persist)
    - `init(root)`: cache DOM nodes, wire add form, call load
    - `add(text, color)`: validate with validateTaskText; if invalid, show inline error; if valid, create task, append, render, persist
    - `edit(id, text, color)`: validate; if valid, update via editTaskInList, render, persist
    - `toggleDone(id)`: update via toggleTaskDoneInList, render, persist
    - `remove(id)`: update via removeTaskFromList, render, persist
    - `sort()`: apply sortTasks to state, render, persist
    - `render()`: render all tasks with done indicator, color styling, edit and delete controls
    - `load()`: read from Storage; if missing or corrupt, use empty array; render
    - `persist()`: save to Storage; if save fails, show inline error and keep current display
    - Include an aria-live error status region for validation and save failures
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.5, 4.6_


- [x] 13. Implement QuickLinks DOM module
  - [x] 13.1 Implement QuickLinks module (init, add, remove, render, load, persist) with new-tab anchors
    - `init(root)`: cache DOM nodes, wire add form, call load
    - `add(label, url)`: validate with validateQuickLink; if invalid, show inline error; if valid, create link, render, persist
    - `remove(id)`: update via removeLinkFromSet, render, persist
    - `render()`: render each link as an anchor with `target="_blank" rel="noopener noreferrer"` and the correct href
    - `load()`: read from Storage; if missing or corrupt, use empty array; render
    - `persist()`: save to Storage; if save fails, show inline error and keep current display
    - Include an aria-live error status region
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8_


- [x] 14. Implement Theme DOM module
  - [x] 14.1 Implement Theme module (init, apply, toggle, load, persist) with data-theme attribute
    - `init(root)`: cache toggle button, call load, then apply
    - `apply(theme)`: set data-theme attribute on the html element, update toggle button UI
    - `toggle()`: flip theme via toggleTheme, apply, persist
    - `load()`: read from Storage; if missing, default to "light"; validate with isValidTheme
    - `persist(theme)`: save to Storage; no-op if Storage unavailable
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.9_


- [x] 15. Implement Bootstrap/Init
  - [x] 15.1 Implement Bootstrap init function wiring all modules on DOMContentLoaded
    - Guard with `typeof document !== 'undefined'` and listen for DOMContentLoaded
    - Detect Storage availability
    - Initialize Theme first (apply before paint to avoid flash of wrong theme)
    - Initialize Greeting, Timer, TaskList, and QuickLinks (each loads its own persisted state)
    - Wire global event listeners: theme toggle, name edit, timer controls, task form, link form
    - _Requirements: 1.8, 2.1, 4.2, 5.6, 6.5, 7.1, 7.2_

- [x] 16. Checkpoint - Verify all components and unit tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Write integration and smoke tests

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases in jsdom
- Integration tests verify Local Storage wiring end-to-end
- Smoke tests verify file structure and browser compatibility constraints
- All pure logic functions are exported via the CommonJS guard in js/app.js for test access
- The single IIFE structure means all implementation tasks modifying js/app.js are inherently sequential

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4", "3.5", "4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.4", "4.5", "5.1"] },
    { "id": 6, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6", "6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 8, "tasks": ["7.2", "8.1"] },
    { "id": 9, "tasks": ["8.2", "8.3", "8.4", "8.5", "10.1"] },
    { "id": 10, "tasks": ["10.2", "11.1"] },
    { "id": 11, "tasks": ["11.2", "12.1"] },
    { "id": 12, "tasks": ["12.2", "13.1"] },
    { "id": 13, "tasks": ["13.2", "14.1"] },
    { "id": 14, "tasks": ["14.2", "15.1"] },
    { "id": 15, "tasks": ["17.1", "17.2"] }
  ]
}
```
