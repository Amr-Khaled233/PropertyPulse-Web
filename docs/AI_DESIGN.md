# AI Design — The Trinity

## 1. LLM (Gemini 2.5 Pro) — `apps/server/src/ai/llm`
- `geminiClient.ts` implements the `LlmClient` contract from `@propertypulse/ai-core`.
- Prompt templates (`prompts/`) are versioned and testable:
  - `investmentReport.prompt` — synthesize the report from facts + retrieved context.
  - `riskAssessment.prompt` — weighted risk factors → overall risk.
  - `propertyComparison.prompt` — compare candidates.
  - `qa.prompt` — grounded natural-language answers.
- Outputs are validated with Zod before persisting (explainable + structured).

## 2. RAG — `apps/server/src/ai/rag`
- **Sources**: listings, rental stats, neighborhood info, economic indicators, regulations.
- **Pipeline**: `ingestion` → `chunking` → `embeddings` (text-embedding-004) → `vectorStore` (Supabase pgvector).
- **Query**: `retriever.search()` embeds the query and calls `match_rag_chunks`.
- Retrieved chunks are injected into prompts so answers stay location-specific and cite `sources`.

## 3. Agents — `apps/server/src/ai/agents`
Coordinated by `orchestrator.ts`:
1. `dataCollectorAgent` — gather property facts.
2. `marketDataAgent` — collect market/neighborhood/economic data.
3. `calculationAgent` — run financial calcs (`@propertypulse/shared-utils`).
4. `reportGeneratorAgent` — LLM synthesis grounded in RAG context.
5. `monitoringAgent` — watch saved properties; emit `property_alerts`.

## Trust & explainability
Numeric metrics come from deterministic calculations (not the LLM). The LLM explains and
narrates; every report records its `sources` and a `confidence` score.
