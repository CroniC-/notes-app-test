# Notes App — Implementation Plan

Companion task list to the code review of this single-file markdown notes app
(`index.html`, `app.js`, `style.css`, no build step, no dependencies, `localStorage`
persistence). Track progress with the checkboxes below. When starting a new
session, read this file first for full context.

> **Status legend:** `- [ ]` = not started · `- [~]` = in progress · `- [x]` = done · `- [-]` = decided against (see notes)

---

## Context for a new session

### What this app is
- Vanilla JS client-side markdown notes app. Three files only:
  - `index.html` — markup: sidebar (new-note button, search, folder filter, tag cloud, note list, footer with export/import/theme) + editor pane (title, folder, tags, Write/Preview toggle, delete, body textarea, preview).
  - `app.js` — all logic: pure helpers (`escapeHtml`, `renderMarkdown`, `parseTagsInput`, `timeAgo`), DOM cache `els`, state (`notes`, `activeId`, `view`, `searchQuery`, `folderFilter`, `selectedTags`), storage (`loadNotes`/`persist`/`normalizeNote`), rendering (`renderSidebar`, `renderEditor`, `applyView`, `flashSaved`), actions (`createNote`, `selectNote`, `deleteActive`, `scheduleSave`, `exportNotes`, `importNotes`), theme, event wiring, init.
  - `style.css` — light/dark themes via `[data-theme]` custom properties; responsive `@media (max-width: 720px)`.
- No `package.json`, no tests, no CI, no README, no LICENSE, no `.gitignore`. Single commit history (`754e9e9 Add files via upload`).

### Architecture invariants to preserve
- Helpers under `// === pure helpers ===` are side-effect free and DOM-free; keep them unit-testable.
- `inline()` inside `renderMarkdown` calls `escapeHtml(text)` **before** running inline transforms (bold/italic/code/links). This ordering is load-bearing for the XSS safety of links — see item P0-1.
- All HTML is built via string concatenation and assigned to `.innerHTML`. There is no virtual DOM; full re-renders are cheap at this scale.
- `renderSidebar()` is the only function that rebuilds the folder `<select>`, tag cloud, and note list. It was split into `renderSidebarChrome()` + `renderNoteList()` (see P0-4).

### Already done (do not redo)
- **P0-4 (sidebar re-render):** `renderSidebar()` split into `renderSidebarChrome()` (folder `<select>` + tag cloud) and `renderNoteList()` (filtered list); search `input` handler now calls `renderNoteList()` only. Shipped on branch `vibe/security-and-render-862446` → PR #1. Verified with a DOM/localStorage shim test.
- **P0-1 (markdown link XSS):** Investigated and **decided against** changing the code. The link path is already safe because `inline()` escapes text before the link regex matches, so the captured URL is entity-encoded before interpolation. A naive `escapeHtml(url)` causes double-escaping of legitimate `&` in query strings (`?a=1&b=2` → `&amp;amp;`), which is a real regression. See P0-1 notes for the defense-in-depth alternative if desired.

### Working assumptions
- The repo has no test runner. Tests, if added, should be runnable with plain `node --test` (no deps) or Vitest (already-aligned to "no deps" philosophy → prefer `node --test`).
- All `path:line` references below are against commit `754e9e9` (the pre-PR baseline). After P0-4, some line numbers shift by ~+9 in the rendering/events sections.
- Delivery: open changes on `vibe/<short-slug>-862446` branches, draft PRs to `CroniC-/notes-app-test`.

---

## Priority groups

### P0 — Correctness & Security (do first)

- [x] **P0-1 — Markdown link XSS (investigate, no code change needed)**
  - Location: `app.js` `inline()` link builder (~line 34 baseline).
  - Finding: `inline()` runs `escapeHtml(text)` **before** the link regex, so `"`, `<`, `>`, `&` in the URL are already entity-encoded before interpolation into `href`. **No attribute-breakout vector exists.**
  - Decided against: adding `escapeHtml(url)` double-escapes `&` (`?a=1&b=2` → `&amp;amp;`), corrupting real URLs. Verified: `renderMarkdown('[click](https://x.com"onmouseover="alert(1))')` → `href="https://x.com&quot;onmouseover=&quot;alert(1)"` (single well-formed `href`, no raw quote).
  - Defense-in-depth option (optional, separate task): replace string-built `<a>` with `document.createElement('a')` + `el.href = url` so the browser parses the URL safely. Low priority given current safety.

- [ ] **P0-2 — Paragraph parser prematurely terminates on list-like lines**
  - Location: `app.js` `isBlockStart()` + paragraph loop (~lines 8-21, ~95-105).
  - Problem: a line starting with `-` or `*` inside a paragraph ends the paragraph. E.g. `Some text\n- not a list` splits unexpectedly. Also paragraphs cannot contain intentional blank lines.
  - Acceptance: paragraph only breaks on a real block opener at column 0 (no leading indent) OR a blank line; document the limitation in a code comment OR handle indented continuation.
  - Tests: add `renderMarkdown` cases covering paragraph-then-dash and nested-looking content.

- [x] **P0-4 — Sidebar re-renders folder `<select>` on every keystroke**
  - Location: `renderSidebar()` + search `input` handler.
  - Done: split into `renderSidebarChrome()` + `renderNoteList()`; search calls `renderNoteList()` only. See PR #1.

- [x] **P0-5 — `localStorage` quota errors silently swallowed**
  - Location: `app.js` `persist()` (~line 200).
  - Problem: `catch { return; }` hides save failures; user with many/large notes loses edits with no feedback.
  - Acceptance: on quota error, show "Save failed — storage full" in `#save-indicator` (reuse `flashSaved` pattern with a failure class) and do not clear the pending debounced save.
  - Tests: unit-test `persist()` with a mock `localStorage.setItem` that throws `QuotaExceededError`.

- [x] **P0-6 — No `beforeunload` flush of debounced save**
  - Location: `app.js` near event wiring (~line 430+).
  - Problem: `scheduleSave` debounces 400ms; closing the tab mid-typing loses the last edits.
  - Acceptance: add `window.addEventListener('beforeunload', flushSave)` where `flushSave` clears `saveTimer` and calls `persist()` immediately if a save is pending.
  - Note: keep `scheduleSave` setting `n.updatedAt` synchronously (it already does) so even an unflushed edit is at most a write-away.

- [ ] **P0-9 — Import treats `NaN`/invalid `updatedAt` as "now"**
  - Location: `app.js` `normalizeNote()` (~line 185): `updatedAt: Number(n.updatedAt) || Date.now()`.
  - Problem: `Number(undefined)` → `NaN` → falls back to `Date.now()`, which can reorder note history incorrectly on import.
  - Acceptance: use `Number.isFinite(Number(n.updatedAt)) ? Number(n.updatedAt) : Date.now()` (or drop the note). Apply the same in `loadNotes`.
  - Tests: import a note with `updatedAt: null` / `"abc"` and assert it does not clobber ordering.

- [x] **P0-18 — `uid()` collision risk under rapid creates**
  - Location: `app.js` `uid()` (~line 195).
  - Problem: `Date.now().toString(36) + Math.random().toString(36).slice(2,8)`; rapid creates in the same ms rely on 6 random chars.
  - Acceptance: use `crypto.randomUUID()` where available, fall back to current implementation.
  - Tests: `uid()` returns a unique-ish string; 1000 calls yield 1000 distinct values.

### P1 — Robustness & UX

- [x] **P1-7 — Active note fallback after delete may pick unrelated note**
  - Location: `app.js` `deleteActive()`.
  - Problem: falls back to `visibleNotes()[0]`, which respects current filters; deleting a note outside the current filter can select an unexpected note.
  - Acceptance: after delete, prefer the nearest sibling in sort order; if none, clear `activeId` (show empty state).
  - Tests: delete active note with a folder filter active; assert selection is a sibling or empty.

  - Fix: Changed `deleteActive()` to find index in sorted notes list before deleting, then select nearest sibling (previous or next in sort order) instead of using `visibleNotes()[0]`. Added `test/deleteActive.test.js` with 7 passing tests.
- [ ] **P1-8 — Stale filters yield empty list with no explanation**
  - Location: `app.js` `renderSidebar()` / `renderNoteList()`.
  - Problem: when `selectedTags`/`folderFilter` match nothing, the list shows "No notes match." with no way to see/clear the active filters.
  - Acceptance: when filtered result is empty due to active filters, show active filter chips and a "Clear filters" action; keep "No notes match." only for empty search.
  - Tests: filter to zero results → assert "Clear filters" control present; clicking it restores list.

- [ ] **P1-10 — No keyboard navigation or shortcuts**
  - Acceptance: add `Ctrl/Cmd+N` (new note), `Ctrl/Cmd+S` (flush save, prevent default), Arrow Up/Down to move between note-list items, Enter to select. Avoid hijacking browser shortcuts that conflict.
  - Location: event wiring section of `app.js`; add `tabindex`/`role` to `.note-item` in `index.html`/`style.css`.

- [ ] **P1-17 — `timeAgo` becomes stale while app stays open**
  - Location: `app.js` `timeAgo()` + rendering.
  - Acceptance: refresh note-list timestamps on a 60s interval and on `visibilitychange`/focus by calling `renderNoteList()` (cheap, list-only).
  - Caution: do not call full `renderSidebar()` (would rebuild chrome unnecessarily).

### P2 — Architecture & Maintainability

- [ ] **P2-11 — Inline HTML string concatenation**
  - Location: `renderSidebar`/`renderNoteList`/tag cloud.
  - Acceptance: introduce a tiny `el(tag, props, children)` helper using `document.createElement`, OR `<template>` elements, for the sidebar/list/tag cloud. Keep `renderMarkdown` output as HTML strings (it's parsed into a dedicated `.markdown` container).
  - Scope: refactor only; no behavior change. Add snapshot/string-equivalence tests before/after.

- [ ] **P2-12 — Global mutable state + free functions**
  - Location: module-level `let notes`, `activeId`, `view`, etc.
  - Acceptance: introduce a small `store` object (`{ get, set, subscribe }`) so re-renders are predictable and `storage` events (multi-tab sync) become feasible later. Migrate incrementally; keep public behavior identical.

- [ ] **P2-13 — No tests**
  - Acceptance: add `test/app.test.js` runnable with `node --test` (no deps). Cover pure helpers first: `renderMarkdown`, `parseTagsInput`, `normalizeNote`, `visibleNotes` (latter needs a state shim). Add a `package.json` with a `"test"` script and a `.gitignore`.
  - Note: `renderMarkdown` and `parseTagsInput` are DOM-free; `visibleNotes` reads module state, so either export getters or test via a store abstraction (ties into P2-12).

- [ ] **P2-14 — Markdown subset is small**
  - Missing: tables, nested lists, task lists (`- [ ]`), images, strikethrough, autolinks.
  - Acceptance: **decide** — either (a) declare "minimal markdown" as a feature and document it in the UI/README, or (b) adopt a vetted library (marked / markdown-it) behind a render function so the rest of the app is unaffected. Prefer (b) only if the app grows; otherwise document (a).

- [ ] **P2-15 — No README / LICENSE / .gitignore**
  - Acceptance: add `README.md` (features, shortcuts, storage model, import/export format, dev/run instructions — "open index.html" or a static server), `LICENSE` (confirm owner's preferred license — ask if unclear), `.gitignore` (node_modules, OS files).

- [ ] **P2-16 — Accessibility gaps**
  - Acceptance: tag chips and note items → `role="button"`/`role="option"` + `tabindex="0"` + Enter/Space handlers; view-toggle buttons → `aria-pressed`; folder filter → keep `aria-label` (already present); `#save-indicator` → `aria-live="polite"`.
  - Location: `index.html` (roles/labels) + `app.js` (keyboard handlers) + `style.css` (focus-visible styles).

- [ ] **P2-19 — `.editor-pane` visibility uses `hidden` on a flex child**
  - Note: the `[hidden] { display: none !important }` global rule handles this correctly; only one of empty-state/editor-pane is visible at a time via `hidden`. **No code change needed** — keep this checklist item as a verification note. Mark done after confirming in a quick smoke test.

### Quick wins (bundle into one small PR if convenient)

- [ ] **Q-escape**: (Already investigated under P0-1 — no change required unless pursuing defense-in-depth.)
- [ ] **Q-sidebar-render**: Done (P0-4).
- [x] **Q-beforeunload**: P0-6.
- [x] **Q-quota-feedback**: P0-5.
- [x] **Q-uuid**: P0-18 (`crypto.randomUUID()`).
- [ ] **Q-readme**: P2-15.

---

## Suggested order for a new session

1. **P0-6** (beforeunload) + **P0-5** (quota feedback) + **P0-18** (uuid) — small, isolated, bundle into one PR.
2. **P0-9** (import `updatedAt` validation) — small, needs a test.
3. **P2-13** (test harness with `node --test`) — unlocks safe refactors below.
4. **P0-2** (paragraph parser) — after tests exist.
5. **P1-7 / P1-8 / P1-10 / P1-17** — UX pass.
6. **P2-15** (README/LICENSE/.gitignore).
7. **P2-16** (a11y) + **P2-11 / P2-12** (refactors) — larger, do last with tests green.

## Definition of done (per item)
- Code change committed on a `vibe/<slug>-862446` branch, draft PR opened.
- `node --check app.js` passes.
- If the item touches pure helpers or rendering, a `node --test` case is added and passes.
- No unrelated files changed; diff scoped to the item.
- Checkbox in this file updated (`- [x]` done / `- [-]` decided against) in the same commit.

## Open questions (resolve before starting the relevant item)
- **P2-14**: keep minimal markdown or adopt a library? (Decision blocks that item only.)
- **P2-15**: which license? Ask the repo owner if not stated.
