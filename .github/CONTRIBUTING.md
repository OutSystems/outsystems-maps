# Contributing to OutSystems Maps

Thank you for contributing to OutSystems Maps. This guide covers the development workflow and standards for this TypeScript-based mapping component library.

## Development Setup

**Prerequisites:**
- Node.js >= 12
- npm
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

**Recommended VS Code Extensions:**
- Document This
- ESLint
- Prettier - Code formatter

**Setup:**
```bash
npm install
npm run dev  # Starts development server at http://localhost:3000
```

The development server watches for TypeScript changes and recompiles automatically.

## Development Workflow

### Branch Naming

Create branches from `dev` following the pattern `<JIRA-ID>` or `<JIRA-ID>-description`:

```bash
git checkout dev
git pull origin dev
git checkout -b ROU-1234
```

Examples: `ROU-12619`, `ROU-12504-fix-marker-clustering`

### Commit Messages

No strict commit format enforced. Use clear, descriptive messages that explain the change.

### Pull Request Requirements

**PR Title Format:**
```
<JIRA-ID> <description>
```

Examples:
- `ROU-12619 Fix marker clustering performance`
- `ROU-12558 Mark release as latest`

The title must match the regex: `^([A-Z][A-Z0-9]*-\d+(:)?\s\w)` (enforced by CI).

**Required Labels:**

PRs must have at least one of these labels:
- `feature`
- `bug` / `bugfix`
- `dependencies` / `dependency`
- `chore`

PRs with `do not merge` label will be blocked.

**Before Submitting:**
1. Test locally using the dev server
2. Run `npm run build` to ensure the build succeeds
3. Fix all ESLint errors and warnings
4. Document your code using JSDoc comments (type `/**` above functions)
5. Fill out the PR template completely

**PR Template Requirements:**
- Link to sample page demonstrating the change
- What was happening (the problem)
- What was done (the solution)
- Test steps to verify the fix
- Screenshots or animated GIFs
- Checklist confirmation

PRs require approval from 2 team members before merge.

## Building and Testing

| Command | Description |
|---------|-------------|
| `npm run setup` | Install dependencies and start dev server |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle with linting |
| `npm run lint` | Check code style (ESLint) |
| `npm run lintfix` | Auto-fix ESLint issues |
| `npm run prettier` | Format all JS/TS/CSS files |
| `npm run docs` | Generate TypeDoc documentation |

**Note:** `npm test` is not configured. Manual testing via the dev server and sample pages is required.

## Testing

Automated tests are maintained in a separate repository: [outsystems-maps-tests](https://github.com/OutSystems/outsystems-maps-tests)

The test suite uses Gherkin/BDD framework with WebDriver.io and supports:
- Multiple browsers (Chrome, Firefox, Edge, Safari)
- Multiple environments (dev, qa)
- Local and SauceLabs execution

To run tests locally (from the tests repository):
```bash
npm run local -- --browsers=chrome --environment=dev --map=web
```

## Code Standards

### TypeScript

- **Target:** ES2017, compiled to AMD module
- **Output:** Single file at `dist/OutSystemsMaps.js`
- **Style:** Strict ESLint rules enforced (see `.eslintrc.json`)

### Naming Conventions

Enforced by ESLint:
- **Exported functions:** `StrictPascalCase`
- **Classes:** `StrictPascalCase`
- **Interfaces:** `IPascalCase` (must start with `I`)
- **Public/protected properties:** `strictCamelCase` (no leading underscore)
- **Private properties:** `_strictCamelCase` (leading underscore required)
- **Public/protected methods:** `strictCamelCase` (no leading underscore)
- **Private methods:** `_strictCamelCase` (leading underscore required)

### Member Ordering

Class members alphabetically ordered within groups:
1. Private fields
2. Protected fields
3. Public fields
4. Constructor
5. Private methods
6. Protected methods
7. Public methods

### Formatting

Enforced by Prettier (`.prettierrc.json`):
- Single quotes
- Semicolons required
- 120 character line width
- Tabs for indentation (width: 4)
- ES5 trailing commas

Run `npm run prettier` to format all files.

## Documentation

Document all public APIs using JSDoc comments. VS Code's "Document This" extension provides templates when you type `/**`.

Architectural decisions are documented in `docs/adr/`. Follow the template in `docs/adr/ADR-0000-Title-of-ADR.md`.

## Support and Communication

**External Contributors:**
Contact the UI Components team via [component support page](https://www.outsystems.com/forge/component-discussions/9909/OutSystems+Maps)

**Internal Contributors:**
Slack channel `#rd-uicomponents-contributors` (business days, 2-3 PM PT)
Trusted Committer: [UI Components team on support rotation](mailto:rd.uicomponents.team@outsystems.com)

## License

This repository is proprietary to OutSystems. All rights reserved.
