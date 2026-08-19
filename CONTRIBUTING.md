# Contributing to Notes App

Thank you for your interest in contributing to Notes App! We welcome contributions from everyone.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [How to Contribute](#-how-to-contribute)
- [Development Setup](#-development-setup)
- [Pull Request Process](#-pull-request-process)
- [Coding Guidelines](#-coding-guidelines)
- [Testing](#-testing)
- [Commit Message Guidelines](#-commit-message-guidelines)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/notes-app-test.git
   cd notes-app-test
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the app**: Simply open `index.html` in your browser, or start a local server:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```

## 🛠 How to Contribute

### Reporting Bugs

- Use the [Bug Report template](https://github.com/CroniC-/notes-app-test/issues/new?template=bug_report.md)
- Include clear steps to reproduce
- Provide screenshots if applicable
- Specify your browser and OS

### Suggesting Features

- Use the [Feature Request template](https://github.com/CroniC-/notes-app-test/issues/new?template=feature_request.md)
- Explain the problem you're trying to solve
- Describe your proposed solution
- Consider alternatives you've thought about

### Submitting Code

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Add tests for new functionality
4. Run tests and lint:
   ```bash
   npm test
   npm run lint
   npm run format
   ```
5. Commit your changes with a descriptive message
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request

## 💻 Development Setup

### Prerequisites

- Node.js 18+ (for running tests)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
npm install
```

This installs development dependencies (ESLint, Prettier, Husky).

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
node --test test/markdown.test.js
```

### Linting and Formatting

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Auto-format all files
npm run format
```

### Git Hooks

This project uses Husky for git hooks. After installing dependencies, run:

```bash
npm run prepare
```

This sets up a pre-commit hook that runs linting and formatting checks before each commit.

## 📝 Pull Request Process

1. **Fill out the PR template** completely
2. **Link to any related issues** using `Closes #123` or `Fixes #456`
3. **Ensure all tests pass** (`npm test`)
4. **Ensure linting passes** (`npm run lint`)
5. **Ensure formatting is correct** (`npm run format:check`)
6. **Add screenshots** if your PR changes the UI
7. **Wait for review** - At least one maintainer must approve your PR
8. **Address feedback** - Make requested changes and push new commits

## 📜 Coding Guidelines

### JavaScript

- Use ES6+ features (arrow functions, template literals, etc.)
- Use `const` by default, `let` when reassignment is needed
- Use strict equality (`===` and `!==`)
- Avoid `console.log` in production code (use `console.warn` or `console.error` for debugging)
- Follow the existing code style and patterns

### CSS

- Use CSS custom properties (variables) for colors and common values
- Follow the existing naming conventions
- Keep selectors simple and specific
- Use flexbox and grid for layout

### HTML

- Use semantic HTML5 elements
- Include appropriate ARIA attributes for accessibility
- Keep the structure clean and well-organized

### General

- Keep functions small and focused
- Add comments for complex logic
- Write descriptive commit messages
- Test your changes thoroughly

## ✅ Testing

All code changes should be accompanied by tests. This project uses Node.js's built-in test runner.

### Test Structure

- Test files are in the `test/` directory
- Each test file corresponds to a module or feature
- Use descriptive test names
- Test both happy paths and edge cases

### Running Tests

```bash
# All tests
npm test

# Specific test file
node --test test/markdown.test.js

# Watch mode (not supported by node --test, use nodemon or similar)
```

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

### Format

```
type(scope): subject

body

footer
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Examples

```bash
# Good commit messages
feat(markdown): add strikethrough support
fix(storage): prevent duplicate note IDs
docs(readme): update feature list
docs: add contribution guidelines
refactor(app): extract markdown rendering logic
chore: update eslint configuration

# Bad commit messages (avoid these)
fixed bug
update
wip
changes
```

### Scope

The scope should be the file or module affected by the change:
- `app` for changes to `app.js`
- `style` for changes to `style.css`
- `markdown` for markdown-related changes
- `storage` for storage-related changes
- Omit scope if the change affects multiple areas

## 🙏 Thank You!

Your contributions help make Notes App better for everyone. Thank you for taking the time to contribute!

## 📄 License

By contributing to this project, you agree to license your contributions under the [MIT License](LICENSE).
