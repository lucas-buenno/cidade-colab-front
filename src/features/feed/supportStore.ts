import { create } from "zustand";

type SupportStore = {
  supportedIds: string[];
  isSupported: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
};

export const useSupportStore = create<SupportStore>((set, get) => ({
  supportedIds: [],
  isSupported: (id) => get().supportedIds.includes(id),
  add: (id) =>
    set((state) =>
      state.supportedIds.includes(id)
        ? state
        : { supportedIds: [...state.supportedIds, id] },
    ),
  remove: (id) =>
    set((state) => ({
      supportedIds: state.supportedIds.filter((item) => item !== id),
    })),
}));
