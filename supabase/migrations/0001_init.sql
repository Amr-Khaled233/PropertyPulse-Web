-- 0001_init.sql — extensions, enums, and user profiles.

create extension if not exists "uuid-ossp";
create extension if not exists vector;      -- pgvector, for RAG embeddings

-- Enums -------------------------------------------------------------
create type property_type as enum ('apartment','house','villa','townhouse','commercial','land');
create type listing_status as enum ('for_sale','for_rent','sold','off_market');
create type user_role as enum ('investor','consultant','admin');
create type recommendation as enum ('buy','hold','avoid');
create type risk_level as enum ('low','moderate','high');

-- Profiles (1:1 with auth.users) ------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        user_role not null default 'investor',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
