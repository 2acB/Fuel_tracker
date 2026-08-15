-- Using built-in Postgres gen_random_uuid() instead of uuid-ossp extension

-- Create entry_status ENUM for offline drafts
CREATE TYPE entry_status AS ENUM ('DRAFT', 'CONFIRMED');

-- VEHICLES
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,                        -- e.g. "My Honda Civic"
  make text not null,                        -- e.g. "Honda"
  model text not null,                       -- e.g. "Civic"
  year integer,
  license_plate text,
  fuel_type text not null,                   -- default fuel type for this car
  tank_capacity_litres numeric(6,2),
  color text,
  avatar_emoji text default '🚗',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- FUEL PRICES (cached from scraper / manual seed)
create table fuel_prices (
  id uuid primary key default gen_random_uuid(),
  fuel_type text not null,                   -- 'gasohol_91','gasohol_95','gasohol_e20','gasohol_e85','diesel','premium_diesel'
  price_thb numeric(8,2) not null,
  station_brand text,                        -- 'bangchak','ptt','shell','caltex','esso','susco'
  effective_date date not null,
  source_url text,
  created_at timestamptz default now()
);

-- REFUELING SESSIONS
create table refuel_sessions (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  fueled_at timestamptz not null,            -- user-selected date/time
  odometer_km numeric(10,2) not null,
  fuel_type text not null,
  litres numeric(8,3),                       -- calculated or entered manually
  cost_thb numeric(10,2) not null,           -- what user paid
  price_per_litre_thb numeric(8,4),          -- auto-filled from fuel_prices
  is_full_tank boolean default true,
  station_brand text,
  station_name text,                         -- optional custom name
  lat numeric(10,7),                         -- GPS latitude
  lng numeric(11,7),                         -- GPS longitude
  notes text,
  receipt_url text,                          -- Supabase Storage URL
  status entry_status default 'DRAFT',       -- Tracks offline drafts vs confirmed
  created_at timestamptz default now()
);

-- SERVICE LOGS
create table service_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  service_type text not null,               -- 'oil_change','tire','brake','filter','inspection','other'
  serviced_at timestamptz not null,
  odometer_km numeric(10,2),
  cost_thb numeric(10,2),
  workshop_name text,
  notes text,
  next_service_km numeric(10,2),            -- reminder odometer
  next_service_date date,                   -- reminder date
  created_at timestamptz default now()
);

-- EXPENSES (parking, toll, etc.)
create table expenses (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,                   -- 'toll','parking','car_wash','fine','insurance','other'
  amount_thb numeric(10,2) not null,
  expense_at timestamptz not null,
  notes text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table vehicles enable row level security;
alter table refuel_sessions enable row level security;
alter table service_logs enable row level security;
alter table expenses enable row level security;
alter table fuel_prices enable row level security;

-- RLS Policies (users see only their own data)
create policy "Users own vehicles" on vehicles for all using (auth.uid() = user_id);
create policy "Users own refuels" on refuel_sessions for all using (auth.uid() = user_id);
create policy "Users own services" on service_logs for all using (auth.uid() = user_id);
create policy "Users own expenses" on expenses for all using (auth.uid() = user_id);

-- Fuel prices are public read
create policy "Public read fuel prices" on fuel_prices for select using (true);
create policy "Service role insert fuel prices" on fuel_prices for insert with check (true);

-- Enable pg_cron extension (for scheduling)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the Edge Function to run daily at 00:00 UTC (07:00 AM Thailand time)
-- Note: Replace 'your_project_ref' and 'anon_key' with actual values or use Supabase Scheduled Functions UI instead.
-- SELECT cron.schedule(
--   'invoke-fuel-price-update',
--   '0 0 * * *', -- Every day at 00:00
--   $$
--   SELECT net.http_post(
--       url:='https://bplihuxnoxvdetuiootn.supabase.co/functions/v1/update-fuel-prices',
--       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
--       body:='{}'::jsonb
--   ) as request_id;
--   $$
-- );
