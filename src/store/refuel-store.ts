import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RefuelSession } from '../types';
import { generateId } from '../lib/utils';
import { calculateEfficiency } from '../lib/calculations';
import { supabase } from '../lib/supabase';

interface RefuelState {
  sessions: RefuelSession[];
  addSession: (s: Omit<RefuelSession, 'id' | 'user_id' | 'created_at' | 'efficiency_kml'>) => void;
  updateSession: (id: string, s: Partial<RefuelSession>) => void;
  deleteSession: (id: string) => void;
  getSessionsByVehicle: (vehicleId: string) => RefuelSession[];
  getLastSession: (vehicleId: string) => RefuelSession | undefined;
  syncPending: () => Promise<void>;
  fetchCloudSessions: () => Promise<void>;
}

export const useRefuelStore = create<RefuelState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (s) =>
        set((state) => {
          let efficiency_kml: number | undefined;
          if (s.is_full_tank && s.litres && s.litres > 0) {
            const prev = get()
              .sessions.filter((x) => x.vehicle_id === s.vehicle_id && x.status === 'CONFIRMED')
              .sort((a, b) => b.odometer_km - a.odometer_km)[0];
            if (prev) {
              const eff = calculateEfficiency(s.odometer_km, prev.odometer_km, s.litres);
              if (eff !== null) efficiency_kml = eff;
            }
          }

          const newSession: RefuelSession = {
            ...s,
            id: generateId(),
            user_id: 'local', // Will be overridden by auth user id on sync
            efficiency_kml,
            status: s.status || 'CONFIRMED',
            sync_status: 'PENDING',
            created_at: new Date().toISOString(),
          };

          // Attempt sync asynchronously
          setTimeout(() => get().syncPending(), 100);

          return { sessions: [...state.sessions, newSession] };
        }),

      updateSession: (id, s) =>
        set((state) => {
          const updatedSessions = state.sessions.map((ses) =>
            ses.id === id ? { ...ses, ...s, sync_status: 'PENDING' as const } : ses
          );
          
          // Attempt sync asynchronously
          setTimeout(() => get().syncPending(), 100);

          return { sessions: updatedSessions };
        }),

      deleteSession: (id) =>
        set((state) => {
          // If we want to truly delete from Supabase, we should make an API call here.
          // For now, we just remove locally.
          supabase.from('refuel_sessions').delete().eq('id', id).then();
          return { sessions: state.sessions.filter((s) => s.id !== id) };
        }),

      getSessionsByVehicle: (vehicleId) =>
        get()
          .sessions.filter((s) => s.vehicle_id === vehicleId)
          .sort((a, b) => new Date(b.fueled_at).getTime() - new Date(a.fueled_at).getTime()),

      getLastSession: (vehicleId) => {
        const vehicleSessions = get()
          .sessions.filter((s) => s.vehicle_id === vehicleId && s.status === 'CONFIRMED')
          .sort((a, b) => b.odometer_km - a.odometer_km);
        return vehicleSessions[0];
      },

      fetchCloudSessions: async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data, error } = await supabase.from('refuel_sessions').select('*');
        if (!error && data) {
          // Merge or replace based on strategy, simplest is replace for now
          // (assuming no pending offline drafts are overwritten without care)
          set(state => {
            const pending = state.sessions.filter(s => s.sync_status === 'PENDING');
            return { sessions: [...data, ...pending] };
          });
        }
      },

      syncPending: async () => {
        if (!navigator.onLine) return;

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return; // Must be logged in to sync

        const state = get();
        const pendingSessions = state.sessions.filter(s => s.sync_status === 'PENDING');

        if (pendingSessions.length === 0) return;

        // Upsert all pending sessions
        for (const session of pendingSessions) {
          const { sync_status, ...dbSession } = session; // Remove local-only fields
          
          // Ensure correct user_id
          dbSession.user_id = userData.user.id;

          const { error } = await supabase
            .from('refuel_sessions')
            .upsert(dbSession, { onConflict: 'id' });

          if (!error) {
            // Mark as synced locally
            set(s => ({
              sessions: s.sessions.map(x => 
                x.id === session.id ? { ...x, sync_status: 'SYNCED', user_id: userData.user.id } : x
              )
            }));
          } else {
            console.error('Failed to sync session:', session.id, error);
          }
        }
      }
    }),
    { name: 'fueltrack-refuels' }
  )
);

// Setup online listener to trigger sync automatically
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useRefuelStore.getState().syncPending();
  });
}
