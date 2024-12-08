import {create} from "zustand";
import {persist} from "zustand/middleware";

interface TabState {
  tabs: App.Tab[];
  addTab: (tab: App.Tab) => void;
  removeTab: (tab: App.Tab) => void;
  storeTabTitle: (title: string, tabId: string) => void;
  storeTabContent: (content: string, tabId: string) => void;
}

export const useTabStore = create<TabState>()(
  persist((set) => ({
    tabs: [],
    addTab: (tab) => set((state) => ({
      tabs: [...state.tabs, tab],
    })),
    removeTab: (tab) => set((state) => ({
      tabs: state.tabs.filter((t) => t.id !== tab.id),
    })),
    storeTabContent: (content, tabId) => set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? {...t, content} : t)),
    })),
    storeTabTitle: (title, tabId) => set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? {...t, title} : t)),
    })),
  }), {
    name: "tabs",
  })
)
