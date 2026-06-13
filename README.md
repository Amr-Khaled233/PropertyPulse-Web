# PropertyPulse Web — AI-Powered Real Estate Investment Advisor

Team 3 · Real Estate Technology

> **Web client + backend.** The mobile app lives in a separate repository: **PropertyPulse-Mobile**.

PropertyPulse aggregates property listings, rental market data, economic indicators,
neighborhood insights, and local regulations into a single intelligent dashboard.
Users analyze any property and receive a comprehensive investment report (ROI projections,
rental yield, market trends, risk assessment) in minutes.

## AI Trinity

| Pillar     | Role                                                                      | Tech                             |
| ---------- | ------------------------------------------------------------------------- | -------------------------------- |
| **LLM**    | Investment reasoning, report generation, risk assessment, Q&A             | Gemini 2.5 Pro                   |
| **RAG**    | Retrieve listings, rental stats, neighborhood, economic & regulatory data | Embeddings + pgvector (Supabase) |
| **Agents** | Gather data, run calculations, generate reports, monitor saved properties | Orchestrated agents (server)     |

## Monorepo Layout

```
propertypulse-web/
├── apps/
│   ├── web/        # React + Vite (MVVM)
│   └── server/     # Node.js + Express + AI layer
├── packages/
│   ├── shared-types/   # Domain types shared across apps
│   ├── shared-utils/   # Financial calcs, formatters, constants
│   └── ai-core/        # Reusable AI building blocks
├── supabase/       # DB schema, migrations, seed
└── docs/           # Architecture, API, data model, AI design
```

## Architecture: MVVM

- **Model** — domain types + data access (`models/`, `services/`, `repositories/`).
- **ViewModel** — state + business logic, framework-agnostic UI logic (`viewmodels/` as hooks/stores).
- **View** — pure presentation (`views/` pages/screens + components).

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting Started

```bash
npm install
npm run dev:web                 # web → http://localhost:5173  (runs in MOCK mode, no keys needed)
```

The web client ships with a **mock mode** (`VITE_USE_MOCK=true`, the default) so the full UI —
dashboard, search, property analysis, AI advisor, reports, watchlist, admin — runs on seeded
data without any backend or API keys. Financial metrics are still computed by the real
`@propertypulse/shared-utils` engine.

To run the **real backend** (live Supabase + Gemini):

```bash
cp apps/server/.env.example apps/server/.env   # fill SUPABASE_* + GEMINI_API_KEY
cp apps/web/.env.example apps/web/.env          # set VITE_USE_MOCK=false + Supabase anon key
npm run dev:server                              # backend → http://localhost:4000
npm run dev:web                                 # web     → http://localhost:5173
```

### Web features

- **Design** — Navy / Green / Cream system, Newsreader + DM Sans, matching the product design.
- **Dark / Light mode** — persisted, toggled from the top bar.
- **Localization** — English + Arabic with full RTL support.
- **Auth** — email/password + **Continue with Google**, sessions persisted. Accounts save to
  Supabase (real mode) or localStorage (mock). Sign in as `admin@propertypulse.app` to reach the
  **Admin dashboard**.
- **MVVM** — `views/` (pure UI) · `viewmodels/` (hooks) · `services/` + `store/` (model/state).

## Tech Stack

React · Node.js · Express · TypeScript · Supabase (Postgres + Auth + Storage + pgvector) · Gemini 2.5 Pro
