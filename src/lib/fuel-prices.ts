import type { FuelPrice, FuelType, StationBrand } from '../types';

/** Default Thai fuel prices (Bangchak, as of seeded data) */
export const DEFAULT_FUEL_PRICES: FuelPrice[] = [
  { id: '1', fuel_type: 'gasohol_91', price_thb: 36.13, station_brand: 'bangchak', effective_date: '2026-04-20', source_url: 'https://www.bangchak.co.th/th/retail-prices' },
  { id: '2', fuel_type: 'gasohol_95', price_thb: 43.53, station_brand: 'bangchak', effective_date: '2026-04-20', source_url: 'https://www.bangchak.co.th/th/retail-prices' },
  { id: '3', fuel_type: 'gasohol_e20', price_thb: 34.33, station_brand: 'bangchak', effective_date: '2026-04-20', source_url: 'https://www.bangchak.co.th/th/retail-prices' },
  { id: '4', fuel_type: 'gasohol_e85', price_thb: 25.59, station_brand: 'bangchak', effective_date: '2026-04-20', source_url: 'https://www.bangchak.co.th/th/retail-prices' },
  { id: '5', fuel_type: 'diesel', price_thb: 33.49, station_brand: 'bangchak', effective_date: '2026-04-20', source_url: 'https://www.bangchak.co.th/th/retail-prices' },
  { id: '6', fuel_type: 'premium_diesel', price_thb: 39.41, station_brand: 'bangchak', effective_date: '2026-04-20', source_url: 'https://www.bangchak.co.th/th/retail-prices' },
];

/** Get latest price for a fuel type from a specific brand or default to first match */
export function getLatestPrice(
  fuelType: FuelType, 
  prices: FuelPrice[] = [], 
  brand?: StationBrand
): number | undefined {
  const list = prices.length > 0 ? prices : DEFAULT_FUEL_PRICES;
  const match = list.find((p) => p.fuel_type === fuelType && (!brand || p.station_brand === brand));
  return match?.price_thb ?? list.find(p => p.fuel_type === fuelType)?.price_thb;
}

/** Get all latest prices grouped by fuel type */
export function getAllLatestPrices(prices: FuelPrice[] = DEFAULT_FUEL_PRICES): Record<FuelType, number> {
  const result: Partial<Record<FuelType, number>> = {};
  for (const p of prices) {
    result[p.fuel_type] = p.price_thb;
  }
  return result as Record<FuelType, number>;
}
