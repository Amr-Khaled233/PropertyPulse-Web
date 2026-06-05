-- 0005_rag.sql — RAG knowledge base: documents, chunks and vector embeddings.

create table rag_documents (
  id          uuid primary key default uuid_generate_v4(),
  source      text not null,          -- listing | rental_stats | neighborhood | economic | regulation
  ref_id      text,                   -- optional link back to a domain row
  title       text,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

-- 768 dims matches Gemini text-embedding-004. Adjust if the model changes.
create table rag_chunks (
  id           uuid primary key default uuid_generate_v4(),
  document_id  uuid not null references rag_documents(id) on delete cascade,
  chunk_index  int not null,
  content      text not null,
  embedding    vector(768),
  created_at   timestamptz not null default now()
);

-- Approximate nearest-neighbour index for fast semantic search.
create index idx_rag_chunks_embedding
  on rag_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Similarity search RPC used by the retriever.
create or replace function match_rag_chunks(
  query_embedding vector(768),
  match_count int default 5,
  filter_source text default null
)
returns table (id uuid, document_id uuid, content text, similarity float)
language sql stable as $$
  select c.id, c.document_id, c.content,
         1 - (c.embedding <=> query_embedding) as similarity
  from rag_chunks c
  join rag_documents d on d.id = c.document_id
  where filter_source is null or d.source = filter_source
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
