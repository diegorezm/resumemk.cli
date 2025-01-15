import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useResumeStore } from "@/store/use-resume-store";
import { Resume } from "@/types";
import { FormEvent, useState } from "react";

type Props = {
  resume: Resume;
  openEditDialog: boolean;
  setOpenEditDialog: (b: boolean) => void;
};

export const EditDialog = ({
  resume,
  openEditDialog,
  setOpenEditDialog,
}: Props) => {
  const { setResumeTitle } = useResumeStore();
  const [formError, setFormError] = useState<string | null>(null);

  const onEditSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (resume?.id === undefined) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get("title")?.toString() ?? "";

    if (title.length < 2) {
      setFormError("The title has to have more than two characters.");
      return;
    }

    if (title.length > 12) {
      setFormError("The title cannot have more than 12 characters.");
      return;
    }

    setResumeTitle(resume?.id, title);
    setOpenEditDialog(false);
    form.reset();
  };

  return (
    <Dialog
      open={openEditDialog}
      onOpenChange={() => setOpenEditDialog(!openEditDialog)}
    >
      <form
        onSubmit={onEditSubmit}
        className="flex flex-col items-start w-full gap-2"
      >
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          placeholder="Title"
          id="title"
          className="input"
          defaultValue={resume.title}
          autoFocus
        />
        {formError && <p className="text-sm text-th-red">{formError}</p>}
        <div className="w-full py-2 mt-2 border-t space-x-4 border-t-th-muted">
          <Button
            variant="ghost"
            type="button"
            onClick={() => setOpenEditDialog(false)}
          >
            Cancel
          </Button>
          <Button>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
};
