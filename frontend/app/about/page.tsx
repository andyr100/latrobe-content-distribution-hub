import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { appConfig } from "@/config/app";

function assessmentVideo() {
  const configuredUrl = process.env.NEXT_PUBLIC_ASSESSMENT_VIDEO_URL?.trim();
  if (!configuredUrl) return null;

  if (configuredUrl.startsWith("/")) {
    return { url: configuredUrl, locallyHosted: true };
  }

  try {
    const url = new URL(configuredUrl);
    if (url.hostname === "youtu.be") {
      return {
        url: `https://www.youtube.com/embed/${url.pathname.slice(1)}`,
        locallyHosted: false,
      };
    }
    if (url.hostname.endsWith("youtube.com") && url.searchParams.get("v")) {
      return {
        url: `https://www.youtube.com/embed/${url.searchParams.get("v")}`,
        locallyHosted: false,
      };
    }
    return { url: configuredUrl, locallyHosted: false };
  } catch {
    return null;
  }
}

export default function AboutPage() {
  const video = assessmentVideo();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Project context"
        title="A clearer way to share CSIT content"
        description="A full-stack publishing hub connecting a polished React interface to persistent channel RSS feeds."
      />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <GlassCard className="p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge>Assessment 3</Badge>
            <Badge tone="cyan">Next.js + Sequelize</Badge>
            <Badge tone="neutral">SQLite + Docker</Badge>
          </div>
          <h2 className="mt-5 text-2xl font-bold">Purpose and scope</h2>
          <p className="muted mt-3 leading-7">
            Lecturers and administrators create posts, publish them to one or more fixed CSIT
            channels, and manage that content through a REST API. Sequelize persists every post and
            relationship in SQLite.
          </p>
          <p className="muted mt-4 leading-7">
            Each channel has a real RSS 2.0 endpoint generated from the database. The standalone RSS
            Client — Mock LMS View requests and parses that XML so a newly published post can be
            demonstrated end to end.
          </p>
          <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
            <div className="flex items-center gap-3">
              <Icon name="workflow" className="size-5 text-[var(--primary)]" />
              <h3 className="font-bold">Assessment boundary</h3>
            </div>
            <p className="muted mt-3 text-sm leading-6">
              Assessment 3 adds persisted request analytics, separate RSS student identities, feed
              status history, alerts, Hub Intelligence, and repeatable test evidence. User selection
              remains mock authentication and there is no production LMS connection.
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 sm:p-8">
          <p className="eyebrow">Student project</p>
          <div className="mt-5 flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--magenta))] text-white">
              <Icon name="user" className="size-6" />
            </span>
            <div>
              <h2 className="font-bold">{appConfig.student.name}</h2>
              <p className="muted mt-1 text-sm">{appConfig.student.number}</p>
            </div>
          </div>
          <dl className="mt-6 divide-y divide-[var(--border)] text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="muted">Version</dt>
              <dd className="font-semibold">{appConfig.version}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="muted">Frontend</dt>
              <dd className="font-semibold">localhost:3000</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="muted">API</dt>
              <dd className="font-semibold">localhost:4000</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="muted">RSS Client</dt>
              <dd className="font-semibold">localhost:5000</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="muted">Persistence</dt>
              <dd className="font-semibold">SQLite volume</dd>
            </div>
          </dl>
        </GlassCard>
      </div>
      <GlassCard className="mt-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Assessment demonstration</p>
            <h2 className="mt-2 text-2xl font-bold">Assessment 3 video walkthrough</h2>
            <p className="muted mt-2 max-w-3xl leading-7">
              This video demonstrates live operational data, reports and alerts, automated tests,
              load and accessibility evidence, Docker persistence, and RSS delivery to the separate
              mock LMS client.
            </p>
          </div>
          <Badge tone={video ? "cyan" : "neutral"}>
            {video ? "Video available" : "Video link pending"}
          </Badge>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
          {video?.locallyHosted ? (
            <video className="aspect-video w-full bg-black" controls preload="metadata">
              <source src={video.url} type="video/mp4" />
              Your browser does not support HTML video playback.
            </video>
          ) : video ? (
            <iframe
              className="aspect-video w-full"
              src={video.url}
              title="Assessment 3 video walkthrough"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="grid aspect-video place-items-center p-8 text-center">
              <div className="max-w-xl">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--primary)] text-white">
                  <Icon name="workflow" className="size-7" />
                </span>
                <h3 className="mt-5 text-xl font-bold">Video placeholder ready</h3>
                <p className="muted mt-3 leading-7">
                  Set <code>NEXT_PUBLIC_ASSESSMENT_VIDEO_URL</code> to a local public video path or
                  an embeddable video URL, then rebuild the frontend.
                </p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
