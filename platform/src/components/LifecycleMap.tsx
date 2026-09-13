import { Fragment } from "react";
import LifecycleBox from "./LifecycleBox";
import { sequenceNodes, governanceNodes, miroBoardUrl } from "@/data/lifecycle-map";
import { LoopIcon, ArrowDownIcon } from "./icons";

const RADIUS_PCT = 38;
const GOVERNANCE_RADIUS_PCT = 15;

/** clockDeg: 0 = 12 o'clock, increasing clockwise. */
function pointOnCircle(clockDeg: number, radius: number) {
  const rad = ((clockDeg - 90) * Math.PI) / 180;
  return {
    x: 50 + radius * Math.cos(rad),
    y: 50 + radius * Math.sin(rad),
  };
}

export default function LifecycleMap() {
  const n = sequenceNodes.length;
  const step = 360 / n;
  const governanceStep = governanceNodes.length > 0 ? 360 / governanceNodes.length : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Circular layout, md and up. Extra padding around the square
          gives the absolutely-positioned boxes room to overflow the
          ring without colliding with the sections above/below. */}
      <div className="hidden px-4 py-16 md:block">
        <div className="relative mx-auto aspect-square w-full max-w-3xl">
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
              className="lc-ring-outer stroke-neutral-300 dark:stroke-neutral-700"
            />
            <circle
              cx={50}
              cy={50}
              r={GOVERNANCE_RADIUS_PCT}
              fill="none"
              strokeWidth={0.4}
              strokeDasharray="1.5 1.5"
              className="lc-ring-inner stroke-neutral-300 dark:stroke-neutral-700"
            />
            {sequenceNodes.map((node, i) => {
              const mid = i * step + step / 2;
              const { x, y } = pointOnCircle(mid, RADIUS_PCT);
              const isLoopBack = i === n - 1;
              return (
                <text
                  key={node.slug}
                  x={x}
                  y={y}
                  fontSize={isLoopBack ? 5.5 : 4.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${mid}, ${x}, ${y})`}
                  className={
                    isLoopBack
                      ? "fill-emerald-500 dark:fill-emerald-400"
                      : "fill-neutral-400 dark:fill-neutral-600"
                  }
                >
                  &#10148;
                </text>
              );
            })}
          </svg>

          {sequenceNodes.map((node, i) => {
            const { x, y } = pointOnCircle(i * step, RADIUS_PCT);
            return (
              <div
                key={node.slug}
                className="absolute w-36 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <LifecycleBox box={node} compact animationDelayMs={i * 60} />
              </div>
            );
          })}

          {governanceNodes.map((node, i) => {
            const { x, y } = pointOnCircle(i * governanceStep + 90, GOVERNANCE_RADIUS_PCT);
            return (
              <div
                key={node.slug}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <LifecycleBox box={node} animationDelayMs={n * 60 + i * 60} />
              </div>
            );
          })}

          <span className="absolute left-1/2 top-[calc(50%-2.5rem)] -translate-x-1/2 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
            Governance
          </span>
        </div>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <LoopIcon className="h-3.5 w-3.5 animate-pulse" />
          Maintenance loops back to Planning: the cycle repeats
        </p>
      </div>

      {/* Linear fallback, below md, where a ring would be too cramped */}
      <div className="flex flex-col gap-3 md:hidden">
        {sequenceNodes.map((node, i) => (
          <Fragment key={node.slug}>
            <div className={node.kind === "gate" ? "flex justify-center py-1" : undefined}>
              <LifecycleBox box={node} animationDelayMs={i * 50} />
            </div>
            {i < sequenceNodes.length - 1 && (
              <ArrowDownIcon className="mx-auto h-5 w-5 text-neutral-400 dark:text-neutral-600" />
            )}
          </Fragment>
        ))}
        <span className="flex items-center justify-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
          <LoopIcon className="h-4 w-4" />
          loops back to &ldquo;{sequenceNodes[0]?.title}&rdquo;
        </span>
      </div>

      {governanceNodes.length > 0 && (
        <div className="rounded-lg border-2 border-neutral-300 bg-neutral-100 p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Governance: happens across every phase, not inside one
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {governanceNodes.map((node) => (
              <LifecycleBox key={node.slug} box={node} compact />
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
