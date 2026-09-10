import Link from "next/link";
import type { LifecycleNode } from "@/data/lifecycle-map";

const phaseColors: Record<"decision" | "verification", string> = {
  decision:
    "border-orange-300 bg-orange-50 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/40 dark:hover:bg-orange-950/70",
  verification:
    "border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:hover:bg-blue-950/70",
};

const gateColors: Record<"normal" | "blocking", string> = {
  normal:
    "border-violet-300 bg-violet-50 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:hover:bg-violet-950/70",
  blocking:
    "border-red-300 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:hover:bg-red-950/70",
};

export default function LifecycleBox({
  box,
  compact = false,
}: {
  box: LifecycleNode;
  compact?: boolean;
}) {
  if (box.kind === "gate") {
    return (
      <Link
        href={`/modules/${box.slug}`}
        className={`group flex aspect-square w-24 rotate-45 items-center justify-center rounded-md border-2 shadow-sm transition-colors ${gateColors[box.severity]}`}
        title={box.summary}
      >
        <span className="-rotate-45 px-1 text-center text-[11px] font-semibold leading-tight text-neutral-900 dark:text-neutral-100">
          {box.title}
        </span>
      </Link>
    );
  }

  if (box.kind === "governance") {
    return (
      <Link
        href={`/modules/${box.slug}`}
        className="flex min-h-[56px] w-28 flex-col items-center justify-center rounded-full border-2 border-neutral-300 bg-neutral-100 p-2 text-center shadow-sm transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800/60 dark:hover:bg-neutral-800"
        title={box.summary}
      >
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          {box.title}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/modules/${box.slug}`}
      className={`flex flex-col justify-center rounded-lg border-2 p-4 text-center shadow-sm transition-colors ${phaseColors[box.role]} ${
        compact ? "min-h-[72px]" : "min-h-[96px]"
      }`}
    >
      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
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
