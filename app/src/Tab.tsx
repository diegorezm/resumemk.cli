import MDEditor from "@uiw/react-md-editor";
import {useEffect, useState} from "react";
import {useTabStore} from "./store";
import {Trash, Pencil, Download, Loader} from "./Icons";

type Props = {
  tab: App.Tab;
  toNextTab: () => void;
};

const DELAY = 1000;

export default function Tab({tab, toNextTab}: Props) {
  const {storeTabContent, removeTab, storeTabTitle} = useTabStore();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(tab.content);
  const [newTabTitle, setNewTabTitle] = useState(tab.title);

  useEffect(() => {
    const handler = setTimeout(() => {
      storeTabContent(content, tab.id);
    }, DELAY);
    return () => clearTimeout(handler);
  }, [content])

  const downloadPDF = () => {
    setIsLoading(true);
    const request = {
      title: tab.title,
      content: content,
    }

    fetch("/get_pdf", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(request),
    }).then(res => {
      res.blob().then(blob => {
        const link = document.createElement("a");
        link.hidden = true;
        link.href = URL.createObjectURL(blob);
        link.download = `${tab.title}.pdf`;
        link.click();
        link.remove();
      })
    }).catch(err => {
      console.error(err);
    }).finally(() => setIsLoading(false));
  }

  const downloadMarkdown = () => {
    setIsLoading(true);
    const link = document.createElement("a");
    link.hidden = true;
    link.href = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    link.download = `${tab.title}.md`;
    link.click();
    link.remove();
    setIsLoading(false);
  }

  return (
    <div className="space-y-4 h-full mt-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">{newTabTitle}</h1>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            removeTab(tab);
            toNextTab();
          }}>
            <Trash className="text-neutral-300 size-5" />
          </button>
          {/* @ts-ignore */}
          <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById("update-tab-modal")?.showModal()}>
            <Pencil className="text-neutral-300 size-5" />
          </button>
        </div>
        <div className="space-x-4">
          <button className="btn btn-ghost btn-sm" onClick={downloadMarkdown} disabled={isLoading}>
            <Download className="text-neutral-300 size-6" />
            Markdown
          </button>
          <button className="btn btn-ghost btn-sm" onClick={downloadPDF} disabled={isLoading}>
            <Download className="text-neutral-300 size-6" />
            PDF
          </button>
        </div>
      </div>
      <MDEditor
        height={400}
        value={content}
        onChange={(e) => setContent(e || "")} />


      <dialog className="modal" id="update-tab-modal">
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
              <button className="btn btn-primary" onClick={() => {
                storeTabTitle(newTabTitle, tab.id);
              }}>Save</button>
            </form>
          </div>
        </div>
      </dialog>

      {isLoading && <div className="text-neutral-300 flex flex-row gap-2" role="status">
        <Loader className="animate-spin" />
        Loading...
      </div>}
    </div>
  )
}
