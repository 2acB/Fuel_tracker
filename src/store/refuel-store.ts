import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RefuelSession } from '../types';
import { generateId } from '../lib/utils';
import { calculateEfficiency } from '../lib/calculations';

interface RefuelState {
  sessions: RefuelSession[];
  addSession: (s: Omit<RefuelSession, 'id' | 'user_id' | 'created_at' | 'efficiency_kml'>) => void;
  updateSession: (id: string, s: Partial<RefuelSession>) => void;
  deleteSession: (id: string) => void;
  getSessionsByVehicle: (vehicleId: string) => RefuelSession[];
  getLastSession: (vehicleId: string) => RefuelSession | undefined;
}

export const useRefuelStore = create<RefuelState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (s) =>
        set((state) => {
          // Calculate efficiency if full tank and we have a previous session
          let efficiency_kml: number | undefined;
          if (s.is_full_tank && s.litres && s.litres > 0) {
            const prev = get()
              .sessions.filter((x) => x.vehicle_id === s.vehicle_id)
              .sort((a, b) => b.odometer_km - a.odometer_km)[0];
            if (prev) {
              const eff = calculateEfficiency(s.odometer_km, prev.odometer_km, s.litres);
              if (eff !== null) efficiency_kml = eff;
            }
          }

          const newSession: RefuelSession = {
            ...s,
            id: generateId(),
            user_id: 'local',
            efficiency_kml,
            created_at: new Date().toISOString(),
          };
          return { sessions: [...state.sessions, newSession] };
        }),

      updateSession: (id, s) =>
        set((state) => ({
          sessions: state.sessions.map((ses) =>
            ses.id === id ? { ...ses, ...s } : ses
          ),
        })),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),

      getSessionsByVehicle: (vehicleId) =>
        get()
          .sessions.filter((s) => s.vehicle_id === vehicleId)
          .sort((a, b) => new Date(b.fueled_at).getTime() - new Date(a.fueled_at).getTime()),

      getLastSession: (vehicleId) => {
        const vehicleSessions = get()
          .sessions.filter((s) => s.vehicle_id === vehicleId)
          .sort((a, b) => b.odometer_km - a.odometer_km);
        return vehicleSessions[0];
      },
    }),
    { name: 'fueltrack-refuels' }
  )
);
