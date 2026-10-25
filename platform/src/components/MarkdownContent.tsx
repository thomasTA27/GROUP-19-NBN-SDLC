import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import type { ExtraProps } from "react-markdown";
import { resolveMarkdownLink } from "@/lib/links";
import CodeBlock from "@/components/CodeBlock";

type MarkdownContentProps = {
  markdown: string;
  // Repo-relative posix path of the file being rendered, for example
  // white-paper/modules/deployment.md. Pass it so relative links written
  // for GitHub get translated. Leave it out and links render exactly as
  // written, with no rewriting at all.
  sourcePath?: string;
};

export default function MarkdownContent({
  markdown,
  sourcePath,
}: MarkdownContentProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => <MarkdownLink {...props} sourcePath={sourcePath} />,
          pre: CodeBlock,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

type MarkdownLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ExtraProps & { sourcePath?: string };

function MarkdownLink({ href, sourcePath, node, ...rest }: MarkdownLinkProps) {
  // react-markdown passes the underlying hast node so components can
  // inspect it. This component does not need it, and it is not a real
  // anchor attribute, so it must not be spread onto the element below.
  void node;

  const resolution =
    sourcePath && href ? resolveMarkdownLink(href, sourcePath) : { kind: "unchanged" as const };

  if (resolution.kind === "internal") {
    return <Link href={resolution.href} {...rest} />;
  }

  if (resolution.kind === "github") {
    return (
      <a href={resolution.href} target="_blank" rel="noopener noreferrer" {...rest} />
    );
  }

  return <a href={href} {...rest} />;
}
