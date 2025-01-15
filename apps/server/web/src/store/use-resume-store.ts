import { Resume } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IResumeStore {
  resumes: Resume[];
  addResume: (resume: Resume) => void;
  removeResume: (resume: Resume) => void;
  setResumeTitle: (resumeId: string, title: string) => void;
  setResumeContent: (resumeId: string, content: string) => void;
  setResumeCss: (resumeId: string, css: string) => void;
}

export const useResumeStore = create<IResumeStore>()(
  persist(
    (set) => ({
      resumes: [],
      addResume: (resume) =>
        set((state) => ({
          resumes: [...state.resumes, resume],
        })),
      removeResume: (resume) =>
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== resume.id),
        })),
      setResumeTitle: (resumeId, title) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === resumeId ? { ...r, title } : r,
          ),
        })),
      setResumeContent: (resumeId, content) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === resumeId ? { ...r, content } : r,
          ),
        })),
      setResumeCss: (resumeId, css) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === resumeId ? { ...r, css } : r,
          ),
        })),
    }),
    {
      name: "resume-store",
    },
  ),
);
