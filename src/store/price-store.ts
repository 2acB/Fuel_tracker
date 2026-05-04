import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FuelType, FuelPrice, StationBrand } from '../types';

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
          const res = await fetch(API_URL);
          const data = await res.json();

          if (data.status !== 'success') throw new Error('API returned error');

          const stations = data.response.stations;
          const date = data.response.date;
          const newPrices: FuelPrice[] = [];

          // Map API keys to our internal keys
          const stationMap: Record<string, StationBrand> = {
            ptt: 'ptt',
            bcp: 'bangchak',
            shell: 'shell',
            caltex: 'caltex',
            esso: 'esso',
            susco: 'susco',
          };

          const fuelMap: Record<string, FuelType> = {
            gasohol_95: 'gasohol_95',
            gasohol_91: 'gasohol_91',
            gasohol_e20: 'gasohol_e20',
            gasohol_e85: 'gasohol_e85',
            diesel: 'diesel',
            premium_diesel: 'premium_diesel',
            diesel_b7: 'diesel', // Map B7 to standard diesel if needed
          };

          Object.entries(stations).forEach(([sKey, sData]: [string, any]) => {
            const stationBrand = stationMap[sKey];
            if (!stationBrand) return;

            Object.entries(sData).forEach(([fKey, fData]: [string, any]) => {
              const fuelType = fuelMap[fKey];
              if (!fuelType) return;

              newPrices.push({
                id: `${sKey}-${fKey}-${date}`,
                fuel_type: fuelType,
                price_thb: Number((parseFloat(fData.price) + 0.05).toFixed(2)),
                station_brand: stationBrand,
                effective_date: date,
                source_url: API_URL,
              });
            });
          });

          set({ prices: newPrices, lastFetched: new Date().toISOString(), isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },
    }),
    { name: 'fueltrack-prices' }
  )
);
