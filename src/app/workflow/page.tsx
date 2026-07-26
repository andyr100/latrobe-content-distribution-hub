import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";

const internal: { title: string; note: string; icon: IconName }[] = [
  { title: "Create post", note: "Write and classify an update", icon: "posts" },
  { title: "Choose channels", note: "Select subject destinations", icon: "channels" },
  { title: "Confirm publish", note: "Review author and reach", icon: "check" },
  { title: "RSS feed generated", note: "Simulated in Assessment 1", icon: "rss" },
  { title: "Students view in LMS", note: "Future integration", icon: "external" },
];
const external: { title: string; note: string; icon: IconName }[] = [
  { title: "External RSS feed", note: "Subscribed mock source", icon: "rss" },
  { title: "Review article", note: "Read and assess relevance", icon: "search" },
  { title: "Choose channels", note: "Select subject destinations", icon: "channels" },
  { title: "Republish", note: "Use the shared workflow", icon: "arrow" },
  { title: "Students view in LMS", note: "Future integration", icon: "external" },
];

function Flow({ items, tone }: { items: typeof internal; tone: "primary" | "cyan" }) {
  const colour = tone === "primary" ? "var(--primary)" : "var(--cyan)";
  return <ol className="mt-6 grid gap-3 lg:grid-cols-5">{items.map((item, index) => <li key={item.title} className="relative flex lg:block"><div className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 lg:min-h-40 lg:flex-col lg:items-start lg:p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-strong)]" style={{ color: colour }}><Icon name={item.icon} className="size-5" /></span><div><span className="muted text-[.65rem] font-bold uppercase tracking-widest">Step {index + 1}</span><h3 className="mt-1 text-sm font-bold">{item.title}</h3><p className="muted mt-1 text-xs leading-5">{item.note}</p></div></div>{index < items.length - 1 && <span aria-hidden="true" className="absolute -bottom-4 left-5 z-10 grid size-5 rotate-90 place-items-center rounded-full bg-[var(--surface-strong)] text-[var(--text-muted)] lg:-right-4 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:rotate-0"><Icon name="chevron" className="size-3" /></span>}</li>)}</ol>;
}

export default function WorkflowPage(){
  return <div className="mx-auto max-w-6xl">
    <PageHeader eyebrow="How it works" title="From insight to every subject" description="Two simple journeys, one consistent publishing experience for lecturers and administrators." />
    <div className="mb-6 grid gap-3 sm:grid-cols-3"><GlassCard className="p-4"><Badge>Assessment 1</Badge><p className="mt-3 text-sm font-bold">Workflow simulation</p></GlassCard><GlassCard className="p-4"><Badge tone="cyan">Frontend only</Badge><p className="mt-3 text-sm font-bold">No backend processing</p></GlassCard><GlassCard className="p-4"><Badge tone="neutral">Assessment 2</Badge><p className="mt-3 text-sm font-bold">Live RSS and LMS planned</p></GlassCard></div>
    <GlassCard className="p-5 sm:p-7"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="posts" className="size-5" /></span><div><p className="eyebrow">Journey one</p><h2 className="text-xl font-bold">Internal content flow</h2></div></div><Flow items={internal} tone="primary" /></GlassCard>
    <GlassCard className="mt-6 p-5 sm:p-7"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--cyan)_12%,transparent)] text-[var(--cyan)]"><Icon name="rss" className="size-5" /></span><div><p className="eyebrow">Journey two</p><h2 className="text-xl font-bold">External RSS flow</h2></div></div><Flow items={external} tone="cyan" /></GlassCard>
    <div className="mt-6 rounded-2xl border border-[var(--border-strong)] bg-[linear-gradient(115deg,color-mix(in_srgb,var(--primary)_10%,var(--surface)),color-mix(in_srgb,var(--cyan)_8%,var(--surface)))] p-5 sm:p-6"><p className="font-bold">A clear boundary for this assessment</p><p className="muted mt-2 max-w-4xl text-sm leading-6">The interface simulates the lecturer journey and the three-second distribution step. It does not generate RSS XML, process live external feeds or send content to an LMS. Those server-side capabilities are planned for a later assessment.</p></div>
  </div>
}
