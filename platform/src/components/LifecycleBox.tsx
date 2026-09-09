import Link from "next/link";
import type { LifecycleBox as LifecycleBoxType } from "@/data/lifecycle-map";

const categoryStyles: Record<LifecycleBoxType["category"], string> = {
  "existing-changed": "border-cyan-300 bg-cyan-50 hover:bg-cyan-100",
  new: "border-purple-300 bg-purple-50 hover:bg-purple-100",
  renamed: "border-blue-300 bg-blue-50 hover:bg-blue-100",
};

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
      className={`flex flex-col justify-center rounded-lg border-2 p-4 text-center transition-colors ${categoryStyles[box.category]} ${
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
