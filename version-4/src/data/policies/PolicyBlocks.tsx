import type { ReactNode } from "react";

export function PolicySection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      {title && (
        <h2 className="border-b border-ink-900/15 pb-2 text-lg font-bold text-ink-900">
          {title}
        </h2>
      )}
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-700 [&_strong]:font-semibold [&_strong]:text-ink-900">
        {children}
      </div>
    </section>
  );
}

export function PolicyP({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function PolicyOl({ items }: { items: ReactNode[] }) {
  return (
    <ol className="list-decimal space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}

export function PolicyUl({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function PolicySub({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-5 text-base font-bold text-ink-900 first:mt-0">
      {children}
    </h3>
  );
}

export function PolicyTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-ink-900/10">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <thead className="bg-paper-100">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-ink-900/10 px-3 py-2 font-semibold text-ink-800"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="align-top">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border-b border-ink-900/5 px-3 py-2 text-ink-700"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PolicyContact({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <dl className="overflow-hidden rounded-md border border-ink-900/10">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[7rem_1fr] border-b border-ink-900/5 last:border-b-0 sm:grid-cols-[9rem_1fr]"
        >
          <dt className="bg-paper-100 px-3 py-2 font-semibold text-ink-800">
            {row.label}
          </dt>
          <dd className="px-3 py-2 text-ink-700">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
