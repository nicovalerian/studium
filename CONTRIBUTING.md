# Contributing to Studium

Thank you for your interest in contributing to Studium!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/studium.git`
3. Install dependencies: `npm install`
4. Copy `.env.local.example` to `.env.local` and fill in your API keys
5. Start the dev server: `npm run dev`

## Code Style

- We use ESLint and Prettier for code formatting
- Run `npm run lint` to check for linting errors
- Run `npm run format` to auto-format code
- TypeScript strict mode is enabled

## Commit Messages

Use conventional commit format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding/updating tests
- `chore:` Maintenance tasks

## Pull Requests

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Run tests: `npm run test:run`
4. Run build: `npm run build`
5. Push and create a PR

## Questions?

Open an issue for any questions or suggestions.
