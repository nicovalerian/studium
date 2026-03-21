# Contributing to Studium

Keep changes small, verifiable, and consistent with the current product behavior. If you change user-visible flows, data shape, or deployment requirements, update the relevant documentation in the same pass.

## Development workflow

1. Install dependencies with `npm install`.
2. Copy `.env.local.example` to `.env.local`.
3. Run `npm run dev`.
4. Use `MOCK_EXTERNAL_APIS=1` when you want to exercise the UI without live AI providers.

## Before opening a PR

Run the checks that match your change:

- `npm run lint`
- `npm run format:check`
- `npm run test:run`
- `npm run build`
- `npm run e2e` for changes that affect critical browser flows

## Coding expectations

- Keep TypeScript strict-mode compatible.
- Do not commit secrets from `.env.local`.
- Preserve guest preview, email verification gating, and per-user data isolation unless the change is intentionally redesigning those rules.
- Update docs when setup steps, auth redirects, scripts, or provider requirements change.

## Commit and PR notes

- Prefer conventional commit prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, and `chore:`.
- Describe any required environment, schema, or deployment follow-up in the PR description.
- Include screenshots or short notes for UI changes when they help reviewers confirm behavior quickly.
