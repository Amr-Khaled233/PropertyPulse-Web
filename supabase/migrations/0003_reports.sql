-- 0003_reports.sql — AI-generated investment reports.

create table investment_reports (
  id              uuid primary key default uuid_generate_v4(),
  property_id     uuid not null references properties(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  summary         text not null,
  recommendation  recommendation not null,
  confidence      numeric(4,3) not null default 0,
  metrics         jsonb not null default '{}',   -- InvestmentMetrics
  risk            jsonb not null default '{}',   -- RiskAssessment
  market_trends   jsonb not null default '[]',   -- MarketTrendPoint[]
  neighborhood    jsonb,                         -- NeighborhoodInsight
  sources         text[] default '{}',
  generated_at    timestamptz not null default now()
);

create index idx_reports_user on investment_reports(user_id);
create index idx_reports_property on investment_reports(property_id);

alter table investment_reports enable row level security;

create policy "Users read own reports"
  on investment_reports for select using (auth.uid() = user_id);
create policy "Users create own reports"
  on investment_reports for insert with check (auth.uid() = user_id);
