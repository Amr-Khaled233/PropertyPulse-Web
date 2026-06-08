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
create index if not exists idx_inquiries_status on inquiries(status);
create index if not exists idx_inquiries_kind on inquiries(kind);
-- No seed rows: inquiries should only come from real submissions via the
-- "Contact / Request viewing" form on a property page.
