"use client";

import { isValidElement, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import type { ExtraProps } from "react-markdown";

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return extractText(node.props.children);
  return "";
}

type PreProps = ComponentPropsWithoutRef<"pre"> & ExtraProps;

export default function CodeBlock({ node, children, className, ...rest }: PreProps) {
  void node;
  const [copied, setCopied] = useState(false);
  const code = extractText(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (unsupported browser or blocked permission); no-op.
    }
  };

  return (
    <div className="group not-prose relative my-4">
      <pre
        {...rest}
        className={`overflow-x-hidden whitespace-pre-wrap break-words rounded-lg bg-neutral-900 p-4 pr-16 text-sm leading-relaxed text-neutral-100 dark:bg-neutral-950 ${className ?? ""}`}
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-200 opacity-0 transition-opacity hover:bg-neutral-700 focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
