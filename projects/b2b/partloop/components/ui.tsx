import type { ComponentProps, ReactNode } from "react";
import { CheckCircle, HourglassMedium, PaperPlaneTilt, Truck, WarningCircle } from "@phosphor-icons/react";
import type { OrderStatus } from "../lib/types";

export const STATUS: Record<OrderStatus, { label: string; fg: string; bg: string; Icon: typeof Truck }> = {
  "pending-approval": { label: "승인 대기", fg: "#92400E", bg: "#FEF3C7", Icon: HourglassMedium },
  "awaiting-accept": { label: "수락 대기", fg: "#334155", bg: "#E2E8F0", Icon: PaperPlaneTilt },
  "in-progress": { label: "진행 중", fg: "#075985", bg: "#E0F2FE", Icon: Truck },
  delayed: { label: "지연", fg: "#991B1B", bg: "#FEE2E2", Icon: WarningCircle },
  delivered: { label: "납품 완료", fg: "#065F46", bg: "#D1FAE5", Icon: CheckCircle },
};

export function StatusBadge({ status, size = "sm" }: { status: OrderStatus; size?: "sm" | "md" }) {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium ${
        size === "md" ? "h-7 px-3 text-[13px]" : "h-6 px-2 text-[12.5px]"
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
    "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 text-[13.5px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45";
  const v = {
    primary: "bg-(--pl-accent) text-white hover:bg-(--pl-accent-hover)",
    secondary: "border border-(--pl-line-strong) bg-(--pl-surface) text-(--pl-ink) hover:bg-(--pl-muted)",
    ghost: "text-(--pl-ink-3) hover:bg-(--pl-muted) hover:text-(--pl-ink)",
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
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-(--pl-ink-2)">
        {label}
        {required && <span className="ml-0.5 text-(--pl-danger)" aria-hidden>*</span>}
      </label>
      {children}
      {hint && <p className="text-[12.5px] text-(--pl-ink-4)">{hint}</p>}
    </div>
  );
}

export const inputCls =
  "h-9 w-full rounded-lg border border-(--pl-line-strong) bg-(--pl-surface) px-3 text-[14px] text-(--pl-ink) placeholder:text-(--pl-ink-4) transition-colors duration-150 hover:border-(--pl-ink-4) focus:border-(--pl-accent) focus:outline-none focus:ring-3 focus:ring-(--pl-accent)/15";

export function Panel({ title, action, children, className = "", bodyClass = "p-5" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={`rounded-xl border border-(--pl-line) bg-(--pl-surface) ${className}`}>
      {title && (
        <header className="flex h-12 items-center justify-between border-b border-(--pl-line) px-5">
          <h2 className="text-[14px] font-semibold text-(--pl-ink)">{title}</h2>
          {action}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}
