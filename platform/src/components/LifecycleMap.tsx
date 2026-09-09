import { Fragment } from "react";
import LifecycleBox from "./LifecycleBox";
import { stageBoxes, crossCuttingBoxes, miroBoardUrl } from "@/data/lifecycle-map";

export default function LifecycleMap() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        {stageBoxes.map((box, i) => (
          <Fragment key={box.slug}>
            <div className="w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(25%-0.5625rem)]">
              <LifecycleBox box={box} />
            </div>
            {i < stageBoxes.length - 1 && (
              <span aria-hidden className="hidden text-2xl text-neutral-400 lg:block">
                →
              </span>
            )}
          </Fragment>
        ))}
        <span className="flex items-center gap-2 text-sm text-neutral-500">
          <span aria-hidden className="text-lg">
            ↩
          </span>
          loops back to &ldquo;{stageBoxes[0]?.title}&rdquo;
        </span>
      </div>

      {crossCuttingBoxes.length > 0 && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <p className="mb-3 text-sm font-semibold text-amber-900">
            Runs underneath every stage
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {crossCuttingBoxes.map((box) => (
              <LifecycleBox key={box.slug} box={box} compact />
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-neutral-500">
        This is a rendering of the team&apos;s lifecycle map. The{" "}
        <a
          href={miroBoardUrl}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-neutral-700"
        >
          live Miro board
        </a>{" "}
        is the source of truth.
      </p>
    </div>
  );
}
