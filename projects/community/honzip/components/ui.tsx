import type { ComponentProps, ReactNode } from "react";
import { CheckCircle, ImageSquare, Lightbulb, Question, SealCheck, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
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

// 사진이 없는 자리는 틴트 타일로만 둠 (사진 요청 목록에 기록)
export function PhotoTile({ className = "" }: { className?: string }) {
  return (
    <div role="img" aria-label="첨부 사진 자리" className={`flex items-center justify-center bg-[#E3EBE4] text-[#7C9185] ${className}`}>
      <ImageSquare size={28} weight="light" aria-hidden />
    </div>
  );
}

type BtnProps = ComponentProps<"button"> & { variant?: "cta" | "primary" | "secondary" | "ghost"; icon?: ReactNode };

export function Button({ variant = "secondary", icon, className = "", children, ...rest }: BtnProps) {
  const base =
    "inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 text-[15px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45";
  const v = {
    cta: "bg-(--hz-accent) text-white hover:bg-(--hz-accent-hover) disabled:bg-(--hz-muted) disabled:text-(--hz-ink-4) disabled:opacity-100",
    primary: "bg-(--hz-primary) text-white hover:bg-(--hz-primary-hover) disabled:bg-(--hz-muted) disabled:text-(--hz-ink-4) disabled:opacity-100",
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
