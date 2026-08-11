import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
const flow: { title: string; note: string; icon: IconName }[] = [
  { title: "Create post", note: "Write and classify an update", icon: "posts" },
  {
    title: "Choose channels",
    note: "Select one or more fixed channels",
    icon: "channels",
  },
  { title: "Confirm publish", note: "Review author and reach", icon: "check" },
  {
    title: "Channel RSS feed generated",
    note: "Real XML from SQLite",
    icon: "rss",
  },
  {
    title: "Students view in LMS",
    note: "RSS Client mock LMS",
    icon: "external",
  },
];
export default function WorkflowPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="How it works"
        title="From post to channel RSS"
        description="A single publishing journey for lecturers and administrators."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <GlassCard className="p-4">
          <Badge>Assessment 2</Badge>
          <p className="mt-3 text-sm font-bold">End-to-end workflow</p>
        </GlassCard>
        <GlassCard className="p-4">
          <Badge tone="cyan">Next.js API</Badge>
          <p className="mt-3 text-sm font-bold">Sequelize and SQLite</p>
        </GlassCard>
        <GlassCard className="p-4">
          <Badge tone="neutral">RSS 2.0</Badge>
          <p className="mt-3 text-sm font-bold">Mock LMS client</p>
        </GlassCard>
      </div>
      <GlassCard className="p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <Icon name="posts" className="size-5" />
          </span>
          <div>
            <p className="eyebrow">Publishing journey</p>
            <h2 className="text-xl font-bold">Channel content flow</h2>
          </div>
        </div>
        <ol className="mt-6 grid gap-3 lg:grid-cols-5">
          {flow.map((item, index) => (
            <li key={item.title} className="relative flex lg:block">
              <div className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 lg:min-h-40 lg:flex-col lg:items-start lg:p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-strong)] text-[var(--primary)]">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <div>
                  <span className="muted text-[.65rem] font-bold uppercase tracking-widest">
                    Step {index + 1}
                  </span>
                  <h3 className="mt-1 text-sm font-bold">{item.title}</h3>
                  <p className="muted mt-1 text-xs leading-5">{item.note}</p>
                </div>
              </div>
              {index < flow.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-4 left-5 z-10 grid size-5 rotate-90 place-items-center rounded-full bg-[var(--surface-strong)] text-[var(--text-muted)] lg:-right-4 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:rotate-0"
                >
                  <Icon name="chevron" className="size-3" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </GlassCard>
      <div className="mt-6 rounded-2xl border border-[var(--border-strong)] bg-[linear-gradient(115deg,color-mix(in_srgb,var(--primary)_10%,var(--surface)),color-mix(in_srgb,var(--cyan)_8%,var(--surface)))] p-5 sm:p-6">
        <p className="font-bold">A clear boundary for this assessment</p>
        <p className="muted mt-2 max-w-4xl text-sm leading-6">
          Publishing, persistence, CRUD and RSS generation are real. User selection remains mock
          authentication, and the RSS Client represents an LMS without connecting to a production
          LMS. Advanced analytics and alerts remain Assessment 3 scope.
        </p>
      </div>
    </div>
  );
}
