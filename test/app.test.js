'use strict';

// Test harness for pure helpers from app.js
// These functions are DOM-free and side-effect free

import { strictEqual, deepStrictEqual, ok, throws } from 'node:assert';
import { describe, it } from 'node:test';

// === Pure helpers from app.js ===

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
  if (/^\s*[-*]\s+/.test(line)) return true;
  if (/^\s*\d+\.\s+/.test(line)) return true;
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

    if (/^\s*[-*]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      out.push('<ul>' + buf.map((li) => '<li>' + inline(li) + '</li>').join('') + '</ul>');
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
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

function normalizeNote(n) {
  return {
    id: n.id,
    title: typeof n.title === 'string' ? n.title : '',
    body: typeof n.body === 'string' ? n.body : '',
    folder: typeof n.folder === 'string' ? n.folder : '',
    tags: Array.isArray(n.tags) ? n.tags.filter((t) => typeof t === 'string') : [],
    updatedAt: Number(n.updatedAt) || Date.now(),
  };
}

// === Tests for escapeHtml ===

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    strictEqual(escapeHtml('<script>'), '&lt;script&gt;');
    strictEqual(escapeHtml('&'), '&amp;');
    strictEqual(escapeHtml('"'), '&quot;');
    strictEqual(escapeHtml("'"), '&#39;');
  });

  it('escapes multiple special characters', () => {
    strictEqual(escapeHtml('<a href="test">'), '&lt;a href=&quot;test&quot;&gt;');
  });

  it('handles empty string', () => {
    strictEqual(escapeHtml(''), '');
  });

  it('handles non-string input', () => {
    strictEqual(escapeHtml(null), 'null');
    strictEqual(escapeHtml(undefined), 'undefined');
    strictEqual(escapeHtml(123), '123');
  });

  it('does not escape safe characters', () => {
    strictEqual(escapeHtml('Hello World!'), 'Hello World!');
  });
});

// === Tests for parseTagsInput ===

describe('parseTagsInput', () => {
  it('parses comma-separated tags', () => {
    deepStrictEqual(parseTagsInput('tag1, tag2, tag3'), ['tag1', 'tag2', 'tag3']);
  });

  it('trims whitespace from tags', () => {
    deepStrictEqual(parseTagsInput('  tag1  , tag2 ,  tag3  '), ['tag1', 'tag2', 'tag3']);
  });

  it('removes empty tags', () => {
    deepStrictEqual(parseTagsInput('tag1,,tag2'), ['tag1', 'tag2']);
    deepStrictEqual(parseTagsInput(',tag1,,'), ['tag1']);
  });

  it('deduplicates tags', () => {
    deepStrictEqual(parseTagsInput('tag1, tag1, tag2'), ['tag1', 'tag2']);
  });

  it('handles empty string', () => {
    deepStrictEqual(parseTagsInput(''), []);
  });

  it('handles non-string input', () => {
    deepStrictEqual(parseTagsInput(null), ['null']);
    deepStrictEqual(parseTagsInput(undefined), ['undefined']);
  });

  it('handles tags with spaces', () => {
    deepStrictEqual(parseTagsInput('multi word tag, another'), ['multi word tag', 'another']);
  });
});

// === Tests for normalizeNote ===

describe('normalizeNote', () => {
  it('preserves valid note fields', () => {
    const note = {
      id: '123',
      title: 'Test Note',
      body: 'Test body',
      folder: 'test-folder',
      tags: ['tag1', 'tag2'],
      updatedAt: 1234567890,
    };
    deepStrictEqual(normalizeNote(note), note);
  });

  it('converts non-string title to empty string', () => {
    const note = { id: '1', title: 123, body: '', folder: '', tags: [], updatedAt: 0 };
    strictEqual(normalizeNote(note).title, '');
  });

  it('converts non-string body to empty string', () => {
    const note = { id: '1', title: '', body: null, folder: '', tags: [], updatedAt: 0 };
    strictEqual(normalizeNote(note).body, '');
  });

  it('converts non-string folder to empty string', () => {
    const note = { id: '1', title: '', body: '', folder: 123, tags: [], updatedAt: 0 };
    strictEqual(normalizeNote(note).folder, '');
  });

  it('filters non-string tags', () => {
    const note = {
      id: '1',
      title: '',
      body: '',
      folder: '',
      tags: ['valid', 123, null, 'also-valid'],
      updatedAt: 0,
    };
    deepStrictEqual(normalizeNote(note).tags, ['valid', 'also-valid']);
  });

  it('converts non-array tags to empty array', () => {
    const note = { id: '1', title: '', body: '', folder: '', tags: 'not-an-array', updatedAt: 0 };
    deepStrictEqual(normalizeNote(note).tags, []);
  });

  it('handles NaN updatedAt by falling back to Date.now()', () => {
    const note = { id: '1', title: '', body: '', folder: '', tags: [], updatedAt: 'invalid' };
    const result = normalizeNote(note);
    ok(typeof result.updatedAt === 'number');
    ok(!isNaN(result.updatedAt));
  });

  it('handles missing updatedAt by falling back to Date.now()', () => {
    const note = { id: '1', title: '', body: '', folder: '', tags: [] };
    const result = normalizeNote(note);
    ok(typeof result.updatedAt === 'number');
    ok(!isNaN(result.updatedAt));
  });

  it('preserves numeric updatedAt', () => {
    const ts = 1234567890;
    const note = { id: '1', title: '', body: '', folder: '', tags: [], updatedAt: ts };
    strictEqual(normalizeNote(note).updatedAt, ts);
  });
});

// === Tests for isBlockStart ===

describe('isBlockStart', () => {
  it('returns true for empty line', () => {
    ok(isBlockStart(''));
    ok(isBlockStart('   '));
  });

  it('returns true for headings', () => {
    ok(isBlockStart('# Heading'));
    ok(isBlockStart('## Heading'));
    ok(isBlockStart('### Heading'));
    ok(isBlockStart('#### Heading'));
    ok(isBlockStart('  # Heading with indent'));
  });

  it('returns true for code fences', () => {
    ok(isBlockStart('```'));
    ok(isBlockStart('```js'));
    ok(isBlockStart('  ```'));
  });

  it('returns true for blockquotes', () => {
    ok(isBlockStart('> quote'));
    ok(isBlockStart('  > quote with indent'));
  });

  it('returns true for unordered list markers', () => {
    ok(isBlockStart('- item'));
    ok(isBlockStart('* item'));
    ok(isBlockStart('  - item with indent'));
    ok(isBlockStart('  * item with indent'));
  });

  it('returns true for ordered list markers', () => {
    ok(isBlockStart('1. item'));
    ok(isBlockStart('123. item'));
    ok(isBlockStart('  1. item with indent'));
  });

  it('returns true for horizontal rules', () => {
    ok(isBlockStart('---'));
    ok(isBlockStart('***'));
    ok(isBlockStart('  ---  '));
  });

  it('returns false for regular text', () => {
    ok(!isBlockStart('regular text'));
    ok(!isBlockStart('  regular text with indent'));
  });
});

// === Tests for renderMarkdown ===

describe('renderMarkdown', () => {
  it('renders plain text as paragraph', () => {
    strictEqual(renderMarkdown('Hello World'), '<p>Hello World</p>');
  });

  it('renders multiple paragraphs', () => {
    const result = renderMarkdown('First\n\nSecond');
    ok(result.includes('<p>First</p>'));
    ok(result.includes('<p>Second</p>'));
  });

  it('renders headings', () => {
    strictEqual(renderMarkdown('# Heading'), '<h1>Heading</h1>');
    strictEqual(renderMarkdown('## Heading'), '<h2>Heading</h2>');
    strictEqual(renderMarkdown('### Heading'), '<h3>Heading</h3>');
    strictEqual(renderMarkdown('#### Heading'), '<h4>Heading</h4>');
  });

  it('renders bold text', () => {
    strictEqual(renderMarkdown('**bold**'), '<p><strong>bold</strong></p>');
  });

  it('renders italic text', () => {
    strictEqual(renderMarkdown('*italic*'), '<p><em>italic</em></p>');
  });

  it('renders inline code', () => {
    strictEqual(renderMarkdown('`code`'), '<p><code>code</code></p>');
  });

  it('renders links', () => {
    const result = renderMarkdown('[link](https://example.com)');
    ok(result.includes('<a href="https://example.com"'));
    ok(result.includes('target="_blank"'));
    ok(result.includes('rel="noopener"'));
  });

  it('does not render non-http links', () => {
    const result = renderMarkdown('[link](javascript:alert(1))');
    strictEqual(result, '<p>link</p>');
  });

  it('renders unordered lists', () => {
    const result = renderMarkdown('- item 1\n- item 2');
    ok(result.includes('<ul>'));
    ok(result.includes('<li>item 1</li>'));
    ok(result.includes('<li>item 2</li>'));
  });

  it('renders ordered lists', () => {
    const result = renderMarkdown('1. item 1\n2. item 2');
    ok(result.includes('<ol>'));
    ok(result.includes('<li>item 1</li>'));
    ok(result.includes('<li>item 2</li>'));
  });

  it('renders code blocks', () => {
    const result = renderMarkdown('```\ncode here\n```');
    ok(result.includes('<pre><code>code here</code></pre>'));
  });

  it('renders blockquotes', () => {
    const result = renderMarkdown('> quote\n> more');
    ok(result.includes('<blockquote>quote<br>more</blockquote>'));
  });

  it('renders horizontal rules', () => {
    const result = renderMarkdown('---');
    ok(result.includes('<hr>'));
  });

  it('escapes HTML in markdown', () => {
    const result = renderMarkdown('<script>alert(1)</script>');
    strictEqual(result, '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  });

  it('handles line breaks in paragraphs', () => {
    const result = renderMarkdown('line 1\nline 2');
    strictEqual(result, '<p>line 1<br>line 2</p>');
  });

  it('handles Windows line endings', () => {
    const result = renderMarkdown('line 1\r\nline 2');
    strictEqual(result, '<p>line 1<br>line 2</p>');
  });
});

// === Tests for timeAgo ===

describe('timeAgo', () => {
  it('returns "just now" for recent timestamps', () => {
    const recent = Date.now();
    strictEqual(timeAgo(recent), 'just now');
  });

  it('returns minutes for timestamps within an hour', () => {
    const oneMinAgo = Date.now() - 60000;
    strictEqual(timeAgo(oneMinAgo), '1 min ago');

    const fiftyNineMinAgo = Date.now() - 59 * 60000;
    strictEqual(timeAgo(fiftyNineMinAgo), '59 min ago');
  });

  it('returns hours for timestamps within a day', () => {
    const oneHourAgo = Date.now() - 60 * 60000;
    strictEqual(timeAgo(oneHourAgo), '1 h ago');

    const twentyThreeHoursAgo = Date.now() - 23 * 60 * 60000;
    strictEqual(timeAgo(twentyThreeHoursAgo), '23 h ago');
  });

  it('returns "yesterday" for timestamps from 1 day ago', () => {
    const yesterday = Date.now() - 24 * 60 * 60000;
    strictEqual(timeAgo(yesterday), 'yesterday');
  });

  it('returns days for timestamps within a week', () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60000;
    strictEqual(timeAgo(twoDaysAgo), '2 days ago');

    const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60000;
    strictEqual(timeAgo(sixDaysAgo), '6 days ago');
  });

  it('returns date string for older timestamps', () => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60000;
    const result = timeAgo(oneWeekAgo);
    // Should return a date string like "1/1/2024" (format varies by locale)
    ok(typeof result === 'string');
    ok(result.length > 0);
  });
});
