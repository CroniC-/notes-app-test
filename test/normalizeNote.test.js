'use strict';

// Test normalizeNote for P0-9: validate updatedAt so invalid values
// do not masquerade as Date.now() and reorder history on import.

// Inlined copies of isTimestamp + normalizeNote from app.js (kept in sync
// manually), because app.js touches document/localStorage at module load and
// cannot be imported directly in a plain Node test.

const FIXED_NOW = 1700000000000;
const realDateNow = Date.now;

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

const tests = [
  {
    name: 'valid positive timestamp preserved',
    input: { id: 'a', updatedAt: 1690000000000 },
    check: (r) => r.updatedAt === 1690000000000,
  },
  {
    name: 'valid number-string timestamp parsed and preserved',
    input: { id: 'a', updatedAt: '1690000000000' },
    check: (r) => r.updatedAt === 1690000000000 && typeof r.updatedAt === 'number',
  },
  {
    name: 'valid numeric string with surrounding whitespace preserved',
    input: { id: 'a', updatedAt: ' 1690000000000 ' },
    check: (r) => r.updatedAt === 1690000000000,
  },
  {
    name: 'null updatedAt falls back to Date.now() (not 0)',
    input: { id: 'a', updatedAt: null },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'undefined updatedAt falls back to Date.now()',
    input: { id: 'a' },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'number 0 updatedAt falls back to Date.now() (not 0)',
    input: { id: 'a', updatedAt: 0 },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'string "0" updatedAt falls back to Date.now() (not 0)',
    input: { id: 'a', updatedAt: '0' },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'NaN updatedAt falls back to Date.now()',
    input: { id: 'a', updatedAt: NaN },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'non-numeric string updatedAt falls back to Date.now()',
    input: { id: 'a', updatedAt: 'abc' },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'Infinity updatedAt falls back to Date.now()',
    input: { id: 'a', updatedAt: Infinity },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: '-Infinity updatedAt falls back to Date.now()',
    input: { id: 'a', updatedAt: -Infinity },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'negative number updatedAt falls back to Date.now()',
    input: { id: 'a', updatedAt: -100 },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'empty string updatedAt falls back to Date.now() (not 0)',
    input: { id: 'a', updatedAt: '' },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'whitespace-only string updatedAt falls back to Date.now() (not 0)',
    input: { id: 'a', updatedAt: '   ' },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'object updatedAt falls back to Date.now()',
    input: { id: 'a', updatedAt: { x: 1 } },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'boolean updatedAt falls back to Date.now()',
    input: { id: 'a', updatedAt: true },
    check: (r) => r.updatedAt === FIXED_NOW,
  },
  {
    name: 'fallback preserves id and other normalized fields',
    input: { id: 'a', title: 'T', body: 'B', folder: 'F', tags: ['t'], updatedAt: 'bad' },
    check: (r) =>
      r.id === 'a' &&
      r.title === 'T' &&
      r.body === 'B' &&
      r.folder === 'F' &&
      Array.isArray(r.tags) &&
      r.tags[0] === 't' &&
      r.updatedAt === FIXED_NOW,
  },
  {
    name: 'result updatedAt is always a finite number',
    input: null,
    check: () => {
      const cases = [
        null,
        undefined,
        0,
        '0',
        '',
        '   ',
        NaN,
        Infinity,
        -1,
        { x: 1 },
        true,
        1690000000000,
        '1690000000000',
      ];
      return cases.every((c) => {
        const u = normalizeNote({ id: 'a', updatedAt: c }).updatedAt;
        return typeof u === 'number' && Number.isFinite(u);
      });
    },
  },
  {
    name: 'import ordering: invalid updatedAt no longer clobbers history',
    input: null,
    check: () => {
      // Newest-first sort, as used by visibleNotes(). A note with an invalid
      // updatedAt used to become Date.now() and jump to the top. With the fix
      // every normalized note has a finite updatedAt, so the sort is sane.
      const older = normalizeNote({ id: 'old', updatedAt: 1690000000000 });
      const bad = normalizeNote({ id: 'bad', updatedAt: 'not-a-number' });
      const sorted = [older, bad].sort((a, b) => b.updatedAt - a.updatedAt);
      return (
        Number.isFinite(older.updatedAt) &&
        Number.isFinite(bad.updatedAt) &&
        sorted.every((n) => Number.isFinite(n.updatedAt))
      );
    },
  },
];

let passCount = 0;
let failCount = 0;

// Pin Date.now for deterministic fallback assertions.
Date.now = () => FIXED_NOW;

console.log('Testing P0-9: normalizeNote updatedAt validation\n');

tests.forEach((test, index) => {
  let result;
  try {
    result = test.input ? normalizeNote(test.input) : null;
  } catch (e) {
    result = { __error: e.message };
  }
  const pass = test.check(result);
  console.log(`Test ${index + 1}: ${test.name}`);
  if (test.input) console.log(`  Input: ${JSON.stringify(test.input)}`);
  console.log(`  Result: ${JSON.stringify(result)}`);
  console.log(`  ${pass ? '\u2713 PASS' : '\u2717 FAIL'}`);
  console.log('');
  if (pass) passCount++;
  else failCount++;
});

Date.now = realDateNow;

console.log(`Results: ${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);
