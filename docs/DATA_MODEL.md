# Data Model

Source of truth: `supabase/migrations/`.

## Tables

- **profiles** — user accounts (1:1 with `auth.users`), role-based.
- **neighborhoods** — neighborhood insights (walk/safety/schools, amenities).
- **properties** — listings (price, area, beds/baths, location, images).
- **rental_market_stats** — time-series rental/price medians per city & type.
- **economic_indicators** — interest rates, inflation, GDP growth, etc.
- **investment_reports** — AI-generated reports (metrics, risk, trends as JSONB).
- **watchlist_items** — saved properties + alert preferences.
- **property_alerts** — alerts raised by the monitoring agent.
- **rag_documents / rag_chunks** — RAG knowledge base; `rag_chunks.embedding` is `vector(768)`.

## RAG

`match_rag_chunks(query_embedding, match_count, filter_source)` performs cosine
similarity search over `rag_chunks` (ivfflat index) and is called by the retriever.

## Relationships

```
auth.users 1─1 profiles 1─* investment_reports *─1 properties *─1 neighborhoods
profiles 1─* watchlist_items *─1 properties
profiles 1─* property_alerts
rag_documents 1─* rag_chunks
```
