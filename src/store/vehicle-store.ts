import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Vehicle } from '../types';
import { generateId } from '../lib/utils';

interface VehicleState {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  addVehicle: (v: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateVehicle: (id: string, v: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  setActiveVehicle: (id: string | null) => void;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set) => ({
      vehicles: [],
      activeVehicleId: null,

      addVehicle: (v) =>
        set((state) => {
          const now = new Date().toISOString();
          const newVehicle: Vehicle = {
            ...v,
            id: generateId(),
            user_id: 'local',
            created_at: now,
            updated_at: now,
          };
          const vehicles = [...state.vehicles, newVehicle];
          return {
            vehicles,
            activeVehicleId: state.activeVehicleId ?? newVehicle.id,
          };
        }),

      updateVehicle: (id, v) =>
        set((state) => ({
          vehicles: state.vehicles.map((veh) =>
            veh.id === id ? { ...veh, ...v, updated_at: new Date().toISOString() } : veh
          ),
        })),

      deleteVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
          activeVehicleId: state.activeVehicleId === id
            ? (state.vehicles.find((v) => v.id !== id)?.id ?? null)
            : state.activeVehicleId,
        })),

      setActiveVehicle: (id) => set({ activeVehicleId: id }),
    }),
    { name: 'fueltrack-vehicles' }
  )
);
