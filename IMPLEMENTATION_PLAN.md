# Notes App - Implementation Plan

> **Project**: Notes App - A lightweight, client-side markdown notes application
> **Repository**: [CroniC-/notes-app-test](https://github.com/CroniC-/notes-app-test)
> **Status**: Active Development
> **Last Updated**: Tue Aug 18 10:55:40 PM UTC 2026
> **Current Version**: 1.0.0
> **Task Reference Format**: `P#.T#` (Phase.Number)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Current State](#-current-state)
3. [Goals & Vision](#-goals--vision)
4. [Implementation Phases](#-implementation-phases)
5. [Detailed Feature List](#-detailed-feature-list)
6. [Technical Architecture](#-technical-architecture)
7. [Testing Strategy](#-testing-strategy)
8. [Resources & References](#-resources--references)
9. [Session Context](#-session-context)
10. [Task Index](#-task-index)

---

## 🏗️ Project Overview

### Description
A zero-dependency, client-side markdown notes application built with vanilla JavaScript, HTML, and CSS. All data is stored in localStorage with no server requirements.

### Core Files
- `index.html` - Main HTML structure
- `app.js` - All application logic (~800 lines)
- `style.css` - Styles with light/dark themes (~500 lines)
- `package.json` - Project metadata and test scripts
- `test/` - Test suite (82 tests, 100% passing)

### Key Features (Current)
- [x] **P0.T1** - Markdown support (headings, bold, italic, code, lists, links, blockquotes, horizontal rules)
- [x] **P0.T2** - LocalStorage persistence with auto-save (400ms debounce)
- [x] **P0.T3** - Folders and tags for organization
- [x] **P0.T4** - Full-text search across all notes
- [x] **P0.T5** - Light and dark theme toggle
- [x] **P0.T6** - Responsive design (mobile and desktop)
- [x] **P0.T7** - Import/export as JSON
- [x] **P0.T8** - Keyboard shortcuts (Ctrl+N, Ctrl+S, Arrow keys, Enter, Escape)
- [x] **P0.T9** - Relative timestamps with auto-refresh
- [x] **P0.T10** - Accessibility features (ARIA labels, keyboard navigation)

---

## ✅ Current State

### What's Working
- [x] **P0.T11** - All 82 tests passing
- [x] **P0.T12** - Clean, well-organized codebase
- [x] **P0.T13** - Zero dependencies
- [x] **P0.T14** - Good documentation (README.md)
- [x] **P0.T15** - Comprehensive test coverage
- [x] **P0.T16** - Responsive design
- [x] **P0.T17** - Accessibility best practices
- [x] **P0.T18** - MIT License

### Code Quality
- [x] **P0.T19** - ES6+ JavaScript
- [x] **P0.T20** - Modular helper functions
- [x] **P0.T21** - Store pattern for state management
- [x] **P0.T22** - Pure functions where possible
- [x] **P0.T23** - HTML escaping for security
- [x] **P0.T24** - Input validation
- [x] **P0.T25** - Error handling

### Test Coverage
- [x] **P0.T26** - `app.test.js` - Helper functions and utilities
- [x] **P0.T27** - `deleteActive.test.js` - Note deletion logic
- [x] **P0.T28** - `el.test.js` - DOM element creation
- [x] **P0.T29** - `markdown.test.js` - Markdown rendering
- [x] **P0.T30** - `normalizeNote.test.js` - Note normalization
- [x] **P0.T31** - `store.test.js` - State management store

---

## 🎯 Goals & Vision

### Short-Term Goals (1-2 months)
- [ ] **G1.T1** - Enhance user experience with rich text editing
- [ ] **G1.T2** - Improve mobile experience
- [ ] **G1.T3** - Add commonly requested features (tables, task lists, note linking)
- [ ] **G1.T4** - Polish visual design with icons and animations
- [ ] **G1.T5** - Maintain 100% test coverage

### Medium-Term Goals (2-4 months)
- [ ] **G2.T1** - Add power user features (plugins, backlinks, graph view)
- [ ] **G2.T2** - Implement sync capabilities (File System Access, GitHub)
- [ ] **G2.T3** - Build PWA features (service worker, install prompt)
- [ ] **G2.T4** - Grow community (documentation, contributions)

### Long-Term Goals (4-8 months)
- [ ] **G3.T1** - Desktop and mobile apps (Electron, Tauri, React Native)
- [ ] **G3.T2** - Browser extension (Chrome, Firefox)
- [ ] **G3.T3** - Plugin ecosystem
- [ ] **G3.T4** - End-to-end encryption
- [ ] **G3.T5** - Multi-device sync

### Success Metrics
- [ ] **G4.T1** - Test coverage: 90%+
- [ ] **G4.T2** - GitHub stars: 100+
- [ ] **G4.T3** - Active contributors: 5+
- [ ] **G4.T4** - Performance: < 100ms for all operations
- [ ] **G4.T5** - Accessibility score: 100/100

---

## 📅 Implementation Phases

---

### Phase 1: Quick Wins (Priority: High, Effort: Low)
**Goal**: Immediate UX improvements with minimal code changes
**Estimated Time**: 1-2 weeks
**Status**: ⏳ Not Started
**Phase ID**: P1

#### User Experience (P1.UX)
- [ ] **P1.UX.1** - Add rich text editor toolbar with formatting buttons
  - [ ] **P1.UX.1.1** - Bold, Italic, Strikethrough
  - [ ] **P1.UX.1.2** - Headers (H1-H4)
  - [ ] **P1.UX.1.3** - Lists (ordered, unordered)
  - [ ] **P1.UX.1.4** - Links
  - [ ] **P1.UX.1.5** - Code blocks
  - [ ] **P1.UX.1.6** - Blockquotes
  - [ ] **P1.UX.1.7** - Horizontal rule
- [ ] **P1.UX.2** - Implement note drag & drop reordering
- [ ] **P1.UX.3** - Add word/character count display
- [ ] **P1.UX.4** - Auto-focus title input when creating new note
- [ ] **P1.UX.5** - Add `Ctrl/Cmd + D` shortcut to duplicate current note
- [ ] **P1.UX.6** - Add click-to-filter for tags in metadata
- [ ] **P1.UX.7** - Show full timestamp on hover of relative time
- [ ] **P1.UX.8** - Add smooth transitions and animations
- [ ] **P1.UX.9** - Improve empty states with icons and illustrations

#### Mobile Experience (P1.MO)
- [ ] **P1.MO.1** - Add swipe gestures (swipe to delete)
- [ ] **P1.MO.2** - Create mobile-specific toolbar (fixed bottom)
- [ ] **P1.MO.3** - Increase touch target sizes
- [ ] **P1.MO.4** - Add pull-to-refresh for note list
- [ ] **P1.MO.5** - Improve mobile keyboard handling
- [ ] **P1.MO.6** - Add mobile-specific CSS

#### Performance (P1.PF)
- [ ] **P1.PF.1** - Debounce search input (currently fires on every keystroke)
- [ ] **P1.PF.2** - Add loading indicators for async operations
- [ ] **P1.PF.3** - Optimize markdown rendering
- [ ] **P1.PF.4** - Add performance profiling

#### Accessibility (P1.A1)
- [ ] **P1.A1.1** - Add skip-to-main-content link
- [ ] **P1.A1.2** - Improve focus indicators
- [ ] **P1.A1.3** - Add reduced motion support (`prefers-reduced-motion`)
- [ ] **P1.A1.4** - Add high contrast mode support
- [ ] **P1.A1.5** - Test with screen readers (NVDA, VoiceOver)
- [ ] **P1.A1.6** - Add keyboard shortcut customization

#### Code Quality (P1.CQ)
- [ ] **P1.CQ.1** - Add JSDoc comments to all functions
- [ ] **P1.CQ.2** - Improve error messages
- [ ] **P1.CQ.3** - Add more defensive programming
- [ ] **P1.CQ.4** - Refactor duplicate code

---

### Phase 2: Feature Expansion (Priority: High, Effort: Medium)
**Goal**: Add commonly requested features
**Estimated Time**: 2-4 weeks
**Status**: ⏳ Not Started
**Phase ID**: P2
**Depends On**: Phase 1

#### Markdown Support (P2.MD)
- [ ] **P2.MD.1** - Add strikethrough support (`~~text~~`)
- [ ] **P2.MD.2** - Add tables support
- [ ] **P2.MD.3** - Add task lists (`- [ ] task`)
- [ ] **P2.MD.4** - Add images (`![alt](url)`)
- [ ] **P2.MD.5** - Add autolinks (`https://example.com`)
- [ ] **P2.MD.6** - Add footnotes
- [ ] **P2.MD.7** - Add definition lists
- [ ] **P2.MD.8** - Improve nested list support

#### Organization (P2.OR)
- [ ] **P2.OR.1** - Implement nested folders
- [ ] **P2.OR.2** - Add smart folders (saved searches)
- [ ] **P2.OR.3** - Add note linking with `[[Note Title]]` syntax
- [ ] **P2.OR.4** - Add backlinks view
- [ ] **P2.OR.5** - Add recent notes sidebar
- [ ] **P2.OR.6** - Add pin notes feature
- [ ] **P2.OR.7** - Add note templates
- [ ] **P2.OR.8** - Add bulk note selection
- [ ] **P2.OR.9** - Add bulk actions (delete, export, tag)

#### Viewing & Editing (P2.VE)
- [ ] **P2.VE.1** - Add split view (editor + preview side-by-side)
- [ ] **P2.VE.2** - Add distraction-free/zen mode
- [ ] **P2.VE.3** - Add full-screen mode
- [ ] **P2.VE.4** - Add resizable panels
- [ ] **P2.VE.5** - Add collapsible sidebar
- [ ] **P2.VE.6** - Add undo/redo functionality
- [ ] **P2.VE.7** - Add find in note (`Ctrl/Cmd + F`)
- [ ] **P2.VE.8** - Add replace in note (`Ctrl/Cmd + H`)

#### Visual Improvements (P2.VI)
- [ ] **P2.VI.1** - Add icons to all buttons and actions
- [ ] **P2.VI.2** - Add syntax highlighting for code blocks
- [ ] **P2.VI.3** - Add custom theme colors
- [ ] **P2.VI.4** - Add custom CSS support
- [ ] **P2.VI.5** - Add multiple font options
- [ ] **P2.VI.6** - Add line height adjustment
- [ ] **P2.VI.7** - Add reading mode (larger text, reduced distractions)

---

### Phase 3: Advanced Features (Priority: Medium, Effort: High)
**Goal**: Power user features and polish
**Estimated Time**: 4-8 weeks
**Status**: ⏳ Not Started
**Phase ID**: P3
**Depends On**: Phase 2

#### Sync & Storage (P3.SS)
- [ ] **P3.SS.1** - Implement File System Access API for local file sync
- [ ] **P3.SS.2** - Add GitHub sync (via GitHub API)
- [ ] **P3.SS.3** - Add Dropbox/Google Drive sync
- [ ] **P3.SS.4** - Implement end-to-end encryption
- [ ] **P3.SS.5** - Add password protection
- [ ] **P3.SS.6** - Add biometric authentication (Fingerprint/Face ID)
- [ ] **P3.SS.7** - Add auto-lock after inactivity
- [ ] **P3.SS.8** - Add storage versioning for migrations
- [ ] **P3.SS.9** - Add IndexedDB for larger datasets
- [ ] **P3.SS.10** - Add automatic backups

#### Plugins & Extensions (P3.PL)
- [ ] **P3.PL.1** - Design plugin architecture
- [ ] **P3.PL.2** - Create plugin API
- [ ] **P3.PL.3** - Add plugin loader
- [ ] **P3.PL.4** - Create example plugins
- [ ] **P3.PL.5** - Add plugin marketplace/documentation

#### Advanced Features (P3.AF)
- [ ] **P3.AF.1** - Add graph view for note connections
- [ ] **P3.AF.2** - Add advanced search (regex, operators)
- [ ] **P3.AF.3** - Add tags autocomplete
- [ ] **P3.AF.4** - Add folders autocomplete
- [ ] **P3.AF.5** - Add note references/mentions
- [ ] **P3.AF.6** - Add daily notes feature
- [ ] **P3.AF.7** - Add calendar view
- [ ] **P3.AF.8** - Add Kanban board view
- [ ] **P3.AF.9** - Add mind map view

#### PWA Features (P3.PW)
- [ ] **P3.PW.1** - Add service worker for offline support
- [ ] **P3.PW.2** - Add manifest.json for PWA
- [ ] **P3.PW.3** - Add install prompt
- [ ] **P3.PW.4** - Add push notifications
- [ ] **P3.PW.5** - Add background sync
- [ ] **P3.PW.6** - Add periodic sync

---

### Phase 4: Polish & Optimization (Priority: Medium, Effort: Varies)
**Goal**: Performance, accessibility, and refinement
**Estimated Time**: Ongoing
**Status**: ⏳ Not Started
**Phase ID**: P4
**Depends On**: Phase 3

#### Performance (P4.PF)
- [ ] **P4.PF.1** - Implement virtual scrolling for large note lists
- [ ] **P4.PF.2** - Add memoization for markdown rendering
- [ ] **P4.PF.3** - Add code splitting and lazy loading
- [ ] **P4.PF.4** - Add build system (Vite/Rollup)
- [ ] **P4.PF.5** - Minify assets
- [ ] **P4.PF.6** - Add tree-shaking
- [ ] **P4.PF.7** - Optimize storage usage
- [ ] **P4.PF.8** - Add performance budgets

#### Testing (P4.TE)
- [ ] **P4.TE.1** - Add E2E tests with Playwright
- [ ] **P4.TE.2** - Add visual regression testing (Percy/Chromatic)
- [ ] **P4.TE.3** - Add accessibility testing (axe-core)
- [ ] **P4.TE.4** - Add performance testing (Lighthouse CI)
- [ ] **P4.TE.5** - Increase test coverage to 90%+
- [ ] **P4.TE.6** - Add integration tests
- [ ] **P4.TE.7** - Add stress tests

#### Code Quality (P4.CQ)
- [ ] **P4.CQ.1** - Migrate to TypeScript
- [ ] **P4.CQ.2** - Split app.js into multiple modules
- [ ] **P4.CQ.3** - Add linting (ESLint)
- [ ] **P4.CQ.4** - Add formatting (Prettier)
- [ ] **P4.CQ.5** - Add commit hooks (Husky)
- [ ] **P4.CQ.6** - Add code review guidelines
- [ ] **P4.CQ.7** - Add contribution guidelines

#### Documentation (P4.DO)
- [ ] **P4.DO.1** - Create user guide
- [ ] **P4.DO.2** - Create markdown reference
- [ ] **P4.DO.3** - Create keyboard shortcuts cheatsheet
- [ ] **P4.DO.4** - Create troubleshooting section
- [ ] **P4.DO.5** - Create API reference
- [ ] **P4.DO.6** - Create architecture overview
- [ ] **P4.DO.7** - Create testing guide
- [ ] **P4.DO.8** - Create deployment guide

---

### Phase 5: Ecosystem & Community (Priority: Low, Effort: High)
**Goal**: Build community and ecosystem
**Estimated Time**: Ongoing
**Status**: ⏳ Not Started
**Phase ID**: P5

#### Community (P5.CO)
- [ ] **P5.CO.1** - Enable GitHub Discussions
- [ ] **P5.CO.2** - Add issue templates
- [ ] **P5.CO.3** - Add pull request templates
- [ ] **P5.CO.4** - Add code of conduct
- [ ] **P5.CO.5** - Add contributing guide
- [ ] **P5.CO.6** - Create website/landing page
- [ ] **P5.CO.7** - Add roadmap to README
- [ ] **P5.CO.8** - Add changelog

#### Extensions (P5.EX)
- [ ] **P5.EX.1** - Create browser extension (Chrome/Firefox)
- [ ] **P5.EX.2** - Create desktop app (Electron/Tauri)
- [ ] **P5.EX.3** - Create mobile app (React Native/Capacitor)
- [ ] **P5.EX.4** - Create VS Code extension
- [ ] **P5.EX.5** - Create CLI tool

#### Analytics (P5.AN) - Optional, with consent
- [ ] **P5.AN.1** - Add local analytics (stored in localStorage)
- [ ] **P5.AN.2** - Add opt-in telemetry
- [ ] **P5.AN.3** - Add error tracking (anonymized)
- [ ] **P5.AN.4** - Add feature usage tracking
- [ ] **P5.AN.5** - Add performance metrics

---

## 📝 Detailed Feature List

---

### User Experience Features

#### Editor Enhancements
- [ ] **F1.EE.1** - Rich Text Toolbar
  - [ ] **F1.EE.1.1** - Add toolbar above editor
  - [ ] **F1.EE.1.2** - Add buttons for all markdown formatting
  - [ ] **F1.EE.1.3** - Add keyboard shortcuts display
  - [ ] **F1.EE.1.4** - Add mobile-optimized toolbar
  - [ ] **F1.EE.1.5** - Add customizable toolbar

- [ ] **F1.EE.2** - Word Count
  - [ ] **F1.EE.2.1** - Display word count
  - [ ] **F1.EE.2.2** - Display character count
  - [ ] **F1.EE.2.3** - Display paragraph count
  - [ ] **F1.EE.2.4** - Display reading time
  - [ ] **F1.EE.2.5** - Add live update

- [ ] **F1.EE.3** - Find & Replace
  - [ ] **F1.EE.3.1** - Add `Ctrl/Cmd + F` for find
  - [ ] **F1.EE.3.2** - Add `Ctrl/Cmd + H` for replace
  - [ ] **F1.EE.3.3** - Add case-sensitive option
  - [ ] **F1.EE.3.4** - Add regex support
  - [ ] **F1.EE.3.5** - Add match highlighting

- [ ] **F1.EE.4** - Undo/Redo
  - [ ] **F1.EE.4.1** - Add history stack
  - [ ] **F1.EE.4.2** - Add `Ctrl/Cmd + Z` for undo
  - [ ] **F1.EE.4.3** - Add `Ctrl/Cmd + Y` for redo
  - [ ] **F1.EE.4.4** - Add history limit
  - [ ] **F1.EE.4.5** - Add undo/redo buttons

- [ ] **F1.EE.5** - Auto-save Improvements
  - [ ] **F1.EE.5.1** - Add visual feedback
  - [ ] **F1.EE.5.2** - Add save history
  - [ ] **F1.EE.5.3** - Add restore from backup
  - [ ] **F1.EE.5.4** - Add conflict resolution

#### Viewing Enhancements
- [ ] **F1.VE.1** - Split View
  - [ ] **F1.VE.1.1** - Show editor and preview side-by-side
  - [ ] **F1.VE.1.2** - Add sync scrolling
  - [ ] **F1.VE.1.3** - Add resize handle
  - [ ] **F1.VE.1.4** - Add mobile support

- [ ] **F1.VE.2** - Zen Mode
  - [ ] **F1.VE.2.1** - Hide all UI except editor
  - [ ] **F1.VE.2.2** - Center text
  - [ ] **F1.VE.2.3** - Increase font size
  - [ ] **F1.VE.2.4** - Add typewriter scrolling

- [ ] **F1.VE.3** - Full-Screen Mode
  - [ ] **F1.VE.3.1** - Add full-screen button
  - [ ] **F1.VE.3.2** - Add `F11` support
  - [ ] **F1.VE.3.3** - Add mobile full-screen

- [ ] **F1.VE.4** - Reading Mode
  - [ ] **F1.VE.4.1** - Larger text
  - [ ] **F1.VE.4.2** - Reduced distractions
  - [ ] **F1.VE.4.3** - Better typography
  - [ ] **F1.VE.4.4** - Customizable

#### Organization Enhancements
- [ ] **F1.OR.1** - Nested Folders
  - [ ] **F1.OR.1.1** - Add folder hierarchy
  - [ ] **F1.OR.1.2** - Add folder tree view
  - [ ] **F1.OR.1.3** - Add folder drag & drop
  - [ ] **F1.OR.1.4** - Add folder rename
  - [ ] **F1.OR.1.5** - Add folder delete

- [ ] **F1.OR.2** - Smart Folders
  - [ ] **F1.OR.2.1** - Add saved searches
  - [ ] **F1.OR.2.2** - Add filter combinations
  - [ ] **F1.OR.2.3** - Add custom queries
  - [ ] **F1.OR.2.4** - Add smart folder management

- [ ] **F1.OR.3** - Note Linking
  - [ ] **F1.OR.3.1** - Add `[[Note Title]]` syntax
  - [ ] **F1.OR.3.2** - Add autocomplete for note links
  - [ ] **F1.OR.3.3** - Add backlinks view
  - [ ] **F1.OR.3.4** - Add graph view
  - [ ] **F1.OR.3.5** - Add link validation

- [ ] **F1.OR.4** - Templates
  - [ ] **F1.OR.4.1** - Add note templates
  - [ ] **F1.OR.4.2** - Add template management
  - [ ] **F1.OR.4.3** - Add template variables
  - [ ] **F1.OR.4.4** - Add default templates

---

### Markdown Features

#### Inline Formatting
- [ ] **F2.MD.1** - Strikethrough (`~~text~~`)
- [ ] **F2.MD.2** - Autolinks (`https://example.com`)
- [ ] **F2.MD.3** - Emoji shortcodes (`:smile:`)
- [ ] **F2.MD.4** - Subscript (`H~2~O`)
- [ ] **F2.MD.5** - Superscript (`X^2^`)
- [ ] **F2.MD.6** - Highlight (`==text==`)
- [ ] **F2.MD.7** - Custom HTML (optional)

#### Block Elements
- [ ] **F2.MD.8** - Tables
- [ ] **F2.MD.9** - Task lists (`- [ ] task`)
- [ ] **F2.MD.10** - Images (`![alt](url)`)
- [ ] **F2.MD.11** - Footnotes
- [ ] **F2.MD.12** - Definition lists
- [ ] **F2.MD.13** - Nested lists (better support)
- [ ] **F2.MD.14** - Math/LaTeX (optional)
- [ ] **F2.MD.15** - Mermaid diagrams (optional)

#### Code Blocks
- [ ] **F2.MD.16** - Syntax highlighting
- [ ] **F2.MD.17** - Line numbers
- [ ] **F2.MD.18** - Copy button
- [ ] **F2.MD.19** - Language detection
- [ ] **F2.MD.20** - Multiple themes

---

### Visual Features

#### Theming
- [ ] **F3.VI.1** - Custom accent colors
- [ ] **F3.VI.2** - Multiple color schemes
- [ ] **F3.VI.3** - Custom CSS
- [ ] **F3.VI.4** - Theme presets
- [ ] **F3.VI.5** - Theme import/export
- [ ] **F3.VI.6** - System theme detection

#### Typography
- [ ] **F3.VI.7** - Font family selection
- [ ] **F3.VI.8** - Font size adjustment
- [ ] **F3.VI.9** - Line height adjustment
- [ ] **F3.VI.10** - Letter spacing adjustment
- [ ] **F3.VI.11** - Dyslexia-friendly font

#### Layout
- [ ] **F3.VI.12** - Resizable panels
- [ ] **F3.VI.13** - Collapsible sidebar
- [ ] **F3.VI.14** - Custom column widths
- [ ] **F3.VI.15** - Grid view for notes
- [ ] **F3.VI.16** - Card view for notes

#### Icons
- [ ] **F3.VI.17** - Add icons to all actions
- [ ] **F3.VI.18** - Add icon library
- [ ] **F3.VI.19** - Add custom icon support
- [ ] **F3.VI.20** - Add icon theming

---

### Mobile Features

#### Touch Support
- [ ] **F4.MO.1** - Swipe to delete
- [ ] **F4.MO.2** - Swipe to archive
- [ ] **F4.MO.3** - Pull to refresh
- [ ] **F4.MO.4** - Long press for context menu
- [ ] **F4.MO.5** - Pinch to zoom

#### Mobile UI
- [ ] **F4.MO.6** - Mobile-optimized toolbar
- [ ] **F4.MO.7** - Bottom navigation
- [ ] **F4.MO.8** - Full-screen editor
- [ ] **F4.MO.9** - Mobile-specific layouts
- [ ] **F4.MO.10** - Touch-friendly buttons

#### Mobile Features
- [ ] **F4.MO.11** - Offline indicator
- [ ] **F4.MO.12** - Connection status
- [ ] **F4.MO.13** - Mobile keyboard handling
- [ ] **F4.MO.14** - Screen orientation handling
- [ ] **F4.MO.15** - Mobile notifications

---

### Sync & Storage Features

#### Local Storage
- [ ] **F5.SS.1** - Storage versioning
- [ ] **F5.SS.2** - Automatic migrations
- [ ] **F5.SS.3** - Storage compression
- [ ] **F5.SS.4** - Storage cleanup
- [ ] **F5.SS.5** - Storage statistics

#### File System
- [ ] **F5.SS.6** - File System Access API
- [ ] **F5.SS.7** - Local file sync
- [ ] **F5.SS.8** - Auto-save to file
- [ ] **F5.SS.9** - File watcher
- [ ] **F5.SS.10** - Conflict resolution

#### Cloud Sync
- [ ] **F5.SS.11** - GitHub sync
- [ ] **F5.SS.12** - Dropbox sync
- [ ] **F5.SS.13** - Google Drive sync
- [ ] **F5.SS.14** - OneDrive sync
- [ ] **F5.SS.15** - iCloud sync

#### Security
- [ ] **F5.SS.16** - End-to-end encryption
- [ ] **F5.SS.17** - Password protection
- [ ] **F5.SS.18** - Biometric authentication
- [ ] **F5.SS.19** - Auto-lock
- [ ] **F5.SS.20** - Secure storage

---

### Advanced Features

#### Plugins
- [ ] **F6.AD.1** - Plugin architecture
- [ ] **F6.AD.2** - Plugin API
- [ ] **F6.AD.3** - Plugin loader
- [ ] **F6.AD.4** - Plugin marketplace
- [ ] **F6.AD.5** - Plugin documentation

#### Views
- [ ] **F6.AD.6** - Graph view
- [ ] **F6.AD.7** - Calendar view
- [ ] **F6.AD.8** - Kanban view
- [ ] **F6.AD.9** - Mind map view
- [ ] **F6.AD.10** - Timeline view

#### Collaboration
- [ ] **F6.AD.11** - Real-time collaboration (optional)
- [ ] **F6.AD.12** - Comments (optional)
- [ ] **F6.AD.13** - Version history
- [ ] **F6.AD.14** - Diff view
- [ ] **F6.AD.15** - Restore previous versions

---

## 🏗️ Technical Architecture

---

### Current Architecture

```
notes-app/
├── index.html          # Main HTML structure
├── app.js              # All application logic
├── style.css           # Styles with light/dark themes
├── package.json        # Project metadata
├── LICENSE             # MIT License
├── README.md           # Documentation
└── test/               # Test files
    ├── app.test.js
    ├── deleteActive.test.js
    ├── el.test.js
    ├── markdown.test.js
    ├── normalizeNote.test.js
    └── store.test.js
```

### app.js Structure

```
app.js
├── Pure Helpers (DOM-free utilities)
│   ├── el() - Element creation
│   ├── escapeHtml() - HTML escaping
│   ├── isBlockStart() - Markdown parsing
│   ├── renderMarkdown() - Markdown rendering
│   ├── parseTagsInput() - Tag parsing
│   └── timeAgo() - Relative timestamps
├── DOM Cache (Cached element references)
│   └── els object
├── Store (State management)
│   ├── store.get()
│   ├── store.set()
│   └── store.subscribe()
├── State (Global variables)
│   ├── notes
│   ├── activeId
│   ├── view
│   ├── searchQuery
│   ├── folderFilter
│   └── selectedTags
├── Storage
│   ├── loadNotes()
│   ├── persist()
│   ├── normalizeNote()
│   └── uid()
├── Rendering
│   ├── renderSidebarChrome()
│   ├── renderNoteList()
│   ├── renderSidebar()
│   ├── renderEditor()
│   ├── applyView()
│   ├── renderAll()
│   └── refreshTimestamps()
├── Actions
│   ├── createNote()
│   ├── selectNote()
│   ├── clearFilters()
│   ├── deleteActive()
│   ├── scheduleSave()
│   ├── flushSave()
│   ├── exportNotes()
│   └── importNotes()
├── Theme
│   ├── currentTheme()
│   └── applyTheme()
├── Events (Event listeners)
└── Init (Initialization)
```

### Proposed Architecture Improvements

```
notes-app/
├── src/
│   ├── index.html
│   ├── main.js          # Entry point
│   ├── config.js        # Configuration
│   ├── store/
│   │   ├── index.js     # Store factory
│   │   └── migrations.js # Storage migrations
│   ├── utils/
│   │   ├── dom.js       # DOM utilities
│   │   ├── markdown.js  # Markdown rendering
│   │   ├── time.js      # Time utilities
│   │   └── validate.js   # Validation utilities
│   ├── state/
│   │   ├── notes.js     # Notes state management
│   │   ├── ui.js        # UI state management
│   │   └── theme.js     # Theme management
│   ├── components/
│   │   ├── sidebar.js   # Sidebar component
│   │   ├── editor.js    # Editor component
│   │   ├── toolbar.js   # Toolbar component
│   │   └── preview.js   # Preview component
│   ├── services/
│   │   ├── storage.js   # Storage service
│   │   ├── sync.js      # Sync service
│   │   └── export.js    # Export service
│   └── styles/
│       ├── main.css    # Main styles
│       ├── light.css   # Light theme
│       └── dark.css    # Dark theme
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── user/
│   └── developer/
├── package.json
├── vite.config.js      # Build configuration
└── README.md
```

---

## 🧪 Testing Strategy

---

### Current Testing

- **Framework**: Node.js built-in test runner (`node --test`)
- **Tests**: 82 tests across 6 files
- **Coverage**: Good coverage of pure functions
- **Status**: All tests passing ✅

### Test Files

| File | Tests | Description |
|------|-------|-------------|
| `app.test.js` | ~20 | Helper functions, utilities |
| `deleteActive.test.js` | ~10 | Note deletion logic |
| `el.test.js` | ~15 | DOM element creation |
| `markdown.test.js` | ~20 | Markdown rendering |
| `normalizeNote.test.js` | ~10 | Note normalization |
| `store.test.js` | ~10 | State management store |

### Proposed Testing Improvements

#### Unit Tests
- [ ] **T1.UT.1** - Add tests for all pure functions
- [ ] **T1.UT.2** - Add edge case tests
- [ ] **T1.UT.3** - Add performance tests
- [ ] **T1.UT.4** - Add property-based tests
- [ ] **T1.UT.5** - Increase coverage to 90%+

#### Integration Tests
- [ ] **T1.IT.1** - Add component integration tests
- [ ] **T1.IT.2** - Add state management tests
- [ ] **T1.IT.3** - Add rendering tests
- [ ] **T1.IT.4** - Add storage tests
- [ ] **T1.IT.5** - Add sync tests

#### E2E Tests
- [ ] **T1.E2.1** - Set up Playwright
- [ ] **T1.E2.2** - Add basic navigation tests
- [ ] **T1.E2.3** - Add note creation tests
- [ ] **T1.E2.4** - Add note editing tests
- [ ] **T1.E2.5** - Add note deletion tests
- [ ] **T1.E2.6** - Add search tests
- [ ] **T1.E2.7** - Add filter tests
- [ ] **T1.E2.8** - Add theme toggle tests
- [ ] **T1.E2.9** - Add import/export tests

#### Visual Regression Tests
- [ ] **T1.VR.1** - Set up Percy or Chromatic
- [ ] **T1.VR.2** - Add screenshot tests for all views
- [ ] **T1.VR.3** - Add theme tests
- [ ] **T1.VR.4** - Add responsive tests

#### Accessibility Tests
- [ ] **T1.A1.1** - Set up axe-core
- [ ] **T1.A1.2** - Add accessibility scans
- [ ] **T1.A1.3** - Add screen reader tests
- [ ] **T1.A1.4** - Add keyboard navigation tests
- [ ] **T1.A1.5** - Add color contrast tests

#### Performance Tests
- [ ] **T1.PF.1** - Set up Lighthouse CI
- [ ] **T1.PF.2** - Add performance budgets
- [ ] **T1.PF.3** - Add load time tests
- [ ] **T1.PF.4** - Add rendering performance tests
- [ ] **T1.PF.5** - Add memory usage tests

---

## 📚 Resources & References

---

### Documentation
- [README.md](./README.md) - Project documentation
- [LICENSE](./LICENSE) - MIT License
- [package.json](./package.json) - Project metadata

### Dependencies
- None! Zero dependencies by design

### Tools
- **Testing**: Node.js built-in test runner
- **Linting**: None (consider ESLint)
- **Formatting**: None (consider Prettier)
- **Build**: None (consider Vite/Rollup)

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

### Requirements
- `localStorage` support
- `crypto.randomUUID()` (with fallback)
- ES6+ JavaScript support

---

## 💡 Session Context

---

### For New Agent Sessions

**Project Context:**
- This is a **vanilla JavaScript** notes application with **zero dependencies**
- All code is in the root directory (`index.html`, `app.js`, `style.css`)
- Tests are in the `test/` directory
- The app uses **localStorage** for persistence
- The app has **no build step** - just open `index.html` in a browser

**Current State:**
- All 82 tests passing ✅
- Clean, well-organized codebase ✅
- Good documentation ✅
- Responsive design ✅
- Accessibility best practices ✅

**Getting Started:**
1. Read `README.md` for project overview
2. Read `IMPLEMENTATION_PLAN.md` (this file) for roadmap
3. Run `npm test` to verify all tests pass
4. Open `index.html` in browser to test the app

**Development Workflow:**
1. Create a feature branch: `git checkout -b feature/feature-name`
2. Make changes to `app.js`, `style.css`, or `index.html`
3. Add tests in the `test/` directory
4. Run `npm test` to verify all tests pass
5. Test manually in browser
6. Commit changes: `git commit -m "Add feature-name"`
7. Push to branch: `git push origin feature/feature-name`
8. Open a Pull Request

**Important Files:**
- `app.js` - Main application logic (~800 lines)
- `style.css` - All styles (~500 lines)
- `index.html` - HTML structure
- `test/*.test.js` - Test files

**Key Functions in app.js:**
- `el()` - DOM element creation helper
- `renderMarkdown()` - Markdown to HTML rendering
- `store` - State management (get, set, subscribe)
- `loadNotes()` / `persist()` - Storage functions
- `renderSidebar()` / `renderEditor()` - Rendering functions
- `createNote()` / `selectNote()` / `deleteActive()` - Action functions

**Key CSS Variables:**
```css
:root {
  --bg: #f6f7f9;
  --panel: #ffffff;
  --text: #1c2128;
  --muted: #6b7280;
  --border: #e2e5ea;
  --accent: #2563eb;
  --accent-soft: #dbeafe;
  --danger: #dc2626;
  --code-bg: #f0f2f5;
}

[data-theme="dark"] {
  --bg: #12151a;
  --panel: #1a1f26;
  --text: #e5e9f0;
  /* ... */
}
```

**Testing:**
- Run all tests: `npm test` or `node --test`
- Run specific test: `node --test test/markdown.test.js`
- Tests use Node.js built-in test runner
- Tests cover pure functions (no DOM testing)

---

### Quick Reference

**Keyboard Shortcuts:**
| Shortcut | Action | Task ID |
|----------|--------|--------|
| `Ctrl/Cmd + N` | Create new note | P1.UX.1 |
| `Ctrl/Cmd + S` | Flush pending save | P1.PF.1 |
| `Ctrl/Cmd + D` | Duplicate note | P1.UX.5 |
| `Arrow Up/Down` | Navigate note list | P1.UX.2 |
| `Enter` | Select focused note | P1.UX.2 |
| `Escape` | Clear search input | P1.A1.6 |
| `Ctrl/Cmd + F` | Find in note | P2.VE.7 |

**Storage:**
- Key: `notes-app.v1`
- Format: JSON array of note objects
- Note structure: `{ id, title, body, folder, tags, updatedAt }`

**Theme:**
- Key: `notes-app.theme`
- Values: `light` or `dark`
- Default: System preference

---

## 📝 Task Index

---

### How to Reference Tasks

All tasks in this document have **unique identifiers** in the format:
- **Phase.Task**: `P1.UX.1` (Phase 1, User Experience, Task 1)
- **Goal.Task**: `G1.T1` (Goal 1, Task 1)
- **Feature.Task**: `F1.EE.1` (Feature Category 1, Editor Enhancement 1)
- **Test.Task**: `T1.UT.1` (Test Category 1, Unit Test 1)

### Phase Index
| Phase ID | Name | Tasks | Status |
|----------|------|-------|--------|
| P0 | Current State | 31 | ✅ Complete |
| P1 | Quick Wins | 34 | ⏳ Not Started |
| P2 | Feature Expansion | 31 | ⏳ Not Started |
| P3 | Advanced Features | 29 | ⏳ Not Started |
| P4 | Polish & Optimization | 28 | ⏳ Not Started |
| P5 | Ecosystem & Community | 17 | ⏳ Not Started |

### Goal Index
| Goal ID | Category | Tasks | Status |
|---------|----------|-------|--------|
| G1 | Short-Term (1-2 months) | 5 | ⏳ Not Started |
| G2 | Medium-Term (2-4 months) | 4 | ⏳ Not Started |
| G3 | Long-Term (4-8 months) | 5 | ⏳ Not Started |
| G4 | Success Metrics | 5 | ⏳ Not Started |

### Feature Category Index
| Category | ID Prefix | Tasks | Status |
|----------|-----------|-------|--------|
| User Experience | F1 | 20+ | ⏳ Not Started |
| Markdown | F2 | 20 | ⏳ Not Started |
| Visual | F3 | 20 | ⏳ Not Started |
| Mobile | F4 | 15 | ⏳ Not Started |
| Sync & Storage | F5 | 20 | ⏳ Not Started |
| Advanced | F6 | 15 | ⏳ Not Started |

### Test Category Index
| Category | ID Prefix | Tasks | Status |
|----------|-----------|-------|--------|
| Unit Tests | T1.UT | 5 | ⏳ Not Started |
| Integration Tests | T1.IT | 5 | ⏳ Not Started |
| E2E Tests | T1.E2 | 9 | ⏳ Not Started |
| Visual Regression | T1.VR | 4 | ⏳ Not Started |
| Accessibility | T1.A1 | 5 | ⏳ Not Started |
| Performance | T1.PF | 5 | ⏳ Not Started |

---

## 🏁 Conclusion

This implementation plan provides a **comprehensive roadmap** for enhancing the Notes App with:
- **Clear phases** with estimated timelines
- **Unique task identifiers** for easy reference (e.g., "Please implement P1.UX.1")
- **Detailed feature lists** with checkboxes
- **Technical architecture** improvements
- **Testing strategy** for quality assurance
- **Session context** for new agents
- **Task index** for quick lookup

**Status**: Ready for implementation ✅

**Next Review**: Update this file as features are completed

---

*Generated for Notes App project - Last updated: Tue Aug 18 10:55:40 PM UTC 2026*
