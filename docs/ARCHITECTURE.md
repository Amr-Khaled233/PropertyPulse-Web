# Architecture

PropertyPulse is a TypeScript monorepo with three apps sharing common packages.

## MVVM layering

Each client app (web, mobile) follows **Model–View–ViewModel**:

```
View (pages/screens + components)   ← pure UI, no business logic
        ↓ uses
ViewModel (viewmodels/*.ts hooks)   ← state + logic, framework-aware, UI-agnostic data
        ↓ uses
Model (models/ + services/ + store) ← domain types, API/data access, global state
```

- **View** never calls the API directly. It only consumes a ViewModel.
- **ViewModel** exposes state and actions (e.g. `usePropertyAnalysisViewModel`) and calls services.
- **Model** = domain types (from `@propertypulse/shared-types`) + `services/` (API/Supabase) + `store/` (Zustand).

The **server** uses a layered architecture (routes → controllers → services → repositories),
with a dedicated **AI layer** (`ai/llm`, `ai/rag`, `ai/agents`).

## Data flow for "Analyze a property"

```
View (AnalysisPage)
  → useReportViewModel.generate(propertyId, assumptions)
    → reportService.generate()  (HTTP)
      → POST /api/reports        (server)
        → report.controller → report.service
          → agents/orchestrator
              ├─ dataCollectorAgent   (property facts)
              ├─ marketDataAgent       (rental/economic/neighborhood)
              ├─ rag/retriever         (grounding context)
              ├─ calculationAgent      (shared-utils financial calcs)
              └─ reportGeneratorAgent  (Gemini → InvestmentReport)
        → persisted via report.repository (Supabase)
  ← InvestmentReport rendered by ReportViewer
```

## Packages

- `@propertypulse/shared-types` — domain types used by every app.
- `@propertypulse/shared-utils` — pure financial calculations, formatters, constants.
- `@propertypulse/ai-core` — framework-agnostic AI contracts (LlmClient, Retriever, Agent).

## Tech choices

| Concern | Choice |
| --- | --- |
| Language | TypeScript (strict) |
| Web | React + Vite + React Query + Zustand + React Router |
| Mobile | Expo (React Native) + React Navigation |
| Server | Node.js + Express + Zod + pino |
| AI | Gemini 2.5 Pro + text-embedding-004 |
| Data | Supabase (Postgres, Auth, Storage, pgvector) |
