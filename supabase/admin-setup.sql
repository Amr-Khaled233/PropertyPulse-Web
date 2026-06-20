-- ============================================================
-- PropertyPulse — ADMIN features schema (run ONCE in Supabase → SQL Editor)
-- Safe to re-run. Adds property moderation fields + the CRM inquiries table.
-- ============================================================

-- ---------- Property moderation fields ----------
alter table properties add column if not exists featured  boolean not null default false;
alter table properties add column if not exists approved  boolean not null default true;   -- imported listings are pre-approved
alter table properties add column if not exists agent_name text;

create index if not exists idx_properties_featured on properties(featured);
create index if not exists idx_properties_approved on properties(approved);

-- ---------- CRM: inquiries / requests / messages ----------
do $$ begin
  create type inquiry_kind as enum ('buyer_inquiry','viewing_request','contact_message','application');
exception when duplicate_object then null; end $$;
do $$ begin
  create type inquiry_status as enum ('new','in_progress','closed');
exception when duplicate_object then null; end $$;

create table if not exists inquiries (
  id           uuid primary key default uuid_generate_v4(),
  kind         inquiry_kind   not null default 'contact_message',
  status       inquiry_status not null default 'new',
  name         text not null,
  email        text,
  phone        text,
  message      text,
  property_id  uuid references properties(id) on delete set null,
  created_at   timestamptz not null default now()
);
-- Soft-delete: admin "delete" sets this; the row stays so the owner can be
-- notified that their inquiry was deleted, but it's hidden from the CRM.
alter table inquiries add column if not exists deleted_at timestamptz;
create index if not exists idx_inquiries_status on inquiries(status);
create index if not exists idx_inquiries_kind on inquiries(kind);
-- No seed rows: inquiries should only come from real submissions via the
-- "Contact / Request viewing" form on a property page.

-- ---------- Usage events (plan quota enforcement: AI compare, etc.) ----------
create table if not exists usage_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  kind        text not null,           -- e.g. 'compare'
  created_at  timestamptz not null default now()
);
create index if not exists idx_usage_user_kind on usage_events(user_id, kind, created_at);

-- ---------- Saved AI comparisons ----------
-- Persists each AI Compare a user runs so they can revisit and delete them.
create table if not exists comparisons (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  property_ids jsonb not null,
  result       jsonb not null,          -- the full ComparisonResult (candidates, ranking, verdict)
  created_at   timestamptz not null default now()
);
create index if not exists idx_comparisons_user on comparisons(user_id, created_at desc);
