import { Button } from "@/components/ui/button";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";

type Props = {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  styles: string;
  setStyles: (styles: string) => void;
};

export const EditorTabs = ({
  markdown,
  setMarkdown,
  styles,
  setStyles,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"markdown" | "css">("markdown");
  return (
    <div className="w-full h-full space-y-2">
      <nav className="space-x-2">
        <Button
          variant={activeTab === "markdown" ? "primary" : "outline"}
          onClick={() => setActiveTab("markdown")}
        >
          Markdown
        </Button>
        <Button
          variant={activeTab === "css" ? "primary" : "outline"}
          onClick={() => setActiveTab("css")}
        >
          CSS
        </Button>
      </nav>
      {activeTab === "markdown" && (
        <Editor
          height="100%"
          width="100%"
          theme="vs-dark"
          defaultLanguage="markdown"
          defaultValue={markdown}
          className="border rounded-md border-th-foreground"
          onChange={(e) => setMarkdown(e || "")}
          value={markdown}
          options={{
            autoIndent: "brackets",
            minimap: {
              enabled: false,
            },
          }}
        />
      )}
      {activeTab === "css" && (
        <Editor
          height="100%"
          width="100%"
          theme="vs-dark"
          defaultLanguage="css"
          defaultValue={styles}
          className="border rounded-md border-th-foreground"
          onChange={(e) => setStyles(e || "")}
          value={styles}
          options={{
            autoIndent: "brackets",
            minimap: {
              enabled: false,
            },
          }}
        />
      )}
    </div>
  );
};
