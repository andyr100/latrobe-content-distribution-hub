import { GlassCard } from "@/components/ui/GlassCard";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl">
      <p className="eyebrow">Content distribution</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
        Publish once. Keep every subject informed.
      </h1>
      <p className="muted mt-5 max-w-2xl text-lg leading-8">
        A focused workspace for university teams to prepare, classify and distribute content to subject channels.
      </p>
      <GlassCard className="mt-10 p-8">
        <p className="eyebrow">Foundation ready</p>
        <h2 className="mt-2 text-2xl font-bold">A consistent application shell</h2>
        <p className="muted mt-3 max-w-2xl leading-7">
          Navigation, publishing tools and dashboard content will be added through the remaining implementation milestones.
        </p>
      </GlassCard>
    </div>
  );
}
