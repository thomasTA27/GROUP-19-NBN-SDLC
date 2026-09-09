import Link from "next/link";
import { notFound } from "next/navigation";
import { lifecycleMap, getBoxBySlug } from "@/data/lifecycle-map";
import { getModuleContent } from "@/lib/content";
import MarkdownContent from "@/components/MarkdownContent";

export function generateStaticParams() {
  return lifecycleMap.map((box) => ({ slug: box.slug }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const box = getBoxBySlug(slug);

  if (!box) {
    notFound();
  }

  const content = await getModuleContent(box);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Back to lifecycle map
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        {box.title}
      </h1>

      {content.exists ? (
        <div className="mt-6">
          <MarkdownContent markdown={content.markdown} />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Research not started yet for this stage.
          </p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {box.summary}
          </p>
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            Once written, this page will render{" "}
            <code className="rounded bg-neutral-200 px-1 py-0.5 text-xs dark:bg-neutral-800">
              white-paper/{box.source}/{box.slug}.md
            </code>
            .
          </p>
        </div>
      )}
    </main>
  );
}
