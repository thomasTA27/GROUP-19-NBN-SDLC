import { Fragment } from "react";
import LifecycleBox from "./LifecycleBox";
import { stageBoxes, crossCuttingBoxes, miroBoardUrl } from "@/data/lifecycle-map";

const arrowRight = (
  <span aria-hidden className="hidden text-2xl text-neutral-400 md:block">
    →
  </span>
);
const arrowLeft = (
  <span aria-hidden className="hidden text-2xl text-neutral-400 md:block">
    ←
  </span>
);

export default function LifecycleMap() {
  const topRow = stageBoxes.slice(0, 4); // orders 1-4, left to right
  const bottomRow = stageBoxes.slice(4).reverse(); // orders 8,7,6,5, left to right

  return (
    <div className="flex flex-col gap-8">
      <div className="relative pl-6 md:pl-8">
        {/* Loop-back connector: box 8 (bottom-left) returns to box 1 (top-left) */}
        <div
          aria-hidden
          className="absolute bottom-6 left-0 top-6 hidden w-6 border-l-2 border-dashed border-neutral-400 md:block"
        >
          <span className="absolute -top-3 -left-[11px] text-lg text-neutral-400">
            ↑
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2">
          {topRow.map((box, i) => (
            <Fragment key={box.slug}>
              <LifecycleBox box={box} />
              {i < topRow.length - 1 && arrowRight}
            </Fragment>
          ))}
        </div>

        <div className="flex justify-end py-1 pr-[calc(12.5%-1rem)]">
          <span aria-hidden className="hidden text-2xl text-neutral-400 md:block">
            ↓
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2">
          {bottomRow.map((box, i) => (
            <Fragment key={box.slug}>
              <LifecycleBox box={box} />
              {i < bottomRow.length - 1 && arrowLeft}
            </Fragment>
          ))}
        </div>

        <p className="mt-2 text-xs text-neutral-500 md:hidden">
          Loop order: {stageBoxes.map((b) => b.title).join(" → ")} → back to{" "}
          {stageBoxes[0]?.title}.
        </p>
      </div>

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
