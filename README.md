# LeadHive Web

React (JavaScript / JSX) website for the LeadHive platform: a marketing site plus interactive demos for each product feature (YouTube auto-reply bot, TIS visa lead generator, and more to come).

## Design Principles

1. **Feature-based.** Each product feature is a self-contained folder owning its content, demo, and (only if needed) service and hooks.
2. **One-way dependencies.** `app` -> `features` -> `shared`. Never the reverse.
3. **Features are isolated.** A feature never imports from another feature, and nothing outside `app` imports more than one feature.
4. **Content-driven.** A feature exports data plus one Demo component. Generic templates render the feature page, home card and nav. Adding a feature needs no page code.
5. **Layers only when needed.** `services/` and `hooks/` exist only in features that call a backend.
6. **Tailwind only.** No custom CSS, no CSS Modules, no inline `style`, no `@apply`.

## Stack

| Concern | Choice |
|---|---|
| Build | Vite + React (JavaScript, JSX) |
| Routing | React Router (lazy-loaded demos) |
| Server state | TanStack Query (only for features hitting an API) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| UI kit | shadcn/ui (Radix + `cva` + `cn`), icons from `lucide-react` |
| SEO | `react-helmet-async` via a shared `Seo` component |
| Type safety | `checkJs` + JSDoc typedefs (no TypeScript) |
| Lint / format | ESLint (`eslint-plugin-boundaries`, `jsx-a11y`), Prettier (+ `prettier-plugin-tailwindcss`) |
| Tests | Vitest + React Testing Library |
| Git hooks / CI | Husky + lint-staged, GitHub Actions (lint, test, build) |

## File Structure

```
leadhive-web/
├── .github/workflows/ci.yml
├── .husky/pre-commit
├── public/                          # favicon, og-image.png
├── src/
│   ├── app/                         # Composition root (ONLY place importing all features)
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── providers.jsx            # HelmetProvider, QueryClientProvider, Router, ErrorBoundary
│   │   ├── router.jsx               # Routes generated from the registry
│   │   └── registry.js              # Array of all feature manifests
│   │
│   ├── features/
│   │   ├── marketing/               # Platform pages. Props-driven, never imports the registry
│   │   │   ├── pages/               # HomePage, FeaturePage (generic template), PricingPage, ContactPage
│   │   │   ├── sections/            # Hero, FeatureGrid, HowItWorks, CTA
│   │   │   ├── components/          # FeatureCard, StepList, StatusBadge
│   │   │   └── index.js
│   │   │
│   │   ├── youtube/                 # Product feature: YouTube auto-reply bot
│   │   │   ├── content.js           # Marketing copy, steps, benefits (pure data)
│   │   │   ├── Demo.jsx             # Interactive demo (lazy-loaded)
│   │   │   ├── components/          # CommentList, CommentForm, VideoEmbed
│   │   │   ├── services/            # youtube.service.js (backend calls)
│   │   │   ├── hooks/               # useDemoVideo.js, useDemoComments.js
│   │   │   ├── mock.js              # Fallback data if the API fails
│   │   │   ├── __tests__/
│   │   │   ├── manifest.js
│   │   │   └── index.js             # Public API: exports manifest only
│   │   │
│   │   └── tis-leads/               # Product feature: TIS visa lead generator
│   │       ├── content.js
│   │       ├── Demo.jsx             # Scripted chat demo (local state, no service needed)
│   │       ├── components/          # ChatWindow, MessageBubble, LeadScoreCard
│   │       ├── script.js            # Scripted conversation data
│   │       ├── manifest.js
│   │       └── index.js
│   │
│   ├── shared/                      # Feature-agnostic. Imports nothing from features/app
│   │   ├── ui/                      # shadcn/ui components (Button, Card, Dialog, Tabs, ...)
│   │   ├── components/              # DemoShell, Seo, ErrorBoundary, PageLoader, NotFound
│   │   ├── layouts/                 # SiteLayout, Navbar, Footer (props-driven nav items)
│   │   ├── api/httpClient.js        # Base fetch wrapper (base URL, errors, timeout)
│   │   ├── config/env.js            # Validated access to import.meta.env
│   │   ├── hooks/                   # useMediaQuery, useDebounce
│   │   ├── lib/cn.js                # clsx + tailwind-merge
│   │   ├── constants/featureStatus.js
│   │   ├── types.js                 # JSDoc typedefs (FeatureManifest, FeatureContent)
│   │   └── styles/theme.css         # Tailwind entry: @import + @theme tokens ONLY
│   │
│   └── test/setup.js
│
├── .env.example
├── .prettierrc
├── components.json                  # shadcn/ui config
├── eslint.config.js
├── index.html
├── jsconfig.json                    # alias + "checkJs": true
├── package.json
├── vite.config.js
└── README.md
```

## Dependency Rules

- `shared` imports nothing from `features` or `app`.
- `features/*` import only from `shared`.
- `features/*` never import sibling features.
- Outside code imports a feature only through its `index.js`.
- `marketing` receives features as props (from `app`), so it never imports the registry or other features.
- `app` is the only layer that imports multiple features.

Enforced with `eslint-plugin-boundaries` so violations fail lint and CI.


| Route | Renders |
|---|---|
| `/` | `HomePage` (feature grid from `features` prop) |
| `/features/:slug` | generic `FeaturePage` driven by `manifest.content` |
| `/demo/:slug` | `manifest.Demo` inside `shared/components/DemoShell` |
| `*` | `NotFound` |

## Inside a Feature

| File / folder | Owns | Must NOT |
|---|---|---|
| `content.js` | Pure data (copy, steps, benefits) | Import React or fetch |
| `Demo.jsx` | Composes components + hooks | Call `fetch` directly |
| `components/` | Presentational UI (Tailwind classes) | Call services directly |
| `hooks/` | Server state (TanStack Query), demo state | Call `fetch` directly, render JSX |
| `services/` | Backend calls via `httpClient`, request/response mapping | Import React, hold UI state |
| `mock.js` | Fallback data | Be imported by other features |

Data flow (features with a backend): `Component -> Hook -> Service -> shared/api/httpClient -> Backend`.
Scripted demos (e.g. TIS): `Component -> local state`, no hooks or services.

## Styling Rules (Tailwind only)

- All styling is Tailwind utility classes in JSX.
- The only stylesheet is `src/shared/styles/theme.css`: the Tailwind import plus `@theme` design tokens, never component rules.
- No `*.css` or `*.module.css` in features, no inline `style={{}}`, no `@apply`.
- Reusable look and feel is a React component, not a CSS class. Variants use `cva`, merged classes use `cn()`.
- Dark mode and responsiveness use Tailwind variants (`dark:`, `md:`).
- Prettier sorts classes automatically.
