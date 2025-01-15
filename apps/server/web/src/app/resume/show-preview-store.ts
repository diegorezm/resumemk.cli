import { create } from "zustand";

interface IShowPreviewStore {
  showPreview: boolean;
  onCollapse: () => void;
  onExpand: () => void;
}

export const useShowPreviewStore = create<IShowPreviewStore>()((set) => ({
  showPreview: true,
  onCollapse: () => {
    set(() => ({
      showPreview: false,
    }));
  },
  onExpand: () => {
    set(() => ({
      showPreview: true,
    }));
  },
}));
