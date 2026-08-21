// ── Fuel Types ──────────────────────────────────────────────
export type FuelType =
  | 'gasohol_91'
  | 'gasohol_95'
  | 'premium_gasohol_95'
  | 'gasohol_e20'
  | 'gasohol_e85'
  | 'diesel'
  | 'premium_diesel';

export const FUEL_LABELS: Record<FuelType, string> = {
  gasohol_91: 'Gasohol 91',
  gasohol_95: 'Gasohol 95',
  premium_gasohol_95: 'Premium Gasohol 95',
  gasohol_e20: 'Gasohol E20',
  gasohol_e85: 'Gasohol E85',
  diesel: 'Diesel B7',
  premium_diesel: 'Premium Diesel',
};

export const FUEL_COLORS: Record<FuelType, string> = {
  gasohol_91: '#22c55e',
  gasohol_95: '#3b82f6',
  premium_gasohol_95: '#2563eb',
  gasohol_e20: '#a855f7',
  gasohol_e85: '#ec4899',
  diesel: '#f59e0b',
  premium_diesel: '#ef4444',
};

// ── Station Brands ──────────────────────────────────────────
export type StationBrand = 'bangchak' | 'ptt' | 'shell' | 'caltex' | 'esso' | 'susco' | 'other';

export const STATION_LABELS: Record<StationBrand, string> = {
  bangchak: 'Bangchak',
  ptt: 'PTT',
  shell: 'Shell',
  caltex: 'Caltex',
  esso: 'Esso',
  susco: 'Susco',
  other: 'Other',
};

// ── Vehicle ─────────────────────────────────────────────────
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

// ── Refuel Session ──────────────────────────────────────────
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
  station_brand?: StationBrand;
  station_name?: string;
  lat?: number;
  lng?: number;
  notes?: string;
  receipt_url?: string;
  efficiency_kml?: number; // km/L calculated on save
  status?: 'DRAFT' | 'CONFIRMED';
  sync_status?: 'PENDING' | 'SYNCED';
  created_at: string;
}

// ── Fuel Price ──────────────────────────────────────────────
export interface FuelPrice {
  id: string;
  fuel_type: FuelType;
  price_thb: number;
  station_brand: string;
  effective_date: string;
  source_url?: string;
}

// ── Service Log ─────────────────────────────────────────────
export type ServiceType = 'oil_change' | 'tire' | 'brake' | 'filter' | 'inspection' | 'other';

export interface ServiceLog {
  id: string;
  vehicle_id: string;
  user_id: string;
  service_type: ServiceType;
  serviced_at: string;
  odometer_km?: number;
  cost_thb?: number;
  workshop_name?: string;
  notes?: string;
  next_service_km?: number;
  next_service_date?: string;
  created_at: string;
}

// ── Expense ─────────────────────────────────────────────────
export type ExpenseCategory = 'toll' | 'parking' | 'car_wash' | 'fine' | 'insurance' | 'other';

export interface Expense {
  id: string;
  vehicle_id: string;
  user_id: string;
  category: ExpenseCategory;
  amount_thb: number;
  expense_at: string;
  notes?: string;
  created_at: string;
}
