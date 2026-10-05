# LeadHive Web

React (JavaScript / JSX) website for the LeadHive platform: a marketing site plus interactive demos for each product feature (YouTube auto-reply bot, TIS visa lead generator, and more to come).

## Design Principles

1. **Feature-based.** Each product feature is a self-contained folder that owns its data, service, hooks, components and pages.
2. **One-way dependencies.** `app` -> `features` -> `shared`. Never the reverse.
3. **Features are isolated.** A feature never imports from another feature.
4. **Registry-driven.** Nav, feature grid and routes are generated from a list of feature manifests. Adding a feature never requires editing marketing code.
5. **Strict layering inside a feature.** Component -> Hook -> Service -> Shared API client.
6. **Tailwind only.** No custom CSS, no CSS Modules, no inline `style`, no `@apply`.

## Stack

| Concern | Choice |
|---|---|
| Build | Vite + React (JavaScript, JSX) |
| Routing | React Router (lazy-loaded feature routes) |
| Server state | TanStack Query |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Class helpers | `clsx` + `tailwind-merge` (`cn()`), `class-variance-authority` (variants) |
| Icons | `lucide-react` |
| Props validation | `prop-types` |
| Lint / format | ESLint (+ `eslint-plugin-boundaries`), Prettier (+ `prettier-plugin-tailwindcss`) |
| Tests | Vitest + React Testing Library |
| Git hooks | Husky + lint-staged |
| CI | GitHub Actions (lint, test, build) |

## File Structure

```
leadhive-web/
├── .github/workflows/ci.yml
├── .husky/pre-commit
├── public/
├── src/
│   ├── app/                         # Composition root (only place that knows all features)
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── providers.jsx            # QueryClientProvider, Router, ErrorBoundary
│   │   ├── router.jsx               # Routes generated from the registry
│   │   └── registry.js              # Array of all feature manifests
│   │
│   ├── shared/                      # Feature-agnostic building blocks
│   │   ├── api/
│   │   │   └── httpClient.js        # Base fetch wrapper (base URL, errors, timeouts)
│   │   ├── config/
│   │   │   └── env.js               # Central, validated access to import.meta.env
│   │   ├── ui/                      # Button, Card, Badge, Modal, Spinner (cva + cn)
│   │   ├── layouts/                 # SiteLayout, Navbar, Footer
│   │   ├── components/              # ErrorBoundary, PageLoader, NotFound
│   │   ├── hooks/                   # useMediaQuery, useDebounce, ...
│   │   ├── lib/
│   │   │   └── cn.js                # clsx + tailwind-merge helper
│   │   ├── constants/
│   │   │   └── featureStatus.js     # LIVE / BETA / COMING_SOON
│   │   └── styles/
│   │       └── theme.css            # Tailwind entry: @import + @theme tokens ONLY
│   │
│   ├── features/
│   │   ├── marketing/               # Platform-level pages (not a product feature)
│   │   │   ├── pages/               # HomePage, PricingPage, ContactPage
│   │   │   ├── sections/            # Hero, FeatureGrid, HowItWorks, CTA
│   │   │   ├── components/
│   │   │   └── index.js
│   │   │
│   │   ├── demo/                    # Generic demo framework
│   │   │   ├── components/
│   │   │   │   └── DemoShell.jsx    # Frame, header, reset, disclaimer, loading/error states
│   │   │   ├── pages/
│   │   │   │   └── DemoPage.jsx     # Resolves :slug -> feature Demo component
│   │   │   └── index.js
│   │   │
│   │   ├── youtube/                 # Product feature: YouTube auto-reply bot
│   │   │   ├── data/
│   │   │   │   ├── content.js       # Static marketing copy, steps, bullets
│   │   │   │   └── mock.js          # Fallback/demo seed data
│   │   │   ├── services/
│   │   │   │   └── youtube.service.js   # Connection layer: backend calls via httpClient
│   │   │   ├── hooks/
│   │   │   │   ├── useDemoVideo.js
│   │   │   │   └── useDemoComments.js
│   │   │   ├── components/          # CommentList, CommentForm, VideoEmbed, YoutubeIcon
│   │   │   ├── pages/
│   │   │   │   ├── YoutubeFeaturePage.jsx
│   │   │   │   └── YoutubeDemo.jsx
│   │   │   ├── sections/
│   │   │   │   └── YoutubeSection.jsx
│   │   │   ├── __tests__/
│   │   │   ├── manifest.js
│   │   │   └── index.js             # Public API: exports manifest only
│   │   │
│   │   └── tis-leads/               # Product feature: TIS visa lead generator
│   │       ├── data/                # content.js, scripted-conversation.js
│   │       ├── services/            # tis.service.js (only if demo hits a real endpoint)
│   │       ├── hooks/               # useChatDemo.js
│   │       ├── components/          # ChatWindow, MessageBubble, LeadScoreCard
│   │       ├── pages/
│   │       ├── sections/
│   │       ├── __tests__/
│   │       ├── manifest.js
│   │       └── index.js
│   │
│   └── test/
│       └── setup.js                 # Vitest + Testing Library setup
│
├── .env.example
├── .prettierrc
├── eslint.config.js                 # Includes dependency-boundary rules
├── index.html
├── jsconfig.json                    # Path alias for editor support
├── package.json
├── vite.config.js                   # Tailwind plugin, path alias, Vitest config
└── README.md
```

## Styling Rules (Tailwind only)

- All styling is Tailwind utility classes in JSX.
- The only stylesheet is `src/shared/styles/theme.css`. It contains the Tailwind import and design tokens, never component rules.
- No `*.css` or `*.module.css` files in features, no inline `style={{}}`, no `@apply`.
- Design tokens (brand colors, fonts, radii) live in `@theme` so they become utilities like `bg-brand-500`.
- Reusable look and feel is a React component, not a CSS class. Variants use `cva`, conditional/merged classes use `cn()`.
- Dark mode and responsiveness use Tailwind variants (`dark:`, `md:`), never custom media queries.
- Prettier sorts class names automatically via `prettier-plugin-tailwindcss`.

## Layer Responsibilities (inside a feature)

| Layer | Owns | Must NOT |
|---|---|---|
| `data/` | Static content, mock/seed data | Fetch anything, import React |
| `services/` | API calls, request/response mapping | Import React, hold UI state |
| `hooks/` | Server state (TanStack Query), demo state, orchestration | Call `fetch` directly, render JSX |
| `components/` | Presentational UI (Tailwind classes) | Call services directly |
| `pages/` / `sections/` | Compose components + hooks | Contain business logic |

Data flow: `Component -> Hook -> Service -> shared/api/httpClient -> Backend`
