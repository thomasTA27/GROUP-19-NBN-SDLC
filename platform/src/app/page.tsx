import LifecycleMap from "@/components/LifecycleMap";
import LifecycleLegend from "@/components/LifecycleLegend";
import LifecycleWhy from "@/components/LifecycleWhy";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        SDLC with AI
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">
        A technical white paper defining what each phase of the software
        development lifecycle looks like when developers use AI
        continuously throughout it.
      </p>

      <div className="mt-8">
        <LifecycleLegend />
      </div>

      <div className="mt-4">
        <LifecycleMap />
      </div>

      <div className="mt-12">
        <LifecycleWhy />
      </div>
    </main>
  );
}
