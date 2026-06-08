-- ============================================================
-- PropertyPulse — ONE-SHOT database setup (schema + seed data)
-- Paste this WHOLE file into Supabase → SQL Editor → Run.
-- Safe to re-run (guards prevent duplicate errors / rows).
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";
create extension if not exists vector;        -- pgvector, for RAG embeddings

-- ---------- Enums (guarded) ----------
do $$ begin create type property_type as enum ('apartment','house','villa','townhouse','commercial','land'); exception when duplicate_object then null; end $$;
do $$ begin create type listing_status as enum ('for_sale','for_rent','sold','off_market'); exception when duplicate_object then null; end $$;
do $$ begin create type user_role as enum ('investor','consultant','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type recommendation as enum ('buy','hold','avoid'); exception when duplicate_object then null; end $$;
do $$ begin create type risk_level as enum ('low','moderate','high'); exception when duplicate_object then null; end $$;

-- ---------- Profiles (1:1 with auth.users) ----------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        user_role not null default 'investor',
  plan        text not null default 'free',   -- 'free' | 'pro' | 'enterprise'
  avatar_url  text,
  created_at  timestamptz not null default now()
);
-- Add plan to an existing profiles table (safe if the column already exists).
alter table profiles add column if not exists plan text not null default 'free';
alter table profiles enable row level security;
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- ---------- Neighborhoods ----------
create table if not exists neighborhoods (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  city          text not null,
  country       text not null,
  walk_score    int,
  safety_score  int,
  schools_score int,
  amenities     text[] default '{}',
  summary       text,
  created_at    timestamptz not null default now()
);

-- ---------- Properties ----------
create table if not exists properties (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  type          property_type not null,
  status        listing_status not null default 'for_sale',
  price         numeric(14,2) not null,
  currency      text not null default 'USD',
  area_sqm      numeric(10,2) not null,
  bedrooms      int not null default 0,
  bathrooms     int not null default 0,
  year_built    int,
  address_line1 text,
  city          text,
  state         text,
  country       text,
  postal_code   text,
  lat           double precision,
  lng           double precision,
  images        text[] default '{}',
  description   text,
  source        text,
  neighborhood_id uuid references neighborhoods(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_properties_city on properties(city);
create index if not exists idx_properties_type on properties(type);
create index if not exists idx_properties_price on properties(price);

-- ---------- Rental market stats ----------
create table if not exists rental_market_stats (
  id            uuid primary key default uuid_generate_v4(),
  city          text not null,
  property_type property_type,
  period        date not null,
  median_price  numeric(14,2),
  median_rent   numeric(12,2),
  avg_yield     numeric(6,3),
  created_at    timestamptz not null default now()
);

-- ---------- Economic indicators ----------
create table if not exists economic_indicators (
  id          uuid primary key default uuid_generate_v4(),
  region      text not null,
  indicator   text not null,
  period      date not null,
  value       numeric(14,4) not null,
  unit        text,
  source      text,
  created_at  timestamptz not null default now()
);

-- ---------- Investment reports ----------
create table if not exists investment_reports (
  id              uuid primary key default uuid_generate_v4(),
  property_id     uuid not null references properties(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  summary         text not null,
  recommendation  recommendation not null,
  confidence      numeric(4,3) not null default 0,
  metrics         jsonb not null default '{}',
  risk            jsonb not null default '{}',
  market_trends   jsonb not null default '[]',
  neighborhood    jsonb,
  sources         text[] default '{}',
  generated_at    timestamptz not null default now()
);
create index if not exists idx_reports_user on investment_reports(user_id);
create index if not exists idx_reports_property on investment_reports(property_id);
alter table investment_reports enable row level security;
drop policy if exists "Users read own reports" on investment_reports;
create policy "Users read own reports" on investment_reports for select using (auth.uid() = user_id);
drop policy if exists "Users create own reports" on investment_reports;
create policy "Users create own reports" on investment_reports for insert with check (auth.uid() = user_id);

-- ---------- Watchlist + alerts ----------
create table if not exists watchlist_items (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  property_id     uuid not null references properties(id) on delete cascade,
  notes           text,
  notify_on_change boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (user_id, property_id)
);
alter table watchlist_items enable row level security;
drop policy if exists "Users manage own watchlist" on watchlist_items;
create policy "Users manage own watchlist" on watchlist_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists property_alerts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  property_id  uuid not null references properties(id) on delete cascade,
  kind         text not null,
  message      text not null,
  payload      jsonb default '{}',
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists idx_alerts_user on property_alerts(user_id);

-- ---------- RAG knowledge base ----------
create table if not exists rag_documents (
  id          uuid primary key default uuid_generate_v4(),
  source      text not null,
  ref_id      text,
  title       text,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);
create table if not exists rag_chunks (
  id           uuid primary key default uuid_generate_v4(),
  document_id  uuid not null references rag_documents(id) on delete cascade,
  chunk_index  int not null,
  content      text not null,
  embedding    vector(768),
  created_at   timestamptz not null default now()
);
create index if not exists idx_rag_chunks_embedding
  on rag_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

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

-- ============================================================
-- SEED DATA (guarded — only inserts if tables are empty)
-- ============================================================
do $$
begin
  if not exists (select 1 from neighborhoods) then
    insert into neighborhoods (name, city, country, walk_score, safety_score, schools_score, amenities, summary) values
      ('Downtown','Cairo','Egypt',88,72,80, array['metro','malls','restaurants'], 'Central, high footfall, strong rental demand.'),
      ('New Cairo','Cairo','Egypt',65,85,90, array['schools','compounds','parks'], 'Family-oriented, premium compounds, steady appreciation.');
  end if;

  if not exists (select 1 from properties) then
    insert into properties (title, type, status, price, currency, area_sqm, bedrooms, bathrooms, year_built, address_line1, city, country, lat, lng, images, description, source) values
      ('The Zenith Penthouse','apartment','for_sale',8400000,'EGP',325,4,5,2022,'Downtown','New Cairo','Egypt',30.0084,31.4913,
        array['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=70'],
        'A landmark penthouse combining skyline views, premium finishes and a strong rental track record.','seed'),
      ('Heliopolis Luxury Apartment','apartment','for_sale',4300000,'EGP',180,3,2,2019,'Korba','Cairo','Egypt',30.0876,31.3260,
        array['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=70'],
        'Elegant apartment in historic Heliopolis with steady appreciation and high footfall.','seed'),
      ('Sheikh Zayed Villa','villa','for_sale',12200000,'EGP',480,5,4,2021,'Beverly Hills','Giza','Egypt',30.0392,30.9876,
        array['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=70'],
        'Spacious family villa in a premium compound with private garden and pool.','seed'),
      ('New Cairo Office','commercial','for_sale',3900000,'EGP',140,0,2,2023,'90th Street','New Cairo','Egypt',30.0100,31.4200,
        array['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70'],
        'Grade-A commercial unit on the 90th Street corridor with surging tenant demand.','seed'),
      ('Skyline Heights Tower','apartment','for_sale',6750000,'EGP',210,3,3,2024,'Fifth Settlement','New Cairo','Egypt',30.0250,31.4700,
        array['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=70'],
        'Brand-new tower unit with high growth probability and institutional-grade amenities.','seed'),
      ('Maadi Garden Townhouse','townhouse','for_sale',9100000,'EGP',300,4,3,2018,'Maadi Sarayat','Cairo','Egypt',29.9600,31.2600,
        array['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=70'],
        'Leafy, family-friendly townhouse in established Maadi with resilient demand.','seed');
  end if;

  if not exists (select 1 from rental_market_stats) then
    insert into rental_market_stats (city, property_type, period, median_price, median_rent, avg_yield)
    select 'New Cairo','apartment', (date '2024-01-01' + (n || ' month')::interval)::date,
           38000 + n*900, 210 + n*6, 6.8 + (n % 3) * 0.2
    from generate_series(0, 11) as n;
  end if;
end $$;
