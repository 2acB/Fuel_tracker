# ⛽ FuelTrack — Full Technical Specification & IDE Prompt
> Copy this entire document as your system prompt / project brief when working in Cursor, Windsurf, or any AI-assisted IDE.

---

## 🎯 Project Overview

Build a **Progressive Web App (PWA)** called **FuelTrack** — a vehicle fuel consumption tracker tailored for Thailand.
Users can manage multiple vehicles, log refueling sessions with GPS, view live Thai fuel prices, and analyze spending through dashboards and reports.

**Target Platform:** Mobile-first PWA (works in browser, installable on iOS/Android)
**Primary Market:** Thailand (THB currency, Thai fuel station brands, Thai fuel types)
**Language:** English UI (Thai locale for numbers/dates)

---

## 🏗️ Tech Stack (Non-Negotiable)

| Layer | Choice | Reason |
|---|---|---|
| Framework | **React 18 + TypeScript** | Type safety, ecosystem |
| Build Tool | **Vite** | Fast HMR, PWA plugin support |
| Styling | **Tailwind CSS v3** | Utility-first, mobile-first |
| UI Components | **shadcn/ui** | Accessible, customizable |
| State Management | **Zustand** | Lightweight, no boilerplate |
| Database | **Supabase** | Auth + Postgres + Realtime + Storage |
| Maps | **Leaflet.js + React-Leaflet** | Free, no API key needed |
| Charts | **Recharts** | React-native, composable |
| Forms | **React Hook Form + Zod** | Validation + type inference |
| PWA | **vite-plugin-pwa** | Offline support, installable |
| Date Handling | **date-fns** | Lightweight, tree-shakeable |
| HTTP Client | **axios** | Fuel price fetching |
| Icons | **Lucide React** | Consistent icon set |

---

## 📁 Project Structure

```
fueltrack/
├── public/
│   ├── icons/                    # PWA icons (192x192, 512x512)
│   └── manifest.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   │
│   ├── types/                    # All TypeScript interfaces
│   │   ├── vehicle.ts
│   │   ├── refuel.ts
│   │   ├── service.ts
│   │   ├── fuel-price.ts
│   │   └── index.ts
│   │
│   ├── lib/                      # Utilities & config
│   │   ├── supabase.ts           # Supabase client
│   │   ├── utils.ts              # cn(), formatters
│   │   ├── fuel-prices.ts        # Price fetching logic
│   │   └── calculations.ts       # km/L, cost/km logic
│   │
│   ├── store/                    # Zustand stores
│   │   ├── vehicle-store.ts
│   │   ├── refuel-store.ts
│   │   └── ui-store.ts           # FAB open state, active modal
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useGeolocation.ts
│   │   ├── useFuelPrices.ts
│   │   ├── useVehicles.ts
│   │   └── useRefuelHistory.ts
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui base components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # Bottom nav + FAB
│   │   │   ├── BottomNav.tsx
│   │   │   └── FAB.tsx           # Floating Action Button + radial menu
│   │   ├── vehicles/
│   │   │   ├── VehicleCard.tsx
│   │   │   ├── VehicleForm.tsx   # Add/Edit modal
│   │   │   └── VehicleList.tsx
│   │   ├── refuel/
│   │   │   ├── RefuelForm.tsx    # Main refuel logging modal
│   │   │   ├── RefuelCard.tsx
│   │   │   └── FuelTypeSelector.tsx
│   │   ├── map/
│   │   │   ├── RefuelMap.tsx     # Leaflet map component
│   │   │   └── RoutePolyline.tsx # Draw lines between refuel points
│   │   ├── charts/
│   │   │   ├── CostChart.tsx     # Monthly cost bar chart
│   │   │   ├── EfficiencyChart.tsx # km/L line chart over time
│   │   │   └── FuelTypeChart.tsx # Pie chart by fuel type
│   │   └── dashboard/
│   │       ├── StatCard.tsx
│   │       ├── PriceBoard.tsx    # Live fuel prices display
│   │       └── VehicleSummary.tsx
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Vehicles.tsx
│   │   ├── History.tsx
│   │   ├── MapView.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   │
│   └── service-worker/
│       └── sw.ts                 # Offline caching strategy
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

```sql
-- Run in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- VEHICLES
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
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
  id uuid primary key default uuid_generate_v4(),
  fuel_type text not null,                   -- 'gasohol_91','gasohol_95','gasohol_e20','gasohol_e85','diesel','premium_diesel'
  price_thb numeric(8,2) not null,
  station_brand text,                        -- 'bangchak','ptt','shell','caltex','esso','susco'
  effective_date date not null,
  source_url text,
  created_at timestamptz default now()
);

-- REFUELING SESSIONS
create table refuel_sessions (
  id uuid primary key default uuid_generate_v4(),
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
  created_at timestamptz default now()
);

-- SERVICE LOGS
create table service_logs (
  id uuid primary key default uuid_generate_v4(),
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
  id uuid primary key default uuid_generate_v4(),
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

-- RLS Policies (users see only their own data)
create policy "Users own vehicles" on vehicles for all using (auth.uid() = user_id);
create policy "Users own refuels" on refuel_sessions for all using (auth.uid() = user_id);
create policy "Users own services" on service_logs for all using (auth.uid() = user_id);
create policy "Users own expenses" on expenses for all using (auth.uid() = user_id);

-- Fuel prices are public read
create policy "Public read fuel prices" on fuel_prices for select using (true);
```

---

## 🔑 TypeScript Types

```typescript
// src/types/vehicle.ts
export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  make: string;
  model: string;
  year?: number;
  license_plate?: string;
  fuel_type: FuelType;
  tank_capacity_litres?: number;
  color?: string;
  avatar_emoji: string;
  created_at: string;
  updated_at: string;
}

// src/types/refuel.ts
export type FuelType =
  | 'gasohol_91'
  | 'gasohol_95'
  | 'gasohol_e20'
  | 'gasohol_e85'
  | 'diesel'
  | 'premium_diesel';

export const FUEL_LABELS: Record<FuelType, string> = {
  gasohol_91:     'Gasohol 91',
  gasohol_95:     'Gasohol 95',
  gasohol_e20:    'Gasohol E20',
  gasohol_e85:    'Gasohol E85',
  diesel:         'Diesel B7',
  premium_diesel: 'Premium Diesel',
};

export interface FuelPrice {
  id: string;
  fuel_type: FuelType;
  price_thb: number;
  station_brand: string;
  effective_date: string;
  source_url?: string;
}

export interface RefuelSession {
  id: string;
  vehicle_id: string;
  user_id: string;
  fueled_at: string;
  odometer_km: number;
  fuel_type: FuelType;
  litres?: number;
  cost_thb: number;
  price_per_litre_thb?: number;
  is_full_tank: boolean;
  station_brand?: string;
  station_name?: string;
  lat?: number;
  lng?: number;
  notes?: string;
  receipt_url?: string;
  created_at: string;
}
```

---

## 🎛️ Core Feature Specifications

### 1. FAB (Floating Action Button)
- Fixed bottom-center, above bottom nav
- Tap → radial/arc menu expands with 4 options:
  - ⛽ **Refuel** (primary)
  - 🔧 **Service**
  - 💰 **Expense**
  - ⏰ **Reminder**
- Background overlay dims when open
- Smooth CSS spring animation

```tsx
// FAB radial menu layout (positions relative to center button)
const FAB_ITEMS = [
  { icon: '⛽', label: 'Refuel',   angle: -90, action: 'refuel'   },
  { icon: '🔧', label: 'Service',  angle: -45, action: 'service'  },
  { icon: '💰', label: 'Expense',  angle: -135,action: 'expense'  },
  { icon: '⏰', label: 'Reminder', angle: 180, action: 'reminder' },
];
```

---

### 2. Refuel Form Modal (Most Important Feature)

**Fields in order:**
```
1. Vehicle selector          → dropdown (if multiple vehicles)
2. Date & Time               → datetime-local input, default = now()
3. Odometer (km)             → number input, validates > last entry
4. Fuel Type                 → pill selector (see FuelType enum)
5. Station Brand             → Bangchak | PTT | Shell | Caltex | Esso | Other
6. Full Tank?                → toggle switch (affects efficiency calc)
7. Cost (THB)                → large number input (primary input)
8. Price/Litre (THB/L)       → auto-filled from fuel_prices table, editable
9. Litres                    → AUTO-CALCULATED: cost ÷ price_per_litre
10. Location                 → "Use My Location" button → GPS coords + map pin
11. Notes                    → optional text
12. Receipt Photo            → optional camera/upload → Supabase Storage
```

**Calculation Logic:**
```typescript
// src/lib/calculations.ts

export const calculateLitres = (cost: number, pricePerLitre: number): number =>
  pricePerLitre > 0 ? parseFloat((cost / pricePerLitre).toFixed(3)) : 0;

export const calculateEfficiency = (
  currentOdometer: number,
  previousOdometer: number,
  litres: number
): number | null => {
  const distance = currentOdometer - previousOdometer;
  if (distance <= 0 || litres <= 0) return null;
  return parseFloat((distance / litres).toFixed(2)); // km/L
};

export const calculateCostPerKm = (cost: number, distanceKm: number): number =>
  distanceKm > 0 ? parseFloat((cost / distanceKm).toFixed(2)) : 0;
```

---

### 3. Live Fuel Prices

**Strategy (important — no official API exists):**

```typescript
// src/lib/fuel-prices.ts
// Primary: Check Supabase fuel_prices table for today's date
// Fallback: Show last known price with "as of [date]" label
// Manual override: Admin can update prices in Supabase directly

// Seed this data weekly from:
// - https://www.bangchak.co.th/th/retail-prices  
// - https://www.pttplc.com/th/Media-Center/Oil-Price.aspx

export const FUEL_PRICE_SOURCES = {
  bangchak: 'https://www.bangchak.co.th/th/retail-prices',
  ptt:      'https://www.pttplc.com/th/Media-Center/Oil-Price.aspx',
};

// In your app, fetch from YOUR Supabase table — don't scrape from client side
// Set up a Supabase Edge Function (cron) to scrape weekly and update the table
```

**Price Board UI Component:**
- Card showing a grid of all fuel types + current prices
- "Last updated: [date]" footer
- Color-coded: green = cheaper than last week, red = more expensive

---

### 4. Map Feature

```tsx
// src/components/map/RefuelMap.tsx
// Uses React-Leaflet — no Google Maps API key required

// Features:
// 1. Show pin for each refuel session (clustered if many)
// 2. Polyline connecting pins chronologically per vehicle
// 3. Popup on pin click: date, litres, cost, station
// 4. Vehicle filter (show only selected vehicle's history)
// 5. Color-code pins by vehicle

// Tile provider (free):
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// Custom pin colors per vehicle using DivIcon
const createVehiclePin = (color: string) =>
  L.divIcon({ className: 'custom-pin', html: `<div style="background:${color}">⛽</div>` });
```

**GPS Hook:**
```typescript
// src/hooks/useGeolocation.ts
export const useGeolocation = () => {
  const [coords, setCoords] = useState<{lat: number; lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('GPS not supported on this device');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError('Location permission denied. You can enter location manually.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { coords, error, loading, getLocation };
};
```

---

### 5. Dashboard Page

**Stat Cards (top row):**
- 💰 Total spend this month (THB)
- ⛽ Total litres this month
- 📏 Average km/L (best vehicle)
- 🚗 Active vehicles count

**Charts Section:**
```
1. Monthly Cost Bar Chart       → last 6 months, stacked by vehicle
2. Efficiency Trend Line Chart  → km/L over last 10 fill-ups per vehicle
3. Fuel Type Pie Chart          → spending breakdown by fuel type
```

**Price Board:**
- Live prices for all 6 fuel types
- Bangchak prices (most recent in DB)

---

### 6. Reports Page

**Filters:**
- Vehicle selector (all or specific)
- Date range picker (month/quarter/year/custom)

**Report Sections:**
```
📊 Summary Cards
  - Total fuel cost
  - Total litres consumed  
  - Total distance driven
  - Average cost per km
  - Average efficiency (km/L)

📈 Cost Analysis
  - Month-over-month comparison
  - Best month (cheapest per km)
  - Worst month

🚗 Per-Vehicle Breakdown table
  | Vehicle | Litres | Cost | Avg km/L | Cost/km |

⛽ Fuel Type Breakdown
  - How much spent on each fuel type

📍 Top Refuel Stations
  - Most visited stations
```

**Export:** PDF button (use `@react-pdf/renderer` or `jsPDF`)

---

## 🔒 Authentication

Use **Supabase Auth** with:
- Email + Password (primary)
- Google OAuth (secondary — easy for Thai users)

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## 📱 PWA Configuration

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
        handler: 'NetworkFirst',         // Try network, fallback to cache
        options: { cacheName: 'supabase-cache' }
      }
    ]
  },
  manifest: {
    name: 'FuelTrack',
    short_name: 'FuelTrack',
    theme_color: '#0ea5e9',
    background_color: '#0f172a',
    display: 'standalone',
    orientation: 'portrait',
  }
})
```

---

## 🎨 Design System

```css
/* Design Direction: Dark industrial — like a car dashboard */
/* Font pairing: "DM Mono" (numbers/data) + "Outfit" (UI text) */

:root {
  --bg-base:      #0a0f1e;   /* Deep navy — main background */
  --bg-card:      #111827;   /* Card background */
  --bg-elevated:  #1f2937;   /* Modals, dropdowns */
  --accent:       #f97316;   /* Fuel orange — primary CTA */
  --accent-blue:  #0ea5e9;   /* Sky blue — secondary */
  --success:      #10b981;   /* Green — efficiency good */
  --warning:      #f59e0b;   /* Amber — warning */
  --danger:       #ef4444;   /* Red — cost high */
  --text-primary: #f9fafb;
  --text-muted:   #6b7280;
  --border:       #1f2937;
}
```

**Component Patterns:**
- Cards: `rounded-2xl bg-card border border-border p-4`
- Primary button: `bg-accent text-white rounded-xl` (orange)
- Bottom sheet modals (not center dialogs) — feels native on mobile
- Skeleton loaders for all async data
- Empty states with helpful CTAs (not just blank)

---

## ⚙️ Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Optional: if you set up a scraping edge function
VITE_PRICE_UPDATE_WEBHOOK=https://xxxx.supabase.co/functions/v1/update-prices
```

---

## 📦 Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "axios": "^1.7.0",
    "lucide-react": "^0.447.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vite-plugin-pwa": "^0.20.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🚀 Build Order (Follow This Exactly)

### Phase 1 — Foundation (Day 1-2)
- [ ] `npm create vite@latest fueltrack -- --template react-ts`
- [ ] Install all dependencies
- [ ] Configure Tailwind, shadcn/ui
- [ ] Set up Supabase project + run migrations
- [ ] Build AppShell with BottomNav + placeholder pages
- [ ] Supabase auth (email login)

### Phase 2 — Core CRUD (Day 3-4)
- [ ] Vehicle list, add, edit, delete
- [ ] Zustand store for vehicles
- [ ] Refuel form (no GPS yet, no live prices yet)
- [ ] Refuel history list

### Phase 3 — Intelligence (Day 5-6)
- [ ] Fuel price seeding in Supabase
- [ ] Auto-fill price in refuel form
- [ ] Litres auto-calculation
- [ ] km/L calculation on save
- [ ] Dashboard stat cards

### Phase 4 — Maps (Day 7)
- [ ] GPS hook
- [ ] Leaflet map with refuel pins
- [ ] Polyline between pins per vehicle
- [ ] Map filter by vehicle

### Phase 5 — Analytics (Day 8-9)
- [ ] All Recharts charts
- [ ] Reports page with date filter
- [ ] Per-vehicle breakdown table

### Phase 6 — Polish (Day 10)
- [ ] PWA manifest + service worker
- [ ] Offline mode (queue refuel saves)
- [ ] Skeleton loaders + empty states
- [ ] FAB radial animation
- [ ] Receipt photo upload

---

## 🧠 Cursor/Windsurf Prompt Template

When asking your AI IDE to build a specific piece, use this pattern:

```
Context: I'm building FuelTrack, a PWA fuel consumption tracker for Thailand.
Stack: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Supabase + Zustand

Task: Build [COMPONENT NAME]

Requirements:
- [specific requirement 1]
- [specific requirement 2]

Refer to these types: [paste relevant types from src/types/]
Design: Dark theme, accent color #f97316 (orange), rounded-2xl cards
Mobile-first, bottom sheet modals not center dialogs
```

---

## ⚠️ Key Pitfalls to Avoid

1. **Don't scrape fuel prices from the browser** — CORS will block you. Use a Supabase Edge Function as a proxy, or manually seed prices weekly.

2. **Efficiency calculation requires full tank** — Always check `is_full_tank === true` before calculating km/L. Partial fills give wrong numbers.

3. **Odometer must be monotonically increasing** — Validate `newOdometer > lastOdometer` on save.

4. **GPS coords are optional** — Never block saving a refuel session because GPS failed. Degrade gracefully.

5. **Leaflet SSR issues** — Leaflet uses `window` internally. Use dynamic imports or `typeof window !== 'undefined'` guards.

6. **Date/time is user-selected, not server time** — Use `fueled_at` (user picks), not `created_at` for all calculations and sorting.

7. **Use Row Level Security** — Never disable RLS on Supabase. All tables have policies from day 1.

---

*Generated for FuelTrack v1.0 — Thailand Fuel Consumption Tracker PWA*
