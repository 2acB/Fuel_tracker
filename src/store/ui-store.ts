import { create } from 'zustand';

type ModalType = 'refuel' | 'vehicle' | 'service' | 'expense' | 'reminder' | null;

interface UIState {
  fabOpen: boolean;
  activeModal: ModalType;
  editingId: string | null;
  toggleFab: () => void;
  closeFab: () => void;
  openModal: (modal: ModalType, editId?: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  fabOpen: false,
  activeModal: null,
  editingId: null,

  toggleFab: () => set((s) => ({ fabOpen: !s.fabOpen })),
  closeFab: () => set({ fabOpen: false }),
  openModal: (modal, editId) => set({ activeModal: modal, editingId: editId ?? null, fabOpen: false }),
  closeModal: () => set({ activeModal: null, editingId: null }),
}));
