<!-- BEGIN:nextjs-agent-rules -->
Please read the bundled documentation in node_modules/next/dist/docs/ before writing any Next.js code.




# AGENTS.md — Coding-Agent Guide for IMPRO GENERATOR

This file is the authoritative reference for AI coding agents working in this repository.
Read it fully before touching any file.

---

## 1. Project Overview

**IMPRO GENERATOR** is a mobile-first, PWA-ready web application that generates random
improvisation-theater prompts. Users pick a category and a difficulty level; the app draws
a random word from MongoDB while excluding already-drawn words within the same session.

- Live URL: <https://impro-generator.vercel.app>
- Framework: **Next.js 16.x — App Router only** (no Pages Router)
- Runtime: Node.js ≥ 18 + Vercel Edge for middleware
- Language: **TypeScript 5** — `strict: true` is enforced
- Default locale: `it` (Italian)

---

## 2. Repository Layout

```
/
├── src/
│   ├── app/
│   │   ├── [lang]/                # Every user-facing route is locale-prefixed
│   │   │   ├── (index)/           # Home — Server Component + ClientAction
│   │   │   ├── (pages)/settings/  # Settings page
│   │   │   ├── login/             # OAuth sign-in
│   │   │   ├── getDictionary.ts   # Dynamic locale JSON loader
│   │   │   └── dictionaries/      # en.json  it.json  ro.json
│   │   ├── admin/                 # Protected admin dashboard
│   │   ├── api/
│   │   │   ├── auth/[...nextauth] # NextAuth catch-all
│   │   │   └── v1/                # All public/authed REST endpoints
│   │   ├── layout.tsx             # Root HTML shell (no providers)
│   │   ├── manifest.ts            # PWA Web App Manifest
│   │   └── auth.ts                # NextAuth config
│   ├── components/
│   │   ├── custom-ui/             # App-specific React components
│   │   └── ui/                    # shadcn/ui primitives (do not edit by hand)
│   ├── context/
│   │   ├── LocaleContext.tsx      # Locale state + cookie + URL sync
│   │   └── ThemeContext.tsx       # Theme state + localStorage
│   ├── hooks/
│   │   ├── useLongPress.ts        # Tap vs. 600 ms long-press
│   │   ├── useDoubleClick.ts      # Double-click detection
│   │   └── useOfflineWordCache.ts # Client-side word cache for offline mode
│   ├── lib/
│   │   ├── general.ts             # Shared utility functions
│   │   ├── rateLimit.ts           # In-memory per-IP rate limiter (60 req/min)
│   │   ├── isAdmin.ts             # Admin-check helper (DB flag + env fallback)
│   │   ├── offlineWordCache.ts    # Offline cache logic
│   │   ├── utils.ts               # cn() and other shadcn utilities
│   │   └── db/
│   │       ├── mongodb.ts         # Mongoose connection singleton
│   │       ├── mongodbClient.ts   # Raw MongoClient for NextAuth adapter
│   │       ├── models/            # Mongoose schemas (Category, Word, User, …)
│   │       ├── queries/           # Server-side cached query functions
│   │       ├── seed/              # seed.ts, seedFromCsv.ts
│   │       └── types/             # TypeScript interfaces mirroring DB models
│   ├── proxy.ts                   # Middleware: locale negotiation + auth re-export
│   └── types/                     # Global type augmentations (next-auth session)
├── assets/                        # Static seed assets (word-list CSVs, etc.)
├── public/                        # Static files served at /
├── next.config.ts                 # Next.js + PWA (Workbox) config
├── tailwind.config.ts
├── tsconfig.json                  # strict: true, paths alias @/* → src/*
└── eslint.config.mjs
```

---

## 3. Development Commands

```bash
# Install dependencies
npm install

# Start dev server (Turbopack, http://localhost:3000)
npm run dev

# Production build (also generates the service worker)
npm run build

# Start production server
npm run start

# Lint (eslint-config-next + core-web-vitals + TypeScript rules)
npm run lint

# Seed structured data (categories, languages, words) into MongoDB
npm run seed

# Seed additional words from CSV files in /assets/wordlist/
npm run seed:csv
```

There is **no test runner** configured in this repository. Validate changes by running
`npm run build` (catches TypeScript errors) and `npm run lint`.

---

## 4. Environment Variables

Create `.env.local` in the project root. **Never commit this file.**

```env
# ── Required ─────────────────────────────────────────────────────────────────
# src/lib/db/mongodb.ts reads MONGO_URI (not MONGODB_URI).
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# ── NextAuth v5 ───────────────────────────────────────────────────────────────
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# ── Admin bootstrap (optional) ────────────────────────────────────────────────
# Comma-separated email list — grants admin before any DB record has isAdmin=true
ADMIN_EMAILS=you@example.com
```

All runtime secret reads go through `process.env.*`; never hard-code credentials.

---

## 5. Next.js Architecture Rules

### 5.1 App Router only

All routes live under `src/app/`. The Pages Router (`src/pages/`) does **not** exist and
must not be created.

### 5.2 Locale-prefixed routes

Every user-facing page **must** live under `src/app/[lang]/`. The `[lang]` dynamic segment
is the locale code (`en`, `it`, `ro`). The middleware (`src/proxy.ts`) redirects bare paths
to the correct locale automatically.

Do not hardcode locale prefixes outside of `src/proxy.ts` and `src/app/[lang]/getDictionary.ts`.

### 5.3 Server Components vs. Client Components

| Rule | Detail |
|------|--------|
| Default to **Server Component** | Omit `"use client"` unless the component needs browser APIs, state, or event handlers. |
| Add `"use client"` at the **top of the file** | It must be the very first line, before any imports. |
| Never call `auth()` from a Client Component | Use `useSession()` from `next-auth/react` instead. |
| Never import a Client Component into a Server Component **without a boundary** | Wrap in a Client parent or pass as `children`. |
| Server Components can be `async` | Call `await connectDB()` and Mongoose queries directly. |

Current Client Components: `ClientAction`, `ActionButton`, `Screen`, `LevelChecker`,
`StopWatch`, `Navbar`, `ToggleAction`, `LocaleContext`, `ThemeContext`, `AdminDashboard`.

### 5.4 Route Handlers (API)

- Location: `src/app/api/v1/<resource>/route.ts`
- Export named HTTP-method functions: `export async function GET(req: NextRequest) {}`
- Always call `rateLimit(getClientIp(req))` at the top of every public endpoint and
  return `429` with a `Retry-After` header when the limit is exceeded.
- Use `auth()` from `@/app/auth` for protected endpoints.
- Set `Cache-Control` headers explicitly:
  - Deterministic list responses: `public, max-age=3600, stale-while-revalidate=86400`
  - Random / stochastic responses: `no-store`
  - Mutations: `no-store`

### 5.5 Middleware

`src/middleware.ts` re-exports `auth` as the default export from NextAuth — this is how
Next.js picks up the auth session on every request. The locale-negotiation function
(`proxy()`) in `src/proxy.ts` is imported by middleware but runs **inside** auth's
callback:

```
Request → NextAuth middleware (src/proxy.ts re-export) → locale negotiation → handler
```

The middleware matcher excludes `api`, `admin`, `_next/static`, `_next/image`, and static
assets — do not add new exclusions without updating the matcher in `src/proxy.ts`.

### 5.6 ISR and Data Caching

Use `unstable_cache` from `next/cache` for server-side data that should survive across
requests:

```ts
export const getCategories = unstable_cache(fetchFn, ['categories'], {
  revalidate: 3600,
  tags: ['categories'],
});
```

Call `revalidateTag('categories')` from a Route Handler or Server Action after any
mutation that changes category data. Do not add `export const revalidate = ...` to a
page if the data already has its own `unstable_cache` TTL — they would conflict.

The home page (`src/app/[lang]/(index)/page.tsx`) sets `export const revalidate = 3600`
as a page-level ISR guard.

---

## 6. TypeScript Conventions

- **`strict: true`** — all types must be explicit; avoid `any` except where the ESLint
  rule is intentionally disabled (`// NO explicit any IS ONLY FOR DEMO PURPOSES`).
- Path alias: `@/*` maps to `src/*`. Always use `@/` imports, never relative `../../`.
- Interfaces for DB types live in `src/lib/db/types/`. Match them to the Mongoose schema.
- Augment NextAuth session type in `src/types/` (e.g., adding `isAdmin` to `session.user`).
- All React component props must be typed (no implicit `any` props).

---

## 7. Database Patterns

### 7.1 Connection singleton

Always use `connectDB()` from `src/lib/db/mongodb.ts` before every Mongoose query.
It caches the connection on the global object to survive hot-reloads in development.

```ts
await connectDB();
const words = await Word.find(query);
```

Never instantiate a new `mongoose.connect()` call directly.

### 7.2 Model registration guard

Every model file uses the singleton pattern:

```ts
const Word: Model<IWord> =
  mongoose.models.Word || mongoose.model<IWord>('Word', WordSchema);
```

Always follow this pattern. Do not call `mongoose.model()` unconditionally — it throws
on hot reload.

### 7.3 Multilingual fields

`Word.word` and `Category.name` / `Category.description` are Mongoose `Map<String>` fields
keyed by locale code (`en`, `it`, `ro`). When reading them in a component or API:

```ts
const display = word.word[locale] ?? word.word['en'] ?? '';
```

Always fall back to `'en'` if the requested locale is absent.

### 7.4 Difficulty enum

```ts
type Difficulty = 'easy' | 'medium' | 'hard';
```

The API accepts numeric aliases (`1`=easy, `2`=medium, `3`=hard) for backwards
compatibility, but the DB stores the string form. Map via `LEVEL_ALIAS` in
`src/app/api/v1/words/route.ts`.

### 7.5 Aggregation over N+1

Prefer MongoDB aggregations (`$lookup`, `$group`, `$sample`) over multiple sequential
queries. Example: counting words per category is done in a single `$lookup` pipeline in
`getCategories.ts` — do not replace this with `Word.countDocuments()` in a loop.

---

## 8. API Conventions

### 8.1 Rate limiting

Every public `GET` endpoint must start with:

```ts
const { ok, retryAfter } = rateLimit(getClientIp(req));
if (!ok) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}
```

Current window: 60 requests per IP per 60 seconds (configured in `src/lib/rateLimit.ts`).

### 8.2 Auth guard for mutations

```ts
const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Admin-only endpoints additionally call `isAdmin(session)` from `src/lib/isAdmin.ts`.

### 8.3 Response shape

| Scenario | Shape |
|----------|-------|
| List endpoint | `{ metadata: { total, … }, data: T[] }` |
| Random draw | `{ data: T[] }` (array with 0 or 1 item) |
| Single resource | the resource object directly |
| Error | `{ error: string }` |

### 8.4 Versioning

All new endpoints go under `/api/v1/`. Do not create `/api/v0/` routes — the v0 prefix
is reserved for the legacy CSV-based API and is deprecated.

---

## 9. Internationalization Conventions

### 9.1 Supported locales

`it` (default), `en`, `ro`. Defined in two places — keep them in sync:

- `src/proxy.ts` — `const locales = ['it', 'ro', 'en']`
- `src/app/[lang]/getDictionary.ts` — the `languages` array

### 9.2 UI strings

Load via `getDictionary(locale)` in Server Components (it returns a JSON object).
In Client Components use `useLocale()` from `LocaleContext` to get the `dictionary`.

Never hard-code user-visible strings in English — always add the key to all three
dictionary files (`en.json`, `it.json`, `ro.json`).

### 9.3 Locale cookie

The active locale is persisted in a cookie named `locale` with a 1-year max-age.
The cookie is set by the middleware on every request and by `handleSetLocale` in
`LocaleContext` on user selection.

### 9.4 Adding a new locale

1. Add a `{lang}.json` dictionary file in `src/app/[lang]/dictionaries/`.
2. Append the locale code to `locales` in `src/proxy.ts`.
3. Append the locale to the `languages` array in `src/app/[lang]/getDictionary.ts`.
4. Add a `{ lang: '<code>' }` entry to `generateStaticParams` in
   `src/app/[lang]/(index)/page.tsx`.
5. Seed a new `Language` document and translated words via `npm run seed`.

---

## 10. Authentication Patterns

### 10.1 NextAuth v5 (beta)

Config: `src/app/auth.ts`. Exports: `{ handlers, signIn, signOut, auth }`.

- Session strategy: **JWT** (no DB session table).
- The `jwt` callback reads `isAdmin` from the `User` collection and attaches it to the
  token on every sign-in.
- The `session` callback forwards `isAdmin` onto `session.user`.

### 10.2 Checking admin access

```ts
// Server Component or Route Handler
import { auth } from '@/app/auth';
import { isAdmin } from '@/lib/isAdmin';

const session = await auth();
if (!isAdmin(session)) redirect('/');
```

`isAdmin()` returns `true` if `session.user.isAdmin === true` **or** if the user's email
is in the `ADMIN_EMAILS` environment variable (comma-separated). The env var is the
bootstrap escape hatch before the first admin DB record is created.

### 10.3 Client-side auth

```ts
import { useSession } from 'next-auth/react';
const { data: session } = useSession();
```

Never call `auth()` in a Client Component — it is a Server-only function.

### 10.4 Sign-in / error pages

Both are routed to `/it/login` (hardcoded in `src/app/auth.ts`).

---

## 11. PWA & Service Worker

The service worker is generated by `@ducanh2912/next-pwa` (Workbox) during
`npm run build`. It is **not** active in development.

Caching strategy (configured in `next.config.ts`):

| Resource pattern | Strategy | TTL |
|------------------|----------|-----|
| `/_next/static/**` | CacheFirst | 30 days |
| `/_next/image?*` | CacheFirst | 7 days |
| `/api/v1/categories*` | StaleWhileRevalidate | 24 h |
| `/api/v1/words*` | NetworkFirst (10 s) | 24 h |
| HTML pages (prod domain) | NetworkFirst (10 s) | 24 h |

Do not change these strategies without understanding how they interact with the
`Cache-Control` headers set in the Route Handlers.

---

## 12. Styling Conventions

- **Tailwind CSS v3** only — no inline `style={}` props unless animating dynamic values.
- Use `cn()` from `src/lib/utils.ts` (re-export of `clsx` + `tailwind-merge`) to merge
  conditional classes.
- Dark-mode is class-based: `darkMode: ["class"]` in `tailwind.config.ts`. The root
  `<html>` element gets `class="dark"` via `next-themes`.
- Custom animations (`marquee`, `marquee2`) and the monospace font stack (`Geist Mono`)
  are declared in `tailwind.config.ts` — extend there, not in `globals.css`.
- The retro CRT / Nokia aesthetic lives in `src/app/[lang]/globals.css`. Keep all
  global style overrides there.
- **Never edit** files under `src/components/ui/` directly — they are managed by
  `shadcn/ui` and will be overwritten on upgrades.

---

## 13. Component Conventions

- One component per file, file name matches the component name (`PascalCase.tsx`).
- Custom app components go in `src/components/custom-ui/`.
- Shared logic extracted to `src/hooks/` as `useCamelCase.ts` hooks.
- Context providers live in `src/context/` and export both the provider and a
  `use<Name>()` hook that throws if called outside the provider.

---

## 14. How to Verify Changes

Since there is no test suite, verify changes as follows:

1. **Type-check + build**
   ```bash
   npm run build
   ```
   A successful build means no TypeScript errors and no broken imports.

2. **Lint**
   ```bash
   npm run lint
   ```
   Fix all errors; warnings from disabled rules (`no-explicit-any`,
   `no-unescaped-entities`) can be ignored if intentional.

3. **Local dev smoke-test**
   ```bash
   npm run dev
   ```
   - Visit `http://localhost:3000` → should redirect to `http://localhost:3000/it`.
   - Test the main draw flow: select a category, tap a level, verify a word appears.
   - Switch locale via settings and verify the URL changes.

4. **API smoke-test** (requires a running MongoDB)
   ```
   GET http://localhost:3000/api/v1/categories
   GET http://localhost:3000/api/v1/words?action=<categoryId>&level=easy&sample=1
   ```

---

## 15. Common Pitfalls to Avoid

| Pitfall | Correct approach |
|---------|-----------------|
| Calling `auth()` in a Client Component | Use `useSession()` from `next-auth/react` |
| Importing from `@/app/auth` in a Client Component | Move auth logic to a Server Component or Route Handler |
| Creating a new Mongoose model with `mongoose.model(...)` unconditionally | Always use the `mongoose.models.X \|\| mongoose.model(...)` guard |
| Hardcoding locale strings (`/en/`, `/it/`) outside proxy/getDictionary | Read from the `locales` array in `src/proxy.ts` |
| Adding `Cache-Control: no-store` to a list endpoint | Only use `no-store` for random/stochastic responses |
| Skipping `rateLimit()` in a new Route Handler | Every public endpoint needs the rate-limit guard |
| Editing `src/components/ui/` files | These are shadcn-managed; customise via Tailwind tokens instead |
| Adding a new locale without updating both `src/proxy.ts` and `getDictionary.ts` | Both arrays must stay in sync or middleware will loop |


<!-- END:nextjs-agent-rules -->