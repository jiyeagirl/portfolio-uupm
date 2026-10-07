"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "../ui";

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-[#E3E7E3] px-8 pb-4 pt-7">
      <div>
        <h1 className="tf-heading text-[26px] leading-[32px] text-(--tf-ink)">{title}</h1>
        {desc && <p className="mt-1 text-[13.5px] text-(--tf-sub)">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, right, children, className }: { title?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-lg border border-[#E3E7E3] bg-white", className)}>
      {title && (
        <div className="flex h-12 items-center justify-between border-b border-[#E3E7E3] px-4">
          <h2 className="text-[14px] font-bold text-(--tf-text)">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export const thCls = "h-10 bg-[#F3F5F3] px-4 text-left text-[12.5px] font-semibold text-(--tf-sub) whitespace-nowrap";
export const tdCls = "px-4 text-[13.5px] text-(--tf-text)";

export function Dl({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-[#EDF0ED] text-[13.5px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex min-h-10 items-center justify-between gap-4 py-2">
          <dt className="shrink-0 text-(--tf-sub)">{k}</dt>
          <dd className="text-right font-semibold text-(--tf-text)">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function useToast() {
  const [text, setText] = useState<string | null>(null);
  const t = useRef<number | null>(null);
  useEffect(() => () => {
    if (t.current) window.clearTimeout(t.current);
  }, []);
  const show = (s: string) => {
    setText(s);
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setText(null), 3200);
  };
  const node = text ? (
    <div role="status" className="tf-rise fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-(--tf-ink) px-5 py-3 text-[13.5px] font-medium text-white shadow-[0_8px_24px_rgba(14,42,34,0.3)]">
      {text}
    </div>
  ) : null;
  return { show, node };
}

export const selectCls =
  "h-9 w-full rounded-lg border border-[#D9DDD9] bg-white px-3 text-[13px] text-(--tf-text) focus:border-(--tf-ink) focus:outline-none";
export const textareaCls =
  "w-full resize-none rounded-lg border border-[#D9DDD9] bg-white px-3 py-2 text-[13px] leading-[20px] text-(--tf-text) placeholder:text-[#8A938E] focus:border-(--tf-ink) focus:outline-none";
