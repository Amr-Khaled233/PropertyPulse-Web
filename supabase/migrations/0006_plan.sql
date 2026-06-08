-- 0006_plan.sql — subscription tier on profiles (free / pro / enterprise).
-- Free plan is limited to 3 AI reports per calendar month (enforced in the API).

alter table profiles add column if not exists plan text not null default 'free';
