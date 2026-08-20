# Notes App

A lightweight, client-side markdown notes application built with vanilla JavaScript, HTML, and CSS. No build step, no dependencies, no server required — just open `index.html` in a browser.
Test: https://cronic-.github.io/notes-app-test/

## Features

- **Markdown Support**: Write notes in a lightweight, intentional subset of markdown with live preview
  - Headings (`#`, `##`, `###`, `####`)
  - Bold (`**bold**`), Italic (`*italic*`), Strikethrough (`~~strikethrough~~`)
  - Inline code (`` `code` ``)
  - Code blocks (``` ``` ``` ```)
  - Links (`[text](https://url)`)
  - Blockquotes (`> quoted text`)
  - Unordered lists (`- item` or `* item`)
  - Ordered lists (`1. item`)
  - Horizontal rules (`---` or `***`)
  - *Note: This is a minimal markdown implementation by design. Features like tables, nested lists, task lists, images, and autolinks are intentionally not supported to keep the app lightweight with zero dependencies.*

- **Organization**
  - Folders: Categorize notes by folder
  - Tags: Add comma-separated tags to notes
  - Search: Full-text search across all notes
  - Filter by folder and/or tags

- **Persistence**
  - All notes saved to `localStorage` automatically
  - Auto-save with debouncing (400ms)
  - Save indicator shows confirmation or errors
  - Flushes pending saves before tab close

- **Import/Export**
  - Export all notes as JSON file
  - Import notes from JSON file

- **Keyboard Shortcuts**
  | Shortcut | Action |
  |----------|--------|
  | `Ctrl/Cmd + N` | Create new note |
  | `Ctrl/Cmd + S` | Flush pending save |
  | `Ctrl/Cmd + B` | Bold selected text |
  | `Ctrl/Cmd + I` | Italic selected text |
  | `Ctrl/Cmd + K` | Insert link |
  | `Arrow Up/Down` | Navigate note list |
  | `Enter` | Select focused note |
  | `Escape` | Clear search input |

- **Theming**
  - Light and dark theme toggle
  - Responsive design for mobile and desktop

- **Rich Text Formatting**
  - Format toolbar with buttons for: Bold, Italic, Strikethrough, Heading 1-4, Bullet List, Numbered List, Link, Code Block, Blockquote, Horizontal Rule
  - Keyboard shortcuts for common formatting (Ctrl/Cmd+B, Ctrl/Cmd+I, Ctrl/Cmd+K)

- **Relative Timestamps**
  - Note timestamps show relative time ("2 hours ago", "yesterday", etc.)
  - Auto-refresh every 60 seconds
  - Refresh on tab focus

## Quick Start

### Option 1: Open Directly
```bash
# Simply open index.html in your browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

### Option 2: Local Server
For best experience (especially with file import):
```bash
# Python 3
python3 -m http.server 8000

# Node.js (npx)
npx serve .

# Then open http://localhost:8000 in your browser
```

## Project Structure

```
notes-app/
├── index.html      # Main HTML structure
├── app.js          # All application logic
├── style.css       # Styles with light/dark themes
├── package.json    # Project metadata and test script
├── LICENSE          # MIT License
├── README.md       # This file
└── test/           # Test files (node --test)
    ├── app.test.js         # Pure helper tests
    ├── deleteActive.test.js
    ├── markdown.test.js
    └── normalizeNote.test.js
```

## Storage Model

Notes are stored in `localStorage` under the key `notes-app-data` as a JSON array.

### Note Object Structure

```json
{
  "id": "unique-string-id",
  "title": "Note title",
  "body": "Markdown content",
  "folder": "folder-name",
  "tags": ["tag1", "tag2"],
  "updatedAt": 1690000000000
}
```

- `id`: Unique identifier (generated with `crypto.randomUUID()` or fallback)
- `title`: String, note title
- `body`: String, markdown content
- `folder`: String, folder name (empty string for no folder)
- `tags`: Array of strings
- `updatedAt`: Unix timestamp in milliseconds

## Import/Export Format

The import/export JSON file contains an array of note objects in the same format as stored in `localStorage`.

Example `export.json`:
```json
[
  {
    "id": "abc-123",
    "title": "My First Note",
    "body": "# Hello World\n\nThis is a note",
    "folder": "work",
    "tags": ["important", "todo"],
    "updatedAt": 1690000000000
  }
]
```

## Running Tests

Tests are written for Node.js's built-in test runner (`node --test`).

```bash
# Run all tests
npm test

# Or directly
node --test

# Run specific test file
node --test test/markdown.test.js
```

Tests cover:
- HTML escaping
- Markdown rendering
- Tag parsing
- Note normalization
- Timestamp validation
- Delete behavior
- And more...

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

Requires:
- `localStorage` support
- `crypto.randomUUID()` (with fallback for older browsers)
- ES6+ JavaScript support

## Development

### Adding Features

1. Edit `app.js` for logic changes
2. Edit `style.css` for styling changes
3. Edit `index.html` for structural changes
4. Add tests in the `test/` directory

### Code Organization

`app.js` is organized into sections:
- **Pure helpers**: DOM-free, side-effect-free utilities
- **DOM cache**: Cached element references (`els` object)
- **State**: Notes array and UI state variables
- **Storage**: `loadNotes()`, `persist()`, `normalizeNote()`
- **Rendering**: `renderSidebar()`, `renderEditor()`, `renderMarkdown()`
- **Actions**: `createNote()`, `selectNote()`, `deleteActive()`, etc.
- **Event wiring**: Event listeners and initialization

### Architecture Notes

- No framework, no build step, no dependencies
- Full re-renders are used (cheap at this scale)
- HTML built via string concatenation and `.innerHTML`
- State is global mutable variables (may evolve to a store pattern)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run `npm test` to ensure all tests pass
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
