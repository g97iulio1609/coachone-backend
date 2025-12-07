import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type OneAgendaView = 'agenda' | 'projects' | 'habits' | 'gantt';

interface OneAgendaState {
  selectedDate: Date;
  view: OneAgendaView;
  quickActionDate: Date | null;
  taskStatusFilter?: string | null;
}

interface OneAgendaActions {
  setSelectedDate: (date: Date) => void;
  setView: (view: OneAgendaView) => void;
  setQuickActionDate: (date: Date | null) => void;
  setTaskStatusFilter: (status: string | null) => void;
  reset: () => void;
}

type OneAgendaStore = OneAgendaState & OneAgendaActions;

const initialState: OneAgendaState = {
  selectedDate: new Date(),
  view: 'agenda',
  quickActionDate: null,
  taskStatusFilter: null,
};

export const useOneAgendaStore = create<OneAgendaStore>()(
  subscribeWithSelector((set) => ({
    ...initialState,
    setSelectedDate: (date) => set({ selectedDate: date }),
    setView: (view) => set({ view }),
    setQuickActionDate: (date) => set({ quickActionDate: date }),
    setTaskStatusFilter: (status) => set({ taskStatusFilter: status }),
    reset: () => set(initialState),
  }))
);
