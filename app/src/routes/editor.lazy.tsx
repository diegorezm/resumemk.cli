import {createLazyFileRoute} from '@tanstack/react-router'
import React, {useState} from "react";
import {useTabStore} from "@/store/use-tab-store";
import {Plus} from "@/components/icons";
import {Tab} from "@/components/editor/tab";
import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";

const genRandomId = () => {
  return crypto.randomUUID()
}

export const Route = createLazyFileRoute('/editor')({
  component: RouteComponent,
})

function RouteComponent() {
  const {tabs, addTab} = useTabStore();
  const [currentTab, setCurrentTab] = useState<Tab | null>(tabs[0] || null);
  const [newTabTitle, setNewTabTitle] = useState("");
  const [openDialog, setOnOpenDialog] = useState(false)

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

  const onCreateTabSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTab(newTabTitle)
    setOnOpenDialog(false)
  }

  return (
    <div className="flex flex-col h-screen px-12 py-6">

      <nav className="flex items-center justify-between pb-2 border-b border-b-th-muted gap-2">
        <div className="flex items-center overflow-x-auto gap-6">
          {tabs.length === 0 && <button className="btn btn-outline" onClick={() => createTab()}>
            <Plus className="size-5" />
          </button>}

          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={tab.id === currentTab?.id ? 'primary' : 'outline'}
              onClick={() => setCurrentTab(tab)}
            >
              {tab.title}
            </Button>
          ))}
        </div>
        <Button onClick={() => setOnOpenDialog(!openDialog)}>New Tab</Button>
      </nav>

      <div>
        {
          currentTab !== null &&
          <Tab tab={currentTab} key={currentTab.id} toNextTab={toNextTab} />
        }
      </div>

      <Dialog open={openDialog} onOpenChange={() => setOnOpenDialog(!openDialog)}>
        <form className="flex flex-col" onSubmit={onCreateTabSubmit}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            placeholder="Title"
            id="title"
            className="input"
            value={newTabTitle}
            onChange={e => setNewTabTitle(e.target.value)} />
          <div className="flex mt-6 gap-2">
            <Button variant="ghost" type="button" onClick={() => setOnOpenDialog(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
