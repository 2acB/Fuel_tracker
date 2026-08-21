import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Vehicle } from '../types';
import { generateId } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface VehicleState {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  addVehicle: (v: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateVehicle: (id: string, v: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  setActiveVehicle: (id: string | null) => void;
  syncPending: () => Promise<void>;
  fetchCloudVehicles: () => Promise<void>;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      activeVehicleId: null,

      addVehicle: (v) =>
        set((state) => {
          const now = new Date().toISOString();
          const newVehicle: Vehicle = {
            ...v,
            id: generateId(),
            user_id: 'local', // Overridden during sync
            created_at: now,
            updated_at: now,
            sync_status: 'PENDING'
          } as any;
          
          setTimeout(() => get().syncPending(), 100);

          return {
            vehicles: [...state.vehicles, newVehicle],
            activeVehicleId: state.activeVehicleId ?? newVehicle.id,
          };
        }),

      updateVehicle: (id, v) =>
        set((state) => {
          setTimeout(() => get().syncPending(), 100);
          return {
            vehicles: state.vehicles.map((veh) =>
              veh.id === id ? { ...veh, ...v, updated_at: new Date().toISOString(), sync_status: 'PENDING' } as any : veh
            ),
          };
        }),

      deleteVehicle: (id) =>
        set((state) => {
          supabase.from('vehicles').delete().eq('id', id).then();
          return {
            vehicles: state.vehicles.filter((v) => v.id !== id),
            activeVehicleId: state.activeVehicleId === id
              ? (state.vehicles.find((v) => v.id !== id)?.id ?? null)
              : state.activeVehicleId,
          };
        }),

      setActiveVehicle: (id) => set({ activeVehicleId: id }),

      fetchCloudVehicles: async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data, error } = await supabase.from('vehicles').select('*');
        if (!error && data) {
          set(state => {
            const pending = state.vehicles.filter(v => (v as any).sync_status === 'PENDING');
            const merged = [...data];
            pending.forEach(p => {
              if (!merged.find(m => m.id === p.id)) merged.push(p);
            });
            return { vehicles: merged, activeVehicleId: merged.length > 0 ? merged[0].id : null };
          });
          
          setTimeout(() => get().syncPending(), 100);
        }
      },

      syncPending: async () => {
        if (!navigator.onLine) return;
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const state = get();
        const pending = state.vehicles.filter((v: any) => v.sync_status === 'PENDING');
        if (pending.length === 0) return;

        for (const veh of pending) {
          const { sync_status, ...dbVeh } = veh as any;
          dbVeh.user_id = userData.user.id;
          
          const { error } = await supabase.from('vehicles').upsert(dbVeh, { onConflict: 'id' });
          if (!error) {
            set(s => ({
              vehicles: s.vehicles.map(x => x.id === veh.id ? { ...x, sync_status: 'SYNCED', user_id: userData.user.id } as any : x)
            }));
          }
        }
      }
    }),
    { name: 'fueltrack-vehicles' }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useVehicleStore.getState().syncPending();
  });
}
