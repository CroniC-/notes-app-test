'use strict';
// DOM element creation helper - creates elements with props and children
// Usage: el('div', { class: 'foo', 'data-id': '123' }, 'text content')
//        el('div', {}, [el('span', {}, 'child1'), el('span', {}, 'child2')])
function el(tag, props, children) {
  const element = document.createElement(tag);

  // Set properties/attributes
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key === 'className' || key === 'class') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        element[key] = value;
      } else if (value === true) {
        element.setAttribute(key, '');
      } else if (value === false || value === null || value === undefined) {
        // Skip boolean false, null, undefined
      } else {
        element.setAttribute(key, String(value));
      }
    }
  }

  // Append children
  if (children !== undefined && children !== null) {
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child !== null && child !== undefined) {
          if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
          } else if (child instanceof Node) {
            element.appendChild(child);
          }
        }
      }
    } else if (typeof children === 'string') {
      element.textContent = children;
    } else if (children instanceof Node) {
      element.appendChild(children);
    }
  }

  return element;
}

// === pure helpers ===

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isBlockStart(line) {
  const t = line.trim();
  if (!t) return true;
  if (/^#{1,4}\s/.test(t)) return true;
  if (/^```/.test(t)) return true;
  if (/^\s*>/.test(line)) return true;
  // List markers only start a block when at column 0 (no leading indent)
  if (/^[-*]\s+/.test(line)) return true;
  if (/^\d+\.\s+/.test(line)) return true;
  if (/^(-{3,}|\*{3,})$/.test(t)) return true;
  return false;
}

function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const out = [];

  const inline = (text) => {
    let s = escapeHtml(text);
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (m, c) => {
      codes.push('<code>' + c + '</code>');
      return '\u0000' + (codes.length - 1) + '\u0000';
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/~~([^~]+)~~/g, '<s>$1</s>');
    s = s.replace(/\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))*)\)/g, (m, txt, url) => {
      if (!/^(https?:\/\/|mailto:)/i.test(url)) return txt;
      return '<a href="' + url + '" target="_blank" rel="noopener">' + txt + '</a>';
    });
    s = s.replace(/\u0000(\d+)\u0000/g, (m, n) => codes[+n]);
    return s;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push('<pre><code>' + escapeHtml(buf.join('\n')) + '</code></pre>');
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      out.push('<h' + lvl + '>' + inline(h[2]) + '</h' + lvl + '>');
      i++;
      continue;
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push('<blockquote>' + buf.map(inline).join('<br>') + '</blockquote>');
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      out.push('<ul>' + buf.map((li) => '<li>' + inline(li) + '</li>').join('') + '</ul>');
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      out.push('<ol>' + buf.map((li) => '<li>' + inline(li) + '</li>').join('') + '</ol>');
      continue;
    }

    const buf = [line];
    i++;
    while (i < lines.length && !isBlockStart(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    out.push('<p>' + buf.map(inline).join('<br>') + '</p>');
  }

  return out.join('\n');
}

function parseTagsInput(value) {
  return [
    ...new Set(
      String(value)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    ),
  ];
}

function timeAgo(ts) {
  const min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return min + ' min ago';
  const h = Math.floor(min / 60);
  if (h < 24) return h + ' h ago';
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 7) return d + ' days ago';
  return new Date(ts).toLocaleDateString();
}

function formatFullTimestamp(ts) {
  return new Date(ts).toLocaleString();
}

// === dom ===

const STORAGE_KEY = 'notes-app.v1';
const THEME_KEY = 'notes-app.theme';

const $ = (sel) => document.querySelector(sel);

const els = {
  newNote: $('#new-note'),
  search: $('#search'),
  folderFilter: $('#folder-filter'),
  tagCloud: $('#tag-cloud'),
  noteList: $('#note-list'),
  exportBtn: $('#export'),
  importBtn: $('#import'),
  importFile: $('#import-file'),
  themeToggle: $('#theme-toggle'),
  emptyState: $('#empty-state'),
  editorPane: $('#editor-pane'),
  title: $('#note-title'),
  folder: $('#note-folder'),
  tags: $('#note-tags'),
  viewWrite: $('#view-write'),
  viewPreview: $('#view-preview'),
  saveIndicator: $('#save-indicator'),
  wordCount: $('#word-count'),
  deleteBtn: $('#delete-note'),
  body: $('#note-body'),
  preview: $('#preview'),
  fmtBold: $('#fmt-bold'),
  fmtItalic: $('#fmt-italic'),
  fmtStrike: $('#fmt-strike'),
  fmtH1: $('#fmt-h1'),
  fmtH2: $('#fmt-h2'),
  fmtH3: $('#fmt-h3'),
  fmtH4: $('#fmt-h4'),
  fmtUl: $('#fmt-ul'),
  fmtOl: $('#fmt-ol'),
  fmtLink: $('#fmt-link'),
  fmtCode: $('#fmt-code'),
  fmtQuote: $('#fmt-quote'),
  fmtHr: $('#fmt-hr'),
};

// === store ===

// Simple reactive store for managing application state
// Provides get, set, and subscribe functionality
// Usage:
//   store.set('key', value)
//   store.get('key')
//   store.subscribe('key', callback)
const store = (() => {
  const state = {};
  const subscribers = {};

  return {
    // Get current value for a key
    get(key) {
      return state[key];
    },

    // Set value for a key and notify subscribers
    set(key, value) {
      const oldValue = state[key];
      state[key] = value;
      const subs = subscribers[key];
      if (subs && oldValue !== value) {
        for (const sub of subs) {
          sub(value, oldValue);
        }
      }
    },

    // Subscribe to changes for a key
    subscribe(key, callback) {
      if (!subscribers[key]) {
        subscribers[key] = new Set();
      }
      subscribers[key].add(callback);
      // Return unsubscribe function
      return () => subscribers[key].delete(callback);
    },

    // Get current state (for debugging/testing)
    getState() {
      return { ...state };
    },
  };
})();

let notes = loadNotes();
let activeId = null;
let view = 'write';
let searchQuery = '';
let folderFilter = '';
let selectedTags = new Set();

// Initialize store with current state
store.set('notes', notes);
store.set('activeId', activeId);
store.set('view', view);
store.set('searchQuery', searchQuery);
store.set('folderFilter', folderFilter);
store.set('selectedTags', selectedTags);

// Sync global state to store when it changes
// This allows incremental migration - code can use either globals or store

let saveTimer = null;
let indicatorTimer = null;

// ---------- storage ----------

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr.filter((n) => n && typeof n.id === 'string').map(normalizeNote);
  } catch {
    return [];
  }
}

function isTimestamp(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0;
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return false;
    const num = Number(t);
    return Number.isFinite(num) && num > 0;
  }
  return false;
}

function normalizeNote(n) {
  return {
    id: n.id,
    title: typeof n.title === 'string' ? n.title : '',
    body: typeof n.body === 'string' ? n.body : '',
    folder: typeof n.folder === 'string' ? n.folder : '',
    tags: Array.isArray(n.tags) ? n.tags.filter((t) => typeof t === 'string') : [],
    updatedAt: isTimestamp(n.updatedAt) ? Number(n.updatedAt) : Date.now(),
  };
}

function persist() {
  let ok = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    ok = false;
  }
  if (ok) flashSaved();
  else flashSaveError();
  return ok;
}

function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// ---------- state ----------

function getActive() {
  return notes.find((n) => n.id === activeId) || null;
}

function visibleNotes() {
  const q = searchQuery.trim().toLowerCase();
  return notes
    .filter((n) => {
      if (folderFilter && n.folder !== folderFilter) return false;
      if (selectedTags.size && ![...selectedTags].every((t) => n.tags.includes(t))) return false;
      if (q) {
        const hay = (n.title + '\n' + n.body + '\n' + n.tags.join(' ')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

// ---------- rendering ----------

function renderSidebarChrome() {
  const folders = [...new Set(notes.map((n) => n.folder).filter(Boolean))].sort();
  if (folderFilter && !folders.includes(folderFilter)) folderFilter = '';
  selectedTags = new Set([...selectedTags].filter((t) => notes.some((n) => n.tags.includes(t))));

  els.folderFilter.textContent = '';
  els.folderFilter.appendChild(el('option', { value: '' }, 'All folders'));
  for (const f of folders) {
    els.folderFilter.appendChild(
      el('option', { value: f, selected: f === folderFilter }, escapeHtml(f))
    );
  }

  const tags = [...new Set(notes.flatMap((n) => n.tags))].sort();
  els.tagCloud.textContent = '';
  if (tags.length) {
    for (const t of tags) {
      els.tagCloud.appendChild(
        el(
          'span',
          {
            class: 'tag' + (selectedTags.has(t) ? ' selected' : ''),
            'data-tag': t,
            role: 'button',
            tabindex: '0',
          },
          escapeHtml(t)
        )
      );
    }
  }
}

function renderNoteList() {
  const list = visibleNotes();
  if (list.length) {
    els.noteList.textContent = '';
    for (const n of list) {
      const tags =
        n.tags && n.tags.length > 0
          ? n.tags.map((t) =>
              el(
                'span',
                {
                  class: 'note-tag' + (selectedTags.has(t) ? ' selected' : ''),
                  'data-tag': t,
                  role: 'button',
                  tabindex: '0',
                },
                escapeHtml(t)
              )
            )
          : [];

      const li = el(
        'li',
        {
          class: 'note-item' + (n.id === activeId ? ' active' : ''),
          'data-id': n.id,
          role: 'option',
          tabindex: n.id === activeId ? '0' : '-1',
          draggable: 'true',
        },
        [
          el('div', { class: 'note-title' }, escapeHtml(n.title || 'Untitled')),
          el('div', { class: 'note-sub' }, [
            n.folder ? el('span', {}, escapeHtml(n.folder)) : '',
            el(
              'span',
              { class: 'note-timestamp', title: formatFullTimestamp(n.updatedAt) },
              timeAgo(n.updatedAt)
            ),
          ]),
          tags.length > 0 ? el('div', { class: 'note-tags' }, tags) : '',
        ]
      );
      els.noteList.appendChild(li);
    }
    return;
  }
  // No notes match. Distinguish "nothing in the store" from "filters excluded
  // everything": only the latter shows active filters + a clear-filters action.
  if (!notes.length) {
    els.noteList.textContent = '';
    const emptyLi = el('li', { class: 'no-notes' });
    emptyLi.appendChild(el('div', { class: 'empty-state-icon' }, '🗒'));
    emptyLi.appendChild(el('div', { class: 'no-notes-msg' }, 'No notes yet'));
    emptyLi.appendChild(el('p', { class: 'no-notes-hint' }, 'Create one with + New.'));
    els.noteList.appendChild(emptyLi);
    return;
  }
  const chips = [];
  if (folderFilter)
    chips.push(
      el(
        'span',
        { class: 'empty-filter-chip', 'data-filter': 'folder', role: 'button', tabindex: '0' },
        'Folder: ' + escapeHtml(folderFilter)
      )
    );
  for (const t of selectedTags)
    chips.push(
      el(
        'span',
        {
          class: 'empty-filter-chip',
          'data-filter': 'tag',
          'data-tag': t,
          role: 'button',
          tabindex: '0',
        },
        'Tag: ' + escapeHtml(t)
      )
    );
  if (searchQuery.trim())
    chips.push(
      el(
        'span',
        { class: 'empty-filter-chip', 'data-filter': 'search', role: 'button', tabindex: '0' },
        'Search: ' + escapeHtml(searchQuery.trim())
      )
    );
  els.noteList.textContent = '';
  const resultsLi = el('li', { class: 'no-notes no-results' });
  resultsLi.appendChild(el('div', { class: 'empty-state-icon' }, '🔍'));
  resultsLi.appendChild(
    el('div', { class: 'no-results-msg' }, 'No notes match the current filters.')
  );
  if (chips.length) {
    resultsLi.appendChild(el('div', { class: 'empty-filter-chips' }, chips));
  }
  resultsLi.appendChild(
    el(
      'button',
      { class: 'btn btn-ghost clear-filters', type: 'button', role: 'button' },
      'Clear filters'
    )
  );
  els.noteList.appendChild(resultsLi);
}

function renderSidebar() {
  renderSidebarChrome();
  renderNoteList();
}

function renderEditor() {
  const n = getActive();
  if (!n) {
    els.editorPane.hidden = true;
    els.emptyState.hidden = false;
    return;
  }
  els.editorPane.hidden = false;
  els.emptyState.hidden = true;
  els.title.value = n.title;
  els.folder.value = n.folder;
  els.tags.value = n.tags.join(', ');
  els.body.value = n.body;
  applyView();
  updateWordCount();
}

function applyView() {
  const previewing = view === 'preview';
  els.viewWrite.classList.toggle('active', !previewing);
  els.viewPreview.classList.toggle('active', previewing);
  els.viewWrite.setAttribute('aria-pressed', String(!previewing));
  els.viewPreview.setAttribute('aria-pressed', String(previewing));
  els.body.hidden = previewing;
  els.preview.hidden = !previewing;
  if (previewing) {
    const n = getActive();
    els.preview.innerHTML =
      n && n.body.trim()
        ? renderMarkdown(n.body)
        : '<p class="empty-preview">Nothing to preview yet.</p>';
  }
}

function renderAll() {
  renderSidebar();
  renderEditor();
}

function refreshTimestamps() {
  renderNoteList();
}

function flashSaved() {
  els.saveIndicator.textContent = 'Saved';
  els.saveIndicator.classList.remove('error');
  els.saveIndicator.classList.add('show');
  clearTimeout(indicatorTimer);
  indicatorTimer = setTimeout(() => els.saveIndicator.classList.remove('show'), 1500);
}

function flashSaveError() {
  els.saveIndicator.textContent = 'Save failed — storage full';
  els.saveIndicator.classList.add('error', 'show');
  clearTimeout(indicatorTimer);
  indicatorTimer = setTimeout(() => els.saveIndicator.classList.remove('show'), 4000);
}

// ---------- actions ----------

function createNote() {
  const now = Date.now();
  const n = {
    id: uid(),
    title: '',
    body: '',
    folder: folderFilter,
    tags: [...selectedTags],
    updatedAt: now,
  };
  notes.unshift(n);
  persist();
  activeId = n.id;
  view = 'write';
  renderAll();
  els.title.focus();
}

function selectNote(id) {
  if (id === activeId) return;
  activeId = id;
  renderSidebar();
  renderEditor();
  updateWordCount();
}

function clearFilters() {
  searchQuery = '';
  els.search.value = '';
  folderFilter = '';
  els.folderFilter.value = '';
  selectedTags = new Set();
  renderSidebar();
}

function deleteActive() {
  const n = getActive();
  if (!n) return;
  if (!confirm('Delete "' + (n.title || 'Untitled') + '"?')) return;
  // Find index in sorted list before deleting
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  const deletedIndex = sortedNotes.findIndex((x) => x.id === n.id);
  notes = notes.filter((x) => x.id !== n.id);
  persist();
  // Prefer nearest sibling in sort order
  if (deletedIndex >= 0) {
    activeId = sortedNotes[deletedIndex - 1]?.id || sortedNotes[deletedIndex + 1]?.id || null;
  } else {
    activeId = null;
  }
  renderAll();
}

function duplicateNote() {
  const n = getActive();
  if (!n) return;
  const now = Date.now();
  const duplicate = {
    id: uid(),
    title: n.title + ' (Copy)',
    body: n.body,
    folder: n.folder,
    tags: [...n.tags],
    updatedAt: now,
  };
  notes.unshift(duplicate);
  persist();
  activeId = duplicate.id;
  view = 'write';
  renderAll();
  els.title.focus();
}

function scheduleSave() {
  const n = getActive();
  if (!n) return;
  n.title = els.title.value;
  n.folder = els.folder.value.trim();
  n.tags = parseTagsInput(els.tags.value);
  n.body = els.body.value;
  n.updatedAt = Date.now();
  clearTimeout(saveTimer);
  updateWordCount();
  saveTimer = setTimeout(() => {
    saveTimer = null;
    persist();
    renderSidebar();
  }, 400);
}

function flushSave() {
  if (saveTimer === null) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  persist();
  renderSidebar();
}

function exportNotes() {
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'notes-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

// Word and character count utility
function countWordsAndChars(text) {
  const trimmed = text.trim();
  const charCount = trimmed.length;
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  return { words: wordCount, chars: charCount };
}

function updateWordCount() {
  const n = getActive();
  if (!n) {
    els.wordCount.textContent = '';
    return;
  }
  const { words, chars } = countWordsAndChars(n.body);
  els.wordCount.textContent = words + ' words, ' + chars + ' chars';
}
function importNotes(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const arr = JSON.parse(reader.result);
      if (!Array.isArray(arr)) throw new Error('not an array');
      let added = 0;
      let updated = 0;
      for (const raw of arr) {
        if (!raw || typeof raw.id !== 'string') continue;
        const n = normalizeNote(raw);
        const idx = notes.findIndex((x) => x.id === n.id);
        if (idx === -1) {
          notes.push(n);
          added++;
        } else if (n.updatedAt > (notes[idx].updatedAt || 0)) {
          notes[idx] = n;
          updated++;
        }
      }
      persist();
      renderAll();
      alert('Import complete: ' + added + ' added, ' + updated + ' updated.');
    } catch {
      alert('Invalid notes file. Expected a JSON array exported from this app.');
    }
  };
  reader.onerror = () => alert('Could not read file.');
  reader.readAsText(file);
}

// ---------- theme ----------

function currentTheme() {
  let saved;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch {
    saved = null;
  }
  return (
    saved ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light')
  );
}

function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  els.themeToggle.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
}

// ---------- formatting helpers ----------

function getTextarea() {
  return els.body;
}

function getSelection() {
  const textarea = getTextarea();
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  return { start, end, text: textarea.value.substring(start, end) };
}

function replaceSelection(replacement) {
  const textarea = getTextarea();
  const { start, end } = getSelection();
  textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  textarea.selectionStart = start + replacement.length;
  textarea.selectionEnd = start + replacement.length;
  textarea.focus();
  scheduleSave();
}

function wrapSelection(prefix, suffix = prefix) {
  const { start, end, text } = getSelection();
  const hasSelection = start !== end;

  if (hasSelection) {
    replaceSelection(prefix + text + suffix);
  } else {
    // Insert prefix and suffix with cursor in between
    const textarea = getTextarea();
    const pos = start;
    textarea.value =
      textarea.value.substring(0, pos) + prefix + suffix + textarea.value.substring(pos);
    textarea.selectionStart = pos + prefix.length;
    textarea.selectionEnd = pos + prefix.length;
    textarea.focus();
    scheduleSave();
  }
}

function wrapLine(prefix) {
  const textarea = getTextarea();
  const { start, end } = getSelection();
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);
  const selected = textarea.value.substring(start, end);

  // Get the current line
  const lineStart = before.lastIndexOf('\n') + 1;
  // const lineEnd = before.indexOf('\n', lineStart);
  // const currentLineStart = lineEnd === -1 ? lineStart : lineEnd;

  // If there's a selection, wrap all selected lines
  const lines = selected.split('\n');
  const wrapped = lines.map((line) => prefix + line).join('\n');

  textarea.value = before.substring(0, lineStart) + wrapped + after;
  textarea.selectionStart = lineStart + wrapped.length;
  textarea.selectionEnd = lineStart + wrapped.length;
  textarea.focus();
  scheduleSave();
}

function insertAtCursor(text) {
  const textarea = getTextarea();
  const { start, end } = getSelection();
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);

  textarea.value = before + text + after;
  textarea.selectionStart = start + text.length;
  textarea.selectionEnd = start + text.length;
  textarea.focus();
  scheduleSave();
}

function formatBold() {
  wrapSelection('**', '**');
}

function formatItalic() {
  wrapSelection('*', '*');
}

function formatStrike() {
  wrapSelection('~~', '~~');
}

function formatHeading(level) {
  const prefix = '#'.repeat(level) + ' ';
  wrapLine(prefix);
}

function formatUl() {
  wrapLine('- ');
}

function formatOl() {
  wrapLine('1. ');
}

function formatLink() {
  const url = prompt('Enter URL:');
  if (!url) return;
  const { text } = getSelection();
  const displayText = text || 'link text';
  replaceSelection('[' + displayText + '](' + url + ')');
}

function formatCode() {
  const { start, end, text } = getSelection();
  if (start !== end) {
    replaceSelection('`' + text + '`');
  } else {
    insertAtCursor('```\n\n```');
    // Position cursor between the code block markers
    const textarea = getTextarea();
    textarea.selectionStart = start + 4;
    textarea.selectionEnd = start + 4;
  }
}

function formatQuote() {
  wrapLine('> ');
}

function formatHr() {
  insertAtCursor('\n\n---\n\n');
}

// ---------- events ----------

els.newNote.addEventListener('click', createNote);

els.noteList.addEventListener('click', (e) => {
  if (e.target.closest('.clear-filters')) {
    clearFilters();
    return;
  }
  const item = e.target.closest('.note-item');
  if (item) selectNote(item.dataset.id);
});
// Drag and drop reordering
let draggedItem = null;

els.noteList.addEventListener('dragstart', (e) => {
  const item = e.target.closest('.note-item');
  if (item) {
    draggedItem = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.id);
  }
});

els.noteList.addEventListener('dragend', (e) => {
  const item = e.target.closest('.note-item');
  if (item) {
    item.classList.remove('dragging');
    draggedItem = null;
    // Clear all drag-over states
    Array.from(els.noteList.querySelectorAll('.note-item')).forEach((el) => {
      el.classList.remove('drag-over');
    });
  }
});

els.noteList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const item = e.target.closest('.note-item');
  if (item && item !== draggedItem) {
    // Clear previous drag-over states
    Array.from(els.noteList.querySelectorAll('.note-item')).forEach((el) => {
      el.classList.remove('drag-over');
    });
    item.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  }
});

els.noteList.addEventListener('dragleave', (e) => {
  const item = e.target.closest('.note-item');
  if (item) {
    item.classList.remove('drag-over');
  }
});

els.noteList.addEventListener('drop', (e) => {
  e.preventDefault();
  const targetItem = e.target.closest('.note-item');
  if (targetItem && draggedItem && targetItem !== draggedItem) {
    const fromId = draggedItem.dataset.id;
    const toId = targetItem.dataset.id;

    // Clear all drag states
    Array.from(els.noteList.querySelectorAll('.note-item')).forEach((el) => {
      el.classList.remove('dragging', 'drag-over');
    });

    // Get visible notes (already sorted by updatedAt)
    const visible = visibleNotes();
    const fromIndex = visible.findIndex((n) => n.id === fromId);
    const toIndex = visible.findIndex((n) => n.id === toId);

    if (fromIndex !== -1 && toIndex !== -1) {
      // Determine if we're dropping above or below the target
      const rect = targetItem.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const dropAbove = e.clientY < midY;
      const finalIndex = dropAbove ? toIndex : toIndex + 1;

      if (fromIndex !== finalIndex) {
        // Update timestamps to reflect new order
        // Use decreasing timestamps so newer notes appear first
        const now = Date.now();
        const draggedNote = notes.find((n) => n.id === fromId);

        // Set the dragged note's timestamp to be between the notes
        // at finalIndex-1 and finalIndex
        if (finalIndex === 0) {
          // Move to top - make it newest
          draggedNote.updatedAt = now;
        } else if (finalIndex >= visible.length) {
          // Move to bottom - make it oldest
          draggedNote.updatedAt = visible[visible.length - 1].updatedAt - 1;
        } else {
          // Insert between finalIndex-1 and finalIndex
          const beforeNote = visible[finalIndex - 1];
          const afterNote = visible[finalIndex];
          draggedNote.updatedAt = (beforeNote.updatedAt + afterNote.updatedAt) / 2;
        }

        persist();
        renderSidebar();

        // Keep the same note selected
        activeId = fromId;
        renderEditor();
      }
    }

    draggedItem = null;
  }
});

els.noteList.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  // Handle filter chips
  const chip = e.target.closest('.empty-filter-chip');
  if (chip) {
    e.preventDefault();
    if (chip.dataset.filter === 'folder') {
      folderFilter = '';
    } else if (chip.dataset.filter === 'tag') {
      selectedTags.delete(chip.dataset.tag);
    } else if (chip.dataset.filter === 'search') {
      searchQuery = '';
      els.search.value = '';
    }
    renderSidebar();
    return;
  }
  // Handle note items
  const item = e.target.closest('.note-item');
  if (item) {
    e.preventDefault();
    selectNote(item.dataset.id);
  }
});

els.search.addEventListener('input', () => {
  searchQuery = els.search.value;
  renderNoteList();
});

els.folderFilter.addEventListener('change', () => {
  folderFilter = els.folderFilter.value;
  renderSidebar();
});

els.tagCloud.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-tag]');
  if (!chip) return;
  const t = chip.dataset.tag;
  if (selectedTags.has(t)) selectedTags.delete(t);
  else selectedTags.add(t);
  renderSidebar();
});

els.tagCloud.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const chip = e.target.closest('[data-tag]');
  if (!chip) return;
  e.preventDefault();
  const t = chip.dataset.tag;
  if (selectedTags.has(t)) selectedTags.delete(t);
  else selectedTags.add(t);
  renderSidebar();
});

// Event listener for note tags in the note list
els.noteList.addEventListener('click', (e) => {
  const tag = e.target.closest('.note-tag');
  if (!tag) return;
  const t = tag.dataset.tag;
  if (selectedTags.has(t)) selectedTags.delete(t);
  else selectedTags.add(t);
  renderSidebar();
});

els.noteList.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const tag = e.target.closest('.note-tag');
  if (!tag) return;
  e.preventDefault();
  const t = tag.dataset.tag;
  if (selectedTags.has(t)) selectedTags.delete(t);
  else selectedTags.add(t);
  renderSidebar();
});

[els.title, els.folder, els.tags, els.body].forEach((el) =>
  el.addEventListener('input', scheduleSave)
);

els.viewWrite.addEventListener('click', () => {
  view = 'write';
  applyView();
});

els.viewPreview.addEventListener('click', () => {
  view = 'preview';
  applyView();
});

els.deleteBtn.addEventListener('click', deleteActive);

els.exportBtn.addEventListener('click', exportNotes);

els.importBtn.addEventListener('click', () => els.importFile.click());

els.importFile.addEventListener('change', () => {
  const file = els.importFile.files[0];
  if (file) importNotes(file);
  els.importFile.value = '';
});

els.themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // storage unavailable; theme still applies for this session
  }
  applyTheme(next);
});

window.addEventListener('beforeunload', flushSave);

// ---------- init ----------

applyTheme(currentTheme());
activeId = visibleNotes()[0] ? visibleNotes()[0].id : null;
renderAll();

// Refresh relative timestamps every 60 seconds
window.timestampInterval = setInterval(refreshTimestamps, 60000);

// Also refresh when the page regains visibility
window.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshTimestamps();
});

// ---------- formatting event listeners ----------

els.fmtBold.addEventListener('click', () => formatBold());
els.fmtItalic.addEventListener('click', () => formatItalic());
els.fmtStrike.addEventListener('click', () => formatStrike());
els.fmtH1.addEventListener('click', () => formatHeading(1));
els.fmtH2.addEventListener('click', () => formatHeading(2));
els.fmtH3.addEventListener('click', () => formatHeading(3));
els.fmtH4.addEventListener('click', () => formatHeading(4));
els.fmtUl.addEventListener('click', () => formatUl());
els.fmtOl.addEventListener('click', () => formatOl());
els.fmtLink.addEventListener('click', () => formatLink());
els.fmtCode.addEventListener('click', () => formatCode());
els.fmtQuote.addEventListener('click', () => formatQuote());
els.fmtHr.addEventListener('click', () => formatHr());

// ---------- keyboard shortcuts ----------

function handleKeyDown(e) {
  // Ignore if typing in an input/textarea
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    // Still allow Escape to clear search
    if (e.key === 'Escape') {
      if (tag === 'INPUT' && document.activeElement === els.search) {
        e.preventDefault();
        els.search.value = '';
        searchQuery = '';
        renderNoteList();
        document.activeElement.blur();
      }
      return;
    }
    return;
  }

  // Ctrl/Cmd + N: new note
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    createNote();
    return;
  }

  // Ctrl/Cmd + S: flush pending save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    flushSave();
    return;
  }

  // Arrow Up/Down: navigate note list
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const items = Array.from(els.noteList.querySelectorAll('.note-item'));
    if (!items.length) return;

    const current = items.findIndex((el) => el.classList.contains('active'));
    let next;
    if (e.key === 'ArrowDown') {
      next = current === -1 || current === items.length - 1 ? 0 : current + 1;
    } else {
      next = current === -1 || current === 0 ? items.length - 1 : current - 1;
    }
    selectNote(items[next].dataset.id);
    items[next].scrollIntoView({ block: 'nearest' });
    return;
  }

  // Ctrl/Cmd + B: bold
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    formatBold();
    return;
  }

  // Ctrl/Cmd + I: italic
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    formatItalic();
    return;
  }

  // Ctrl/Cmd + K: link
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    formatLink();
    return;
  }

  // Ctrl/Cmd + D: duplicate note
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    duplicateNote();
    return;
  }

  // Enter: select the focused note (if any)
  if (e.key === 'Enter') {
    const active = els.noteList.querySelector('.note-item.active');
    if (active) {
      e.preventDefault();
      selectNote(active.dataset.id);
    }
    return;
  }
}

window.addEventListener('keydown', handleKeyDown);
