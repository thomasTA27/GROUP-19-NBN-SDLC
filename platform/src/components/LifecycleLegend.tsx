function Swatch({ shape, className }: { shape: "rect" | "diamond" | "pill"; className: string }) {
  const shapeClass =
    shape === "diamond" ? "h-4 w-4 rotate-45 rounded-[3px]" : shape === "pill" ? "h-4 w-7 rounded-full" : "h-4 w-7 rounded-[4px]";
  return <span aria-hidden className={`inline-block shrink-0 border-2 ${shapeClass} ${className}`} />;
}

function LegendRow({
  shape,
  swatchClassName,
  label,
  description,
}: {
  shape: "rect" | "diamond" | "pill";
  swatchClassName: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Swatch shape={shape} className={swatchClassName} />
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{label}:</span>{" "}
        {description}
      </p>
    </div>
  );
}

export default function LifecycleLegend() {
  return (
    <div className="grid gap-6 rounded-xl border border-neutral-200 bg-neutral-50/60 p-5 dark:border-neutral-800 dark:bg-neutral-900/40 sm:grid-cols-3">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Phases: rectangles
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Where work actually happens. Six of them.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <LegendRow
            shape="rect"
            swatchClassName="border-orange-300 bg-orange-100 dark:border-orange-700 dark:bg-orange-950/60"
            label="Human decision"
            description="a person makes the call and owns the outcome. AI can draft and advise, but it can't decide."
          />
          <LegendRow
            shape="rect"
            swatchClassName="border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-950/60"
            label="Human verification"
            description="the AI does the work, and a person checks it before it moves on."
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Gates: diamonds
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Blocking controls between phases. No work happens in a gate; a
          change either passes it or it stops. Three of them.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <LegendRow
            shape="diamond"
            swatchClassName="border-violet-300 bg-violet-100 dark:border-violet-700 dark:bg-violet-950/60"
            label="Normal gate"
            description="someone signs off before things continue."
          />
          <LegendRow
            shape="diamond"
            swatchClassName="border-red-300 bg-red-100 dark:border-red-700 dark:bg-red-950/60"
            label="Blocking gate"
            description="automated. It either passes or the change doesn't ship. Only the security gate is red."
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Governance: the band
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Things that happen everywhere and belong to no single phase,
          drawn in the centre rather than in the sequence.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <LegendRow
            shape="pill"
            swatchClassName="border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800"
            label="Attribution"
            description="who or what wrote this line, recorded at commit time."
          />
          <LegendRow
            shape="pill"
            swatchClassName="border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800"
            label="Accountability"
            description="who owns the change when it fails, recorded at review."
          />
        </div>
      </div>
    </div>
  );
}
