import { create } from 'zustand';
import type { ReactNode } from 'react';

interface HeaderActionsState {
  actions: ReactNode | null;
  setActions: (actions: ReactNode | null) => void;
}

export const useHeaderActions = create<HeaderActionsState>((set) => ({
  actions: null,
  setActions: (actions) => set({ actions }),
}));
