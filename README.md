# 🎭 IMPRO GENERATOR

> A mobile-first random prompt generator for improvisation theater.
This project was created for fun, with the idea of having a tool for improv shows or lessons. This web app (and potentially a future mobile app) aims to be creative and enjoyable. It is a friendly repository for anyone who wants to contribute and have fun.

[![Deployed on Vercel](https://img.shields.io/badge/deployed-vercel-black?logo=vercel)](https://impro-generator.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-private-lightgrey)](#)

Pick a **category** and a **difficulty level** — get a random word to build your improv scene around. Tracks already-drawn words so you never repeat until the pool is exhausted. Designed to be used live on stage from a phone or tablet.

---

## ✨ Features

- 🎲 **Random word draw** per category and difficulty (Easy / Medium / Hard)
- 🔁 **Anti-repeat sampling** — drawn words are excluded until the pool resets
- ⏱ **Configurable stopwatch** with WakeLock (screen stays on while timing)
- 🌍 **Multi-language** — English, Italian, Romanian (UI + words)
- 📱 **Mobile-first** with haptic feedback
- 🌙 **Dark / Light / System** theme
- 🔁 **Not repeating words** the routes have a call specific logic to not repeat the calls on words
- 📟 Retro Nokia/CRT visual aesthetic
- 🗃 Long-press any category button to browse the full word list

---

## 🛠 Tech Stack

| Layer      | Technology                                                                |
| ---------- | ------------------------------------------------------------------------- |
| Framework  | [Next.js](https://nextjs.org) 16 (App Router)                                |
| UI         | React 19 +[shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) |
| Styling    | Tailwind CSS 3                                                            |
| Database   | MongoDB via[Mongoose](https://mongoosejs.com)                                |
| Table      | [@tanstack/react-table](https://tanstack.com/table) v8                       |
| Carousel   | [Embla Carousel](https://www.embla-carousel.com)                             |
| Toasts     | [Sonner](https://sonner.emilkowal.ski)                                       |
| Haptics    | [Tactus](https://github.com/nicktindall/tactus)                              |
| Analytics  | [Vercel Analytics](https://vercel.com/analytics)                             |
| Deployment | [Vercel](https://vercel.com)                                                 |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
git clone https://github.com/Andyrei/impro-generator.git
cd impro-generator
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### Database Seeding

```bash
# Seed default structured data (categories, languages, words)
npm run seed

# Seed additional words from CSV files in /assets/wordlist/
npm run seed:csv
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/en` (or your browser's preferred language).

---

## 📁 Project Structure

```
src/
├── app/
│   ├── [lang]/                  # All routes are locale-prefixed (/en, /it, /ro)
│   │   ├── page.tsx             # Home — server component, fetches categories
│   │   ├── layout.tsx           # Root layout with theme + locale providers
│   │   ├── globals.css          # Global styles + CRT/Nokia effects
│   │   ├── getDictionary.ts     # Loads the locale JSON dictionary
│   │   ├── dictionaries/        # en.json, it.json, ro.json
│   │   └── (pages)/
│   │       └── settings/        # Language, theme, stopwatch settings
│   └── api/
│       ├── v0/action/           # Legacy CSV-based API (deprecated)
│       └── v1/
│           ├── categories/      # GET all categories with word counts
│           ├── languages/       # GET all supported languages
│           └── words/           # GET words with filtering and random sampling
├── components/
│   ├── custom-ui/               # App-specific components
│   │   ├── ClientAction.tsx     # Root game state manager
│   │   ├── ActionButton.tsx     # Category button (tap = draw, long-press = browse)
│   │   ├── Screen.tsx           # CRT display area
│   │   ├── LevelChecker.tsx     # Difficulty selector
│   │   ├── StopWatch.tsx        # Scene timer with WakeLock
│   │   ├── Navbar.tsx           # Bottom navigation
│   │   └── ToggleAction.tsx     # Simple action button variant
│   └── ui/                      # shadcn/ui components
├── context/
│   ├── LocaleContext.tsx        # Locale state + cookie persistence
│   └── ThemeContext.tsx         # Theme state + localStorage persistence
├── hooks/
│   └── useLongPress.ts          # Distinguishes tap vs. 600ms long-press
└── lib/
    ├── general.ts               # Shared utilities
    └── db/
        ├── mongodb.ts           # Mongoose connection singleton
        ├── models/              # Category, Language, Word schemas
        ├── queries/             # getCategories (with ISR cache)
        ├── seed/                # seed.ts, seedFromCsv.ts
        └── types/               # TypeScript types mirroring DB models
```

---

## 🔌 API Reference

### `GET /api/v1/categories`

Returns all categories with a pre-computed `wordCount`.

```json
[
  { "_id": "...", "name": { "en": "Place", "it": "Luogo" }, "wordCount": 42 }
]
```

### `GET /api/v1/words`

| Parameter   | Type                    | Description                                       |
| ----------- | ----------------------- | ------------------------------------------------- |
| `action`  | string                  | Category ObjectId to filter by                    |
| `level`   | `1` \| `2` \| `3` | Difficulty (1 = Easy, 2 = Medium, 3 = Hard)       |
| `limit`   | number                  | Max results (1–200, default 1)                   |
| `sample`  | `1`                   | Use MongoDB `$sample` for a random draw         |
| `exclude` | string                  | Comma-separated Word IDs to exclude from sampling |

### `GET /api/v1/languages`

Returns all supported language documents.

---

## 🌍 Internationalization

Routes are prefixed by locale: `/en/`, `/it/`, `/ro/`.

- Active locale is stored in a **cookie** (`locale=`)
- UI strings live in `src/app/[lang]/dictionaries/{lang}.json`
- Words in the database are stored **multilingually** as a `Map<langCode, string>` — the display layer reads `word[locale] ?? word.en`
- Language negotiation on first visit uses `@formatjs/intl-localematcher` + `negotiator`

To add a new language:

1. Add a `{lang}.json` dictionary file in `src/app/[lang]/dictionaries/`
2. Register the locale in `src/app/[lang]/layout.tsx` static params
3. Seed the language record and translated words via `npm run seed`

---

## 🚢 Deployment

Deployed on [Vercel](https://vercel.com). Required environment variable in Vercel project settings:

```
MONGODB_URI=<your MongoDB connection string>
```

The home page uses ISR with a 1-hour revalidation window (`revalidate = 3600`). Categories can be revalidated on-demand using the `'categories'` cache tag.

---

## 🗺 Roadmap

- [ ] Complete FAB button actions
- [ ] Scene Card Mode — generate a full scene prompt in one tap Character + Location + Situation + Relation all at once, shown as a card
- [ ] PWA / offline support with pre-cached word lists - This is used live on stage where Wi-Fi can be spotty. A service worker with pre-cached word lists would be a huge reliability win.
- [ ] Native Share API - integration Share the current prompt via iOS/Android Share Sheet or copy to clipboard
- [ ] Favorites / History - Star words you liked; see last N drawn words per session
- [ ] Word suggestions from users
- [ ] Admin editor for categories and words - A protected `/admin` page to add, edit, delete words and categories without touching MongoDB directly
- [ ] Sound Effects - Optional button click / word-reveal sounds themed to the retro aesthetic
- [ ] Multiplayer / Room Mode - Host generates a prompt and all players on the same "room" see it simultaneously (WebSocket or polling)
- [ ] QR Code Share - Generate a QR code for a specific prompt to display on a projector/screen
- [ ] Animated Word Reveal - Glitch/typewriter animation when a new word appears, matching the CRT aesthetic

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
