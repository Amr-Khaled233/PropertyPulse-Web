-- 0004_watchlist.sql — saved properties + monitoring + change alerts.

create table watchlist_items (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  property_id     uuid not null references properties(id) on delete cascade,
  notes           text,
  notify_on_change boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (user_id, property_id)
);

alter table watchlist_items enable row level security;

create policy "Users manage own watchlist"
  on watchlist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Alerts emitted by the monitoring agent when a watched property changes.
create table property_alerts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  property_id  uuid not null references properties(id) on delete cascade,
  kind         text not null,          -- 'price_drop' | 'new_report' | 'market_shift'
  message      text not null,
  payload      jsonb default '{}',
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_alerts_user on property_alerts(user_id);
