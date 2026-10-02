import type { ComponentProps, ReactNode } from "react";
import { CheckCircle, Clock, Hourglass, Truck, WarningCircle } from "@phosphor-icons/react";
import type { OrderStatus } from "../lib/types";

export const STATUS: Record<OrderStatus, { label: string; fg: string; bg: string; Icon: typeof Truck }> = {
  "pending-approval": { label: "승인 대기", fg: "#92400E", bg: "#FEF3C7", Icon: Hourglass },
  "awaiting-accept": { label: "수락 대기", fg: "#475569", bg: "#E2E8F0", Icon: Clock },
  "in-progress": { label: "진행 중", fg: "#075985", bg: "#E0F2FE", Icon: Truck },
  delayed: { label: "지연", fg: "#B91C1C", bg: "#FEE2E2", Icon: WarningCircle },
  delivered: { label: "납품 완료", fg: "#166534", bg: "#DCFCE7", Icon: CheckCircle },
};

export function StatusBadge({ status, size = "sm" }: { status: OrderStatus; size?: "sm" | "md" }) {
  const s = STATUS[status];
  return (
    <span
      className={`badge-swap inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md font-semibold ${
        size === "md" ? "h-7 w-[104px] text-[13px]" : "h-6 w-[88px] text-[12px]"
      }`}
      style={{ color: s.fg, backgroundColor: s.bg }}
    >
      <s.Icon size={size === "md" ? 15 : 14} weight="bold" aria-hidden />
      {s.label}
    </span>
  );
}

type BtnProps = ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost"; icon?: ReactNode };

export function Button({ variant = "primary", icon, className = "", children, ...rest }: BtnProps) {
  const base =
    "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3.5 text-[13.5px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45";
  const v = {
    primary: "bg-(--pl2-accent) text-white hover:bg-(--pl2-accent-hover)",
    secondary: "border border-(--pl2-line-strong) bg-(--pl2-surface) text-(--pl2-ink) hover:bg-(--pl2-muted)",
    ghost: "text-(--pl2-ink-3) hover:bg-(--pl2-muted) hover:text-(--pl2-ink)",
  }[variant];
  return (
    <button type="button" className={`${base} ${v} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function Field({ label, required, hint, children, htmlFor }: { label: string; required?: boolean; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-(--pl2-ink-2)">
        {label}
        {required && <span className="ml-1 text-[12px] font-normal text-(--pl2-danger)">필수</span>}
      </label>
      {children}
      {hint && <p className="text-[12.5px] text-(--pl2-ink-4)">{hint}</p>}
    </div>
  );
}

export const inputCls =
  "h-9 w-full rounded-md border border-(--pl2-line-strong) bg-(--pl2-surface) px-3 text-[13.5px] text-(--pl2-ink) placeholder:text-(--pl2-ink-4) transition-colors duration-150 hover:border-(--pl2-ink-4) focus:border-(--pl2-accent) focus:outline-none focus:ring-3 focus:ring-(--pl2-accent)/15";

export function Panel({ title, aside, children, className = "" }: { title?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-(--pl2-line) bg-(--pl2-surface) ${className}`}>
      {title && (
        <header className="flex h-12 items-center justify-between border-b border-(--pl2-line) px-5">
          <h2 className="text-[14px] font-semibold text-(--pl2-ink)">{title}</h2>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, sub, action }: { title: string; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <div>
        <h1 className="font-(family-name:--pl2-font-display) text-[24px] font-bold leading-8 tracking-[-0.01em]">{title}</h1>
        {sub && <p className="mt-0.5 text-[13.5px] text-(--pl2-ink-4)">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
