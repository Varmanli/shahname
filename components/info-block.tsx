import type { ReactNode } from "react";

export function InfoBlock({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-white/78 p-4 shadow-sm dark:bg-white/5">
      <dt className="text-xs font-black text-shah-gold-700 dark:text-shah-gold-300">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-bold leading-7 text-zinc-900 dark:text-shah-cream-100">
        {value}
      </dd>
    </div>
  );
}
