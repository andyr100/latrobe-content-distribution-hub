import type { RequestActivityDto } from "@latrobe/api-contract";

function label(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : date.toLocaleString("en-AU", { day: "numeric", month: "short", hour: "numeric" });
}

export function ActivityChart({ data }: { data: RequestActivityDto[] }) {
  const displayed = data.slice(-24);
  const maximum = Math.max(...displayed.map((item) => item.totalRequests), 1);
  if (!displayed.length)
    return <p className="muted py-8 text-sm">No request activity in this period.</p>;
  return (
    <div>
      <div
        className="mt-5 flex h-44 items-end gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3"
        aria-hidden="true"
      >
        {displayed.map((item) => (
          <div key={item.bucket} className="group relative flex h-full min-w-0 flex-1 items-end">
            <div
              className="w-full min-w-1 rounded-t bg-[linear-gradient(180deg,var(--cyan),var(--primary))]"
              style={{ height: `${Math.max((item.totalRequests / maximum) * 100, 4)}%` }}
            />
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>Request volume over time</caption>
        <thead>
          <tr>
            <th>Time</th>
            <th>Requests</th>
            <th>Failures</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map((item) => (
            <tr key={item.bucket}>
              <td>{label(item.bucket)}</td>
              <td>{item.totalRequests}</td>
              <td>{item.failedRequests}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="muted mt-2 flex justify-between text-xs">
        <span>{label(displayed[0].bucket)}</span>
        <span>{label(displayed.at(-1)!.bucket)}</span>
      </div>
    </div>
  );
}
