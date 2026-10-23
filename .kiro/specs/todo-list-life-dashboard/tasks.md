# Implementation Plan: To-do List Life Dashboard

## Overview

The implementation builds a client-side single-page dashboard from plain HTML, one CSS file, and one vanilla JavaScript file. The JavaScript file is a single IIFE with internal modules: a Storage layer, four feature components (Greeting, Timer, TaskList, QuickLinks), a Theme manager, and a bootstrap initializer. Pure logic functions are isolated from DOM code and exported via a CommonJS guard so the same source file feeds both the browser app and a fast-check + Vitest + jsdom test suite.

The implementation proceeds in phases: project structure and test harness, Storage layer, pure logic functions with property tests (grouped by component), DOM-dependent component modules, Theme module, bootstrap wiring, and finally integration and smoke tests. Each phase builds on the previous one, and every piece of code is integrated — there is no orphaned code.

## Tasks

- [ ] 1. Set up project structure and test harness
  - [ ] 1.1 Create index.html with component containers
    - Create the page structure with semantic containers for Greeting, Timer, TaskList, QuickLinks, and Theme toggle
    - Reference exactly one stylesheet in `css/` and one script in `js/`
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 1.2 Create css/styles.css with layout, components, and light/dark theme custom properties
    - Define CSS custom properties for colors, spacing, and typography on `:root` and `[data-theme="dark"]`
    - Style all four component containers, the theme toggle button, and interactive controls with visually distinct boundaries
    - Ensure headings render larger than body text and text is legible against backgrounds in both themes
    - _Requirements: 6.1, 6.2, 6.7, 6.8, 9.1_

  - [ ] 1.3 Create package.json with devDependencies and Vitest configuration
    - Add fast-check, vitest, and jsdom as devDependencies (test-only; not shipped to the browser)
    - Configure Vitest to use the jsdom environment
    - _Requirements: 9.3_

  - [ ] 1.4 Create js/app.js scaffold with IIFE wrapper and CommonJS export guard
    - Wrap all code in an IIFE; add `if (typeof document !== 'undefined')` guard for DOM init and `if (typeof module !== 'undefined') module.exports = {...}` guard for pure-logic exports
    - Add empty stubs for Storage, Greeting, Timer, TaskList, QuickLinks, Theme, and Bootstrap modules
    - _Requirements: 9.2, 9.3_

- [ ] 2. Implement Storage layer
  - [ ] 2.1 Implement Storage module with availability detection, load, save, and remove
    - Implement `isAvailable()` with a memoized real test write/remove in try/catch (handles Safari private mode)
    - Implement `load(key, fallback)` with JSON.parse and fallback on miss or parse error
    - Implement `save(key, value)` with JSON.stringify in try/catch, returning boolean success
    - Implement `remove(key)` with try/catch
    - Define storage keys: `tld.user.name`, `tld.tasks`, `tld.quickLinks`, `tld.theme`
    - Export Storage functions for testing via the CommonJS guard
    - _Requirements: 4.1, 4.5, 4.6, 6.9_

  - [ ]* 2.2 Write unit tests for Storage layer edge cases
    - Test `load` returns fallback on missing key and on unparseable JSON
    - Test `save` returns false on quota exceeded and preserves in-memory state
    - Test `isAvailable` returns false when localStorage throws on write
    - _Requirements: 4.5, 4.6, 6.9_

- [ ] 3. Implement Greeting pure logic and property tests
  - [ ] 3.1 Implement getGreeting, formatTime, formatDate, isValidUserName
    - `getGreeting(hour)`: return "Good morning" for 5-11, "Good afternoon" for 12-16, "Good evening" for 0-4 and 17-23
    - `formatTime(date)`: return "h:mm AM/PM" in 12-hour format
    - `formatDate(date)`: return "Weekday, Month Day" with full names
    - `isValidUserName(name)`: return true if trimmed name is non-empty and length is at most 50
    - Export all functions via the CommonJS guard
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.10_

  - [ ]* 3.2 Write property test for greeting day partition
    - **Property 1: Greeting partitions the day correctly**
    - **Validates: Requirements 1.4, 1.5, 1.6**

  - [ ]* 3.3 Write property test for 12-hour time format
    - **Property 2: 12-hour time format**
    - **Validates: Requirements 1.2**

  - [ ]* 3.4 Write property test for full date format
    - **Property 3: Full date format**
    - **Validates: Requirements 1.3**

  - [ ]* 3.5 Write property test for user name validation boundary
    - **Property 4: User name validation boundary**
    - **Validates: Requirements 1.1, 1.10**

- [ ] 4. Implement Timer pure logic and property tests
  - [ ] 4.1 Implement formatTimer, tickTimer, resetTimer
    - Define `TIMER_DURATION_SECONDS = 1500`
    - `formatTimer(seconds)`: return "MM:SS" with two-digit minutes and seconds
    - `tickTimer(state)`: decrement remainingSeconds by 1, clamp at 0, set isRunning to false at 0
    - `resetTimer(state)`: return `{ remainingSeconds: 1500, isRunning: false }`
    - Export all functions via the CommonJS guard
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

  - [ ]* 4.2 Write property test for timer fresh and reset state
    - **Property 6: Timer fresh and reset state**
    - **Validates: Requirements 2.1, 2.4**

  - [ ]* 4.3 Write property test for timer stop preserving remaining time
    - **Property 7: Timer stop preserves remaining time**
    - **Validates: Requirements 2.3**

  - [ ]* 4.4 Write property test for timer tick decrement and floor at zero
    - **Property 8: Timer tick decrements and floors at zero**
    - **Validates: Requirements 2.2, 2.5**

  - [ ]* 4.5 Write property test for timer display format
    - **Property 9: Timer display format**
    - **Validates: Requirements 2.6**

- [ ] 5. Implement TaskList pure logic and property tests
  - [ ] 5.1 Implement validateTaskText, isValidColor, sortTasks, and array mutation helpers
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

  - [ ]* 5.2 Write property test for task text validation boundary
    - **Property 10: Task text validation boundary**
    - **Validates: Requirements 3.1, 3.2, 3.6**

  - [ ]* 5.3 Write property test for task color invariant
    - **Property 11: Task color invariant**
    - **Validates: Requirements 3.7**

  - [ ]* 5.4 Write property test for task add/remove count invariant
    - **Property 12: Task add/remove count invariant**
    - **Validates: Requirements 3.1, 3.4**

  - [ ]* 5.5 Write property test for task mutation preserving identity
    - **Property 13: Task mutation preserves identity**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 5.6 Write property test for task sort ordering, count, and idempotence
    - **Property 14: Task sort ordering, count, and idempotence**
    - **Validates: Requirements 3.5**

- [ ] 6. Implement QuickLinks pure logic and property tests
  - [ ] 6.1 Implement validateQuickLink and array mutation helpers
    - `validateQuickLink(label, url)`: return `{ valid, error? }`; invalid if label is empty, url is empty, or url does not start with http:// or https://
    - `createQuickLink(label, url)`: return a QuickLink object with a generated id
    - `addLinkToSet(links, link)`: return new array with link appended
    - `removeLinkFromSet(links, id)`: return new array without the link matching id
    - Export all functions via the CommonJS guard
    - _Requirements: 5.1, 5.3, 5.4_

  - [ ]* 6.2 Write property test for quick link validation
    - **Property 16: Quick link validation**
    - **Validates: Requirements 5.4**

  - [ ]* 6.3 Write property test for quick link add/remove count invariant
    - **Property 17: Quick link add/remove count invariant**
    - **Validates: Requirements 5.1, 5.3**

- [ ] 7. Implement Theme pure logic and property tests
  - [ ] 7.1 Implement isValidTheme and toggleTheme
    - `isValidTheme(theme)`: return true only for "light" or "dark"
    - `toggleTheme(theme)`: return "dark" if theme is "light", "light" if theme is "dark"
    - Define `DEFAULT_THEME = "light"`
    - Export functions via the CommonJS guard
    - _Requirements: 6.1, 6.2, 6.3, 6.6_

  - [ ]* 7.2 Write property test for theme toggle flipping mode
    - **Property 19: Theme toggle flips mode**
    - **Validates: Requirements 6.3**

- [ ] 8. Implement serialization helpers and round-trip property tests
  - [ ] 8.1 Implement serialize/deserialize helpers for tasks, quick links, theme, and user name
    - Implement `serializeTasks(tasks)` / `deserializeTasks(json)` for Task array round-trips
    - Implement `serializeQuickLinks(links)` / `deserializeQuickLinks(json)` for QuickLink array round-trips
    - Implement `serializeTheme(theme)` / `deserializeTheme(json)` for Theme round-trips
    - User name round-trip uses Storage save and load directly (string value)
    - Export all helpers via the CommonJS guard
    - _Requirements: 1.7, 1.8, 4.1, 4.2, 4.4, 5.5, 5.6, 5.7, 6.4, 6.5_

  - [ ]* 8.2 Write property test for user name persistence round-trip
    - **Property 5: User name persistence round-trip**
    - **Validates: Requirements 1.7, 1.8**

  - [ ]* 8.3 Write property test for task list persistence round-trip
    - **Property 15: Task list persistence round-trip**
    - **Validates: Requirements 4.1, 4.2, 4.4**

  - [ ]* 8.4 Write property test for quick link set persistence round-trip
    - **Property 18: Quick link set persistence round-trip**
    - **Validates: Requirements 5.5, 5.6, 5.7**

  - [ ]* 8.5 Write property test for theme persistence round-trip
    - **Property 20: Theme persistence round-trip**
    - **Validates: Requirements 6.4, 6.5**

- [ ] 9. Checkpoint - Verify pure logic and property tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement Greeting DOM module
  - [ ] 10.1 Implement Greeting module (init, render, setName) with clock interval and name editing
    - `init(root)`: cache DOM nodes, start a 1-second interval to update the clock, wire the name edit form
    - `render()`: update time (formatTime), date (formatDate), greeting (getGreeting based on current hour), and name display
    - `setName(name)`: validate with isValidUserName; if valid, save to Storage and re-render; if empty, do not save (silent no-op)
    - Load saved name from Storage on init; if none, display greeting without a name
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ]* 10.2 Write unit tests for Greeting DOM module
    - Test clock interval fires and updates the time display
    - Test name edit persists to localStorage and round-trips
    - Test empty name submission does not save
    - Test greeting without a saved name renders correctly
    - _Requirements: 1.2, 1.7, 1.8, 1.9, 1.10_

- [ ] 11. Implement Timer DOM module
  - [ ] 11.1 Implement Timer module (init, start, stop, reset, render) with setInterval and completion indicator
    - `init(root)`: cache DOM nodes, set initial state to 25:00 stopped
    - `start()`: begin or continue countdown via setInterval at 1 second; guard against duplicate intervals
    - `stop()`: clear interval, keep remaining time
    - `reset()`: clear interval, set remaining to 1500
    - `render()`: update MM:SS display (formatTimer); show visible completion indicator when remaining is 0
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 11.2 Write unit tests for Timer DOM module
    - Test start begins countdown and decrements display
    - Test stop pauses and preserves remaining time
    - Test reset returns to 25:00 stopped
    - Test reaching zero shows completion indicator and stops
    - Test start while running is idempotent (no duplicate interval)
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 12. Implement TaskList DOM module
  - [ ] 12.1 Implement TaskList module (init, add, edit, toggleDone, remove, sort, render, load, persist)
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

  - [ ]* 12.2 Write unit tests for TaskList DOM module
    - Test add task renders the task with correct text and color
    - Test invalid text (empty, over 200 chars) shows error and does not add
    - Test edit updates text and color
    - Test toggle done shows completion indicator and distinct styling
    - Test delete removes the task from the display
    - Test sort reorders tasks red then yellow then green
    - Test load with no stored data shows empty state
    - Test load with corrupt data shows empty state
    - Test failed save shows error indication and keeps current tasks
    - _Requirements: 3.1, 3.3, 3.5, 3.6, 4.3, 4.5, 4.6_

- [ ] 13. Implement QuickLinks DOM module
  - [ ] 13.1 Implement QuickLinks module (init, add, remove, render, load, persist) with new-tab anchors
    - `init(root)`: cache DOM nodes, wire add form, call load
    - `add(label, url)`: validate with validateQuickLink; if invalid, show inline error; if valid, create link, render, persist
    - `remove(id)`: update via removeLinkFromSet, render, persist
    - `render()`: render each link as an anchor with `target="_blank" rel="noopener noreferrer"` and the correct href
    - `load()`: read from Storage; if missing or corrupt, use empty array; render
    - `persist()`: save to Storage; if save fails, show inline error and keep current display
    - Include an aria-live error status region
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8_

  - [ ]* 13.2 Write unit tests for QuickLinks DOM module
    - Test add renders an anchor with correct href, target="_blank", and rel="noopener noreferrer"
    - Test invalid input (empty label, empty url, non-http url) shows error and does not add
    - Test remove removes the button from the display
    - Test load with no stored data shows empty state
    - Test failed save shows error indication and keeps current links
    - _Requirements: 5.2, 5.4, 5.8_

- [ ] 14. Implement Theme DOM module
  - [ ] 14.1 Implement Theme module (init, apply, toggle, load, persist) with data-theme attribute
    - `init(root)`: cache toggle button, call load, then apply
    - `apply(theme)`: set data-theme attribute on the html element, update toggle button UI
    - `toggle()`: flip theme via toggleTheme, apply, persist
    - `load()`: read from Storage; if missing, default to "light"; validate with isValidTheme
    - `persist(theme)`: save to Storage; no-op if Storage unavailable
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.9_

  - [ ]* 14.2 Write unit tests for Theme DOM module
    - Test apply sets data-theme on the root element
    - Test toggle switches between light and dark
    - Test load returns saved theme, defaults to light when none saved
    - Test apply and persist work when Storage is unavailable
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 6.9_

- [ ] 15. Implement Bootstrap/Init
  - [ ] 15.1 Implement Bootstrap init function wiring all modules on DOMContentLoaded
    - Guard with `typeof document !== 'undefined'` and listen for DOMContentLoaded
    - Detect Storage availability
    - Initialize Theme first (apply before paint to avoid flash of wrong theme)
    - Initialize Greeting, Timer, TaskList, and QuickLinks (each loads its own persisted state)
    - Wire global event listeners: theme toggle, name edit, timer controls, task form, link form
    - _Requirements: 1.8, 2.1, 4.2, 5.6, 6.5, 7.1, 7.2_

- [ ] 16. Checkpoint - Verify all components and unit tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Write integration and smoke tests
  - [ ]* 17.1 Write integration tests for Local Storage wiring and component interactions
    - Test each task mutation (add, edit, toggle, delete, sort) triggers a persist and round-trips through jsdom localStorage
    - Test quick link add and remove triggers persist and round-trips
    - Test theme toggle triggers persist and round-trips
    - Test name update triggers persist and round-trips
    - Test clock interval fires and updates time display
    - Test all four components render on init
    - _Requirements: 1.2, 4.1, 5.5, 6.4, 7.1_

  - [ ]* 17.2 Write smoke and static checks for file structure and compatibility
    - Assert index.html references exactly one css file and one js file
    - Assert no external CDN scripts or stylesheets and no runtime npm dependencies
    - Assert no fetch, XMLHttpRequest, or WebSocket usage in app.js
    - Assert the app initializes under a file-equivalent jsdom setup
    - _Requirements: 7.2, 9.1, 9.2, 9.3, 9.4_

- [ ] 18. Final checkpoint - Ensure all tests pass
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
