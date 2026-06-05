# PropertyPulse Web — AI-Powered Real Estate Investment Advisor

Team 3 · Real Estate Technology

> **Web client + backend.** The mobile app lives in a separate repository: **PropertyPulse-Mobile**.

PropertyPulse aggregates property listings, rental market data, economic indicators,
neighborhood insights, and local regulations into a single intelligent dashboard.
Users analyze any property and receive a comprehensive investment report (ROI projections,
rental yield, market trends, risk assessment) in minutes.

## AI Trinity

| Pillar | Role | Tech |
| --- | --- | --- |
| **LLM** | Investment reasoning, report generation, risk assessment, Q&A | Gemini 2.5 Pro |
| **RAG** | Retrieve listings, rental stats, neighborhood, economic & regulatory data | Embeddings + pgvector (Supabase) |
| **Agents** | Gather data, run calculations, generate reports, monitor saved properties | Orchestrated agents (server) |

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
cp .env.example .env            # fill in keys (and per-app .env files)
npm run dev:server              # backend  → http://localhost:4000
npm run dev:web                 # web      → http://localhost:5173
```

## Tech Stack

React · Node.js · Express · TypeScript · Supabase (Postgres + Auth + Storage + pgvector) · Gemini 2.5 Pro
