import { Download } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Resume } from "@/types";
import { downloadMarkdown, downloadPDF } from "@/utils/request";
import { parse } from "marked";
import { useState } from "react";

type Props = {
  resume: Resume;
};

export const Preview = ({ resume }: Props) => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="w-full h-full space-y-2">
      <nav className="flex justify-end w-full gap-2">
        <Button
          variant="ghost"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            downloadMarkdown(resume).finally(() => setLoading(false));
          }}
        >
          <Download /> Markdown
        </Button>
        <Button
          disabled={loading}
          variant="ghost"
          onClick={() => {
            setLoading(true);
            downloadPDF(resume)
              .then((e) => {
                if (e.error) {
                  alert(e.error);
                }
              })
              .finally(() => setLoading(false));
          }}
        >
          <Download /> PDF
        </Button>
      </nav>
      <div
        className="w-full h-full overflow-y-auto border resume border-th-foreground rounded-md"
        dangerouslySetInnerHTML={{
          __html: parse(resume.content, {
            gfm: true,
          }),
        }}
      />
    </div>
  );
};
