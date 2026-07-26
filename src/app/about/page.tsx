import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { appConfig } from "@/config/app";

export default function AboutPage(){
  return <div className="mx-auto max-w-6xl">
    <PageHeader eyebrow="Project context" title="A clearer way to share university content" description="A frontend prototype that brings internal publishing and trusted external sources into one approachable workspace." />
    <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-wrap gap-2"><Badge>Assessment 1</Badge><Badge tone="cyan">Cloud Based Applications</Badge><Badge tone="neutral">Frontend prototype</Badge></div>
        <h2 className="mt-5 text-2xl font-bold tracking-[-.03em]">Purpose and scope</h2>
        <p className="muted mt-3 leading-7">The La Trobe Content Distribution Hub helps lecturers and administrators create classified updates, choose subject destinations and simulate publication through RSS feeds. The same workflow lets users review synthetic external articles and republish relevant content to students.</p>
        <p className="muted mt-4 leading-7">Assessment 1 deliberately focuses on interface design, responsive React components, state management and accessibility. There is no backend, database, authentication, live RSS retrieval or LMS connection in this version.</p>
        <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="workflow" className="size-5" /></span><h3 className="font-bold">What comes next</h3></div><p className="muted mt-3 text-sm leading-6">A later assessment can add server-side RSS generation, live feed ingestion, persistence and LMS delivery while retaining the publishing experience demonstrated here.</p></div>
      </GlassCard>
      <GlassCard className="p-6 sm:p-8">
        <p className="eyebrow">Student project</p>
        <div className="mt-5 flex items-center gap-4"><span className="grid size-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--magenta))] text-white"><Icon name="user" className="size-6" /></span><div><h2 className="font-bold">{appConfig.student.name}</h2><p className="muted mt-1 text-sm">{appConfig.student.number}</p></div></div>
        <dl className="mt-6 divide-y divide-[var(--border)] text-sm"><div className="flex justify-between gap-4 py-3"><dt className="muted">Application</dt><dd className="text-right font-semibold">{appConfig.name}</dd></div><div className="flex justify-between gap-4 py-3"><dt className="muted">Version</dt><dd className="font-semibold">{appConfig.version}</dd></div><div className="flex justify-between gap-4 py-3"><dt className="muted">Data</dt><dd className="font-semibold">Synthetic mock content</dd></div></dl>
        <p className="muted mt-5 text-xs leading-5">Student project disclaimer: this application is an assessment prototype and is not affiliated with or deployed by La Trobe University. It must not be used for real university communication.</p>
      </GlassCard>
    </div>
    <GlassCard className="mt-6 overflow-hidden">
      <div className="grid lg:grid-cols-[1.35fr_.65fr]">
        <div className="relative aspect-video min-h-64 bg-[linear-gradient(135deg,#15162c,#272452_55%,#183a4c)]">
          <video className="absolute inset-0 size-full object-cover" controls preload="metadata" aria-label="Assessment demonstration video">
            <source src="/video/assessment-demo.mp4" type="video/mp4" />
            Your browser does not support embedded video.
          </video>
          <div className="pointer-events-none absolute inset-0 -z-0 grid place-items-center text-white"><div className="text-center"><span className="mx-auto grid size-16 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur"><Icon name="external" className="size-7" /></span><p className="mt-4 font-bold">Assessment demonstration</p><p className="mt-1 text-sm text-white/65">Video placeholder</p></div></div>
        </div>
        <div className="p-6 sm:p-8"><p className="eyebrow">Demonstration video</p><h2 className="mt-2 text-2xl font-bold">Show the complete journey</h2><p className="muted mt-3 text-sm leading-6">Replace the placeholder with the final 3–8 minute assessment recording before submission.</p><code className="mt-5 block overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs text-[var(--primary)]">public/video/assessment-demo.mp4</code></div>
      </div>
    </GlassCard>
    <GlassCard className="mt-6 p-6 sm:p-8"><p className="eyebrow">Getting around</p><h2 className="mt-2 text-2xl font-bold">Use the prototype in four steps</h2><ol className="mt-5 grid gap-3 md:grid-cols-4">{["Choose a mock user from the selector.", "Create an internal post or review External RSS.", "Select channels, confirm and wait three seconds.", "Manage feeds, channels and appearance in Settings."].map((step, index) => <li key={step} className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><span className="text-xs font-black text-[var(--primary)]">0{index + 1}</span><p className="mt-2 text-sm font-semibold leading-6">{step}</p></li>)}</ol></GlassCard>
  </div>
}
