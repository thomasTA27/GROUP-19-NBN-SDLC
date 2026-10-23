import type { Metadata } from "next";
import { GITHUB_BRANCH, GITHUB_REPO_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "Usability evidence | SDLC with AI",
  description:
    "Headline results from usability testing of the Planning and Spec Authoring module.",
};

const REPORT_URL = `${GITHUB_REPO_URL}/blob/${GITHUB_BRANCH}/white-paper/evidence/usability-testing.md`;

/**
 * Figures below are copied from white-paper/evidence/usability-testing.md.
 * If the report changes, update them here so the two keep matching.
 */
const results: { measure: string; result: string }[] = [
  {
    measure: "Task success",
    result: "Gate not passed. 1 of 6 criteria met, 4 partly met, 1 not met.",
  },
  {
    measure: "Adapted usability score",
    result:
      "5 out of 100. An internal baseline, not comparable with published scores.",
  },
  {
    measure: "Steps with recorded difficulty",
    result: "5 of 8 steps.",
  },
  {
    measure: "Facilitator help during numbered steps",
    result: "At least 2 steps.",
  },
  {
    measure: "Recorded elapsed window",
    result: "58 minutes.",
  },
];

export default function UsabilityPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        Usability evidence
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Headline results from one usability session on the Planning and Spec
        Authoring module, run on 2026-10-15 with a computer science student who
        did not write the module.
      </p>

      <dl className="mt-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {results.map((row) => (
          <div
            key={row.measure}
            className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4"
          >
            <dt className="font-medium text-neutral-900 dark:text-neutral-100">
              {row.measure}
            </dt>
            <dd className="text-neutral-700 sm:col-span-2 dark:text-neutral-300">
              {row.result}
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        What this shows
      </h2>
      <p className="mt-2 text-neutral-700 dark:text-neutral-300">
        As first written, the module did not let a junior reader produce a
        specification that passes its gate without help. Steps that gave a
        prompt the reader could paste went smoothly. Steps that asked for
        judgement without a method are where the participant got stuck.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        What this does not show
      </h2>
      <p className="mt-2 text-neutral-700 dark:text-neutral-300">
        This is one participant on one module, so it cannot show how common the
        problems are. Four of the five planned measures were not fully
        recorded, and the revised module has not been retested.
      </p>

      <p className="mt-10">
        <a
          href={REPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
        >
          Read the full usability report on GitHub
        </a>
      </p>
    </main>
  );
}
