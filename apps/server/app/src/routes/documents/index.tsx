import {Download, Eye, Plus, Trash} from "@/components/icons";
import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {DEFAULT_RESUME, DEFAULT_STYLES} from "@/constants/default";
import {useResumeStore} from "@/store/use-resume-store"
import {downloadPDF} from "@/utils/request";
import {Link, useNavigate} from "@tanstack/react-router";
import {createFileRoute} from '@tanstack/react-router'
import {parse} from "marked";
import {useState} from "react";

export const Route = createFileRoute('/documents/')({
  component: RouteComponent,
})

const genRandomId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
};

const ResumeCard = ({resume}: {resume: Resume}) => {
  const {removeResume} = useResumeStore()
  return (
    <div
      className="overflow-hidden shadow-md rounded-md"
    >
      <div className="flex items-center justify-between p-4 bg-th-primary text-th-background">
        <h2 className="text-lg font-bold">{resume.title}</h2>
        <div className="flex gap-2 text-th-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeResume(resume)}
          >
            <Trash className="text-th-background" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => downloadPDF(resume)}>
            <Download className="text-th-background" />
          </Button>
          <Link to="/documents/$documentId" params={{
            documentId: resume.id
          }}>
            <Button variant="ghost" size="icon">
              <Eye className="text-th-background" />
            </Button>
          </Link>
        </div>
      </div>
      <div
        className="p-4 overflow-hidden bg-gray-100 border-t border-gray-200 max-h-[200px]"
        dangerouslySetInnerHTML={{
          __html: parse(resume.content)
        }}
      />
    </div>
  )
}

function RouteComponent() {
  const {resumes, addResume} = useResumeStore()
  const [formError, setFormError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const navigation = useNavigate()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const title = formData.get("title")?.toString() || ""
    const includeTemplate = formData.get("template") === "on";
    if (title.length < 2) {
      setFormError("The title has to have more than two characters.")
      return;
    }

    if (title.length > 12) {
      setFormError("The title cannot have more than 12 characters.")
      return;
    }

    const resume: Resume = {
      id: genRandomId(),
      title: title,
      content: includeTemplate ? DEFAULT_RESUME : "",
      css: DEFAULT_STYLES
    }

    form.reset()
    addResume(resume)
    setFormError("")
    setOpen(false)
    navigation({
      to: "/documents/$documentId",
      params: {
        documentId: resume.id
      },
    })
  }

  return (
    <>
      <div className="flex flex-col p-4 gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Resumes</h1>
          <Button variant="outline" onClick={() => setOpen(!open)} >
            <Plus size={20} />
            Create New
          </Button>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center">
          {resumes.length === 0 && (
            <div className="text-md text-th-secondary">
              No resumes yet.
            </div>
          )}
          {resumes.map((resume) => (
            <ResumeCard resume={resume} key={resume.id} />
          ))}
        </div>
      </div>
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <form className="flex flex-col items-start w-full gap-2" onSubmit={onSubmit}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="title"
            placeholder="Title"
            id="title"
            className="input"
            autoFocus
          />

          <div className="flex text-sm gap-2">
            <input type="checkbox" name="template" id="template" defaultChecked />
            <label htmlFor="template">Add template?</label>
          </div>

          {formError && (
            <p className="text-sm text-th-red">{formError}</p>
          )}
          <div className="w-full py-2 mt-2 border-t space-x-4 border-t-th-muted">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button>
              Create
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
