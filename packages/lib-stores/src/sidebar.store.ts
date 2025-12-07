import { create } from 'zustand';
import type { ReactNode } from 'react';

interface SidebarStore {
  extraContent: ReactNode | null;
  setExtraContent: (content: ReactNode | null) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  extraContent: null,
  setExtraContent: (content) => set({ extraContent: content }),
}));
