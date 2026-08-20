'use strict';
// Test the el() DOM helper function
// We need a minimal DOM shim since Node.js doesn't have document

import { describe, it } from 'node:test';
import assert from 'node:assert';

// Minimal DOM shim for testing
class TextNode {
  constructor(data) {
    this.data = data;
    this.nodeType = 3; // TEXT_NODE
  }
}

class ElementNode {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.childNodes = [];
    this.attributes = {};
    this.className = '';
    this.dataset = {};
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
    if (name === 'class') {
      this.className = value;
    } else if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      this.dataset[key] = value;
    }
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  hasAttribute(name) {
    return name in this.attributes;
  }

  appendChild(child) {
    this.childNodes.push(child);
  }
}

// Global document mock
const document = {
  createElement(tag) {
    return new ElementNode(tag);
  },
  createTextNode(data) {
    return new TextNode(data);
  },
};

// The el() helper function (copied from app.js)
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
          } else if (child instanceof ElementNode || child instanceof TextNode) {
            element.appendChild(child);
          }
        }
      }
    } else if (typeof children === 'string') {
      element.appendChild(document.createTextNode(children));
    } else if (children instanceof ElementNode || children instanceof TextNode) {
      element.appendChild(children);
    }
  }

  return element;
}

describe('el() helper', () => {
  it('creates a simple element with no props or children', () => {
    const div = el('div');
    assert.strictEqual(div.tagName, 'DIV');
    assert.strictEqual(div.childNodes.length, 0);
  });

  it('creates an element with text content', () => {
    const span = el('span', {}, 'Hello');
    assert.strictEqual(span.tagName, 'SPAN');
    assert.strictEqual(span.childNodes.length, 1);
    assert.strictEqual(span.childNodes[0].data, 'Hello');
  });

  it('creates an element with props', () => {
    const div = el('div', { id: 'test', class: 'foo bar' });
    assert.strictEqual(div.getAttribute('id'), 'test');
    assert.strictEqual(div.className, 'foo bar');
  });

  it('handles className prop as alias for class', () => {
    const div = el('div', { className: 'test-class' });
    assert.strictEqual(div.className, 'test-class');
  });

  it('creates an element with data attributes', () => {
    const span = el('span', { 'data-tag': 'test', 'data-id': '123' });
    assert.strictEqual(span.dataset.tag, 'test');
    assert.strictEqual(span.dataset.id, '123');
  });

  it('creates an element with boolean true attribute', () => {
    const input = el('input', { disabled: true });
    assert.strictEqual(input.getAttribute('disabled'), '');
  });

  it('skips boolean false, null, and undefined props', () => {
    const div = el('div', { hidden: false, 'data-null': null, 'data-undefined': undefined });
    assert.strictEqual(div.hasAttribute('hidden'), false);
    assert.strictEqual(div.hasAttribute('data-null'), false);
    assert.strictEqual(div.hasAttribute('data-undefined'), false);
  });

  it('handles role and tabindex attributes for accessibility', () => {
    const button = el('span', { role: 'button', tabindex: '0' });
    assert.strictEqual(button.getAttribute('role'), 'button');
    assert.strictEqual(button.getAttribute('tabindex'), '0');
  });

  it('handles selected attribute for option elements', () => {
    const option = el('option', { value: 'test', selected: true }, 'Test');
    assert.strictEqual(option.getAttribute('value'), 'test');
    assert.strictEqual(option.getAttribute('selected'), '');
    assert.strictEqual(option.childNodes.length, 1);
    assert.strictEqual(option.childNodes[0].data, 'Test');
  });

  it('creates note item structure with accessibility attributes', () => {
    const li = el('li', { class: 'note-item', 'data-id': '123', role: 'option', tabindex: '0' }, [
      el('div', { class: 'note-title' }, 'Test Note'),
      el('div', { class: 'note-sub' }, '1 hour ago'),
    ]);

    assert.strictEqual(li.tagName, 'LI');
    assert.strictEqual(li.className, 'note-item');
    assert.strictEqual(li.getAttribute('data-id'), '123');
    assert.strictEqual(li.getAttribute('role'), 'option');
    assert.strictEqual(li.getAttribute('tabindex'), '0');
    assert.strictEqual(li.childNodes.length, 2);
    assert.strictEqual(li.childNodes[0].tagName, 'DIV');
    assert.strictEqual(li.childNodes[0].className, 'note-title');
  });

  it('creates tag span with accessibility attributes', () => {
    const tag = el(
      'span',
      { class: 'tag selected', 'data-tag': 'test', role: 'button', tabindex: '0' },
      'Test Tag'
    );
    assert.strictEqual(tag.tagName, 'SPAN');
    assert.strictEqual(tag.className, 'tag selected');
    assert.strictEqual(tag.getAttribute('data-tag'), 'test');
    assert.strictEqual(tag.getAttribute('role'), 'button');
    assert.strictEqual(tag.getAttribute('tabindex'), '0');
    assert.strictEqual(tag.childNodes.length, 1);
    assert.strictEqual(tag.childNodes[0].data, 'Test Tag');
  });

  it('creates filter chip with accessibility attributes', () => {
    const chip = el(
      'span',
      { class: 'empty-filter-chip', 'data-filter': 'folder', role: 'button', tabindex: '0' },
      'Folder: test'
    );
    assert.strictEqual(chip.tagName, 'SPAN');
    assert.strictEqual(chip.className, 'empty-filter-chip');
    assert.strictEqual(chip.getAttribute('data-filter'), 'folder');
    assert.strictEqual(chip.getAttribute('role'), 'button');
    assert.strictEqual(chip.getAttribute('tabindex'), '0');
  });

  it('creates button with role attribute', () => {
    const btn = el(
      'button',
      { class: 'btn btn-ghost clear-filters', type: 'button', role: 'button' },
      'Clear filters'
    );
    assert.strictEqual(btn.tagName, 'BUTTON');
    assert.strictEqual(btn.className, 'btn btn-ghost clear-filters');
    assert.strictEqual(btn.getAttribute('type'), 'button');
    assert.strictEqual(btn.getAttribute('role'), 'button');
  });
});
