import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
export default function SettingsPage(){return <div className="mx-auto max-w-6xl"><PageHeader eyebrow="Preferences" title="Settings" description="Choose the appearance and external sources for your workspace."/><GlassCard className="p-8"><p className="muted">Application preferences will appear here.</p></GlassCard></div>}
