"use client";

import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle,
  Hourglass,
  Lightning,
  Lock,
  Prohibit,
  ShieldCheck,
  WarningCircle,
  WarningOctagon,
  X,
  XCircle,
  type IconProps,
} from "@phosphor-icons/react";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

/* ---------- 상태 (앱과 관리자 모든 화면에서 의미 고정) ---------- */

type StatusDef = { label: string; fg: string; bg: string; Icon: ComponentType<IconProps> };

const GREEN = { fg: "#166534", bg: "#DCF3E3" };
const ORANGE = { fg: "#9A4A00", bg: "#FFEBD2" };
const RED = { fg: "#B42318", bg: "#FDE2E0" };
const GRAY = { fg: "#4B5563", bg: "#E8EAED" };
const BLUE = { fg: "#1D4ED8", bg: "#DEE8FD" };

export const STATUS = {
  "member:pending": { label: "승인 대기", ...ORANGE, Icon: Hourglass },
  "member:approved": { label: "정상", ...GREEN, Icon: CheckCircle },
  "member:rejected": { label: "반려", ...RED, Icon: XCircle },
  "member:suspended": { label: "이용 정지", ...GRAY, Icon: Prohibit },
  "course:ok": { label: "정상", ...GREEN, Icon: CheckCircle },
  "course:warn": { label: "점검 필요", ...ORANGE, Icon: WarningCircle },
  "course:error": { label: "오류", ...RED, Icon: WarningOctagon },
  "course:captcha": { label: "보안인증 필요", ...BLUE, Icon: ShieldCheck },
  "slot:open": { label: "예약 가능", ...GREEN, Icon: CheckCircle },
  "slot:closed": { label: "마감", ...GRAY, Icon: Lock },
  "slot:cancel": { label: "취소티", fg: "#FFFFFF", bg: "#1D4ED8", Icon: Lightning },
  "account:ok": { label: "정상", ...GREEN, Icon: CheckCircle },
  "account:failed": { label: "로그인 실패", ...RED, Icon: WarningOctagon },
  "account:captcha": { label: "보안인증 필요", ...BLUE, Icon: ShieldCheck },
  "account:none": { label: "계정 미등록", ...GRAY, Icon: Lock },
} satisfies Record<string, StatusDef>;

export type StatusKey = keyof typeof STATUS;

export function Badge({ kind, size = "md", label }: { kind: StatusKey; size?: "sm" | "md"; label?: string }) {
  const d: StatusDef = STATUS[kind];
  const Icon = d.Icon;
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-semibold whitespace-nowrap",
        size === "sm" ? "h-5 px-2 text-[11px]" : "h-6 px-2.5 text-[12px]",
      )}
      style={{ color: d.fg, backgroundColor: d.bg }}
    >
      <Icon size={size === "sm" ? 11 : 13} weight="fill" aria-hidden />
      {label ?? d.label}
    </span>
  );
}

/* ---------- 브랜드 마크: 티 위에 올라간 공 ---------- */

export function Mark({ size = 28, ball = "#F5F1E6", tee = "#B58532" }: { size?: number; ball?: string; tee?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="11.5" r="8" fill={ball} />
      <circle cx="13" cy="9" r="1" fill={tee} opacity="0.55" />
      <circle cx="17.5" cy="8" r="1" fill={tee} opacity="0.55" />
      <circle cx="19" cy="12.5" r="1" fill={tee} opacity="0.55" />
      <circle cx="14.5" cy="13.5" r="1" fill={tee} opacity="0.55" />
      <path d="M9.5 21.5h13c-.4 2-2.2 3.3-4.6 3.6l-.5 5.9h-2.8l-.5-5.9c-2.4-.3-4.2-1.6-4.6-3.6z" fill={tee} />
    </svg>
  );
}

export function Wordmark({ size = 20, light = true }: { size?: number; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Mark size={size + 6} ball={light ? "#F5F1E6" : "#0E2A22"} />
      <span className="tf-display" style={{ fontSize: size, color: light ? "#F5F1E6" : "#0E2A22" }}>
        TeeFinder
      </span>
    </span>
  );
}

/* ---------- 버튼, 입력 ---------- */

type Variant = "primary" | "brass" | "outline" | "ghost" | "danger" | "onInk" | "outlineOnInk";

const VARIANT: Record<Variant, string> = {
  primary: "bg-(--tf-ink) text-white hover:bg-(--tf-ink-2) disabled:bg-[#C9CFCB] disabled:text-[#59635E]",
  brass: "bg-(--tf-brass) text-(--tf-ink) hover:brightness-95 disabled:bg-[#D8D2C2] disabled:text-[#59635E]",
  outline: "border border-(--tf-ink)/25 bg-white text-(--tf-ink) hover:bg-(--tf-ink)/5 disabled:text-[#8A938E]",
  ghost: "text-(--tf-ink) hover:bg-(--tf-ink)/5",
  danger: "bg-(--tf-danger) text-white hover:brightness-95 disabled:bg-[#E5C4C1] disabled:text-white",
  onInk: "bg-(--tf-paper) text-(--tf-ink) hover:brightness-95",
  outlineOnInk: "border border-white/30 text-white hover:bg-white/10",
};

export function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "md" | "sm"; full?: boolean }) {
  return (
    <button
      type="button"
      {...p}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 font-semibold transition-colors duration-150 disabled:cursor-not-allowed",
        size === "md" ? "min-h-12 rounded-xl px-5 text-[15px]" : "min-h-9 rounded-lg px-3.5 text-[13px]",
        VARIANT[variant],
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

export const inputCls =
  "h-12 w-full rounded-xl border border-(--tf-line) bg-white px-4 text-[15px] text-(--tf-text) placeholder:text-[#8A938E] focus:border-(--tf-ink) focus:outline-none";
export const inputSmCls =
  "h-9 w-full rounded-lg border border-[#D9DDD9] bg-white px-3 text-[13px] text-(--tf-text) placeholder:text-[#8A938E] focus:border-(--tf-ink) focus:outline-none";

export function Field({ label, hint, children, small }: { label: string; hint?: string; children: ReactNode; small?: boolean }) {
  return (
    <label className="block">
      <span className={cx("mb-1.5 block font-semibold text-(--tf-text)", small ? "text-[12px]" : "text-[13px]")}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-(--tf-sub)">{hint}</span>}
    </label>
  );
}

export function Chip({
  active,
  children,
  onClick,
  tone = "light",
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  tone?: "light" | "ink";
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-[14px] font-semibold transition-colors duration-150",
        tone === "light"
          ? active
            ? "bg-(--tf-ink) text-white"
            : "border border-(--tf-line) bg-white text-(--tf-text)"
          : active
            ? "bg-(--tf-paper) text-(--tf-ink)"
            : "border border-white/25 text-white",
      )}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { key: T; label: string }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <div role="tablist" className="flex rounded-xl bg-(--tf-ink)/8 p-1">
      {items.map((it) => (
        <button
          key={it.key}
          role="tab"
          aria-selected={value === it.key}
          type="button"
          onClick={() => onChange(it.key)}
          className={cx(
            "min-h-10 flex-1 rounded-lg text-[14px] font-semibold transition-colors duration-150",
            value === it.key ? "bg-white text-(--tf-ink) shadow-[0_1px_2px_rgba(14,42,34,0.12)]" : "text-(--tf-sub)",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- 시트, 모달 (프레임 안에서만. blur 없음) ---------- */

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/45" />
          <motion.div
            role="dialog"
            aria-label={title}
            className="relative max-h-[86%] w-full overflow-y-auto rounded-t-[28px] bg-(--tf-paper) px-5 pt-3 pb-10 [scrollbar-width:none]"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-(--tf-ink)/15" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="tf-heading text-[20px] text-(--tf-ink)">{title}</h2>
              <button type="button" onClick={onClose} aria-label="닫기" className="flex h-11 w-11 items-center justify-center rounded-full text-(--tf-ink) hover:bg-(--tf-ink)/5">
                <X size={20} weight="bold" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Dialog({ open, children, label }: { open: boolean; children: ReactNode; label: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-50 flex items-center justify-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <div className="absolute inset-0 bg-black/50" />
          <div role="alertdialog" aria-label={label} className="relative w-full rounded-3xl bg-white p-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toast({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          role="status"
          className="pointer-events-none absolute inset-x-5 bottom-28 z-[60] rounded-xl bg-(--tf-ink) px-4 py-3 text-center text-[14px] font-medium text-white"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
