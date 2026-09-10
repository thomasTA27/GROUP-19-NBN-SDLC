import Link from "next/link";
import type { LifecycleNode } from "@/data/lifecycle-map";

const phaseColors: Record<"decision" | "verification", string> = {
  decision:
    "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 dark:border-orange-800 dark:from-orange-950/40 dark:to-orange-900/30 dark:hover:from-orange-950/70 dark:hover:to-orange-900/50",
  verification:
    "border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:border-blue-800 dark:from-blue-950/40 dark:to-blue-900/30 dark:hover:from-blue-950/70 dark:hover:to-blue-900/50",
};

const gateColors: Record<"normal" | "blocking", string> = {
  normal:
    "border-violet-300 bg-gradient-to-br from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200 dark:border-violet-800 dark:from-violet-950/40 dark:to-violet-900/30 dark:hover:from-violet-950/70 dark:hover:to-violet-900/50",
  blocking:
    "border-red-300 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:border-red-800 dark:from-red-950/40 dark:to-red-900/30 dark:hover:from-red-950/70 dark:hover:to-red-900/50",
};

export default function LifecycleBox({
  box,
  compact = false,
  animationDelayMs,
}: {
  box: LifecycleNode;
  compact?: boolean;
  /** Staggers the entrance animation — set from the node's position in the ring. */
  animationDelayMs?: number;
}) {
  const animStyle =
    animationDelayMs !== undefined ? { animationDelay: `${animationDelayMs}ms` } : undefined;

  if (box.kind === "gate") {
    return (
      <Link
        href={`/modules/${box.slug}`}
        style={animStyle}
        className={`lc-node-enter group flex aspect-square w-24 rotate-45 items-center justify-center rounded-lg border-2 shadow-sm transition-all duration-200 hover:z-10 hover:-translate-y-1 hover:scale-105 hover:shadow-lg ${gateColors[box.severity]}`}
        title={box.summary}
      >
        <span className="-rotate-45 px-1 text-center leading-tight text-neutral-900 dark:text-neutral-100">
          <span aria-hidden className="block text-base">
            {box.icon}
          </span>
          <span className="text-[11px] font-semibold">{box.title}</span>
        </span>
      </Link>
    );
  }

  if (box.kind === "governance") {
    return (
      <Link
        href={`/modules/${box.slug}`}
        style={animStyle}
        className="lc-node-enter flex min-h-[56px] w-28 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-neutral-300 bg-gradient-to-br from-neutral-50 to-neutral-200 p-2 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-md hover:from-neutral-100 hover:to-neutral-300 dark:border-neutral-700 dark:from-neutral-800/60 dark:to-neutral-900/60 dark:hover:from-neutral-800 dark:hover:to-neutral-900"
        title={box.summary}
      >
        <span aria-hidden className="text-sm leading-none">
          {box.icon}
        </span>
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          {box.title}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/modules/${box.slug}`}
      style={animStyle}
      className={`lc-node-enter flex flex-col justify-center rounded-xl border-2 p-4 text-center shadow-sm transition-all duration-200 hover:z-10 hover:-translate-y-1 hover:scale-105 hover:shadow-lg ${phaseColors[box.role]} ${
        compact ? "min-h-[72px]" : "min-h-[96px]"
      }`}
    >
      <span className="flex items-center justify-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
        <span aria-hidden>{box.icon}</span>
        {box.title}
      </span>
      {!compact && (
        <span className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
          {box.summary}
        </span>
      )}
    </Link>
  );
}
