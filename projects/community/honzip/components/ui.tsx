import type { ComponentProps, ReactNode } from "react";
import { CheckCircle, Lightbulb, Question, SealCheck, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import type { PostKind } from "../lib/types";

type Tone = { fg: string; bg: string; Icon: typeof Question; label: string };

export const LABEL: Record<"solved" | "question" | "info" | "adopted" | "alert", Tone> = {
  solved: { fg: "#065F46", bg: "#D1FAE5", Icon: CheckCircle, label: "해결됨" },
  question: { fg: "#0C5A82", bg: "#E0F0F9", Icon: Question, label: "질문" },
  info: { fg: "#475569", bg: "#EEF1EB", Icon: Lightbulb, label: "정보 공유" },
  adopted: { fg: "#065F46", bg: "#D1FAE5", Icon: SealCheck, label: "작성자가 채택한 답변" },
  alert: { fg: "#9A3412", bg: "#FFEDD5", Icon: WarningCircle, label: "안전 알림" },
};

export function Tag({ tone }: { tone: keyof typeof LABEL }) {
  const t = LABEL[tone];
  return (
    <span className="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[12.5px] font-semibold" style={{ color: t.fg, backgroundColor: t.bg }}>
      <t.Icon size={14} weight={tone === "solved" || tone === "adopted" ? "fill" : "bold"} aria-hidden />
      {t.label}
    </span>
  );
}

export const kindTone = (k: PostKind) => (k === "question" ? "question" : "info") as "question" | "info";

export function TopicChip({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-6 items-center rounded-md bg-(--hz-muted) px-2 text-[12.5px] font-medium text-(--hz-ink-3)">{children}</span>;
}

// 닉네임과 동네 인증 표시. 동네 인증은 ShieldCheck + 동네명
export function Author({ nickname, dong, anonymous }: { nickname: string; dong: string; anonymous?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 text-[13.5px] text-(--hz-ink-3)">
      <span className="font-semibold text-(--hz-ink-2)">{anonymous ? "익명" : nickname}</span>
      <span className="inline-flex items-center gap-0.5">
        <ShieldCheck size={14} weight="fill" aria-hidden className="text-(--hz-primary)" />
        {dong}
      </span>
    </span>
  );
}

// 지붕 선이 모자처럼 얹힌 'ㅎ' 마크
export function HonzipMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <path d="M5 11.5 14 4l9 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 15.5h12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="14" cy="21" r="3.3" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}

// 창문 격자 모티프. 브랜드 영역, 사진 자리, 빈 상태에서 반복
export function WindowGrid({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className}>
      <rect x="8" y="8" width="104" height="104" rx="14" stroke="currentColor" strokeWidth="5" />
      <path d="M60 8v104M8 60h104" stroke="currentColor" strokeWidth="5" />
      <rect x="20" y="20" width="28" height="28" rx="4" fill="currentColor" opacity=".35" />
    </svg>
  );
}

// 사진이 없는 자리는 창문 격자 틴트 타일로 둠 (사진 요청 목록에 기록)
export function PhotoTile({ className = "" }: { className?: string }) {
  return (
    <div role="img" aria-label="첨부 사진 자리" className={`flex items-center justify-center bg-(--hz-primary-soft) text-(--hz-primary)/45 ${className}`}>
      <WindowGrid className="h-1/2 max-h-14 w-1/2 max-w-14" />
    </div>
  );
}

type BtnProps = ComponentProps<"button"> & { variant?: "cta" | "primary" | "secondary" | "ghost"; icon?: ReactNode };

export function Button({ variant = "secondary", icon, className = "", children, ...rest }: BtnProps) {
  const base =
    "inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 text-[15px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45";
  const v = {
    cta: "bg-(--hz-accent) text-white hover:bg-(--hz-accent-hover) disabled:bg-(--hz-line) disabled:text-(--hz-ink-3) disabled:opacity-100",
    primary: "bg-(--hz-primary) text-white hover:bg-(--hz-primary-hover) disabled:bg-(--hz-line) disabled:text-(--hz-ink-3) disabled:opacity-100",
    secondary: "border border-(--hz-line-strong) bg-(--hz-surface) text-(--hz-ink) hover:bg-(--hz-muted)",
    ghost: "text-(--hz-ink-3) hover:bg-(--hz-muted) hover:text-(--hz-ink)",
  }[variant];
  return (
    <button type="button" className={`${base} ${v} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export const inputCls =
  "w-full rounded-lg border border-(--hz-line-strong) bg-(--hz-surface) px-3.5 text-[15px] text-(--hz-ink) placeholder:text-(--hz-ink-4) transition-colors duration-150 hover:border-(--hz-ink-4) focus:border-(--hz-primary) focus:outline-none focus:ring-3 focus:ring-(--hz-primary)/15";

export function Field({ label, required, hint, children, htmlFor }: { label: string; required?: boolean; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[14px] font-semibold text-(--hz-ink-2)">
        {label}
        {required && <span className="ml-1.5 text-[12.5px] font-normal text-(--hz-danger)">필수</span>}
      </label>
      {children}
      {hint && <p className="text-[13px] text-(--hz-ink-4)">{hint}</p>}
    </div>
  );
}
