import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <>
      <Breadcrumbs current={title} />
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{title}</h1>
          <p className="muted mt-3 max-w-2xl leading-7">{description}</p>
        </div>
        {action}
      </div>
    </>
  );
}
