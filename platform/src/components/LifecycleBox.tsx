import Link from "next/link";
import type { LifecycleNode } from "@/data/lifecycle-map";
import { iconMap } from "./icons";

const phaseColors: Record<"decision" | "verification", string> = {
  decision:
    "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 dark:border-orange-800 dark:from-orange-950/40 dark:to-orange-900/30 dark:hover:from-orange-950/70 dark:hover:to-orange-900/50",
  verification:
    "border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:border-blue-800 dark:from-blue-950/40 dark:to-blue-900/30 dark:hover:from-blue-950/70 dark:hover:to-blue-900/50",
};

const phaseIconColors: Record<"decision" | "verification", string> = {
  decision: "text-orange-600 dark:text-orange-300",
  verification: "text-blue-600 dark:text-blue-300",
};

const gateColors: Record<"normal" | "blocking", string> = {
  normal:
    "border-violet-300 bg-gradient-to-br from-violet-50 to-violet-100 group-hover:from-violet-100 group-hover:to-violet-200 dark:border-violet-800 dark:from-violet-950/40 dark:to-violet-900/30 dark:group-hover:from-violet-950/70 dark:group-hover:to-violet-900/50",
  blocking:
    "border-red-300 bg-gradient-to-br from-red-50 to-red-100 group-hover:from-red-100 group-hover:to-red-200 dark:border-red-800 dark:from-red-950/40 dark:to-red-900/30 dark:group-hover:from-red-950/70 dark:group-hover:to-red-900/50",
};

const gateIconColors: Record<"normal" | "blocking", string> = {
  normal: "text-violet-700 dark:text-violet-300",
  blocking: "text-red-700 dark:text-red-300",
};

export default function LifecycleBox({
  box,
  compact = false,
  animationDelayMs,
}: {
  box: LifecycleNode;
  compact?: boolean;
  /** Staggers the entrance animation, set from the node's position in the ring. */
  animationDelayMs?: number;
}) {
  const animStyle =
    animationDelayMs !== undefined ? { animationDelay: `${animationDelayMs}ms` } : undefined;
  const Icon = iconMap[box.icon];

  if (box.kind === "gate") {
    return (
      <Link
        href={`/modules/${box.slug}`}
        style={animStyle}
        className="lc-node-enter group flex flex-col items-center gap-1.5 transition-transform duration-200 hover:-translate-y-1 hover:scale-105"
        title={box.summary}
      >
        <span
          className={`flex aspect-square w-14 shrink-0 rotate-45 items-center justify-center rounded-lg border-2 shadow-sm transition-shadow duration-200 group-hover:shadow-lg ${gateColors[box.severity]}`}
        >
          <Icon className={`h-5 w-5 -rotate-45 ${gateIconColors[box.severity]}`} />
        </span>
        <span className="text-center text-[11px] font-semibold leading-tight text-neutral-800 dark:text-neutral-100">
          {box.title}
        </span>
      </Link>
    );
  }

  if (box.kind === "governance") {
    return (
      <Link
        href={`/modules/${box.slug}`}
        style={animStyle}
        className="lc-node-enter flex min-h-[64px] w-28 flex-col items-center justify-center gap-1 rounded-full border-2 border-neutral-300 bg-gradient-to-br from-neutral-50 to-neutral-200 px-2 py-2.5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-md hover:from-neutral-100 hover:to-neutral-300 dark:border-neutral-700 dark:from-neutral-800/60 dark:to-neutral-900/60 dark:hover:from-neutral-800 dark:hover:to-neutral-900"
        title={box.summary}
      >
        <Icon className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-300" />
        <span className="text-xs font-semibold leading-tight text-neutral-800 dark:text-neutral-200">
          {box.title}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/modules/${box.slug}`}
      style={animStyle}
      className={`lc-node-enter flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 text-center shadow-sm transition-all duration-200 hover:z-10 hover:-translate-y-1 hover:scale-105 hover:shadow-lg ${phaseColors[box.role]} ${
        compact ? "min-h-[80px]" : "min-h-[104px]"
      }`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${phaseIconColors[box.role]}`} />
      <span className="text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
        {box.title}
      </span>
      {!compact && (
        <span className="line-clamp-2 text-xs leading-snug text-neutral-600 dark:text-neutral-400">
          {box.summary}
        </span>
      )}
    </Link>
  );
}
