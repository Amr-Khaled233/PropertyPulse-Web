-- seed.sql — sample data for local development.
-- Run automatically by `supabase start` / `supabase db reset`.

insert into neighborhoods (name, city, country, walk_score, safety_score, schools_score, amenities, summary)
values
  ('Downtown', 'Cairo', 'Egypt', 88, 72, 80, array['metro','malls','restaurants'], 'Central, high footfall, strong rental demand.'),
  ('New Cairo', 'Cairo', 'Egypt', 65, 85, 90, array['schools','compounds','parks'], 'Family-oriented, premium compounds, steady appreciation.');

-- Properties, market stats, economic indicators and RAG documents
-- are seeded by the ingestion agent (apps/server/src/ai/rag/ingestion.ts).
