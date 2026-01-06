// src/artifacts/renderers/TextArtifact.tsx

import { TextArtifact } from "../types";
import ReactMarkdown from "react-markdown";

interface Props {
  artifact: TextArtifact;
}

export function TextArtifactRenderer({ artifact }: Props) {
  return (
    <div className="rounded-xl px-5 py-4 bg-card/80 backdrop-blur-sm border border-border/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
        {artifact.content}
      </ReactMarkdown>

      <div className="mt-3 text-xs text-muted-foreground flex justify-between">
        <span>Engine: {artifact.engine}</span>
        <span>{new Date(artifact.createdAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
