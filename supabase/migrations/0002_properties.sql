-- 0002_properties.sql — properties, neighborhoods, market & economic data.

create table neighborhoods (
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

create table properties (
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

create index idx_properties_city on properties(city);
create index idx_properties_type on properties(type);
create index idx_properties_price on properties(price);

-- Rental market statistics (time series per location) ---------------
create table rental_market_stats (
  id            uuid primary key default uuid_generate_v4(),
  city          text not null,
  property_type property_type,
  period        date not null,
  median_price  numeric(14,2),
  median_rent   numeric(12,2),
  avg_yield     numeric(6,3),
  created_at    timestamptz not null default now()
);

-- Economic indicators -----------------------------------------------
create table economic_indicators (
  id          uuid primary key default uuid_generate_v4(),
  region      text not null,
  indicator   text not null,         -- e.g. 'interest_rate', 'inflation', 'gdp_growth'
  period      date not null,
  value       numeric(14,4) not null,
  unit        text,
  source      text,
  created_at  timestamptz not null default now()
);
