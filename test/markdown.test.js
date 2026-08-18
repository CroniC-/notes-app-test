'use strict';

// Test renderMarkdown for P0-2: paragraph parser fix

const escapeHtml = (s) => {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const isBlockStart = (line) => {
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
};

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

// Test suite
const tests = [
  {
    name: 'List at column 0',
    input: '- item 1\n- item 2',
    check: (r) => r.includes('<ul>') && r.includes('<li>item 1</li>') && r.includes('<li>item 2</li>')
  },
  {
    name: 'Asterisk list at column 0',
    input: '* item 1\n* item 2',
    check: (r) => r.includes('<ul>') && r.includes('<li>item 1</li>') && r.includes('<li>item 2</li>')
  },
  {
    name: 'Ordered list at column 0',
    input: '1. item 1\n2. item 2',
    check: (r) => r.includes('<ol>') && r.includes('<li>item 1</li>') && r.includes('<li>item 2</li>')
  },
  {
    name: 'Indented dash in paragraph (P0-2 fix)',
    input: 'Paragraph text\n  - indented dash',
    check: (r) => r.includes('<p>Paragraph text<br>  - indented dash</p>')
  },
  {
    name: 'Indented asterisk in paragraph (P0-2 fix)',
    input: 'Paragraph text\n  * indented asterisk',
    check: (r) => r.includes('<p>Paragraph text<br>  * indented asterisk</p>')
  },
  {
    name: 'Indented ordered list marker in paragraph (P0-2 fix)',
    input: 'Paragraph text\n  1. not a list',
    check: (r) => r.includes('<p>Paragraph text<br>  1. not a list</p>')
  },
  {
    name: 'Paragraph with blank line separation',
    input: 'First paragraph\n\nSecond paragraph',
    check: (r) => r.includes('<p>First paragraph</p>') && r.includes('<p>Second paragraph</p>')
  },
  {
    name: 'Paragraph followed by list with blank line',
    input: 'Start of paragraph\n\n- actual list item',
    check: (r) => r.includes('<p>Start of paragraph</p>') && r.includes('<ul>') && r.includes('<li>actual list item</li>')
  },
  {
    name: 'Multiple indented list-like lines in paragraph',
    input: 'Start\n  - item 1\n  * item 2\n  1. item 3',
    check: (r) => r.includes('<p>Start<br>  - item 1<br>  * item 2<br>  1. item 3</p>') && !r.includes('<ul>') && !r.includes('<ol>')
  },
  {
    name: 'Paragraph text then dash at column 0',
    input: 'Some text\n- not a list',
    check: (r) => r.includes('<p>Some text</p>') && r.includes('<ul>') && r.includes('<li>not a list</li>')
  },
  {
    name: 'Blockquote with content',
    input: '> quoted text\n> more text',
    check: (r) => r.includes('<blockquote>quoted text<br>more text</blockquote>')
  }
];

let passCount = 0;
let failCount = 0;

console.log('Testing P0-2: Paragraph parser with list-like lines\n');

tests.forEach((test, index) => {
  const result = renderMarkdown(test.input);
  const pass = test.check(result);
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`  Input: ${JSON.stringify(test.input)}`);
  console.log(`  Output: ${result}`);
  console.log(`  ${pass ? '✓ PASS' : '✗ FAIL'}`);
  console.log('');
  if (pass) passCount++;
  else failCount++;
});

console.log(`Results: ${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);
