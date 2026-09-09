import Link from "next/link";
import type { LifecycleBox as LifecycleBoxType } from "@/data/lifecycle-map";

export default function LifecycleBox({
  box,
  compact = false,
}: {
  box: LifecycleBoxType;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/modules/${box.slug}`}
      className={`flex flex-col justify-center rounded-lg border-2 border-cyan-300 bg-cyan-50 p-4 text-center transition-colors hover:bg-cyan-100 ${
        compact ? "min-h-[72px]" : "min-h-[96px]"
      }`}
    >
      <span className="font-semibold text-neutral-900">{box.title}</span>
      {!compact && (
        <span className="mt-1 line-clamp-2 text-sm text-neutral-600">
          {box.summary}
        </span>
      )}
    </Link>
  );
}
