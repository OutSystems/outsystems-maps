# Contributing to OutSystems Maps

Thank you for contributing to OutSystems Maps. This guide covers the development workflow and standards for this TypeScript mapping component library.

## Code of Conduct

We must follow the code of conduct of OutSystems.

## Development Setup

**Prerequisites:**
- Node.js >= 12
- npm
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

**Recommended VS Code Extensions:**
- Document This (JSDoc comment templates)
- ESLint (code quality enforcement)
- Prettier - Code formatter

**Setup:**
```bash
npm install
npm run dev  # Starts development server at http://localhost:3000
```

The development server watches for TypeScript changes and recompiles automatically with hot reload.

## Development Workflow

### Branch Naming

Create branches from `dev` following the pattern `<JIRA-ID>` or `<JIRA-ID>-description`:

```bash
git checkout dev
git pull origin dev
git checkout -b ROU-1234
```

Examples: `ROU-12619`, `ROU-12504-fix-marker-clustering`

Branches named `release/*` or `merge/*` are exempt from PR title validation.

### Commit Messages

No strict commit format is enforced. Use clear, descriptive messages that explain the change.

### Pull Request Requirements

**PR Title Format:**

PR titles must match the regex `^([A-Z][A-Z0-9]*-\d+(:)?\s\w)` (enforced by CI):

```
<JIRA-ID> <description>
```

Examples:
- `ROU-12619 Fix marker clustering performance`
- `ROU-12558 Mark release as latest`

**Required Labels:**

PRs must have at least one of these labels (enforced by CI):
- `feature`
- `bug` or `bugfix`
- `dependencies` or `dependency`
- `chore`

PRs with `do not merge` label will be blocked from merging.

**PR Content Requirements:**

The PR template requires:
- Link to sample page demonstrating the change
- Problem description ("What was happening?")
- Solution description ("What was done?")
- Test steps to verify the fix
- Screenshots or animated GIFs
- Checklist confirmation (tested locally, documented, ESLint clean, etc.)

**Before Submitting:**
1. Test locally: `npm run dev`
2. Build succeeds: `npm run build`
3. No ESLint errors: `npm run lint`
4. Add JSDoc comments (type `/**` above functions)



## Building and Testing

| Command | Description |
|---------|-------------|
| `npm run setup` | Install dependencies and start dev server |
| `npm run dev` | Start development server with hot reload at http://localhost:3000 |
| `npm run build` | Production build: clean + transpile + lintfix + lint |
| `npm run lint` | Check code style (ESLint) |
| `npm run lintfix` | Auto-fix ESLint issues |
| `npm run prettier` | Format all JS/TS/CSS files |
| `npm run docs` | Generate TypeDoc documentation |

**Note:** `npm test` is not configured. Manual testing via the dev server and sample pages is required.

### Testing

Automated tests are maintained in a separate private repository: [outsystems-maps-tests](https://github.com/OutSystems/outsystems-maps-tests)

To run tests locally (requires `gh` CLI):
```bash
gh repo clone OutSystems/outsystems-maps-tests ../outsystems-maps-tests
cd ../outsystems-maps-tests
npm run local -- --browsers=chrome --environment=dev --map=web
```

**Manual Testing Resources:**
- Development server: `npm run dev` → http://localhost:3000
- Sample app: https://www.outsystems.com/forge/component-overview/10984/outsystems-maps-sample
- Living documentation: https://outsystemsui.outsystems.com/OutSystemsMapsSample/

## Code Standards

### TypeScript

- **Target:** ES2017, compiled to AMD module
- **Output:** Single file at `dist/OutSystemsMaps.js` (configured in `tsconfig.json`)
- **Style:** Strict ESLint rules enforced (`.eslintrc.json`)

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

Class members must be alphabetically ordered within groups (enforced by ESLint `@typescript-eslint/member-ordering`):

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

Document all public APIs using JSDoc comments. VS Code's "Document This" extension provides templates when you type `/**` above a function.

**Architectural Decision Records:**

Architectural decisions are documented in `docs/adr/`. Follow the template in `docs/adr/ADR-0000-Title-of-ADR.md` when creating new ADRs.

## Common Patterns

**Provider Abstraction:**

When modifying provider-specific behavior:
- Google Maps implementation: `src/Providers/Maps/Google/`
- Leaflet implementation: `src/Providers/Maps/Leaflet/`
- Never import provider types into `src/OSFramework/` or `src/OutSystems/` namespaces

See [ARCHITECTURE.md](../ARCHITECTURE.md) for details on the provider abstraction pattern.

**Adding New Features:**

See [CLAUDE.md](../CLAUDE.md#common-tasks) for step-by-step guidance on adding new map features or providers.

## Support and Communication

**External Contributors:**

Contact the UI Components team via [component support page](https://www.outsystems.com/forge/component-discussions/9909/OutSystems+Maps)

**Internal Contributors:**

Slack channel `#rd-uicomponents-contributors` (business days, 2-3 PM PT)
Trusted Committer: [UI Components team on support rotation](mailto:rd.uicomponents.team@outsystems.com)


## Trusted Committers

Our Trusted Committer will always be the [UI Components team member on support rotation](mailto:rd.uicomponents.team@outsystems.com).


## Trusted Committer Availability Schedule

Our Trusted Committees are available internally on Slack channel _#rd-uicomponents-contributors_ on business days from 2PM-3PM (PT time).


## License

This repository is proprietary to OutSystems. All rights reserved.
