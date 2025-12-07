import { create } from 'zustand';
export const useHeaderActions = create((set) => ({
    actions: null,
    setActions: (actions) => set({ actions }),
}));
