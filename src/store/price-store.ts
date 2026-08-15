import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FuelType, FuelPrice, StationBrand } from '../types';
import { supabase } from '../lib/supabase';

interface PriceState {
  prices: FuelPrice[];
  lastFetched: string | null;
  isLoading: boolean;
  error: string | null;
  fetchPrices: () => Promise<void>;
}

const API_URL = 'https://api.chnwt.dev/thai-oil-api/latest';

export const usePriceStore = create<PriceState>()(
  persist(
    (set) => ({
      prices: [],
      lastFetched: null,
      isLoading: false,
      error: null,
      fetchPrices: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('fuel_prices')
            .select('*')
            .order('effective_date', { ascending: false })
            .limit(100);

          if (error) throw error;
          if (!data || data.length === 0) {
            // No data in Supabase yet, we could trigger the edge function here manually
            // or just rely on DEFAULT_FUEL_PRICES.
            throw new Error('No prices found in database');
          }

          // We want the latest price for each (station_brand, fuel_type)
          const latestPricesMap = new Map<string, FuelPrice>();
          
          for (const record of data) {
            const key = `${record.station_brand}-${record.fuel_type}`;
            if (!latestPricesMap.has(key)) {
              latestPricesMap.set(key, record as FuelPrice);
            }
          }

          const newPrices = Array.from(latestPricesMap.values());

          set({ prices: newPrices, lastFetched: new Date().toISOString(), isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },
    }),
    { name: 'fueltrack-prices' }
  )
);
