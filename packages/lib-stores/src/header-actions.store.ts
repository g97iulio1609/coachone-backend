import { create } from 'zustand';
import type { ReactNode } from 'react';

interface HeaderActionsState {
  actions: ReactNode | null;
  leftContent: ReactNode | null;
  setActions: (actions: ReactNode | null) => void;
  setLeftContent: (content: ReactNode | null) => void;
}

export const useHeaderActions = create<HeaderActionsState>((set) => ({
  actions: null,
  leftContent: null,
  setActions: (actions) => set({ actions }),
  setLeftContent: (leftContent) => set({ leftContent }),
}));
