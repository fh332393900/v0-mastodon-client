"use client"

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"

export const CODE_LANGUAGES = [
  { value: "auto", label: "Auto" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "dart", label: "Dart" },
]

export function CodeBlockView({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const t = useTranslations("compose.editor")
  const language = (node.attrs.language as string) ?? "auto"

  return (
    <NodeViewWrapper
      className="my-2 rounded-lg overflow-hidden border border-border/70 shadow-sm not-prose"
      data-type="code-block"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border/50 gap-2">
        <select
          contentEditable={false}
          value={language}
          onChange={(e) => updateAttributes({ language: e.target.value })}
          className="h-6 text-xs bg-transparent border-none outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
        >
          {CODE_LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <div className="flex gap-1 items-center" contentEditable={false}>
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <button
            type="button"
            onClick={deleteNode}
            className="ml-1 text-muted-foreground/50 hover:text-destructive transition-colors"
            tabIndex={-1}
            title={t("deleteBlock")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Code content */}
      <pre className="m-0 rounded-none bg-transparent p-4">
        <NodeViewContent as={"code" as "div"} />
      </pre>
    </NodeViewWrapper>
  )
}
