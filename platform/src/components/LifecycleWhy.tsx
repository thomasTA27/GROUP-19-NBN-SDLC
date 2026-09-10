import { sequenceNodes } from "@/data/lifecycle-map";
import { iconMap, ChevronDownIcon } from "./icons";

const kindLabel: Record<"phase" | "gate", string> = {
  phase: "Phase",
  gate: "Gate",
};

const kindBadgeClass: Record<"phase" | "gate", string> = {
  phase: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
  gate: "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
};

export default function LifecycleWhy() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Why each phase and gate exists
      </h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        In map order. Select a title to expand it.
      </p>
      <div className="mt-3 flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {sequenceNodes.map((node) => {
          const Icon = iconMap[node.icon];
          return (
            <details key={node.slug} className="group px-4 py-3 open:bg-neutral-50 dark:open:bg-neutral-900/50">
              <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-medium text-neutral-800 marker:content-none dark:text-neutral-200">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${kindBadgeClass[node.kind]}`}
                >
                  {kindLabel[node.kind]}
                </span>
                <Icon className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
                <span className="flex-1">{node.title}</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180 dark:text-neutral-600" />
              </summary>
              <p className="mt-2 pl-[3.75rem] text-sm text-neutral-600 dark:text-neutral-400">
                {node.why}
              </p>
            </details>
          );
        })}
      </div>
    </div>
  );
}
