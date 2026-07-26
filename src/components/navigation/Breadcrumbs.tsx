import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function Breadcrumbs({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
        <li><Link href="/" className="rounded-md hover:text-[var(--primary)]">Dashboard</Link></li>
        <li><Icon name="chevron" className="size-4" /></li>
        <li aria-current="page" className="font-semibold text-[var(--text)]">{current}</li>
      </ol>
    </nav>
  );
}
