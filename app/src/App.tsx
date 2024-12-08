import {useState} from "react";
import {useTabStore} from "./store";
import {genRandomId} from "./lib";
import Tab from "./Tab";
import {Plus} from "./Icons";

export default function App() {
  const {tabs, addTab} = useTabStore();
  const [currentTab, setCurrentTab] = useState<App.Tab | null>(tabs[0] || null);
  const [newTabTitle, setNewTabTitle] = useState("");

  const toNextTab = () => {
    if (tabs.length === 0) {
      console.log("no tabs");
      setCurrentTab(null);
      return;
    }
    const currentIndex = tabs.findIndex((t) => t.id === currentTab?.id);
    const nextTab = tabs[currentIndex + 1];
    setCurrentTab(nextTab || null);
  }

  const createTab = (title = "New tab") => {
    const id = genRandomId();
    addTab({id, title: title, content: ""});
    const t = tabs.find(t => t.id === id);
    if (t) {
      setCurrentTab(t);
    }
    setNewTabTitle("");
  }

  return (
    <div className="flex flex-col h-screen px-12 py-6">
      <nav className="flex items-center justify-between border-b border-neutral-200 pb-2 gap-2">
        <div className="flex items-center gap-6 overflow-x-auto">
          {tabs.length === 0 && <button className="btn btn-outline" onClick={() => createTab()}>
            <Plus className="size-5" />
          </button>}

          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`btn ${currentTab?.id === tab.id ? "btn-primary" : ""}`}
              onClick={() => setCurrentTab(tab)}
            >
              {tab.title}
            </button>
          ))}
        </div>
        <div className="">
          {/* @ts-ignore */}
          <button className="btn btn-outline" onClick={() => document.getElementById("create-tab-modal")?.showModal()}>New Tab</button>
        </div>
      </nav>
      <div>
        {
          currentTab !== null &&
          <Tab tab={currentTab} key={currentTab.id} toNextTab={toNextTab} />
        }
      </div>
      <dialog className="modal" id="create-tab-modal">
        <div className="modal-box">
          <label htmlFor="title" className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            placeholder="Tab title"
            className="input input-bordered w-full"
            id="title"
            value={newTabTitle}
            onChange={e => setNewTabTitle(e.target.value)} />
          <div className="modal-action">
            <form method="dialog" className="space-x-4">
              <button className="btn">Close</button>
              <button className="btn btn-primary" onClick={() => createTab(newTabTitle)}>Save</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
