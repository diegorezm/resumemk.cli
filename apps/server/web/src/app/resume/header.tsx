import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Menu,
  Pencil,
  Trash,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/use-resume-store";
import { Resume } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShowPreviewStore } from "./show-preview-store";
import { useState } from "react";

type Props = {
  resume: Resume;
  openEditDialog: boolean;
  setOpenEditDialog: (b: boolean) => void;
};

const MobileHeader = ({ openEditDialog, resume, setOpenEditDialog }: Props) => {
  const { removeResume } = useResumeStore();
  const { showPreview, onCollapse, onExpand } = useShowPreviewStore();
  const navigation = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex md:hidden items-center justify-between w-full px-4 py-2 bg-th-primary text-th-background rounded-md">
      {/* Hamburger Menu */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMenuOpen(!menuOpen)}
        className="!text-th-background"
      >
        <Menu />
      </Button>

      {/* Resume Title */}
      <h1 className="text-lg font-bold text-center flex-grow">
        {resume.title}
      </h1>

      {/* Preview Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="!text-th-background"
        onClick={() => {
          if (!showPreview) onExpand();
          else onCollapse();
        }}
      >
        {showPreview ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </Button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-12 left-4 right-4 bg-th-primary shadow-lg rounded-md p-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpenEditDialog(!openEditDialog);
              setMenuOpen(false);
            }}
            className="w-full justify-start !text-th-background"
          >
            <Pencil className="mr-2" size={20} /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              removeResume(resume);
              navigation.push("/resumes");
              setMenuOpen(false);
            }}
            className="w-full justify-start text-red-500"
          >
            <Trash className="mr-2" size={20} /> Delete
          </Button>
        </div>
      )}
    </header>
  );
};

const DesktopHeader = ({
  openEditDialog,
  resume,
  setOpenEditDialog,
}: Props) => {
  const { removeResume } = useResumeStore();
  const { showPreview, onCollapse, onExpand } = useShowPreviewStore();
  const navigation = useRouter();
  return (
    <header className="hidden md:flex items-center justify-between w-full px-4 py-2 bg-th-primary text-th-background rounded-md">
      <div className="flex items-center gap-2">
        <Link href="/resumes">
          <Button variant="ghost" size="sm" className="!text-th-background">
            <ChevronLeft className="text-th-background" /> Go back
          </Button>
        </Link>
        <h1 className="text-lg font-bold">{resume.title}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="ml-4"
          onClick={() => {
            removeResume(resume);
            navigation.push("/resumes");
          }}
        >
          <Trash className="text-th-background" size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setOpenEditDialog(!openEditDialog);
          }}
        >
          <Pencil className="text-th-background" size={20} />
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="!text-th-background"
          onClick={() => {
            if (!showPreview) onExpand();
            else onCollapse();
          }}
        >
          {showPreview ? (
            <>
              <ChevronUp /> Collapse Preview
            </>
          ) : (
            <>
              <ChevronDown /> Expand Preview
            </>
          )}
        </Button>
      </div>
    </header>
  );
};

export const Header = ({ ...props }: Props) => {
  return (
    <>
      <MobileHeader {...props} />
      <DesktopHeader {...props} />
    </>
  );
};
