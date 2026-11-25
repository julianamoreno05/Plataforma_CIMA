import { create } from "zustand";

interface AssistantPanelState {
  open: boolean;
  openPanel: () => void;
  closePanel: () => void;
}

export const useAssistantPanel = create<AssistantPanelState>((set) => ({
  open: false,
  openPanel: () => set({ open: true }),
  closePanel: () => set({ open: false }),
}));
