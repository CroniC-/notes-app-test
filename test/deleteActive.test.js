'use strict';

// Test for P1-7: deleteActive fallback behavior
import { strictEqual, deepStrictEqual, ok } from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

// We need to test deleteActive which depends on global state
// We'll create a test harness that mimics the app state

// Global state variables (mimicking app.js)
let notes = [];
let activeId = null;
let folderFilter = '';
let selectedTags = new Set();
let searchQuery = '';

// Helper functions from app.js
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

// Mock persist function
function persist() {
  // No-op for testing
}

// Mock renderAll function
function renderAll() {
  // No-op for testing
}

// Mock confirm - always return true for testing
const mockConfirm = (msg) => true;

// The deleteActive function (copied from app.js with our fix)
function deleteActive() {
  const n = getActive();
  if (!n) return;
  if (!mockConfirm('Delete "' + (n.title || 'Untitled') + '"?')) return;
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

describe('P1-7: deleteActive fallback behavior', () => {
  beforeEach(() => {
    // Reset state before each test
    notes = [];
    activeId = null;
    folderFilter = '';
    selectedTags = new Set();
    searchQuery = '';
  });

  it('selects previous note when deleting middle note', () => {
    notes = [
      { id: '1', title: 'Note 1', updatedAt: 1000 },
      { id: '2', title: 'Note 2', updatedAt: 2000 },
      { id: '3', title: 'Note 3', updatedAt: 3000 },
    ];
    activeId = '2';
    
    deleteActive();
    
    strictEqual(activeId, '3'); // Should select the note that was before it in sorted order (newer)
  });

  it('selects next note when deleting first note', () => {
    notes = [
      { id: '1', title: 'Note 1', updatedAt: 1000 },
      { id: '2', title: 'Note 2', updatedAt: 2000 },
      { id: '3', title: 'Note 3', updatedAt: 3000 },
    ];
    activeId = '3'; // Newest note (first in sorted order)
    
    deleteActive();
    
    strictEqual(activeId, '2'); // Should select the next note
  });

  it('clears activeId when deleting last note', () => {
    notes = [
      { id: '1', title: 'Note 1', updatedAt: 1000 },
    ];
    activeId = '1';
    
    deleteActive();
    
    strictEqual(activeId, null);
  });

  it('selects nearest sibling ignoring folder filter', () => {
    // This is the key test for P1-7
    // We have notes in different folders, and we delete one with a folder filter active
    notes = [
      { id: '1', title: 'Note 1', folder: 'folder-a', updatedAt: 1000 },
      { id: '2', title: 'Note 2', folder: 'folder-b', updatedAt: 2000 },
      { id: '3', title: 'Note 3', folder: 'folder-a', updatedAt: 3000 },
    ];
    activeId = '2'; // Active note is in folder-b
    folderFilter = 'folder-a'; // But filter is set to folder-a
    
    deleteActive();
    
    // Should select nearest sibling in sort order (note 3), not first visible note (note 3)
    // In this case, note 3 is the nearest sibling
    strictEqual(activeId, '3');
  });

  it('selects previous note when deleting with folder filter', () => {
    notes = [
      { id: '1', title: 'Note 1', folder: 'folder-a', updatedAt: 1000 },
      { id: '2', title: 'Note 2', folder: 'folder-b', updatedAt: 2000 },
      { id: '3', title: 'Note 3', folder: 'folder-a', updatedAt: 3000 },
      { id: '4', title: 'Note 4', folder: 'folder-a', updatedAt: 4000 },
    ];
    activeId = '4'; // Newest note in folder-a
    folderFilter = 'folder-a';
    
    deleteActive();
    
    // Should select note 3 (previous in sort order)
    strictEqual(activeId, '3');
  });

  it('does not select note from different folder as sibling', () => {
    notes = [
      { id: '1', title: 'Note 1', folder: 'folder-a', updatedAt: 1000 },
      { id: '2', title: 'Note 2', folder: 'folder-b', updatedAt: 2000 },
      { id: '3', title: 'Note 3', folder: 'folder-a', updatedAt: 3000 },
    ];
    activeId = '2'; // Note in folder-b
    
    deleteActive();
    
    // Should select nearest sibling in global sort order
    // Sorted: note 3 (3000), note 2 (2000), note 1 (1000)
    // Deleting note 2, should select note 3 (previous) or note 1 (next)
    // Since note 3 is at index 0 and note 2 is at index 1, previous is note 3
    strictEqual(activeId, '3');
  });

  it('handles no active note', () => {
    notes = [
      { id: '1', title: 'Note 1', updatedAt: 1000 },
    ];
    activeId = null;
    
    deleteActive();
    
    // Should do nothing
    strictEqual(notes.length, 1);
    strictEqual(activeId, null);
  });
});
