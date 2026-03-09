# 🎭 IMPRO GENERATOR

> A mobile-first random prompt generator for improvisation theater — built with the Next.js App Router, React 19, and MongoDB.

This project was created for fun, with the idea of having a tool for improv shows or lessons. This web app (and potentially a future mobile app) aims to be creative and enjoyable. It is a friendly repository for anyone who wants to contribute and have fun.

[![Deployed on Vercel](https://img.shields.io/badge/deployed-vercel-black?logo=vercel)](https://impro-generator.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-private-lightgrey)](#)

Pick a **category** and a **difficulty level** — get a random word to build your improv scene around. Tracks already-drawn words so you never repeat until the pool is exhausted. Designed to be used live on stage from a phone or tablet.

---

## ✨ Features

- 🎲 **Random word draw** per category and difficulty (Easy / Medium / Hard)
- 🔁 **Anti-repeat sampling** — drawn words are excluded client-side until the pool resets
- ⏱ **Configurable stopwatch** with WakeLock API (screen stays on while timing)
- 🌍 **Multi-language** — English, Italian, Romanian (UI strings + database words)
- 📱 **Mobile-first** with haptic feedback via the Vibration API
- 🌙 **Dark / Light / System** theme with `next-themes`
- 📟 Retro Nokia/CRT visual aesthetic
- 🗃 Long-press any category button to browse the full word list in a drawer
- 🔐 Authentication via GitHub & Google OAuth (NextAuth v5)
- 🛡 Rate-limited API endpoints (in-memory, per-IP)
- 📦 **PWA-ready** — installable, works offline with a multi-tier service-worker cache

---

## 🛠 Tech Stack

| Layer          | Technology                                                                              |
| -------------- | --------------------------------------------------------------------------------------- |
| Framework      | [Next.js](https://nextjs.org) 16.x — **App Router**, Turbopack (dev)                   |
| Language       | TypeScript 5                                                                            |
| UI             | React 19 + [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com)       |
| Styling        | Tailwind CSS v3                                                                         |
| Database       | MongoDB 6 via [Mongoose](https://mongoosejs.com) 8                                     |
| Auth           | [NextAuth v5](https://authjs.dev) (beta) — GitHub & Google providers, JWT sessions     |
| Table          | [@tanstack/react-table](https://tanstack.com/table) v8                                  |
| Carousel       | [Embla Carousel](https://www.embla-carousel.com)                                        |
| Toasts         | [Sonner](https://sonner.emilkowal.ski)                                                  |
| Haptics        | [Tactus](https://github.com/nicktindall/tactus)                                         |
| PWA            | [@ducanh2912/next-pwa](https://ducanh-next-pwa.vercel.app) + Workbox runtime caching   |
| Analytics      | [Vercel Analytics](https://vercel.com/analytics) + Speed Insights                      |
| Deployment     | [Vercel](https://vercel.com)                                                            |

---

## 🏗 Next.js Architecture

### App Router & Route Conventions

Every user-facing route lives under `src/app/[lang]/`, making the locale a required URL segment. This approach avoids subdomain complexity and keeps locale state in the URL for easy sharing and caching.

```
/en          → src/app/[lang]/page.tsx          (Server Component, ISR)
/en/settings → src/app/[lang]/(pages)/settings  (Client-heavy settings page)
/admin       → src/app/admin/page.tsx           (protected, server-rendered)
```

### Server Components vs. Client Components

The app follows the **"push state down"** pattern — the outermost layer is a Server Component and only the interactive leaves are Client Components:

| Component | Type | Reason |
|-----------|------|--------|
| `app/[lang]/page.tsx` | **Server** | Fetches categories from DB at render time (ISR) |
| `ClientAction.tsx` | **Client** (`"use client"`) | Manages draw state, exclude list, and haptics |
| `ActionButton.tsx` | **Client** | Long-press gesture detection |
| `StopWatch.tsx` | **Client** | `setInterval`, WakeLock API |
| `Screen.tsx` | **Client** | Animated CRT display |
| `Navbar.tsx` | **Client** | Active-route highlighting |

### Route Handlers (API)

All API routes are under `src/app/api/v1/` and export named HTTP-method functions — Next.js 13+ convention for [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers):

```ts
// src/app/api/v1/words/route.ts
export async function GET(req: NextRequest) { … }
```

Random-draw responses include `Cache-Control: no-store` to prevent caching of stochastic results; list responses use `public, max-age=3600, stale-while-revalidate=86400`.

### Middleware & Locale Negotiation

`src/proxy.ts` exports a `proxy()` function and re-exports `auth` from NextAuth as the actual `middleware` default export. The locale negotiation logic runs before auth:

**Priority order:**
1. URL path prefix (`/en/…`, `/it/…`, `/ro/…`)
2. `locale` cookie (persisted across sessions)
3. `Accept-Language` header (negotiated via `@formatjs/intl-localematcher` + `negotiator`)
4. Default: `it`

The middleware also sets/refreshes the `locale` cookie on every response.

### ISR & Data Caching

Category data is cached using Next.js [`unstable_cache`](https://nextjs.org/docs/app/api-reference/functions/unstable_cache) with a 1-hour TTL and a `'categories'` tag for on-demand revalidation:

```ts
// src/lib/db/queries/getCategories.ts
export const getCategories = unstable_cache(fetchCategories, ['categories'], {
  revalidate: 3600,
  tags: ['categories'],
});
```

To purge the cache after a DB mutation call `revalidateTag('categories')` from a Server Action or Route Handler.

---

## 🔐 Authentication

Powered by **NextAuth v5** (`next-auth@beta`) with the [MongoDB Adapter](https://authjs.dev/reference/adapter/mongodb).

| Provider | Flow |
|----------|------|
| GitHub | OAuth 2.0 — callback: `/api/auth/callback/github` |
| Google | OAuth 2.0 — callback: `/api/auth/callback/google` |

Sessions use **JWT strategy** (no DB session table). The `jwt` callback enriches the token with an `isAdmin` flag read from the `User` collection on each sign-in.

```ts
// src/app/auth.ts  (simplified)
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  providers: [GitHub(…), Google(…)],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await User.findOne({ email: token.email }).lean();
        token.isAdmin = dbUser?.isAdmin ?? false;
      }
      return token;
    },
  },
});
```

Sign-in page: `/it/login`  
Admin guard: check `session.user.isAdmin` in Server Components or Route Handlers.

### Required Auth Environment Variables

```env
AUTH_SECRET=<random-string-min-32-chars>          # Required by NextAuth v5
AUTH_GITHUB_ID=<GitHub OAuth App client ID>
AUTH_GITHUB_SECRET=<GitHub OAuth App client secret>
AUTH_GOOGLE_ID=<Google OAuth client ID>
AUTH_GOOGLE_SECRET=<Google OAuth client secret>
```

---

## 📦 PWA & Service Worker Caching

Configured via `@ducanh2912/next-pwa` (Workbox under the hood) in `next.config.ts`. The service worker applies a **tiered caching strategy**:

| Resource | Strategy | TTL |
|----------|----------|-----|
| `/_next/static/**` | CacheFirst | 30 days |
| `/_next/image?*` | CacheFirst | 7 days |
| `/api/v1/categories` | StaleWhileRevalidate | 24 h |
| `/api/v1/words` | NetworkFirst (10 s timeout) | 24 h |
| HTML pages | NetworkFirst (10 s timeout) | 24 h |

**Turbopack** is enabled for local development (`next dev --turbopack` is the default via `turbopack: {}` in `next.config.ts`). The service worker is only generated in production builds.

---

## 🌍 Internationalization

Routes are prefixed by locale: `/en/`, `/it/`, `/ro/`.

- Active locale is stored in a **cookie** (`locale=`) and read by both the middleware and the `LocaleContext` client provider
- UI strings live in `src/app/[lang]/dictionaries/{lang}.json` and are loaded with dynamic `import()` — zero bundle overhead for unused locales
- Words in the database are stored **multilingually** as a Mongoose `Map<langCode, string>` — the display layer reads `word[locale] ?? word.en`

**To add a new language:**

1. Add a `{lang}.json` dictionary file in `src/app/[lang]/dictionaries/`
2. Add the locale code to the `locales` array in `src/proxy.ts` and the `languages` array in `src/app/[lang]/getDictionary.ts`
3. Add a `generateStaticParams` entry in `src/app/[lang]/layout.tsx`
4. Seed the language record and translated words via `npm run seed`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js ≥ 18** (LTS recommended)
- A **MongoDB** instance — local (`mongod`) or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier

### Installation

```bash
git clone https://github.com/Andyrei/impro-generator.git
cd impro-generator
npm install
```

### Environment Variables

Create a `.env.local` file in the project root. Only `MONGODB_URI` is required to run the app locally; OAuth variables are needed for authentication features.

```env
# ── Database ─────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# ── NextAuth v5 ──────────────────────────────────────────
AUTH_SECRET=<generated-secret-here>
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

> **Tip:** Generate `AUTH_SECRET` with `openssl rand -base64 32` or `npx auth secret`.

### Database Seeding

```bash
# Seed default structured data (categories, languages, words)
npm run seed

# Seed additional words from CSV files in /assets/wordlist/
npm run seed:csv
```

### Development

```bash
npm run dev          # Starts Next.js dev server with Turbopack on http://localhost:3000
```

Visiting `http://localhost:3000` redirects to `/{locale}` based on your `Accept-Language` header or the `locale` cookie.

### Production Build

```bash
npm run build        # Type-checks, compiles, generates service worker
npm run start        # Starts the production server
```

### Linting

```bash
npm run lint         # ESLint via eslint-config-next
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── [lang]/                        # Locale-prefixed routes (/en, /it, /ro)
│   │   ├── (index)/                   # Home route group
│   │   │   ├── page.tsx               # Server Component — fetches categories (ISR)
│   │   │   ├── ClientAction.tsx       # "use client" root game-state manager
│   │   │   └── SuggestDialog.tsx      # Word suggestion dialog
│   │   ├── (pages)/
│   │   │   └── settings/              # Language, theme, stopwatch settings
│   │   ├── login/                     # OAuth sign-in page
│   │   ├── layout.tsx                 # Root layout — ThemeProvider + LocaleProvider
│   │   ├── globals.css                # Global styles + CRT/Nokia effects
│   │   └── getDictionary.ts           # Dynamic locale JSON loader
│   │       └── dictionaries/          # en.json  it.json  ro.json
│   ├── admin/                         # Protected admin dashboard (isAdmin guard)
│   ├── api/
│   │   ├── auth/[...nextauth]/        # NextAuth catch-all handler
│   │   └── v1/
│   │       ├── categories/route.ts    # GET — categories with word counts
│   │       ├── languages/route.ts     # GET — supported languages
│   │       ├── words/route.ts         # GET — filtered + sampled words (rate-limited)
│   │       ├── words/[id]/route.ts    # GET | PATCH | DELETE — single word
│   │       ├── history/route.ts       # GET | POST — draw history
│   │       ├── likes/route.ts         # POST — like/unlike a word
│   │       └── suggestions/route.ts   # POST — submit a word suggestion
│   ├── layout.tsx                     # Root HTML shell (no providers)
│   ├── manifest.ts                    # next/dist MetadataRoute.Manifest (PWA)
│   └── auth.ts                        # NextAuth config (providers, callbacks)
├── components/
│   ├── custom-ui/                     # App-specific components
│   │   ├── ActionButton.tsx           # Category button — tap draws, long-press browses
│   │   ├── Screen.tsx                 # CRT display area
│   │   ├── LevelChecker.tsx           # Difficulty selector (Easy/Medium/Hard)
│   │   ├── StopWatch.tsx              # Scene timer with WakeLock
│   │   ├── Navbar.tsx                 # Bottom navigation bar
│   │   └── ToggleAction.tsx           # Simple toggle button variant
│   └── ui/                            # shadcn/ui primitives
├── context/
│   ├── LocaleContext.tsx              # Locale state + cookie persistence
│   └── ThemeContext.tsx               # Theme state + localStorage persistence
├── hooks/
│   └── useLongPress.ts                # Tap vs. 600 ms long-press detection
├── lib/
│   ├── general.ts                     # Shared utility functions
│   ├── rateLimit.ts                   # In-memory per-IP rate limiter
│   └── db/
│       ├── mongodb.ts                 # Mongoose connection singleton (cached)
│       ├── mongodbClient.ts           # Raw MongoClient for NextAuth adapter
│       ├── models/                    # Category, Language, Word, User schemas
│       ├── queries/
│       │   └── getCategories.ts       # unstable_cache wrapper — 1 h ISR
│       ├── seed/
│       │   ├── seed.ts                # Structured seed (categories + words)
│       │   └── seedFromCsv.ts         # CSV bulk import
│       └── types/                     # TypeScript interfaces mirroring DB models
├── proxy.ts                           # Middleware: locale negotiation + auth export
└── types/                             # Global type augmentations (next-auth, etc.)
```

---

## 🔌 API Reference

All endpoints are under `/api/v1/`. Random-draw responses are never cached (`Cache-Control: no-store`); list responses use `max-age=3600, stale-while-revalidate=86400`.

### `GET /api/v1/categories`

Returns all categories with a pre-computed `wordCount` (single `$lookup` aggregation — no N+1).

```json
[
  { "_id": "663f…", "name": { "en": "Place", "it": "Luogo", "ro": "Loc" }, "wordCount": 42 }
]
```

### `GET /api/v1/words`

| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | `string` | Category `ObjectId` to filter by (`"all"` = no filter) |
| `level` | `easy` \| `medium` \| `hard` \| `1` \| `2` \| `3` | Difficulty filter |
| `limit` | `number` | Max results (1–200). Omit for all. |
| `sample` | `1` | Use MongoDB `$sample` for a true random draw |
| `exclude` | `string` | Comma-separated `Word` IDs to exclude from sampling |

**Sample draw** (`sample=1`) returns `{ data: [word] }` and bypasses the list cache.  
**List draw** returns `{ metadata: { total, action, level, limit }, data: […words] }`.

Rate limit: **30 requests / 60 s** per IP. Returns `429 Too Many Requests` with `Retry-After` header on breach.

### `GET /api/v1/languages`

Returns all language documents from the DB.

### `GET /api/v1/words/:id` · `PATCH /api/v1/words/:id` · `DELETE /api/v1/words/:id`

Single-word CRUD — `PATCH` and `DELETE` require an authenticated admin session.

### `POST /api/v1/suggestions`

Submit a user word suggestion. Stored for admin review.

### `POST /api/v1/likes`

Toggle a like on a word for the authenticated user.

---

## 🚢 Deployment

Deployed on **Vercel** (zero-config for Next.js). Set the following environment variables in your Vercel project settings:

```
MONGODB_URI
AUTH_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
```

**ISR on Vercel:** The home page revalidates categories every 3 600 s. You can trigger an on-demand revalidation by calling `revalidateTag('categories')` from an admin Route Handler or Server Action.

**Service worker on Vercel:** The PWA service worker is generated at build time by `@ducanh2912/next-pwa` and deployed to `/public`. No extra Vercel configuration is required.

---

## 🗺 Roadmap

- [ ] Complete FAB button actions
- [ ] Scene Card Mode — generate a full scene prompt (Character + Location + Situation + Relation) in one tap, displayed as a card
- [ ] PWA offline mode — pre-cache word lists in the service worker for zero-latency on-stage use
- [ ] Native Share API — share the current prompt via iOS/Android Share Sheet or copy to clipboard
- [ ] Favorites / History — star words you liked; see the last N drawn words per session
- [ ] Admin editor — protected `/admin` page to add, edit, delete words and categories without touching MongoDB directly
- [ ] Sound Effects — optional button-click / word-reveal sounds themed to the retro aesthetic
- [ ] Multiplayer / Room Mode — host generates a prompt and all players in the same "room" see it simultaneously (WebSocket or long polling)
- [ ] QR Code Share — generate a QR code for a specific prompt to display on a projector/screen
- [ ] Animated Word Reveal — glitch/typewriter animation when a new word appears, matching the CRT aesthetic

---

## 🤝 Contributing

Contributions are very welcome! Here are some ways you can help:

1. **Report Bugs** — Open an issue describing what went wrong.
2. **Suggest Features** — Open an issue with your idea.
3. **Submit Pull Requests** — Fork the repo, make your changes, and open a PR.

To better understand the project vision, import [PROJECT_IDEA.excalidraw](./PROJECT_IDEA.excalidraw) into [Excalidraw](https://excalidraw.com/).

---

## 👤 Author

**Andy Andrei** — [radoacaandrei3@gmail.com](mailto:radoacaandrei3@gmail.com)
