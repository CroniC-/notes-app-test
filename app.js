'use strict';

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
  return [...new Set(String(value).split(',').map((t) => t.trim()).filter(Boolean))];
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
  deleteBtn: $('#delete-note'),
  body: $('#note-body'),
  preview: $('#preview'),
};

let notes = loadNotes();
let activeId = null;
let view = 'write';
let searchQuery = '';
let folderFilter = '';
let selectedTags = new Set();
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
  } catch (e) {
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

  els.folderFilter.innerHTML =
    '<option value="">All folders</option>' +
    folders
      .map((f) => '<option value="' + escapeHtml(f) + '"' + (f === folderFilter ? ' selected' : '') + '>' + escapeHtml(f) + '</option>')
      .join('');

  const tags = [...new Set(notes.flatMap((n) => n.tags))].sort();
  els.tagCloud.innerHTML = tags.length
    ? tags
        .map((t) => '<span class="tag' + (selectedTags.has(t) ? ' selected' : '') + '" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + '</span>')
        .join('')
    : '';
}

function renderNoteList() {
  const list = visibleNotes();
  if (list.length) {
    els.noteList.innerHTML = list
      .map(
        (n) =>
          '<li class="note-item' + (n.id === activeId ? ' active' : '') + '" data-id="' + escapeHtml(n.id) + '">' +
          '<div class="note-title">' + escapeHtml(n.title || 'Untitled') + '</div>' +
          '<div class="note-sub">' +
          (n.folder ? '<span>' + escapeHtml(n.folder) + '</span>' : '') +
          '<span>' + timeAgo(n.updatedAt) + '</span>' +
          '</div>' +
          '</li>'
      )
      .join('');
    return;
  }

  // No notes match. Distinguish "nothing in the store" from "filters excluded
  // everything": only the latter shows active filters + a clear-filters action.
  if (!notes.length) {
    els.noteList.innerHTML = '<li class="no-notes">No notes yet — create one with + New.</li>';
    return;
  }

  const chips = [];
  if (folderFilter) chips.push('<span class="empty-filter-chip" data-filter="folder">Folder: ' + escapeHtml(folderFilter) + '</span>');
  for (const t of selectedTags) chips.push('<span class="empty-filter-chip" data-filter="tag" data-tag="' + escapeHtml(t) + '">Tag: ' + escapeHtml(t) + '</span>');
  if (searchQuery.trim()) chips.push('<span class="empty-filter-chip" data-filter="search">Search: ' + escapeHtml(searchQuery.trim()) + '</span>');

  els.noteList.innerHTML =
    '<li class="no-notes no-results">' +
    '<div class="no-results-msg">No notes match the current filters.</div>' +
    (chips.length ? '<div class="empty-filter-chips">' + chips.join('') + '</div>' : '') +
    '<button class="btn btn-ghost clear-filters" type="button">Clear filters</button>' +
    '</li>';
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
}

function applyView() {
  const previewing = view === 'preview';
  els.viewWrite.classList.toggle('active', !previewing);
  els.viewPreview.classList.toggle('active', previewing);
  els.body.hidden = previewing;
  els.preview.hidden = !previewing;
  if (previewing) {
    const n = getActive();
    els.preview.innerHTML =
      n && n.body.trim() ? renderMarkdown(n.body) : '<p class="empty-preview">Nothing to preview yet.</p>';
  }
}

function renderAll() {
  renderSidebar();
  renderEditor();
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

function scheduleSave() {
  const n = getActive();
  if (!n) return;
  n.title = els.title.value;
  n.folder = els.folder.value.trim();
  n.tags = parseTagsInput(els.tags.value);
  n.body = els.body.value;
  n.updatedAt = Date.now();
  clearTimeout(saveTimer);
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
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch {
    saved = null;
  }
  return (
    saved ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
}

function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  els.themeToggle.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
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

[els.title, els.folder, els.tags, els.body].forEach((el) => el.addEventListener('input', scheduleSave));

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
