import { Fragment } from "react";
import LifecycleBox from "./LifecycleBox";
import { stageBoxes, crossCuttingBoxes, miroBoardUrl } from "@/data/lifecycle-map";

const RADIUS_PCT = 36;

/** clockDeg: 0 = 12 o'clock, increasing clockwise. */
function pointOnCircle(clockDeg: number, radius: number = RADIUS_PCT) {
  const rad = ((clockDeg - 90) * Math.PI) / 180;
  return {
    x: 50 + radius * Math.cos(rad),
    y: 50 + radius * Math.sin(rad),
  };
}

export default function LifecycleMap() {
  const n = stageBoxes.length;
  const step = 360 / n;

  return (
    <div className="flex flex-col gap-8">
      {/* Circular layout — md and up. Extra padding around the square
          gives the absolutely-positioned boxes room to overflow the
          ring without colliding with the sections above/below. */}
      <div className="hidden px-4 py-16 md:block">
        <div className="relative mx-auto aspect-square w-full max-w-xl">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <circle
              cx={50}
              cy={50}
              r={RADIUS_PCT}
              fill="none"
              strokeWidth={0.4}
              strokeDasharray="2 2"
              className="stroke-neutral-300 dark:stroke-neutral-700"
            />
            {stageBoxes.map((box, i) => {
              const mid = i * step + step / 2;
              const { x, y } = pointOnCircle(mid);
              return (
                <text
                  key={box.slug}
                  x={x}
                  y={y}
                  fontSize={4.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${mid}, ${x}, ${y})`}
                  className="fill-neutral-400 dark:fill-neutral-600"
                >
                  &#10148;
                </text>
              );
            })}
          </svg>

          {stageBoxes.map((box, i) => {
            const { x, y } = pointOnCircle(i * step);
            return (
              <div
                key={box.slug}
                className="absolute w-36 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <LifecycleBox box={box} compact />
              </div>
            );
          })}
        </div>
      </div>

      {/* Linear fallback — below md, where a ring would be too cramped */}
      <div className="flex flex-col gap-3 md:hidden">
        {stageBoxes.map((box, i) => (
          <Fragment key={box.slug}>
            <LifecycleBox box={box} />
            {i < stageBoxes.length - 1 && (
              <span
                aria-hidden
                className="text-center text-xl text-neutral-400 dark:text-neutral-600"
              >
                ↓
              </span>
            )}
          </Fragment>
        ))}
        <span className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <span aria-hidden className="text-lg">
            ↩
          </span>
          loops back to &ldquo;{stageBoxes[0]?.title}&rdquo;
        </span>
      </div>

      {crossCuttingBoxes.length > 0 && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="mb-3 text-sm font-semibold text-amber-900 dark:text-amber-200">
            Runs underneath every stage
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {crossCuttingBoxes.map((box) => (
              <LifecycleBox key={box.slug} box={box} compact />
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        This is a rendering of the team&apos;s lifecycle map. The{" "}
        <a
          href={miroBoardUrl}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          live Miro board
        </a>{" "}
        is the source of truth.
      </p>
    </div>
  );
}
