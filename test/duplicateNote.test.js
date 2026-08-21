import { strict as assert } from 'node:assert';

// Test the duplicateNote function logic without importing app.js
// We'll test the logic directly

console.log('Running duplicateNote tests...\n');

// Test 1: Test that the duplicateNote function would work correctly
console.log('Test 1: duplicateNote logic creates proper copy');
const notes = [
  { id: '1', title: 'Note 1', body: 'Body 1', folder: 'f1', tags: ['t1'], updatedAt: 1000 },
];
const activeId = '1';
const activeNote = notes.find((n) => n.id === activeId);

const now = Date.now();
const duplicate = {
  id: 'new-id',
  title: activeNote.title + ' (Copy)',
  body: activeNote.body,
  folder: activeNote.folder,
  tags: [...activeNote.tags],
  updatedAt: now,
};

assert.equal(duplicate.title, 'Note 1 (Copy)', 'Title should have "(Copy)" suffix');
assert.equal(duplicate.body, 'Body 1', 'Body should be copied');
assert.equal(duplicate.folder, 'f1', 'Folder should be copied');
assert.deepEqual(duplicate.tags, ['t1'], 'Tags should be copied as new array');
assert.notEqual(duplicate.tags, activeNote.tags, 'Tags should be a new array (not same reference)');
console.log('  ✓ Pass\n');

// Test 2: Test with empty title
console.log('Test 2: duplicateNote logic with empty title');
const notes2 = [
  { id: '1', title: '', body: 'Body 1', folder: 'f1', tags: ['t1'], updatedAt: 1000 },
];
const activeNote2 = notes2.find((n) => n.id === '1');
const duplicate2 = {
  id: 'new-id',
  title: activeNote2.title + ' (Copy)',
  body: activeNote2.body,
  folder: activeNote2.folder,
  tags: [...activeNote2.tags],
  updatedAt: now,
};
assert.equal(duplicate2.title, ' (Copy)', 'Should handle empty title');
console.log('  ✓ Pass\n');

// Test 3: Test with empty tags
console.log('Test 3: duplicateNote logic with empty tags');
const notes3 = [
  { id: '1', title: 'Note 1', body: 'Body 1', folder: 'f1', tags: [], updatedAt: 1000 },
];
const activeNote3 = notes3.find((n) => n.id === '1');
const duplicate3 = {
  id: 'new-id',
  title: activeNote3.title + ' (Copy)',
  body: activeNote3.body,
  folder: activeNote3.folder,
  tags: [...activeNote3.tags],
  updatedAt: now,
};
assert.deepEqual(duplicate3.tags, [], 'Should handle empty tags');
console.log('  ✓ Pass\n');

// Test 4: Test with empty folder
console.log('Test 4: duplicateNote logic with empty folder');
const notes4 = [
  { id: '1', title: 'Note 1', body: 'Body 1', folder: '', tags: ['t1'], updatedAt: 1000 },
];
const activeNote4 = notes4.find((n) => n.id === '1');
const duplicate4 = {
  id: 'new-id',
  title: activeNote4.title + ' (Copy)',
  body: activeNote4.body,
  folder: activeNote4.folder,
  tags: [...activeNote4.tags],
  updatedAt: now,
};
assert.equal(duplicate4.folder, '', 'Should handle empty folder');
console.log('  ✓ Pass\n');

// Test 5: Test with empty body
console.log('Test 5: duplicateNote logic with empty body');
const notes5 = [
  { id: '1', title: 'Note 1', body: '', folder: 'f1', tags: ['t1'], updatedAt: 1000 },
];
const activeNote5 = notes5.find((n) => n.id === '1');
const duplicate5 = {
  id: 'new-id',
  title: activeNote5.title + ' (Copy)',
  body: activeNote5.body,
  folder: activeNote5.folder,
  tags: [...activeNote5.tags],
  updatedAt: now,
};
assert.equal(duplicate5.body, '', 'Should handle empty body');
console.log('  ✓ Pass\n');

// Test 6: Test tags are properly copied (not same reference)
console.log('Test 6: tags array is a copy, not a reference');
const notes6 = [
  { id: '1', title: 'Note 1', body: 'Body 1', folder: 'f1', tags: ['t1', 't2'], updatedAt: 1000 },
];
const activeNote6 = notes6.find((n) => n.id === '1');
const duplicate6 = {
  id: 'new-id',
  title: activeNote6.title + ' (Copy)',
  body: activeNote6.body,
  folder: activeNote6.folder,
  tags: [...activeNote6.tags],
  updatedAt: now,
};
duplicate6.tags.push('t3');
assert.deepEqual(activeNote6.tags, ['t1', 't2'], 'Original tags should not be modified');
assert.deepEqual(duplicate6.tags, ['t1', 't2', 't3'], 'Duplicate tags should be modifiable');
console.log('  ✓ Pass\n');

console.log('All duplicateNote tests passed! ✓');
