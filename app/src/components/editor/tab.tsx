import MDEditor from "@uiw/react-md-editor";
import {useEffect, useState} from "react";
import {useTabStore} from "@/store/use-tab-store";
import {Trash, Pencil, Download, Loader} from "@/components/icons";
import {Button} from "../ui/button";
import {Dialog} from "../ui/dialog";

type Props = {
  tab: Tab;
  toNextTab: () => void;
};

const DELAY = 1000;

export const Tab = ({tab, toNextTab}: Props) => {
  const {storeTabContent, removeTab, storeTabTitle} = useTabStore();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(tab.content);
  const [tabTitle, setTabTitle] = useState(tab.title);
  const [newTabTitle, setNewTabTitle] = useState(tab.title);
  const [openDialog, setOnOpenDialog] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      storeTabContent(content, tab.id);
    }, DELAY);
    return () => clearTimeout(handler);
  }, [content])

  const onCloseDialog = () => {
    setNewTabTitle(tabTitle)
    setOnOpenDialog(false)
  }

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

  const onUpdateTabSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    storeTabTitle(newTabTitle, tab.id);
    setTabTitle(newTabTitle)
    onCloseDialog()
  }
  return (
    <>
      <div className="h-full mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold">{tabTitle}</h1>
            <Button variant="ghost" size="sm" onClick={() => {
              removeTab(tab);
              toNextTab();
            }}>
              <Trash className="size-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOnOpenDialog(!openDialog)}>
              <Pencil className="size-5" />
            </Button>
          </div>
          <div className="space-x-4">
            <Button variant="secondary" onClick={downloadMarkdown} disabled={isLoading}>
              <Download className="size-5" />
              Markdown
            </Button>
            <Button variant="secondary" onClick={downloadPDF} disabled={isLoading}>
              <Download className="size-5" />
              PDF
            </Button>
          </div>
        </div>
        <MDEditor
          height={700}
          value={content}
          onChange={(e) => setContent(e || "")} />


        {isLoading && <div className="flex flex-row text-neutral-300 gap-2" role="status">
          <Loader className="animate-spin" />
          Loading...
        </div>}

      </div>
      <Dialog open={openDialog} onOpenChange={onCloseDialog}>
        <form className="flex flex-col gap-2" onSubmit={onUpdateTabSubmit}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            placeholder="Title"
            id="title"
            className="input"
            value={newTabTitle}
            onChange={e => setNewTabTitle(e.target.value)} />
          <div className="flex mt-6 gap-2">
            <Button variant="ghost" type="button" onClick={onCloseDialog}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
